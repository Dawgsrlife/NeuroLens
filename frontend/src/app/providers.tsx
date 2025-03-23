'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange={false}
      storageKey="neurolens-theme"
      themes={['light', 'dark']}
      value={{
        light: 'light',
        dark: 'dark',
      }}
      {...props}
    >
      {children}
    </NextThemeProvider>
  );
} 