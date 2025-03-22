import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface StatusCardProps {
  isActive?: boolean;
}

export const StatusCard = ({ isActive = false }: StatusCardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: isActive ? 1 : 0.5
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`w-3 h-3 rounded-full ${
              isActive ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          <span className="text-lg font-medium text-gray-900 dark:text-white">
            {isActive ? 'Assistant Active' : 'Assistant Inactive'}
          </span>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
        >
          Press Space to {isActive ? 'Stop' : 'Start'}
        </motion.div>
      </div>
    </motion.div>
  );
}; 