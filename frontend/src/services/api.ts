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

    const formData = new FormData();
    formData.append('video', frame.video);
    formData.append('audio', frame.audio);
    formData.append('timestamp', frame.timestamp.toString());

    this.ws.send(formData);
  }

  async sendFrame(frame: WebcamStream): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Queue the frame if WebSocket is not connected
      this.frameQueue.push(frame);
      this.processFrameQueue();
      return;
    }

    try {
      await this.sendFrameInternal(frame);
    } catch (error) {
      console.error('Failed to send frame:', error);
      // Queue the frame if sending fails
      this.frameQueue.push(frame);
      this.processFrameQueue();
      throw new Error('Failed to send frame');
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