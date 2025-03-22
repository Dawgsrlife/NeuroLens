import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
              <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 text-left align-middle shadow-xl transition-all border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <Dialog.Title
                  as="h3"
                  className={`text-lg font-medium leading-6 ${isDark ? 'text-white' : 'text-gray-900'} flex justify-between items-center`}
                >
                  Settings
                  <button
                    onClick={onClose}
                    className={`rounded-full p-1 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                  >
                    <XMarkIcon className={`h-5 w-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                  </button>
                </Dialog.Title>

                <div className="mt-4 space-y-6">
                  {/* Voice Settings */}
                  <div>
                    <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Voice Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Volume</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          className={`w-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Voice Style</label>
                        <select className={`mt-1 block w-full rounded-md ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}>
                          <option>Natural</option>
                          <option>Clear</option>
                          <option>Detailed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Detection Settings */}
                  <div>
                    <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Detection Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Sensitivity</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          className={`w-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Detection Range</label>
                        <select className={`mt-1 block w-full rounded-md ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}>
                          <option>Short (1-3m)</option>
                          <option>Medium (3-5m)</option>
                          <option>Long (5m+)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Save Changes
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}; 