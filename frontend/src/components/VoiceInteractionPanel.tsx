"use client";

import { useEffect, useState, useRef } from "react";
import { apiService } from "@/services/api";
import { ProcessedFrame } from "@/types/api";
import { MicrophoneIcon, StopIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { MicrophoneIcon as OutlinedMicrophoneIcon } from "@heroicons/react/24/outline";

interface VoiceInteractionPanelProps {
  className?: string;
}

export const VoiceInteractionPanel = ({
  className = "",
}: VoiceInteractionPanelProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Define handleMessage at the component level
  const handleMessage = (data: ProcessedFrame) => {
    if (data.voiceFeedback) {
      setFeedback(data.voiceFeedback.text);

      // Use the browser's speech synthesis to speak the response
      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance(data.voiceFeedback.text);
        window.speechSynthesis.speak(speech);
      }
    }

    if (data.captions) {
      const userMessages = data.captions.filter((c) => c.type === "audio");
      if (userMessages.length > 0) {
        setTranscript(userMessages[0].text);
      }
    }
  };

  useEffect(() => {
    // Set up the WebSocket connection
    apiService.initializeWebSocket({
      onMessage: handleMessage,
      onError: (error) => console.error("WebSocket error:", error),
      onConnectionStateChange: (isConnected) => {
        console.log(
          "WebSocket connection state:",
          isConnected ? "connected" : "disconnected"
        );
      },
    });

    // Listen for recording toggle events
    const handleToggleRecording = (event: CustomEvent) => {
      if (event.detail.isRecording) {
        startListening();
      } else {
        stopListening();
      }
    };

    window.addEventListener(
      "toggleRecording",
      handleToggleRecording as EventListener
    );

    return () => {
      // Stop any ongoing speech when the component unmounts
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      // Clear any active timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Remove event listener
      window.removeEventListener(
        "toggleRecording",
        handleToggleRecording as EventListener
      );
    };
  }, []);

  // Timer for recording duration
  useEffect(() => {
    if (isListening) {
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isListening]);

  const startListening = async () => {
    try {
      setIsListening(true);
      setTranscript("");
      audioChunksRef.current = [];

      // Record audio using browser APIs
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorder.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        try {
          setIsLoading(true);
          // Send the audio to the backend
          const response = await apiService.sendAudio(audioBlob);

          // Handle the response using the component-level handleMessage
          if (response) {
            handleMessage(response);
          }
        } catch (error) {
          console.error("Error sending audio:", error);
        } finally {
          stream.getTracks().forEach((track) => track.stop());
          setIsListening(false);
          setIsLoading(false);
        }
      });

      // Start recording - no automatic timeout now
      mediaRecorder.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  // Format seconds into MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`p-6 rounded-xl shadow-sm border ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } ${className}`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <OutlinedMicrophoneIcon
          className={`w-6 h-6 ${
            isDark ? "text-purple-400" : "text-purple-500"
          }`}
        />
        <h3
          className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Voice Commands
        </h3>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className={`space-y-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}
      >
        <p>Available commands:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>"What do you see?" - Get a description of your surroundings</li>
          <li>"Where is the [object]?" - Locate specific objects</li>
          <li>"Read this text" - Read text in your field of view</li>
          <li>"Stop" - Stop the current command</li>
        </ul>
      </motion.div>
      <div className="mt-4">
        <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          {isListening
            ? `Listening... ${formatTime(recordingDuration)}`
            : isLoading
            ? "Processing..."
            : "Click the microphone to start speaking"}
        </p>
      </div>

      {transcript && (
        <div
          className={`mt-4 p-3 ${
            isDark ? "bg-gray-700" : "bg-gray-100"
          } rounded`}
        >
          <p
            className={`text-sm ${
              isDark ? "text-gray-300" : "text-gray-600"
            } italic`}
          >
            You said: "{transcript}"
          </p>
        </div>
      )}

      {feedback && (
        <div
          className={`mt-4 p-3 ${
            isDark ? "bg-blue-900/30" : "bg-blue-50"
          } rounded`}
        >
          <p
            className={`text-sm ${isDark ? "text-blue-300" : "text-blue-600"}`}
          >
            Assistant: "{feedback}"
          </p>
        </div>
      )}

      <div className="flex space-x-2 mt-4">
        {!isListening ? (
          <button
            onClick={startListening}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isDark
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            } transition-colors`}
          >
            <MicrophoneIcon className="w-5 h-5" />
            <span>Start Recording</span>
          </button>
        ) : (
          <button
            onClick={stopListening}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isDark
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            } transition-colors`}
          >
            <StopIcon className="w-5 h-5" />
            <span>Stop Recording</span>
          </button>
        )}
      </div>

      {isListening && (
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            <div
              className="w-2 h-8 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-8 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "100ms" }}
            ></div>
            <div
              className="w-2 h-8 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "200ms" }}
            ></div>
            <div
              className="w-2 h-8 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
            <div
              className="w-2 h-8 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "400ms" }}
            ></div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
