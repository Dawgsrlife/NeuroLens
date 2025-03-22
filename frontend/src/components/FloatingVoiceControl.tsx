import React, { useState } from "react";
import { VoiceInteractionPanel } from "./VoiceInteractionPanel";
import { MicrophoneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

export const FloatingVoiceControl: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button in bottom right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={isOpen ? "Close voice assistant" : "Open voice assistant"}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <MicrophoneIcon className="h-6 w-6" />
        )}
      </button>

      {/* Voice panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 right-6 z-40 w-80 shadow-xl"
          >
            <VoiceInteractionPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
