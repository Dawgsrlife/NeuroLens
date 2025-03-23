"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface StatusCardProps {
  isActive: boolean;
}

export const StatusCard = ({ isActive }: StatusCardProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-6 rounded-xl shadow-sm border ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3
          className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Assistant Status
        </h3>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          {isActive ? (
            <CheckCircleIcon
              className={`w-6 h-6 ${
                isDark ? "text-green-400" : "text-green-500"
              }`}
            />
          ) : (
            <XCircleIcon
              className={`w-6 h-6 ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
            />
          )}
        </motion.div>
      </div>
      <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
        {isActive
          ? "The assistant is currently active and processing your surroundings."
          : "The assistant is currently inactive."}
      </p>
    </motion.div>
  );
};
