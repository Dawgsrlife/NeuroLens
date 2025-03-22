'use client';

import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        {resolvedTheme === 'dark' ? (
          <motion.div
            key="moon"
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 180, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <MoonIcon className="w-6 h-6 text-gray-600" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 180, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <SunIcon className="w-6 h-6 text-yellow-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}; 