// src/services/api.ts
import { WebcamStream, ProcessedFrame } from '@/types/api';

interface WebSocketCallbacks {
  onMessage: (data: ProcessedFrame) => void;
  onError: (error: string) => void;
  onConnectionStateChange?: (isConnected: boolean) => void;
}

class ApiService {
  private static instance: ApiService;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;
  private isConnecting = false;
  private callbacks: WebSocketCallbacks | null = null;
  private frameQueue: WebcamStream[] = [];
  private isProcessingQueue = false;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  initializeWebSocket(callbacks: WebSocketCallbacks): void {
    if (this.isConnecting) return;
    
    this.callbacks = callbacks;
    this.isConnecting = true;

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
      console.log('Connecting to WebSocket:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.callbacks?.onConnectionStateChange?.(true);
        this.processFrameQueue();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as ProcessedFrame;
          this.callbacks?.onMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          this.callbacks?.onError('Failed to parse server message');
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.callbacks?.onConnectionStateChange?.(false);
        this.callbacks?.onError('Connection error. Attempting to reconnect...');
        this.handleReconnect();
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.isConnecting = false;
        this.callbacks?.onConnectionStateChange?.(false);
        this.handleReconnect();
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.isConnecting = false;
      this.callbacks?.onConnectionStateChange?.(false);
      this.callbacks?.onError('Failed to establish connection');
      this.handleReconnect();
    }
  }

  private handleReconnect(): void {
    if (!this.callbacks) return;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectTimeout * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
      
      setTimeout(() => {
        if (!this.isConnecting) {
          this.initializeWebSocket(this.callbacks!);
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.callbacks.onError('Failed to connect to server. Please refresh the page.');
      this.disconnect();
    }
  }

  private async processFrameQueue(): Promise<void> {
    if (this.isProcessingQueue || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.isProcessingQueue = true;
    while (this.frameQueue.length > 0) {
      const frame = this.frameQueue.shift();
      if (!frame) break;

      try {
        await this.sendFrameInternal(frame);
      } catch (error) {
        console.error('Failed to send frame from queue:', error);
        // Put the frame back at the start of the queue
        this.frameQueue.unshift(frame);
        break;
      }
    }
    this.isProcessingQueue = false;
  }

  private async sendFrameInternal(frame: WebcamStream): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    // We can't send FormData directly over WebSocket, so we'll send JSON instead
    // For binary data like video/audio, we'll use Base64 encoding
    try {
      // Convert video blob to base64
      const videoBase64 = await this.blobToBase64(frame.video);
      
      // Convert audio blob to base64
      const audioBase64 = await this.blobToBase64(frame.audio);
      
      // Create a JSON message
      const message = JSON.stringify({
        type: 'frame',
        data: {
          video: videoBase64,
          audio: audioBase64,
          timestamp: frame.timestamp
        }
      });
      
      // Send the JSON message over WebSocket
      this.ws.send(message);
    } catch (error) {
      console.error('Error preparing data for WebSocket:', error);
      throw error;
    }
  }

  // Helper method to convert a Blob to a base64 string
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result is a data URL like "data:image/jpeg;base64,/9j/4AAQSkZ..."
        // We only want the base64 part after the comma
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async sendFrame(frame: WebcamStream): Promise<ProcessedFrame | null> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Queue the frame if WebSocket is not connected
      this.frameQueue.push(frame);
      this.processFrameQueue();
      return null;
    }

    try {
      await this.sendFrameInternal(frame);
      
      // Return a Promise that will resolve when we get a response from the server
      return new Promise((resolve, reject) => {
        // Set up a one-time message handler to catch the response
        const handleMessage = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data) as ProcessedFrame;
            this.ws?.removeEventListener('message', handleMessage);
            clearTimeout(timeout);
            resolve(data);
          } catch (error) {
            reject(error);
          }
        };
        
        // Set up a timeout to prevent waiting indefinitely
        const timeout = setTimeout(() => {
          this.ws?.removeEventListener('message', handleMessage);
          resolve(null); // Resolve with null instead of rejecting
        }, 5000); // 5 second timeout
        
        // Add the temporary event listener
        this.ws?.addEventListener('message', handleMessage);
      });
    } catch (error) {
      console.error('Failed to send frame:', error);
      // Queue the frame if sending fails
      this.frameQueue.push(frame);
      this.processFrameQueue();
      return null;
    }
  }

  async updateSettings(settings: Record<string, any>): Promise<void> {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw new Error('Failed to update settings');
    }
  }

  async sendAudio(audioBlob: Blob): Promise<ProcessedFrame | null> {
    // Similar implementation to sendFrame, but for audio-only data
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return null;
    }

    try {
      // Convert audio blob to base64
      const audioBase64 = await this.blobToBase64(audioBlob);
      
      // Create a JSON message
      const message = JSON.stringify({
        type: 'audio',
        data: {
          audio: audioBase64,
          timestamp: Date.now()
        }
      });
      
      // Send the JSON message over WebSocket
      this.ws.send(message);
      
      // Return a Promise that will resolve when we get a response
      return new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data) as ProcessedFrame;
            this.ws?.removeEventListener('message', handleMessage);
            clearTimeout(timeout);
            resolve(data);
          } catch (error) {
            reject(error);
          }
        };
        
        const timeout = setTimeout(() => {
          this.ws?.removeEventListener('message', handleMessage);
          resolve(null);
        }, 5000);
        
        this.ws?.addEventListener('message', handleMessage);
      });
    } catch (error) {
      console.error('Failed to send audio:', error);
      return null;
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.callbacks = null;
    this.frameQueue = [];
    this.isProcessingQueue = false;
  }
}

export const apiService = ApiService.getInstance();