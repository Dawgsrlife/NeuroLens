import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from 'next-themes';

export const Logo = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Link href="/" className="flex items-center space-x-2">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1
        }}
        className="relative w-10 h-10"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? 'from-blue-600 to-purple-700' : 'from-blue-400 to-purple-500'} rounded-xl transform rotate-3 shadow-lg`} />
        <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? 'from-blue-500 to-purple-600' : 'from-blue-300 to-purple-400'} rounded-xl transform -rotate-3 shadow-lg`} />
        <div className={`absolute inset-0 ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl flex items-center justify-center shadow-inner`}>
          <span className={`text-2xl font-bold ${isDark ? 'bg-gradient-to-r from-blue-400 to-purple-400' : 'bg-gradient-to-r from-blue-600 to-purple-600'} bg-clip-text text-transparent`}>
            N
          </span>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2
        }}
        className="flex flex-col"
      >
        <motion.span
          className={`text-2xl font-bold ${isDark ? 'bg-gradient-to-r from-blue-400 to-purple-400' : 'bg-gradient-to-r from-blue-600 to-purple-600'} bg-clip-text text-transparent tracking-tight`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.3
          }}
        >
          NeuroLens
        </motion.span>
        <motion.span
          className="text-xs text-gray-500 dark:text-gray-400 tracking-wider"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.4
          }}
        >
          AI Vision Assistant
        </motion.span>
      </motion.div>
    </Link>
  );
}; 