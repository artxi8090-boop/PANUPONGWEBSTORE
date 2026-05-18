"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-black">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-pink/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-neon-cyan/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-neon-pink/10 rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
              Panupongwebstore
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-md">
              Premium digital solutions platform. Connect with top talent or offer your expertise.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-2 h-2 bg-neon-cyan rounded-full" />
                <span>Secure authentication with encrypted passwords</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-2 h-2 bg-neon-pink rounded-full" />
                <span>Role-based access for clients and freelancers</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-2 h-2 bg-neon-cyan rounded-full" />
                <span>Protected sessions with automatic timeout</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-pink/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
              Panupongwebstore
            </Link>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl">
            {children}
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-neon-cyan transition-colors">
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
