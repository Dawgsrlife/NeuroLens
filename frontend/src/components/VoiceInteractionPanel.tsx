import { useEffect, useState, useRef } from "react";
import { apiService } from "@/services/api";
import { ProcessedFrame } from "@/types/api";
import { MicrophoneIcon, StopIcon } from "@heroicons/react/24/solid";

interface VoiceInteractionPanelProps {
  className?: string;
}

export const VoiceInteractionPanel: React.FC<VoiceInteractionPanelProps> = ({
  className = "",
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    return () => {
      // Stop any ongoing speech when the component unmounts
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      // Clear any active timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
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
      setFeedback("Please allow microphone access in your browser settings.");
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
    <div
      className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Voice Assistant
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isListening
            ? `Listening... ${formatTime(recordingDuration)}`
            : isLoading
            ? "Processing..."
            : "Press the button and speak"}
        </p>
      </div>

      {transcript && (
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
          <p className="text-sm italic">You said: "{transcript}"</p>
        </div>
      )}

      {feedback && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded">
          <p className="text-sm">Assistant: "{feedback}"</p>
        </div>
      )}

      <div className="flex space-x-2">
        {!isListening ? (
          <button
            onClick={startListening}
            disabled={isLoading}
            className={`flex items-center justify-center px-4 py-2 rounded-full space-x-2 ${
              isLoading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            aria-label="Start recording"
          >
            <MicrophoneIcon className="h-5 w-5" />
            <span>{isLoading ? "Processing..." : "Press to Speak"}</span>
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="flex items-center justify-center px-4 py-2 rounded-full space-x-2 bg-red-500 hover:bg-red-600 text-white animate-pulse"
            aria-label="Stop recording"
          >
            <StopIcon className="h-5 w-5" />
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
    </div>
  );
};
