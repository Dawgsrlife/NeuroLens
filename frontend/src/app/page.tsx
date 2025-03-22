'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { WebcamCapture } from '@/components/WebcamCapture';
import { CaptionDisplay } from '@/components/CaptionDisplay';
import { VoiceFeedback } from '@/components/VoiceFeedback';
import { apiService } from '@/services/api';
import { Caption, VoiceFeedback as VoiceFeedbackType } from '@/types/api';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAssistantActive, setIsAssistantActive] = useState(false);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [voiceFeedback, setVoiceFeedback] = useState<VoiceFeedbackType | null>(null);
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
      if (event.code === 'Space') {
        event.preventDefault();
        setIsAssistantActive((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            NeuroLens
          </h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Webcam Feed */}
          <AnimatedContainer delay={0.2}>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Webcam Feed
              </h2>
              <WebcamCapture
                isActive={isAssistantActive}
                onError={setError}
              />
            </div>
          </AnimatedContainer>

          {/* Captions and Feedback */}
          <AnimatedContainer delay={0.4}>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Captions & Feedback
              </h2>
              <CaptionDisplay
                captions={captions}
                voiceFeedback={voiceFeedback || undefined}
              />
            </div>
          </AnimatedContainer>
        </div>

        {/* Status Bar */}
        <AnimatedContainer delay={0.6}>
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isAssistantActive
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  }`}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {isAssistantActive ? 'Assistant Active' : 'Assistant Inactive'}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Press Space to {isAssistantActive ? 'Stop' : 'Start'}
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Voice Feedback */}
      {voiceFeedback && (
        <VoiceFeedback
          feedback={voiceFeedback}
          volume={1}
          rate={1}
          pitch={1}
        />
      )}

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
