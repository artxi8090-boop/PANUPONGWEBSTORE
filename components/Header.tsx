"use client";

import { useState, useEffect, useRef } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { useAuthStore } from "@/lib/auth-store";
import { User, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function Header() {
  const { t } = useLanguage();
  const { isAuthenticated, user, logout, checkAuth } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    try {
      const path = window.location.pathname;
      if (path === "/login" || path === "/signup") {
        setShouldShow(false);
      }
    } catch {
      setShouldShow(true);
    }
  }, []);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    checkAuth().catch(() => {
    });
  }, [checkAuth]);

  useEffect(() => {
    const handleScroll = () => {
      try {
        setIsScrolled(window.scrollY > 10);
      } catch {
        setIsScrolled(false);
      }
    };
    try {
      window.addEventListener("scroll", handleScroll);
    } catch {
    }
    return () => {
      try {
        window.removeEventListener("scroll", handleScroll);
      } catch {
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    try {
      document.addEventListener("mousedown", handleClickOutside);
    } catch {
    }
    return () => {
      try {
        document.removeEventListener("mousedown", handleClickOutside);
      } catch {
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
    }
    setShowUserMenu(false);
  };

  if (!shouldShow) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/80 backdrop-blur-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Panupongwebstore Logo" className="h-10 w-auto object-contain" />
        </Link>
        <nav className="hidden md:flex space-x-6">
          <a href="#services" className="text-white hover:text-neon-cyan">{t.nav.services}</a>
          <a href="#portfolio" className="text-white hover:text-neon-cyan">{t.nav.portfolio}</a>
          <Link href="/about" className="text-white hover:text-neon-cyan">{t.nav.about}</Link>
          <Link href="/contact" className="text-white hover:text-neon-cyan">{t.nav.contact}</Link>
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-cyan to-neon-pink flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm text-white hidden sm:inline">{user?.name}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-neon-cyan/10 text-neon-cyan rounded-full capitalize">
                        {user?.role}
                      </span>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/signup">
              <button className="px-4 py-2 text-sm bg-neon-cyan hover:bg-cyan-500 text-black font-semibold rounded-lg transition-colors">
                Get Started
              </button>
            </Link>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
