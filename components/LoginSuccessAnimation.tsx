"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, User } from "lucide-react";

interface LoginSuccessAnimationProps {
  userName: string;
  onComplete: () => void;
}

export default function LoginSuccessAnimation({ userName, onComplete }: LoginSuccessAnimationProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 300);
    const t2 = setTimeout(() => setStep(2), 800);
    const t3 = setTimeout(() => setStep(3), 1400);
    const t4 = setTimeout(() => {
      setStep(4);
      onComplete();
    }, 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <div className="relative flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: step >= 1 ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan to-neon-pink flex items-center justify-center mb-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: step >= 2 ? 1 : 0, rotate: step >= 2 ? 0 : -180 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 20 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-2">Welcome!</h2>
            <p className="text-xl text-gray-300">
              Hello, <span className="text-neon-cyan font-semibold">{userName}</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">Login successful</p>
          </motion.div>

          <motion.div
            className="absolute -inset-8 rounded-full border-2 border-neon-cyan/30"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: step >= 1 ? 2 : 0, opacity: step >= 1 ? 0 : 1 }}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            className="absolute -inset-8 rounded-full border-2 border-neon-pink/30"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: step >= 1 ? 2.5 : 0, opacity: step >= 1 ? 0 : 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: i % 2 === 0 ? "var(--neon-cyan)" : "var(--neon-pink)",
              }}
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{
                x: Math.cos((i * 30 * Math.PI) / 180) * 120,
                y: Math.sin((i * 30 * Math.PI) / 180) * 120,
                opacity: step >= 1 && step < 3 ? 1 : 0,
              }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.02 }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
