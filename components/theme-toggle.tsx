"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Switch Container */}
        <motion.div
          className={`relative w-16 h-8 rounded-full cursor-pointer transition-colors duration-300 ${
            isDark ? "bg-sage-700" : "bg-sage-200"
          }`}
          onClick={toggleTheme}
          layout
        >
          {/* Switch Knob */}
          <motion.div
            className={`absolute top-1 w-6 h-6 rounded-full shadow-lg transition-colors duration-300 ${
              isDark ? "bg-yellow-300" : "bg-white"
            }`}
            animate={{
              x: isDark ? 32 : 4,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          >
            {/* Light bulb effect for dark mode */}
            {isDark && (
              <motion.div
                className="absolute inset-0 rounded-full bg-yellow-300"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(253, 224, 71, 0.4)",
                    "0 0 0 8px rgba(253, 224, 71, 0)",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            )}
          </motion.div>

          {/* Icons */}
          <div className="absolute inset-0 flex items-center justify-between px-2">
            {/* Sun Icon */}
            <motion.div
              className="text-yellow-500"
              animate={{
                opacity: isDark ? 0.3 : 1,
                scale: isDark ? 0.8 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>

            {/* Moon Icon */}
            <motion.div
              className="text-slate-300"
              animate={{
                opacity: isDark ? 1 : 0.3,
                scale: isDark ? 1 : 0.8,
              }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Tooltip */}
        <motion.div
          className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? "Light mode" : "Dark mode"}
        </motion.div>
      </motion.div>
    </div>
  );
}
