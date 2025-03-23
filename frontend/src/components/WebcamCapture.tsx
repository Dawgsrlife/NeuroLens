'use client';

import { useRef, useEffect, useState } from "react";
import { apiService } from "@/services/api";
import { ProcessedFrame } from "@/types/api";
import { VideoCameraIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { simulateRealTimeUpdates } from "@/services/mockData";
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

// Define prop types
interface WebcamCaptureProps {
  isActive: boolean;
  onError?: (error: string) => void;
  onFrameProcessed?: (frame: ProcessedFrame) => void;
}

export const WebcamCapture = ({ isActive, onError, onFrameProcessed }: WebcamCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsLoading(false);
      } catch (error) {
        onError?.('Failed to access webcam. Please ensure camera permissions are granted.');
        setIsLoading(false);
      }
    };

    if (isActive) {
      startWebcam();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, onError]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Start sending frames to the backend
      startCapturing();
    } catch (error) {
      console.error("Error accessing camera:", error);
      onError?.("Could not access camera or microphone");
      setError("Could not access camera or microphone");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCapturing = () => {
    const interval = setInterval(() => {
      if (!isActive || !videoRef.current) {
        clearInterval(interval);
        return;
      }

      const context = canvasRef.current?.getContext("2d");
      if (!context) return;

      // Draw the current video frame to the canvas
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      // Convert the canvas to a blob
      canvasRef.current.toBlob(
        async (videoBlob) => {
          if (!videoBlob) return;

          // Get audio from the stream
          const audioTrack = streamRef.current?.getAudioTracks()[0];
          let audioBlob = new Blob();

          if (audioTrack && streamRef.current) {
            // In a real implementation, you'd properly record audio
            // This is simplified for this example
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(
              streamRef.current
            );
            const destination = audioContext.createMediaStreamDestination();
            source.connect(destination);

            // Create a dummy audio blob for this example
            audioBlob = new Blob([], { type: "audio/webm" });
          }

          try {
            // Send the frame to the backend
            const response = await apiService.sendFrame({
              video: videoBlob,
              audio: audioBlob,
              timestamp: Date.now(),
            });

            // Use the onFrameProcessed callback
            if (response && onFrameProcessed) {
              onFrameProcessed(response);
            }
          } catch (error) {
            console.error("Error sending frame:", error);
            onError?.(
              error instanceof Error ? error.message : "Error sending frame"
            );
            setError(error instanceof Error ? error.message : "Error sending frame");
          }
        },
        "image/jpeg",
        0.8
      );
    }, 500); // Send a frame every 500ms

    return () => clearInterval(interval);
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <div className={`animate-spin rounded-full h-12 w-12 border-4 ${isDark ? 'border-gray-700 border-t-blue-400' : 'border-gray-300 border-t-blue-500'}`} />
        </div>
      )}
      {!isActive ? (
        <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-gray-900/50' : 'bg-gray-100/50'} backdrop-blur-sm`}>
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
            >
              <VideoCameraIcon className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg font-medium">
                Click "Start Assistant" to begin
              </p>
              <p className="text-sm mt-2">
                or press Space to start
              </p>
            </motion.div>
          </div>
        </div>
      ) : null}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}
      />
      {error && (
        <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-gray-900/90' : 'bg-gray-100/90'} backdrop-blur-sm`}>
          <div className="text-center space-y-4">
            <ExclamationTriangleIcon className={`w-12 h-12 mx-auto ${isDark ? 'text-red-400' : 'text-red-500'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {error}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
