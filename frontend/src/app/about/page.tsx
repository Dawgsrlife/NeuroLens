'use client';

import { motion } from 'framer-motion';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useTheme } from 'next-themes';

export default function About() {
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
            About NeuroLens
          </h1>
          <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Empowering independence through AI-powered vision assistance
          </p>
        </AnimatedContainer>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Mission Statement */}
          <AnimatedContainer delay={0.4}>
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Our Mission</h2>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                NeuroLens aims to empower individuals with visual impairments by providing real-time,
                AI-powered assistance that helps them navigate and interact with their environment more
                independently. Our goal is to create a seamless, intuitive experience that enhances
                accessibility and promotes greater autonomy.
              </p>
            </div>
          </AnimatedContainer>

          {/* Features */}
          <AnimatedContainer delay={0.6}>
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Key Features</h2>
              <ul className={`space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`} />
                  <span>Real-time object detection and recognition</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`} />
                  <span>Natural language voice feedback</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`} />
                  <span>Customizable detection settings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`} />
                  <span>Accessibility-focused design</span>
                </li>
              </ul>
            </div>
          </AnimatedContainer>

          {/* Technology Stack */}
          <AnimatedContainer delay={0.8}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Technology Stack</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Frontend</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>Next.js</li>
                    <li>TypeScript</li>
                    <li>Tailwind CSS</li>
                    <li>Framer Motion</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Backend</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>Node.js</li>
                    <li>FastAPI</li>
                    <li>OpenCV</li>
                    <li>OpenAI/Gemini</li>
                  </ul>
                </div>
              </div>
            </div>
          </AnimatedContainer>

          {/* Team */}
          <AnimatedContainer delay={1}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">The Team</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                NeuroLens is being developed for the GenAI Genesis 2025 hackathon by a team passionate
                about making technology more accessible and inclusive.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                    AH
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alexander He Meng</h3>
                    <p className="text-gray-600 dark:text-gray-300">UI/UX Designer</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                    MP
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mahan Pouromidi</h3>
                    <p className="text-gray-600 dark:text-gray-300">AI Engineer</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedContainer>
        </div>
      </main>
    </div>
  );
} 