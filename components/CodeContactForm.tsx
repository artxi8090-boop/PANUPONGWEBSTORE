"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowRight, Check, User, Mail, MessageSquare, Loader2 } from "lucide-react";

type FormStep = "name" | "email" | "message" | "success";

export default function CodeContactForm() {
  const [step, setStep] = useState<FormStep>("name");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleNext = () => {
    setError("");
    if (step === "name") {
      if (!name.trim()) {
        setError("Please enter your name");
        return;
      }
      setStep("email");
    } else if (step === "email") {
      if (!email.trim()) {
        setError("Please enter your email");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email");
        return;
      }
      setStep("message");
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setStep("success");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send message");
      }
    } catch {
      setError("Unable to connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (step === "message") {
        handleSubmit();
      } else {
        handleNext();
      }
    }
  };

  const steps = ["name", "email", "message"];
  const currentStepIndex = steps.indexOf(step === "success" ? "message" : step);

  return (
    <div className="rounded-xl overflow-hidden border border-gray-700 shadow-2xl shadow-neon-cyan/10 bg-[#1e1e2e] max-w-2xl mx-auto">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#181825] border-b border-gray-700">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-gray-500 ml-2 font-mono">contact-form.ts</span>
        <div className="flex-1" />

        {/* Step Indicators */}
        <div className="flex items-center gap-2">
          {["name", "email", "message"].map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < currentStepIndex
                    ? "bg-green-500"
                    : i === currentStepIndex
                    ? "bg-neon-cyan"
                    : "bg-gray-600"
                }`}
              />
              {i < 2 && <div className="w-4 h-px bg-gray-700" />}
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-6 font-mono text-sm md:text-base min-h-[280px]" onKeyDown={handleKeyDown}>
        <AnimatePresence mode="wait">
          {/* Step 1: Name */}
          {step === "name" && (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Line 1: Import */}
              <div className="flex items-center gap-4 mb-2">
                <span className="text-gray-600 w-8 text-right select-none text-xs">1</span>
                <span>
                  <span className="text-purple-400">import</span>
                  <span className="text-gray-300"> {"{"} </span>
                  <span className="text-neon-cyan">ContactForm</span>
                  <span className="text-gray-300"> {"}"} </span>
                  <span className="text-purple-400">from</span>
                  <span className="text-green-400"> &apos;@/contact&apos;</span>
                  <span className="text-gray-500">;</span>
                </span>
              </div>

              {/* Line 2: Empty */}
              <div className="h-4" />

              {/* Line 3: Comment */}
              <div className="flex items-center gap-4 mb-2">
                <span className="text-gray-600 w-8 text-right select-none text-xs">2</span>
                <span>
                  <span className="text-gray-500 italic">// Step 1: Enter your name</span>
                </span>
              </div>

              {/* Line 4: Variable */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-600 w-8 text-right select-none text-xs">3</span>
                <span>
                  <span className="text-purple-400">const</span>
                  <span className="text-yellow-300"> name</span>
                  <span className="text-gray-300"> = </span>
                  <span className="text-gray-500">&quot;</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(""); }}
                    placeholder="Your name..."
                    className="bg-transparent text-green-400 outline-none w-48 md:w-64 caret-neon-cyan placeholder-gray-600"
                    autoFocus
                    maxLength={50}
                  />
                  <span className="text-gray-500">&quot;</span>
                  <span className="text-gray-500">;</span>
                </span>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mb-4 ml-16"
                >
                  <span className="text-red-500">✗</span> {error}
                </motion.div>
              )}

              {/* Next Button */}
              <div className="flex items-center gap-4 ml-16">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-lg hover:bg-neon-cyan hover:text-black transition-all text-xs"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3 h-3" />
                </motion.button>
              </div>

              {/* Cursor */}
              <div className="flex items-center gap-4 mt-4">
                <span className="text-gray-600 w-8 text-right select-none text-xs">4</span>
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                  className="inline-block w-2 h-4 bg-neon-cyan"
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Email */}
          {step === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-gray-600 w-8 text-right select-none text-xs">1</span>
                <span>
                  <span className="text-purple-400">import</span>
                  <span className="text-gray-300"> {"{"} </span>
                  <span className="text-neon-cyan">ContactForm</span>
                  <span className="text-gray-300"> {"}"} </span>
                  <span className="text-purple-400">from</span>
                  <span className="text-green-400"> &apos;@/contact&apos;</span>
                  <span className="text-gray-500">;</span>
                </span>
              </div>

              <div className="h-4" />

              {/* Name - completed */}
              <div className="flex items-center gap-4 mb-2">
                <span className="text-gray-600 w-8 text-right select-none text-xs">2</span>
                <span>
                  <span className="text-purple-400">const</span>
                  <span className="text-yellow-300"> name</span>
                  <span className="text-gray-300"> = </span>
                  <span className="text-green-400">&quot;{name}&quot;</span>
                  <span className="text-gray-500">;</span>
                  <span className="ml-2 text-green-500 text-xs">✓</span>
                </span>
              </div>

              <div className="h-4" />

              {/* Email input */}
              <div className="flex items-center gap-4 mb-2">
                <span className="text-gray-600 w-8 text-right select-none text-xs">3</span>
                <span>
                  <span className="text-gray-500 italic">// Step 2: Enter your email</span>
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-600 w-8 text-right select-none text-xs">4</span>
                <span>
                  <span className="text-purple-400">const</span>
                  <span className="text-yellow-300"> email</span>
                  <span className="text-gray-300"> = </span>
                  <span className="text-gray-500">&quot;</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="your@email.com"
                    className="bg-transparent text-green-400 outline-none w-48 md:w-64 caret-neon-cyan placeholder-gray-600"
                    autoFocus
                    maxLength={100}
                  />
                  <span className="text-gray-500">&quot;</span>
                  <span className="text-gray-500">;</span>
                </span>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mb-4 ml-16"
                >
                  <span className="text-red-500">✗</span> {error}
                </motion.div>
              )}

              <div className="flex items-center gap-3 ml-16">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep("name")}
                  className="px-4 py-2 text-gray-500 hover:text-gray-300 transition-colors text-xs"
                >
                  ← Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-lg hover:bg-neon-cyan hover:text-black transition-all text-xs"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3 h-3" />
                </motion.button>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <span className="text-gray-600 w-8 text-right select-none text-xs">5</span>
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                  className="inline-block w-2 h-4 bg-neon-cyan"
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Message */}
          {step === "message" && (
            <motion.div
              key="message"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-gray-600 w-8 text-right select-none text-xs">1</span>
                <span>
                  <span className="text-purple-400">import</span>
                  <span className="text-gray-300"> {"{"} </span>
                  <span className="text-neon-cyan">ContactForm</span>
                  <span className="text-gray-300"> {"}"} </span>
                  <span className="text-purple-400">from</span>
                  <span className="text-green-400"> &apos;@/contact&apos;</span>
                  <span className="text-gray-500">;</span>
                </span>
              </div>

              <div className="h-3" />

              <div className="flex items-center gap-4 mb-1">
                <span className="text-gray-600 w-8 text-right select-none text-xs">2</span>
                <span>
                  <span className="text-purple-400">const</span>
                  <span className="text-yellow-300"> name</span>
                  <span className="text-gray-300"> = </span>
                  <span className="text-green-400">&quot;{name}&quot;</span>
                  <span className="text-gray-500">;</span>
                  <span className="ml-2 text-green-500 text-xs">✓</span>
                </span>
              </div>

              <div className="flex items-center gap-4 mb-2">
                <span className="text-gray-600 w-8 text-right select-none text-xs">3</span>
                <span>
                  <span className="text-purple-400">const</span>
                  <span className="text-yellow-300"> email</span>
                  <span className="text-gray-300"> = </span>
                  <span className="text-green-400">&quot;{email}&quot;</span>
                  <span className="text-gray-500">;</span>
                  <span className="ml-2 text-green-500 text-xs">✓</span>
                </span>
              </div>

              <div className="h-3" />

              <div className="flex items-center gap-4 mb-2">
                <span className="text-gray-600 w-8 text-right select-none text-xs">4</span>
                <span>
                  <span className="text-gray-500 italic">// Step 3: Enter your message</span>
                </span>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <span className="text-gray-600 w-8 text-right select-none text-xs">5</span>
                <div>
                  <span>
                    <span className="text-purple-400">const</span>
                    <span className="text-yellow-300"> message</span>
                    <span className="text-gray-300"> = </span>
                    <span className="text-gray-500">&quot;</span>
                  </span>
                  <textarea
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); setError(""); }}
                    placeholder="Your message..."
                    className="bg-transparent text-green-400 outline-none w-full md:w-[500px] min-h-[80px] max-h-[150px] resize-none caret-neon-cyan placeholder-gray-600 block"
                    autoFocus
                    maxLength={2000}
                  />
                  <span>
                    <span className="text-gray-500">&quot;</span>
                    <span className="text-gray-500">;</span>
                  </span>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mb-4 ml-16"
                >
                  <span className="text-red-500">✗</span> {error}
                </motion.div>
              )}

              <div className="flex items-center gap-3 ml-16">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep("email")}
                  className="px-4 py-2 text-gray-500 hover:text-gray-300 transition-colors text-xs"
                >
                  ← Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-lg hover:bg-neon-cyan hover:text-black transition-all text-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>Submit</span>
                    </>
                  )}
                </motion.button>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <span className="text-gray-600 w-8 text-right select-none text-xs">6</span>
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                  className="inline-block w-2 h-4 bg-neon-cyan"
                />
              </div>
            </motion.div>
          )}

          {/* Success */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="flex flex-col items-center justify-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
              >
                <Check className="w-8 h-8 text-green-400" strokeWidth={3} />
              </motion.div>

              <div className="text-center font-mono">
                <div className="flex items-center gap-4 mb-2 justify-center">
                  <span className="text-gray-600 text-xs">1</span>
                  <span>
                    <span className="text-purple-400">const</span>
                    <span className="text-yellow-300"> status</span>
                    <span className="text-gray-300"> = </span>
                    <span className="text-green-400">&quot;Message sent successfully!&quot;</span>
                    <span className="text-gray-500">;</span>
                  </span>
                </div>
                <div className="flex items-center gap-4 justify-center">
                  <span className="text-gray-600 text-xs">2</span>
                  <span>
                    <span className="text-gray-500 italic">// We will get back to you soon ✓</span>
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setStep("name");
                  setName("");
                  setEmail("");
                  setMessage("");
                  setError("");
                }}
                className="mt-6 flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-lg hover:bg-neon-cyan hover:text-black transition-all text-xs"
              >
                Send another message
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Terminal Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-t border-gray-700 text-xs text-gray-500 font-mono">
        <span>UTF-8</span>
        <span>TypeScript</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          {step === "success" ? "Sent" : "Ready"}
        </span>
      </div>
    </div>
  );
}
