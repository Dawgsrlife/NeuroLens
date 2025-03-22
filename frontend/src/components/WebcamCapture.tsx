import { useRef, useEffect, useState } from "react";
import { apiService } from "@/services/api";
import { ProcessedFrame } from "@/types/api";

// Define prop types
interface WebcamCaptureProps {
  isActive: boolean;
  onError?: (error: string) => void;
  onFrameProcessed?: (frame: ProcessedFrame) => void;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  isActive,
  onError,
  onFrameProcessed,
}) => {
  // Properly type the refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

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
      if (!isActive || !videoRef.current || !canvasRef.current) {
        clearInterval(interval);
        return;
      }

      const context = canvasRef.current.getContext("2d");
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
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover rounded-lg"
      />
      <canvas ref={canvasRef} width={640} height={480} className="hidden" />
    </div>
  );
};
