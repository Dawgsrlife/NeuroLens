"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { SettingsModal } from "@/components/ui/SettingsModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WebcamCapture } from "@/components/WebcamCapture";
import { CaptionDisplay } from "@/components/CaptionDisplay";
import { VoiceFeedback } from "@/components/VoiceFeedback";
import { apiService } from "@/services/api";
import { VoiceInteractionPanel } from "@/components/VoiceInteractionPanel";
import { Caption, VoiceFeedback as VoiceFeedbackType } from "@/types/api";
import { Logo } from "@/components/ui/Logo";
import {
  Cog6ToothIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { StatusCard } from "@/components/StatusCard";
import { FeedbackCard } from "@/components/FeedbackCard";
import { useTheme } from 'next-themes';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAssistantActive, setIsAssistantActive] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [voiceFeedback, setVoiceFeedback] = useState<VoiceFeedbackType | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = mounted ? resolvedTheme === 'dark' : false;

  // Handle mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleAssistant = () => {
    setIsAssistantActive(prev => !prev);
    setIsWebcamActive(prev => !prev);
    setIsVoiceActive(prev => !prev);
    setIsProcessing(false);
    setError(null);
    
    // Smooth scroll to main content
    mainContentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      // Toggle Assistant (Space)
      if (event.code === "Space") {
        event.preventDefault();
        toggleAssistant();
      }
      
      // Open About Page (Cmd/Ctrl + A)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        window.location.href = '/about';
      }
      
      // Open Settings (Cmd/Ctrl + ,)
      if ((event.metaKey || event.ctrlKey) && event.key === ',') {
        event.preventDefault();
        window.location.href = '/settings';
      }
      
      // Toggle Theme (Cmd/Ctrl + D)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [resolvedTheme, setTheme, toggleAssistant]);

  const handleFrameProcessed = (frame: any) => {
    // Handle processed frame data
    if (frame.captions) {
      setCaptions(frame.captions);
    }
    if (frame.voiceFeedback) {
      setVoiceFeedback(frame.voiceFeedback);
    }
  };

  // Don't render anything until mounted to prevent theme flash
  if (!mounted) {
    return null;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full ${isDark ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} z-50`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Logo />
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/about" 
              className={`p-2 rounded-full ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
            >
              <InformationCircleIcon className="h-5 w-5" />
            </Link>
            <Link 
              href="/settings" 
              className={`p-2 rounded-full ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-b ${isDark ? 'from-gray-900 via-gray-800 to-gray-900' : 'from-white via-gray-50 to-white'}`} />
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-4xl sm:text-5xl md:text-6xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}
          >
            AI-Powered Vision Assistant
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`text-xl sm:text-2xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto mb-8`}
          >
            Empowering independence through real-time object detection and voice feedback
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={toggleAssistant}
            className={`px-8 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
              isDark 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isAssistantActive ? 'Stop Assistant' : 'Start Assistant'}
          </motion.button>
        </div>
      </section>

      {/* Main Content */}
      <main ref={mainContentRef} className={`${isDark ? 'bg-gray-900' : 'bg-white'} min-h-screen py-12 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <AnimatedContainer delay={0.6}>
            <div className="text-center mb-12">
              <h2 className={`text-3xl sm:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                NeuroLens
              </h2>
              <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                Experience the world through advanced AI vision technology
              </p>
            </div>
          </AnimatedContainer>

          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Webcam Feed */}
              <AnimatedContainer delay={0.4} className="relative aspect-video rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                <WebcamCapture
                  isActive={isAssistantActive}
                  onError={setError}
                  onFrameProcessed={handleFrameProcessed}
                />
              </AnimatedContainer>
              {/* Voice Feedback Card */}
              <FeedbackCard feedback={voiceFeedback?.text || 'No feedback yet'} />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <StatusCard isActive={isAssistantActive} />
              <VoiceInteractionPanel />
              {/* Hotkeys Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Keyboard Shortcuts
                  </h3>
                </div>
                <div className={`space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div className="flex items-center justify-between">
                    <span>Toggle Assistant</span>
                    <kbd className={`px-2 py-1 text-xs font-semibold ${isDark ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-800 bg-gray-100 border-gray-300'} border rounded-md`}>
                      Space
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Open About Page</span>
                    <kbd className={`px-2 py-1 text-xs font-semibold ${isDark ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-800 bg-gray-100 border-gray-300'} border rounded-md`}>
                      ⌘A
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Open Settings</span>
                    <kbd className={`px-2 py-1 text-xs font-semibold ${isDark ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-800 bg-gray-100 border-gray-300'} border rounded-md`}>
                      ⌘,
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Toggle Theme</span>
                    <kbd className={`px-2 py-1 text-xs font-semibold ${isDark ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-800 bg-gray-100 border-gray-300'} border rounded-md`}>
                      ⌘D
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Return to Home</span>
                    <kbd className={`px-2 py-1 text-xs font-semibold ${isDark ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-800 bg-gray-100 border-gray-300'} border rounded-md`}>
                      Esc
                    </kbd>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <AnimatedContainer
        variant="fade"
        className={`mt-12 py-8 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
      >
        <div className="container mx-auto px-4">
          <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="mb-4">© 2025 NeuroLens. All rights reserved.</p>
            <div className="flex flex-col items-center space-y-2">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Created by</p>
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Alexander He Meng
                  </span>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>UI/UX Designer</span>
                </div>
                <div className={`w-px h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                <div className="flex flex-col items-center">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Mahan Pouromidi
                  </span>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>AI Engineer</span>
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
            className={`fixed bottom-4 right-4 ${isDark ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'} px-4 py-2 rounded-lg shadow-lg`}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
