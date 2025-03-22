'use client';

import { motion } from 'framer-motion';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useTheme } from 'next-themes';

export default function Settings() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full ${isDark ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} z-50`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className={`flex items-center space-x-2 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </nav>
      </motion.header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimatedContainer delay={0.2} className="text-center mb-12">
          <h1 className={`text-4xl sm:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Settings
          </h1>
          <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Customize your NeuroLens experience
          </p>
        </AnimatedContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Voice Settings */}
          <AnimatedContainer delay={0.4}>
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Voice Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Volume
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className={`w-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Voice Style
                  </label>
                  <select className={`w-full rounded-md ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}>
                    <option>Natural</option>
                    <option>Clear</option>
                    <option>Detailed</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Speech Rate
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className={`w-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer`}
                  />
                </div>
              </div>
            </div>
          </AnimatedContainer>

          {/* Detection Settings */}
          <AnimatedContainer delay={0.6}>
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Detection Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Sensitivity
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className={`w-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Detection Range
                  </label>
                  <select className={`w-full rounded-md ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}>
                    <option>Short (1-3m)</option>
                    <option>Medium (3-5m)</option>
                    <option>Long (5m+)</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Update Frequency
                  </label>
                  <select className={`w-full rounded-md ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}>
                    <option>High (100ms)</option>
                    <option>Medium (250ms)</option>
                    <option>Low (500ms)</option>
                  </select>
                </div>
              </div>
            </div>
          </AnimatedContainer>

          {/* Accessibility Settings */}
          <AnimatedContainer delay={0.8}>
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Accessibility</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    High Contrast Mode
                  </label>
                  <button className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent ${isDark ? 'bg-gray-700' : 'bg-gray-200'} transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}>
                    <span className="sr-only">Use high contrast mode</span>
                    <span
                      className="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Screen Reader Optimizations
                  </label>
                  <button className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent ${isDark ? 'bg-gray-700' : 'bg-gray-200'} transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}>
                    <span className="sr-only">Enable screen reader optimizations</span>
                    <span
                      className="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    />
                  </button>
                </div>
              </div>
            </div>
          </AnimatedContainer>

          {/* Keyboard Shortcuts */}
          <AnimatedContainer delay={1}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Keyboard Shortcuts</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Toggle Assistant</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md">
                    Space
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Open Settings</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md">
                    ⌘,
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Toggle Dark Mode</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md">
                    ⌘D
                  </kbd>
                </div>
              </div>
            </div>
          </AnimatedContainer>
        </div>
      </main>
    </div>
  );
} 