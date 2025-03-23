import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useTheme } from 'next-themes';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export const AnimatedCard = ({
  children,
  className = '',
  delay = 0,
  hover = true,
}: AnimatedCardProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.div
      className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { scale: 1.02, y: -5 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}; 