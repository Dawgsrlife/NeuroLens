import { useEffect, useState, useRef } from "react";
import { apiService } from "@/services/api";
import { ProcessedFrame } from "@/types/api";

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

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
    };
  }, []);

  const startListening = async () => {
    try {
      setIsListening(true);
      setIsLoading(true);

      // Record audio using browser APIs
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
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
          // Send the audio to the backend
          const response = await apiService.sendAudio(audioBlob);
          setIsLoading(false);

          // Handle the response using the component-level handleMessage
          if (response) {
            handleMessage(response);
          }
        } catch (error) {
          console.error("Error sending audio:", error);
          setIsLoading(false);
        } finally {
          stream.getTracks().forEach((track) => track.stop());
          setIsListening(false);
        }
      });

      // Start recording
      mediaRecorder.start();

      // Record for 5 seconds
      setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
        }
      }, 5000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsListening(false);
      setIsLoading(false);
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
            ? "Listening..."
            : isLoading
            ? "Processing..."
            : "Press the button to speak"}
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

      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isLoading}
        className={`px-4 py-2 rounded-full ${
          isListening
            ? "bg-red-500 animate-pulse text-white"
            : isLoading
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {isListening
          ? "Stop Listening"
          : isLoading
          ? "Processing..."
          : "Press to Speak"}
      </button>
    </div>
  );
};
