"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
    >
      {/* Logo Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="mb-8"
      >
        <img
          src="/logo.png"
          alt="Panupongwebstore Logo"
          className="w-24 h-auto object-contain"
        />
      </motion.div>

      {/* Loading Text */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-white mb-4"
      >
        Panupongwebstore
      </motion.h2>

      {/* Progress Bar */}
      <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-gradient-to-r from-neon-cyan to-neon-pink"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Loading Percentage */}
      <motion.p
        className="text-sm text-gray-400 font-mono"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {Math.min(Math.round(progress), 100)}%
      </motion.p>

      {/* Animated Dots */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-neon-cyan"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </div>
    </motion.div>
  );
}
