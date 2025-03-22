'use client';

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';

interface FeedbackCardProps {
  feedback: string;
}

export const FeedbackCard = ({ feedback }: FeedbackCardProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center space-x-3 mb-4">
        <SpeakerWaveIcon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Voice Feedback</h3>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} italic`}
      >
        {feedback || 'No feedback available yet'}
      </motion.div>
    </div>
  );
}; 