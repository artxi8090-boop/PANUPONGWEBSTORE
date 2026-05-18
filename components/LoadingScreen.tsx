"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let completed = false;

    interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          completed = true;
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    const maxTimer = setTimeout(() => {
      if (!completed) {
        completed = true;
        clearInterval(interval);
        setProgress(100);
      }
    }, 1800);

    return () => {
      if (!completed) clearInterval(interval);
      clearTimeout(maxTimer);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const fadeTimer = setTimeout(() => {
        setVisible(false);
      }, 300);
      return () => clearTimeout(fadeTimer);
    }
  }, [progress]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
      style={{ transition: "opacity 0.3s ease-out", opacity: progress >= 100 ? 0 : 1 }}
    >
      <div
        className="mb-8"
        style={{
          animation: "logoIn 0.8s ease-out forwards",
        }}
      >
        <img
          src="/logo.png"
          alt="Panupongwebstore Logo"
          className="w-24 h-auto object-contain"
        />
      </div>

      <h2
        className="text-2xl font-bold text-white mb-4"
        style={{
          animation: "fadeUp 0.6s ease-out 0.3s both",
        }}
      >
        Panupongwebstore
      </h2>

      <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-neon-cyan to-neon-pink"
          style={{
            width: `${Math.min(progress, 100)}%`,
            transition: "width 0.3s ease-out",
          }}
        />
      </div>

      <p
        className="text-sm text-gray-400 font-mono"
        style={{
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      >
        {Math.min(Math.round(progress), 100)}%
      </p>

      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-neon-cyan"
            style={{
              animation: `bounce 0.6s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
