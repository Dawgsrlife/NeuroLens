'use client';

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface FeedbackCardProps {
  feedback: string;
}

export const FeedbackCard = ({ feedback }: FeedbackCardProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <ChatBubbleLeftIcon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Voice Feedback
        </h3>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
      >
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {feedback}
        </p>
      </motion.div>
    </motion.div>
  );
}; 