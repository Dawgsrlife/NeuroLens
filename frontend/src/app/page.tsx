"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { SettingsModal } from "@/components/ui/SettingsModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WebcamCapture } from "@/components/WebcamCapture";
import { CaptionDisplay } from "@/components/CaptionDisplay";
import { VoiceFeedback } from "@/components/VoiceFeedback";
import { apiService } from "@/services/api";
import { Caption, VoiceFeedback as VoiceFeedbackType } from "@/types/api";
import { Logo } from "@/components/ui/Logo";
import {
  Cog6ToothIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { StatusCard } from "@/components/StatusCard";
import { FeedbackCard } from "@/components/FeedbackCard";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAssistantActive, setIsAssistantActive] = useState(false);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [voiceFeedback, setVoiceFeedback] = useState<VoiceFeedbackType | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    apiService.initializeWebSocket({
      onMessage: (data) => {
        if (data.captions) {
          setCaptions((prev) => [...prev, ...data.captions]);
        }
        if (data.voiceFeedback) {
          setVoiceFeedback(data.voiceFeedback);
        }
      },
      onError: (error) => {
        setError(error);
      },
    });

    return () => {
      apiService.disconnect();
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        setIsAssistantActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleFrameProcessed = (frame: any) => {
    // Handle processed frame data
    if (frame.captions) {
      setCaptions(frame.captions);
    }
    if (frame.voiceFeedback) {
      setVoiceFeedback(frame.voiceFeedback);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <AnimatedContainer
        variant="slide"
        direction="down"
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center space-x-4">
            <Link
              href="/settings"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Cog6ToothIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </Link>
            <Link
              href="/about"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <InformationCircleIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </AnimatedContainer>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-48 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white"
            >
              AI-Powered Vision Assistant
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Empowering independence through real-time object detection and
              voice feedback
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8"
            >
              <button
                onClick={() => setIsAssistantActive(!isAssistantActive)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {isAssistantActive ? "Stop Assistant" : "Start Assistant"}
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Webcam Feed */}
          <AnimatedContainer variant="scale" className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <WebcamCapture
                isActive={isAssistantActive}
                onError={setError}
                onFrameProcessed={handleFrameProcessed}
              />
            </div>
          </AnimatedContainer>

          {/* Status and Feedback Cards */}
          <div className="space-y-6 h-full">
            <AnimatedContainer variant="slide" direction="right" delay={0.2}>
              <StatusCard isActive={isAssistantActive} />
            </AnimatedContainer>
            <AnimatedContainer
              variant="slide"
              direction="right"
              delay={0.3}
              className="h-[calc(100%-6rem)]"
            >
              <FeedbackCard
                feedback={voiceFeedback?.text || "No feedback yet"}
              />
            </AnimatedContainer>
          </div>
        </div>

        {/* Captions */}
        <div className="mt-8">
          <AnimatedContainer variant="slide" direction="up" delay={0.4}>
            <CaptionDisplay captions={captions} />
          </AnimatedContainer>
        </div>
      </div>

      {/* Footer */}
      <AnimatedContainer
        variant="fade"
        className="mt-12 py-8 border-t border-gray-200 dark:border-gray-800"
      >
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-4">© 2025 NeuroLens. All rights reserved.</p>
            <div className="flex flex-col items-center space-y-2">
              <p className="text-sm">Created by</p>
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Alexander He Meng
                  </span>
                  <span className="text-xs text-gray-500">UI/UX Designer</span>
                </div>
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-700" />
                <div className="flex flex-col items-center">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Mahan Pouromidi
                  </span>
                  <span className="text-xs text-gray-500">AI Engineer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedContainer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-4 py-2 rounded-lg shadow-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
