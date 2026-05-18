"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowRight, Check, Loader2, Shield, Lock, MessageSquare, User, Mail, X } from "lucide-react";
import Link from "next/link";

type FormStep = "name" | "email" | "message" | "chat";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "admin";
  timestamp: Date;
}

const adminResponses = [
  "สวัสดีครับ! ขอบคุณที่ติดต่อมา มีอะไรให้ผมช่วยครับ?",
  "ขอบคุณสำหรับข้อมูลครับ ผมจะตรวจสอบให้เร็วที่สุดครับ",
  "เข้าใจครับ ผมจะดำเนินการให้ครับ มีอะไรเพิ่มเติมไหมครับ?",
  "ขอบคุณครับ ผมได้รับข้อมูลเรียบร้อยแล้ว จะติดต่อกลับเร็วๆ นี้ครับ",
];

export default function ContactPage() {
  const [step, setStep] = useState<FormStep>("name");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (step === "chat" && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [step]);

  const handleNext = () => {
    setError("");
    if (step === "name") {
      if (!name.trim()) {
        setError("กรุณาระบุชื่อ");
        return;
      }
      setStep("email");
    } else if (step === "email") {
      if (!email.trim()) {
        setError("กรุณาระบุอีเมล");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("กรุณาระบุอีเมลที่ถูกต้อง");
        return;
      }
      setStep("message");
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError("กรุณาระบุข้อความ");
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
        setChatMessages([
          {
            id: "welcome",
            text: `สวัสดีครับ ${name}! ขอบคุณที่ติดต่อมา มีอะไรให้ผมช่วยครับ?`,
            sender: "admin",
            timestamp: new Date(),
          },
        ]);
        setStep("chat");
      } else {
        const data = await res.json();
        setError(data.error || "ไม่สามารถส่งข้อความได้");
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");

    setTimeout(() => {
      const randomResponse = adminResponses[Math.floor(Math.random() * adminResponses.length)];
      const adminMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: "admin",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, adminMessage]);
    }, 1000 + Math.random() * 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (step === "chat") {
        handleChatSend();
      } else if (step === "message") {
        handleSubmit();
      } else {
        handleNext();
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-pink/5 rounded-full blur-3xl" />
      </div>

      {/* Back Button */}
      <div className="relative z-10 container mx-auto px-4 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-neon-cyan transition-colors group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">กลับหน้าหลัก</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Page Title */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
                ติดต่อเรา
              </span>
            </h1>
            <p className="text-gray-400">พิมพ์ข้อความของคุณในสไตล์โค้ด</p>
          </div>

          {/* Code Editor Window */}
          <div className="rounded-xl overflow-hidden border border-gray-700 shadow-2xl shadow-neon-cyan/10 bg-[#1e1e2e]">
            {/* Editor Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#181825] border-b border-gray-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-gray-500 ml-2 font-mono">
                {step === "chat" ? "chat.ts" : "contact-form.ts"}
              </span>
              <div className="flex-1" />

              {/* Session Badge */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 font-mono">
                <Lock className="w-3 h-3 text-green-500" />
                <span>Session: {sessionId.slice(0, 6)}</span>
              </div>
            </div>

            {/* Editor Body */}
            <div className="p-6 font-mono text-sm md:text-base min-h-[400px]" onKeyDown={handleKeyDown}>
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

                    <div className="h-6" />

                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-gray-600 w-8 text-right select-none text-xs">2</span>
                      <span>
                        <span className="text-gray-500 italic">// ขั้นตอนที่ 1: ระบุชื่อของคุณ</span>
                      </span>
                    </div>

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
                          placeholder="ชื่อของคุณ..."
                          className="bg-transparent text-green-400 outline-none w-48 md:w-64 caret-neon-cyan placeholder-gray-600"
                          autoFocus
                          maxLength={50}
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

                    <div className="flex items-center gap-4 ml-16">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNext}
                        className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-lg hover:bg-neon-cyan hover:text-black transition-all text-xs"
                      >
                        <span>ถัดไป</span>
                        <ArrowRight className="w-3 h-3" />
                      </motion.button>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
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

                    <div className="h-3" />

                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-gray-600 w-8 text-right select-none text-xs">3</span>
                      <span>
                        <span className="text-gray-500 italic">// ขั้นตอนที่ 2: ระบุอีเมลของคุณ</span>
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
                        ← ย้อนกลับ
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNext}
                        className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-lg hover:bg-neon-cyan hover:text-black transition-all text-xs"
                      >
                        <span>ถัดไป</span>
                        <ArrowRight className="w-3 h-3" />
                      </motion.button>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
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

                    <div className="h-2" />

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

                    <div className="flex items-center gap-4 mb-1">
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

                    <div className="h-2" />

                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-gray-600 w-8 text-right select-none text-xs">4</span>
                      <span>
                        <span className="text-gray-500 italic">// ขั้นตอนที่ 3: ระบุข้อความของคุณ</span>
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
                          placeholder="ข้อความของคุณ..."
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
                        ← ย้อนกลับ
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
                            <span>กำลังส่ง...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>ยืนยัน</span>
                          </>
                        )}
                      </motion.button>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                      <span className="text-gray-600 w-8 text-right select-none text-xs">6</span>
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                        className="inline-block w-2 h-4 bg-neon-cyan"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Chat Mode */}
                {step === "chat" && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col h-[500px]"
                  >
                    {/* Chat Header */}
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-pink flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">แชทสด</p>
                          <p className="text-xs text-gray-500">Session: {sessionId.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-400">
                        <Shield className="w-3 h-3" />
                        <span>Encrypted</span>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                      <AnimatePresence>
                        {chatMessages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                                msg.sender === "user"
                                  ? "bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan rounded-br-sm"
                                  : "bg-gray-800 border border-gray-700 text-gray-200 rounded-bl-sm"
                              }`}
                            >
                              <p className="text-sm">{msg.text}</p>
                              <p className="text-xs text-gray-500 mt-1">{formatTime(msg.timestamp)}</p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-700">
                      <input
                        ref={chatInputRef}
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleChatSend();
                          }
                        }}
                        placeholder="พิมพ์ข้อความ..."
                        className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-neon-cyan/50"
                        maxLength={500}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleChatSend}
                        disabled={!chatInput.trim()}
                        className="p-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-lg hover:bg-neon-cyan hover:text-black transition-all disabled:opacity-30"
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Editor Footer */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-t border-gray-700 text-xs text-gray-500 font-mono">
              <span>UTF-8</span>
              <span>TypeScript</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {step === "chat" ? "Connected" : "Ready"}
              </span>
            </div>
          </div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500"
          >
            <Lock className="w-3 h-3" />
            <span>การสนทนาของคุณเป็นส่วนตัวและเข้ารหัส Session ID: {sessionId}</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
