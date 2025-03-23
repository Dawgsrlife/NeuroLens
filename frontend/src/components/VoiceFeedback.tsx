import { useEffect, useRef } from "react";
import { VoiceFeedback as VoiceFeedbackType } from "@/types/api";

interface VoiceFeedbackProps {
  feedback: VoiceFeedbackType;
  volume?: number;
  rate?: number;
  pitch?: number;
}

export const VoiceFeedback = ({
  feedback,
  volume = 1,
  rate = 1,
  pitch = 1,
}: VoiceFeedbackProps) => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!feedback.text) return;

    // Cancel any ongoing speech
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
    }

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(feedback.text);
    utteranceRef.current = utterance;

    // Configure voice settings
    utterance.volume = volume;
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Set priority-based voice selection
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes("Google") || voice.name.includes("Microsoft")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Handle speech events
    utterance.onstart = () => {
      console.log("Speech started");
    };

    utterance.onend = () => {
      console.log("Speech ended");
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error("Speech error:", event);
      utteranceRef.current = null;
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);

    // Cleanup
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [feedback.text, volume, rate, pitch]);

  return null; // This is a non-visual component
};
