import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header/Navigation */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">🧠</span>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">NeuroLens</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              Start Assistant
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="sr-only">Settings</span>
              ⚙️
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AI-Powered Vision Assistant
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Empowering independence through real-time visual feedback and voice assistance
          </p>
        </section>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Webcam Feed */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 aspect-video relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-gray-400 dark:text-gray-500 text-center">
                <div className="text-4xl mb-2">📹</div>
                <p>Webcam feed will appear here</p>
              </div>
            </div>
          </div>

          {/* Status and Feedback */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">System Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Camera</span>
                  <span className="text-green-500">●</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Voice Assistant</span>
                  <span className="text-green-500">●</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Object Detection</span>
                  <span className="text-green-500">●</span>
                </div>
              </div>
            </div>

            {/* Feedback Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Real-time Feedback</h2>
              <div className="h-48 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-gray-600 dark:text-gray-300 italic">
                  Voice feedback and observations will appear here...
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Press Space to toggle voice feedback
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              Accessibility
            </button>
            <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              Help
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
