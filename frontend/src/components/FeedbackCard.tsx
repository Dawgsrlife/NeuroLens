import { motion } from 'framer-motion';
import { MicrophoneIcon } from '@heroicons/react/24/outline';

interface FeedbackCardProps {
  feedback: string;
}

export const FeedbackCard = ({ feedback }: FeedbackCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-full flex flex-col"
    >
      <div className="flex items-center space-x-2 mb-4">
        <MicrophoneIcon className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Real-time Feedback</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
          {feedback}
        </p>
      </div>
    </motion.div>
  );
}; 