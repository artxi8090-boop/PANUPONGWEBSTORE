"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Shield, Calendar, LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      setIsChecking(false);
    };
    init();
  }, [checkAuth]);

  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      router.push("/login");
    }
  }, [isChecking, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const joinDate = new Date(user.id ? Date.now() : Date.now()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-neon-cyan transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-neon-cyan/20 via-neon-pink/20 to-neon-cyan/20 relative">
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan to-neon-pink flex items-center justify-center border-4 border-gray-900">
                  <span className="text-3xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="pt-16 px-8 pb-8">
              <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
              <span className="inline-block px-3 py-1 text-xs bg-neon-cyan/10 text-neon-cyan rounded-full capitalize mb-6">
                {user.role}
              </span>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-neon-pink/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-neon-pink" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Role</p>
                    <p className="font-medium capitalize">{user.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Member since</p>
                    <p className="font-medium">{joinDate}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-red-900/30 border border-red-800 text-red-400 hover:bg-red-900/50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
