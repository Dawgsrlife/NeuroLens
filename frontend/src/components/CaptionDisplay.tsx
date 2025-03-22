import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Caption, VoiceFeedback } from '@/types/api';
import { useTheme } from 'next-themes';

interface CaptionDisplayProps {
  captions: Caption[];
  voiceFeedback?: VoiceFeedback;
}

export const CaptionDisplay = ({ captions, voiceFeedback }: CaptionDisplayProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [currentCaptions, setCurrentCaptions] = useState<Caption[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<VoiceFeedback | null>(null);

  useEffect(() => {
    // Update captions with animation
    setCurrentCaptions(captions.slice(-3)); // Show last 3 captions
  }, [captions]);

  useEffect(() => {
    if (voiceFeedback) {
      setCurrentFeedback(voiceFeedback);
      // Clear feedback after 5 seconds
      const timer = setTimeout(() => {
        setCurrentFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [voiceFeedback]);

  return (
    <div className="space-y-4">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Live Captions</h3>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {currentCaptions.map((caption) => (
              <motion.div
                key={caption.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`p-3 rounded-lg ${
                  caption.priority === 'high'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    : caption.priority === 'medium'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                }`}
              >
                <p className="text-sm font-medium">{caption.text}</p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(caption.timestamp).toLocaleTimeString()}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {currentFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`p-4 ${isDark ? 'bg-green-900/30' : 'bg-green-100'} rounded-lg border ${isDark ? 'border-green-800' : 'border-green-200'}`}
          >
            <div className="flex items-center space-x-2">
              <div className={isDark ? 'text-green-400' : 'text-green-600'}>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <p className={isDark ? 'text-green-200' : 'text-green-800'}>
                {currentFeedback.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 