import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useSettings, Settings } from "@/contexts/SettingsContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const {
    settings,
    updateVoiceSettings,
    updateDetectionSettings,
    updateAccessibilitySettings,
  } = useSettings();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = mounted ? resolvedTheme === "dark" : false;

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={`fixed inset-0 ${
              isDark ? "bg-black/50" : "bg-black/30"
            } backdrop-blur-sm`}
          />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full max-w-2xl transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className={`text-xl font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Settings
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className={`p-2 rounded-full ${
                      isDark
                        ? "text-gray-300 hover:text-white hover:bg-gray-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    } transition-colors`}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Voice Settings */}
                  <div>
                    <h4
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      } mb-4`}
                    >
                      Voice Settings
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label
                          className={`block text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Volume
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={settings.voice.volume}
                          onChange={(e) =>
                            updateVoiceSettings({
                              volume: parseInt(e.target.value),
                            })
                          }
                          className={`w-full h-2 ${
                            isDark ? "bg-gray-700" : "bg-gray-200"
                          } rounded-lg appearance-none cursor-pointer`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Voice Style
                        </label>
                        <select
                          value={settings.voice.style}
                          onChange={(e) =>
                            updateVoiceSettings({
                              style: e.target
                                .value as Settings["voice"]["style"],
                            })
                          }
                          className={`mt-1 block w-full rounded-md ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-gray-300"
                              : "bg-white border-gray-300 text-gray-900"
                          } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                        >
                          <option>Natural</option>
                          <option>Clear</option>
                          <option>Detailed</option>
                        </select>
                      </div>
                      <div>
                        <label
                          className={`block text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Speech Rate
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={settings.voice.speechRate}
                          onChange={(e) =>
                            updateVoiceSettings({
                              speechRate: parseInt(e.target.value),
                            })
                          }
                          className={`w-full h-2 ${
                            isDark ? "bg-gray-700" : "bg-gray-200"
                          } rounded-lg appearance-none cursor-pointer`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Detection Settings */}
                  <div>
                    <h4
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      } mb-4`}
                    >
                      Detection Settings
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label
                          className={`block text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Sensitivity
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={settings.detection.sensitivity}
                          onChange={(e) =>
                            updateDetectionSettings({
                              sensitivity: parseInt(e.target.value),
                            })
                          }
                          className={`w-full h-2 ${
                            isDark ? "bg-gray-700" : "bg-gray-200"
                          } rounded-lg appearance-none cursor-pointer`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Detection Range
                        </label>
                        <select
                          value={settings.detection.range}
                          onChange={(e) =>
                            updateDetectionSettings({
                              range: e.target
                                .value as Settings["detection"]["range"],
                            })
                          }
                          className={`mt-1 block w-full rounded-md ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-gray-300"
                              : "bg-white border-gray-300 text-gray-900"
                          } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                        >
                          <option>Short (1-3m)</option>
                          <option>Medium (3-5m)</option>
                          <option>Long (5m+)</option>
                        </select>
                      </div>
                      <div>
                        <label
                          className={`block text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Update Frequency
                        </label>
                        <select
                          value={settings.detection.updateFrequency}
                          onChange={(e) =>
                            updateDetectionSettings({
                              updateFrequency: e.target
                                .value as Settings["detection"]["updateFrequency"],
                            })
                          }
                          className={`mt-1 block w-full rounded-md ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-gray-300"
                              : "bg-white border-gray-300 text-gray-900"
                          } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                        >
                          <option>High (100ms)</option>
                          <option>Medium (250ms)</option>
                          <option>Low (500ms)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Accessibility Settings */}
                  <div>
                    <h4
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      } mb-4`}
                    >
                      Accessibility
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label
                          className={`text-sm ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          High Contrast Mode
                        </label>
                        <button
                          onClick={() =>
                            updateAccessibilitySettings({
                              highContrast:
                                !settings.accessibility.highContrast,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent ${
                            settings.accessibility.highContrast
                              ? "bg-blue-600"
                              : isDark
                              ? "bg-gray-700"
                              : "bg-gray-200"
                          } transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        >
                          <span className="sr-only">
                            Use high contrast mode
                          </span>
                          <span
                            className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              settings.accessibility.highContrast
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <label
                          className={`text-sm ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Screen Reader Optimizations
                        </label>
                        <button
                          onClick={() =>
                            updateAccessibilitySettings({
                              screenReaderOptimizations:
                                !settings.accessibility
                                  .screenReaderOptimizations,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent ${
                            settings.accessibility.screenReaderOptimizations
                              ? "bg-blue-600"
                              : isDark
                              ? "bg-gray-700"
                              : "bg-gray-200"
                          } transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        >
                          <span className="sr-only">
                            Enable screen reader optimizations
                          </span>
                          <span
                            className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              settings.accessibility.screenReaderOptimizations
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
