'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import { ArrowLeftIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useHotkeys } from '@/hooks/useHotkeys';

export default function About() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, theme } = useTheme();
  const isDark = mounted ? resolvedTheme === 'dark' : false;
  const router = useRouter();
  const hotkeys = useHotkeys(false);

  // Handle mounted state and theme
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        localStorage.setItem('mainPageScrollPosition', window.scrollY.toString());
        router.push('/');
      }
      
      // Open Settings (Cmd/Ctrl + ,)
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        router.push('/settings');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  // Save scroll position before navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem('homePageScrollPosition', window.scrollY.toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Restore scroll position on mount
  useEffect(() => {
    const savedScrollPosition = localStorage.getItem('homePageScrollPosition');
    if (savedScrollPosition) {
      // Use setTimeout to ensure the DOM is fully rendered
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
        localStorage.removeItem('homePageScrollPosition');
      }, 100);
    }
  }, []);

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
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Technology Stack</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Frontend</h4>
                  <ul className={`space-y-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <li>Next.js 14</li>
                    <li>React</li>
                    <li>Tailwind CSS</li>
                    <li>Framer Motion</li>
                  </ul>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Backend</h4>
                  <ul className={`space-y-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <li>Python</li>
                    <li>FastAPI</li>
                    <li>OpenCV</li>
                    <li>TensorFlow</li>
                  </ul>
                </div>
              </div>
            </div>
          </AnimatedContainer>

          {/* Team */}
          <AnimatedContainer delay={0.8}>
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Our Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
                      isDark 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      AHM
                    </div>
                    <div>
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Alexander He Meng</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>UI/UX Designer</p>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
                      isDark 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'bg-purple-100 text-purple-600'
                    }`}>
                      MP
                    </div>
                    <div>
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Mahan Pouromidi</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>AI Engineer</p>
                    </div>
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