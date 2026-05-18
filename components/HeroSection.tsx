"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useAuthStore } from "@/lib/auth-store";
import LoginSuccessAnimation from "@/components/LoginSuccessAnimation";
import Link from "next/link";
import { User, ArrowDown, Users, FolderOpen, Calendar } from "lucide-react";

function generateSessionId() {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("visitor_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("visitor_session_id", sessionId);
  }
  return sessionId;
}

export default function HeroSection() {
  const { t } = useLanguage();
  const { isAuthenticated, user, showSuccessAnimation, dismissSuccessAnimation, checkAuth } = useAuthStore();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [onlineCount, setOnlineCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [yearsExp] = useState(1);

  const fetchProjectsCount = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjectsCount(data.realProjects || 0);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  }, []);

  const pingOnline = useCallback(async () => {
    try {
      const sessionId = generateSessionId();
      const res = await fetch("/api/online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      setOnlineCount(data.online || 0);
    } catch (error) {
      console.error("Failed to ping online:", error);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    fetchProjectsCount();
    pingOnline();

    const interval = setInterval(pingOnline, 30000);

    return () => clearInterval(interval);
  }, [checkAuth, fetchProjectsCount, pingOnline]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white" id="hero-section">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-neon-cyan/10 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x,
            y: mousePosition.y,
            scale: [1, 1.2, 1],
          }}
          transition={{
            x: { type: "spring", stiffness: 50, damping: 30 },
            y: { type: "spring", stiffness: 50, damping: 30 },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-neon-pink/10 rounded-full blur-3xl"
          animate={{
            x: -mousePosition.x,
            y: -mousePosition.y,
            scale: [1, 1.3, 1],
          }}
          transition={{
            x: { type: "spring", stiffness: 50, damping: 30 },
            y: { type: "spring", stiffness: 50, damping: 30 },
            scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 247, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 247, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Login Success Animation */}
      <AnimatePresence>
        {showSuccessAnimation && user && (
          <LoginSuccessAnimation
            userName={user.name}
            onComplete={dismissSuccessAnimation}
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase bg-neon-cyan/10 text-neon-cyan rounded-full border border-neon-cyan/20">
            Premium Digital Solutions
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl font-bold mb-6 md:text-7xl lg:text-8xl font-poppins"
        >
          <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            {t.hero.title}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl mb-12 max-w-2xl mx-auto text-gray-300 leading-relaxed"
        >
          {t.hero.subtitle}
        </motion.p>

        {/* Buttons */}
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div
              key="get-started"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col items-center gap-4"
            >
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px var(--neon-cyan), 0 0 60px rgba(0, 247, 255, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="px-12 py-4 text-xl bg-gradient-to-r from-neon-cyan to-cyan-400 hover:from-cyan-400 hover:to-neon-cyan text-black font-bold rounded-xl shadow-lg shadow-neon-cyan/30 transition-all relative overflow-hidden group"
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              </Link>
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="text-neon-cyan hover:underline">
                  Login here
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/profile">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px var(--neon-cyan)" }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 text-lg bg-neon-cyan hover:bg-cyan-500 text-black font-semibold rounded-lg flex items-center gap-2"
                >
                  <User className="w-5 h-5" />
                  {user?.name || "Profile"}
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px var(--neon-cyan)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.open("https://www.facebook.com/share/1Jcn2cH4b5/", "_blank")}
                className="px-8 py-3 text-lg border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20 rounded-lg border cursor-pointer"
              >
                {t.hero.hireTalent}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: `${projectsCount}`, label: "Projects", icon: FolderOpen },
            { value: `${onlineCount}`, label: "Online Now", icon: Users },
            { value: `${yearsExp}+`, label: "Years Exp", icon: Calendar },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.1, type: "spring" }}
              className="text-center"
            >
              <div className="flex justify-center mb-2">
                <stat.icon className="w-5 h-5 text-neon-cyan" />
              </div>
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-gray-500"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ArrowDown className="w-5 h-5 text-neon-cyan" />
        </motion.div>
      </motion.div>
    </section>
  );
}
