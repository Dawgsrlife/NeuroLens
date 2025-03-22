import { useRef, useEffect, useState } from "react";
import { apiService } from "@/services/api";
import { ProcessedFrame } from "@/types/api";
import { motion } from "framer-motion";
import { VideoCameraIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { simulateRealTimeUpdates } from "@/services/mockData";

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
  const [error, setError] = useState<string | null>(null);

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
      {!isActive ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
            >
              <VideoCameraIcon className="w-8 h-8 text-blue-500" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-lg font-medium text-gray-700 dark:text-gray-300"
            >
              Press Space to Start
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              or click the button below
            </motion.p>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 dark:bg-gray-800/90">
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"
                >
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="text-lg font-medium text-gray-700 dark:text-gray-300"
                >
                  Camera Access Error
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-sm text-gray-500 dark:text-gray-400"
                >
                  Please check your camera permissions
                </motion.p>
              </div>
            </div>
          )}
        </>
      )}
      <canvas ref={canvasRef} width={640} height={480} className="hidden" />
    </div>
  );
};
