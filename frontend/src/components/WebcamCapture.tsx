'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '@/services/api';
import { WebcamStream, ProcessedFrame } from '@/types/api';

interface WebcamCaptureProps {
  isActive: boolean;
  onError: (error: string) => void;
  onFrameProcessed: (frame: ProcessedFrame) => void;
}

export const WebcamCapture = ({ isActive, onError, onFrameProcessed }: WebcamCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isRecordingRef = useRef(false);
  const clientIdRef = useRef<string>(`client_${Math.random().toString(36).substr(2, 9)}`);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isActive && !isInitialized) {
      initializeWebcam();
    } else if (!isActive) {
      cleanup();
    }

    return () => {
      if (!isActive) {
        cleanup();
      }
    };
  }, [isActive, isInitialized]);

  const initializeWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      mediaStreamRef.current = stream;
      
      // Initialize audio context only if it hasn't been created yet
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      mediaRecorderRef.current = new MediaRecorder(stream);

      // Set up audio processing
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      if (sourceRef.current && processorRef.current) {
        sourceRef.current.connect(processorRef.current);
        processorRef.current.connect(audioContextRef.current.destination);
      }

      // Initialize WebSocket connection
      await apiService.initializeWebSocket({
        onMessage: (data) => {
          onFrameProcessed(data);
        },
        onError: (error) => {
          onError(error);
        },
      }, clientIdRef.current);

      // Start capturing frames
      startFrameCapture();
      setIsInitialized(true);
    } catch (error) {
      onError('Failed to initialize webcam');
      console.error('Webcam initialization error:', error);
      cleanup();
    }
  };

  const startFrameCapture = () => {
    if (!videoRef.current || !mediaRecorderRef.current) {
      console.warn('Required refs not initialized');
      return;
    }

    // Capture frames every 100ms
    frameIntervalRef.current = setInterval(async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current!.videoWidth;
        canvas.height = videoRef.current!.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(videoRef.current!, 0, 0);

        // Convert canvas to blob
        const videoBlob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8)
        );

        // Get audio data
        const audioBlob = await new Promise<Blob>((resolve) => {
          if (!mediaRecorderRef.current) {
            console.warn('MediaRecorder not initialized');
            resolve(new Blob([], { type: 'audio/webm' }));
            return;
          }

          const chunks: BlobPart[] = [];
          
          // Stop any existing recording
          if (isRecordingRef.current && mediaRecorderRef.current.state === 'recording') {
            try {
              mediaRecorderRef.current.stop();
              isRecordingRef.current = false;
            } catch (error) {
              console.warn('Error stopping existing recording:', error);
            }
          }

          // Set up new recording
          mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
          mediaRecorderRef.current.onstop = () => {
            resolve(new Blob(chunks, { type: 'audio/webm' }));
            isRecordingRef.current = false;
          };

          // Start recording
          try {
            mediaRecorderRef.current.start();
            isRecordingRef.current = true;

            // Stop after 100ms
            setTimeout(() => {
              if (mediaRecorderRef.current?.state === 'recording') {
                try {
                  mediaRecorderRef.current.stop();
                } catch (error) {
                  console.warn('Error stopping recording:', error);
                }
              }
            }, 100);
          } catch (error) {
            console.warn('Error starting recording:', error);
            resolve(new Blob([], { type: 'audio/webm' }));
          }
        });

        // Send frame to backend via WebSocket
        await apiService.sendFrame({
          video: videoBlob,
          audio: audioBlob,
          timestamp: Date.now(),
        });

      } catch (error) {
        console.error('Frame capture error:', error);
      }
    }, 100);
  };

  const cleanup = () => {
    // Clear frame capture interval
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    // Stop and cleanup media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Cleanup audio context and nodes
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media recorder
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      } catch (error) {
        console.warn('Error stopping MediaRecorder:', error);
      }
      mediaRecorderRef.current = null;
    }
    isRecordingRef.current = false;

    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Disconnect WebSocket
    apiService.disconnect();

    setIsInitialized(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden"
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📹</div>
            <p className="text-gray-500 dark:text-gray-400">Initializing webcam...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}; 