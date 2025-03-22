'use client';

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface StatusCardProps {
  isActive: boolean;
}

export const StatusCard = ({ isActive }: StatusCardProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Status</h3>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {isActive ? (
            <CheckCircleIcon className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
          ) : (
            <XCircleIcon className={`w-6 h-6 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          )}
        </motion.div>
      </div>
      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        {isActive ? 'Assistant is active and processing video feed' : 'Assistant is inactive'}
      </p>
    </div>
  );
}; 