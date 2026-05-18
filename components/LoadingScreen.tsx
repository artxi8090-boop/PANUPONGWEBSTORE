"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let progressInterval: ReturnType<typeof setInterval>;

    progressInterval = setInterval(() => {
      if (!isMounted) return;
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 12;
      });
    }, 100);

    const failSafeTimeout = setTimeout(() => {
      if (isMounted) {
        setProgress(100);
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(progressInterval);
      clearTimeout(failSafeTimeout);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const fadeTimer = setTimeout(() => {
        setVisible(false);
      }, 200);
      return () => clearTimeout(fadeTimer);
    }
  }, [progress]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.2s ease-out",
        opacity: progress >= 100 ? 0 : 1,
        pointerEvents: progress >= 100 ? "none" : "auto",
      }}
    >
      <div
        style={{
          marginBottom: "2rem",
          animation: "pwLogoIn 0.8s ease-out forwards",
        }}
      >
        <img
          src="/logo.png"
          alt="Panupongwebstore Logo"
          style={{ width: "6rem", height: "auto", objectFit: "contain" }}
        />
      </div>

      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "#fff",
          marginBottom: "1rem",
          animation: "pwFadeUp 0.6s ease-out 0.3s both",
        }}
      >
        Panupongwebstore
      </h2>

      <div
        style={{
          width: "16rem",
          height: "0.25rem",
          backgroundColor: "#1f2937",
          borderRadius: "9999px",
          overflow: "hidden",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(progress, 100)}%`,
            background: "linear-gradient(to right, #00f7ff, #ff2ced)",
            transition: "width 0.3s ease-out",
          }}
        />
      </div>

      <p
        style={{
          fontSize: "0.875rem",
          color: "#9ca3af",
          fontFamily: "monospace",
          animation: "pwPulse 1.5s ease-in-out infinite",
        }}
      >
        {Math.min(Math.round(progress), 100)}%
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: "0.5rem",
              height: "0.5rem",
              borderRadius: "9999px",
              backgroundColor: "#00f7ff",
              animation: `pwBounce 0.6s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
