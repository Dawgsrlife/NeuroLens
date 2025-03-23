import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { SettingsProvider } from '@/contexts/SettingsContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeuroLens - AI-Powered Vision Assistant",
  description: "An AI-powered vision assistant that helps people with visual impairments navigate the world.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${inter.className} min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-300 ease-in-out`}
        style={{ colorScheme: 'light dark' }}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SettingsProvider>
            <div className="transition-colors duration-300 ease-in-out">
              {children}
            </div>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
