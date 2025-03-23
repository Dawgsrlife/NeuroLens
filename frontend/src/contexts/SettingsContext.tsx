"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Settings {
  voice: {
    volume: number;
    style: "Natural" | "Clear" | "Detailed";
    speechRate: number;
  };
  detection: {
    sensitivity: number;
    range: "Short (1-3m)" | "Medium (3-5m)" | "Long (5m+)";
    updateFrequency: "High (100ms)" | "Medium (250ms)" | "Low (500ms)";
  };
  accessibility: {
    highContrast: boolean;
    screenReaderOptimizations: boolean;
  };
}

interface SettingsContextType {
  settings: Settings;
  updateVoiceSettings: (settings: Partial<Settings["voice"]>) => void;
  updateDetectionSettings: (settings: Partial<Settings["detection"]>) => void;
  updateAccessibilitySettings: (
    settings: Partial<Settings["accessibility"]>
  ) => void;
}

const defaultSettings: Settings = {
  voice: {
    volume: 75,
    style: "Natural",
    speechRate: 50,
  },
  detection: {
    sensitivity: 50,
    range: "Medium (3-5m)",
    updateFrequency: "Medium (250ms)",
  },
  accessibility: {
    highContrast: false,
    screenReaderOptimizations: true,
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    // Try to load settings from localStorage on initial render
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  const updateVoiceSettings = (newSettings: Partial<Settings["voice"]>) => {
    setSettings((prev) => ({
      ...prev,
      voice: { ...prev.voice, ...newSettings },
    }));
  };

  const updateDetectionSettings = (
    newSettings: Partial<Settings["detection"]>
  ) => {
    setSettings((prev) => ({
      ...prev,
      detection: { ...prev.detection, ...newSettings },
    }));
  };

  const updateAccessibilitySettings = (
    newSettings: Partial<Settings["accessibility"]>
  ) => {
    setSettings((prev) => ({
      ...prev,
      accessibility: { ...prev.accessibility, ...newSettings },
    }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateVoiceSettings,
        updateDetectionSettings,
        updateAccessibilitySettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
