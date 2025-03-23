import { useSettings } from '@/contexts/SettingsContext';

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { settings, updateVoiceSettings, updateDetectionSettings, updateAccessibilitySettings } = useSettings();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = mounted ? resolvedTheme === 'dark' : false;

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 ${isDark ? 'bg-black/50' : 'bg-black/30'} backdrop-blur-sm z-50`}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl z-50 overflow-hidden`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-full ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Voice Settings */}
                <div>
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Voice Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Volume
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.voice.volume}
                        onChange={(e) => updateVoiceSettings({ volume: parseInt(e.target.value) })}
                        className={`w-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Voice Style
                      </label>
                      <select
                        value={settings.voice.style}
                        onChange={(e) => updateVoiceSettings({ style: e.target.value as Settings['voice']['style'] })}
                        className={`w-full rounded-md ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                      >
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
                        value={settings.voice.speechRate}
                        onChange={(e) => updateVoiceSettings({ speechRate: parseInt(e.target.value) })}
                        className={`w-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer`}
                      />
                    </div>
                  </div>
                </div>

                {/* Detection Settings */}
                <div>
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Detection Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Sensitivity
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.detection.sensitivity}
                        onChange={(e) => updateDetectionSettings({ sensitivity: parseInt(e.target.value) })}
                        className={`w-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Detection Range
                      </label>
                      <select
                        value={settings.detection.range}
                        onChange={(e) => updateDetectionSettings({ range: e.target.value as Settings['detection']['range'] })}
                        className={`w-full rounded-md ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                      >
                        <option>Short (1-3m)</option>
                        <option>Medium (3-5m)</option>
                        <option>Long (5m+)</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Update Frequency
                      </label>
                      <select
                        value={settings.detection.updateFrequency}
                        onChange={(e) => updateDetectionSettings({ updateFrequency: e.target.value as Settings['detection']['updateFrequency'] })}
                        className={`w-full rounded-md ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
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
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Accessibility</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        High Contrast Mode
                      </label>
                      <button
                        onClick={() => updateAccessibilitySettings({ highContrast: !settings.accessibility.highContrast })}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent ${
                          settings.accessibility.highContrast ? 'bg-blue-600' : isDark ? 'bg-gray-700' : 'bg-gray-200'
                        } transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                      >
                        <span className="sr-only">Use high contrast mode</span>
                        <span
                          className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            settings.accessibility.highContrast ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Screen Reader Optimizations
                      </label>
                      <button
                        onClick={() => updateAccessibilitySettings({ screenReaderOptimizations: !settings.accessibility.screenReaderOptimizations })}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent ${
                          settings.accessibility.screenReaderOptimizations ? 'bg-blue-600' : isDark ? 'bg-gray-700' : 'bg-gray-200'
                        } transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                      >
                        <span className="sr-only">Enable screen reader optimizations</span>
                        <span
                          className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            settings.accessibility.screenReaderOptimizations ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 