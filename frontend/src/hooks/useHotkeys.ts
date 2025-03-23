import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

interface HotkeyConfig {
  key: string;
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    meta?: boolean;
  };
  action: () => void;
  description: string;
  global?: boolean;
}

export const useHotkeys = (isMainPage: boolean = false) => {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const hotkeys: HotkeyConfig[] = [
    {
      key: ' ',
      action: () => {
        // This will be handled by the main page component
        const event = new CustomEvent('toggleWebcam');
        window.dispatchEvent(event);
      },
      description: 'Start/Stop Webcam',
      global: false // Only works on main page
    },
    {
      key: 'r',
      modifiers: { ctrl: true, shift: true },
      action: () => {
        // This will be handled by the main page component
        const event = new CustomEvent('toggleRecording');
        window.dispatchEvent(event);
      },
      description: 'Start/Stop Recording',
      global: false // Only works on main page
    },
    {
      key: ',',
      modifiers: { ctrl: true },
      action: () => {
        // This will be handled by the main page component
        const event = new CustomEvent('toggleSettings');
        window.dispatchEvent(event);
      },
      description: 'Open Settings',
      global: true
    },
    {
      key: 'd',
      modifiers: { ctrl: true },
      action: () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      },
      description: 'Toggle Theme',
      global: true
    },
    {
      key: '/',
      modifiers: { ctrl: true },
      action: () => {
        router.push('/about');
      },
      description: 'Open About',
      global: true
    }
  ];

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      hotkeys.forEach(({ key, modifiers, action, global }) => {
        const matchesKey = event.key.toLowerCase() === key.toLowerCase();
        const matchesModifiers = 
          (!modifiers?.ctrl || event.ctrlKey) &&
          (!modifiers?.shift || event.shiftKey) &&
          (!modifiers?.meta || event.metaKey);

        if (matchesKey && matchesModifiers) {
          event.preventDefault();
          if (global || isMainPage) {
            action();
          }
        }
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isMainPage, router, resolvedTheme, setTheme]);

  return hotkeys;
}; 