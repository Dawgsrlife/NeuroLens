import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface FeedbackCardProps {
  feedback?: string;
}

export const FeedbackCard = ({ feedback = 'No feedback yet' }: FeedbackCardProps) => {
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
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Real-time Feedback
      </h3>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg" />
        <p className="text-gray-600 dark:text-gray-300 relative">
          {feedback}
        </p>
      </motion.div>
    </motion.div>
  );
}; 