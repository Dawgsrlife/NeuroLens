'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAssistantActive, setIsAssistantActive] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsAssistantActive(!isAssistantActive);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAssistantActive]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header/Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-50"
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <AnimatedContainer delay={0.2} className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">🧠</span>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">NeuroLens</span>
          </AnimatedContainer>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full transition-colors ${
                isAssistantActive
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              onClick={() => setIsAssistantActive(!isAssistantActive)}
            >
              {isAssistantActive ? 'Stop Assistant' : 'Start Assistant'}
            </motion.button>
            <ThemeToggle />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsSettingsOpen(true)}
            >
              <span className="sr-only">Settings</span>
              ⚙️
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <AnimatedContainer delay={0.4} className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AI-Powered Vision Assistant
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Empowering independence through real-time visual feedback and voice assistance
          </p>
        </AnimatedContainer>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Webcam Feed */}
          <AnimatedContainer delay={0.6} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 aspect-video relative overflow-hidden">
            <motion.div
              animate={{
                scale: isAssistantActive ? [1, 1.02, 1] : 1,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-gray-400 dark:text-gray-500 text-center">
                <div className="text-4xl mb-2">📹</div>
                <p>Webcam feed will appear here</p>
              </div>
            </motion.div>
          </AnimatedContainer>

          {/* Status and Feedback */}
          <div className="space-y-6">
            {/* Status Card */}
            <AnimatedContainer delay={0.8}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">System Status</h2>
                <div className="space-y-3">
                  <motion.div
                    animate={{
                      opacity: isAssistantActive ? 1 : 0.5,
                    }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-600 dark:text-gray-300">Camera</span>
                    <span className="text-green-500">●</span>
                  </motion.div>
                  <motion.div
                    animate={{
                      opacity: isAssistantActive ? 1 : 0.5,
                    }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-600 dark:text-gray-300">Voice Assistant</span>
                    <span className="text-green-500">●</span>
                  </motion.div>
                  <motion.div
                    animate={{
                      opacity: isAssistantActive ? 1 : 0.5,
                    }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-600 dark:text-gray-300">Object Detection</span>
                    <span className="text-green-500">●</span>
                  </motion.div>
                </div>
              </div>
            </AnimatedContainer>

            {/* Feedback Card */}
            <AnimatedContainer delay={1}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Real-time Feedback</h2>
                <div className="h-48 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <AnimatePresence>
                    {isAssistantActive ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-gray-600 dark:text-gray-300"
                      >
                        Voice feedback and observations will appear here...
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-gray-400 dark:text-gray-500 italic"
                      >
                        Assistant is inactive. Press Space or click "Start Assistant" to begin.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </AnimatedContainer>
          </div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <motion.div
            animate={{
              opacity: isAssistantActive ? 1 : 0.5,
            }}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            Press Space to toggle voice feedback
          </motion.div>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Accessibility
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Help
            </motion.button>
          </div>
        </div>
      </motion.footer>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
