'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useScrollPosition() {
  const pathname = usePathname();

  useEffect(() => {
    // Only handle scroll position for the main page
    if (pathname === '/') {
      // Restore scroll position when returning to main page
      const savedScrollPosition = localStorage.getItem('mainPageScrollPosition');
      if (savedScrollPosition) {
        window.scrollTo(0, parseInt(savedScrollPosition));
        localStorage.removeItem('mainPageScrollPosition');
      }
    } else {
      // Save scroll position when leaving main page
      const scrollPosition = window.scrollY;
      localStorage.setItem('mainPageScrollPosition', scrollPosition.toString());
    }
  }, [pathname]);
} 