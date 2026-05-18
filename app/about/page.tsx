"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Palette,
  Globe,
  Sparkles,
  ArrowLeft,
  MapPin,
  Briefcase,
  Award,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import RatingSystem from "@/components/RatingSystem";
import CodeContactForm from "@/components/CodeContactForm";

const techStack = [
  "Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js",
  "PostgreSQL", "Figma", "Three.js", "Framer Motion", "Zustand",
];

interface RatingData {
  ratings: number[];
  userRating: number | null;
}

const STORAGE_KEY = "website_ratings";

function loadRatings(): RatingData {
  if (typeof window === "undefined") return { ratings: [], userRating: null };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { ratings: [], userRating: null };
}

export default function AboutPage() {
  const { t } = useLanguage();
  const a = t.about;
  const [ratingData, setRatingData] = useState<RatingData>({ ratings: [], userRating: null });

  useEffect(() => {
    setRatingData(loadRatings());
  }, []);

  const averageRating = ratingData.ratings.length > 0
    ? ratingData.ratings.reduce((sum, r) => sum + r, 0) / ratingData.ratings.length
    : 0;

  const satisfactionPercent = Math.round((averageRating / 5) * 100) || 100;

  const stats = [
    { icon: <Code2 className="w-6 h-6" />, value: a.stats.projects.value, label: a.stats.projects.label },
    { icon: <Award className="w-6 h-6" />, value: a.stats.experience.value, label: a.stats.experience.label },
    { icon: <Globe className="w-6 h-6" />, value: a.stats.clients.value, label: a.stats.clients.label },
    { icon: <Sparkles className="w-6 h-6" />, value: `${satisfactionPercent}%`, label: a.stats.satisfaction.label },
  ];

  const skills = [
    { name: a.skills.webDev, level: 95, color: "from-neon-cyan to-cyan-400" },
    { name: a.skills.uiux, level: 90, color: "from-neon-pink to-purple-400" },
    { name: a.skills.mobile, level: 85, color: "from-green-400 to-emerald-500" },
    { name: a.skills.seo, level: 80, color: "from-yellow-400 to-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-pink/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl" />
      </div>

      {/* Back Button */}
      <div className="relative z-10 container mx-auto px-4 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-neon-cyan transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm">{a.backToHome}</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase bg-neon-cyan/10 text-neon-cyan rounded-full border border-neon-cyan/20 mb-6">
              {a.badge}
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                {a.heroTitle1}
              </span>
              <br />
              <span className="bg-gradient-to-r from-neon-cyan via-cyan-400 to-neon-pink bg-clip-text text-transparent">
                {a.heroTitle2}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {a.heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 text-center hover:border-neon-cyan/50 transition-colors group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neon-cyan/10 text-neon-cyan mb-3 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Rating System Section */}
      <section className="relative z-10 container mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <RatingSystem stats={a.stats} />
        </motion.div>
      </section>

      {/* Creator Profile Section */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl overflow-hidden">
            {/* Profile Header */}
            <div className="h-48 md:h-56 bg-gradient-to-r from-neon-cyan/20 via-neon-pink/20 to-purple-500/20 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            </div>

            {/* Profile Content */}
            <div className="px-6 md:px-10 pb-10 -mt-20 relative">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="flex items-end gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-neon-cyan via-neon-pink to-purple-500 p-1 shadow-2xl shadow-neon-cyan/20"
                  >
                    <div className="w-full h-full rounded-xl overflow-hidden bg-gray-900">
                      <Image
                        src="/images/creator.jpg"
                        alt="PANUPONG KAMMAUNGJAI"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>
                  </motion.div>

                  <div className="pb-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">{a.creator.name}</h2>
                    <p className="text-neon-cyan font-medium mt-1">{a.creator.role}</p>
                    <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{a.creator.location}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3">
                  <a
                    href="tel:+66985028706"
                    className="flex items-center gap-2 px-5 py-2.5 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-xl hover:bg-neon-cyan hover:text-black transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/30 hover:-translate-y-0.5"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">{a.creator.call}</span>
                  </a>
                  <a
                    href="mailto:artxi8390@gmail.com"
                    className="flex items-center gap-2 px-5 py-2.5 bg-neon-pink/10 border border-neon-pink/30 text-neon-pink rounded-xl hover:bg-neon-pink hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-neon-pink/30 hover:-translate-y-0.5"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">{a.creator.email}</span>
                  </a>
                </div>
              </div>

              {/* About Description */}
              <div className="mt-10 grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-neon-cyan" />
                    {a.aboutMe.title}
                  </h3>
                  <div className="space-y-4 text-gray-400 leading-relaxed">
                    <p>{a.aboutMe.p1}</p>
                    <p>{a.aboutMe.p2}</p>
                    <p>{a.aboutMe.p3}</p>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-neon-pink" />
                    {a.skills.title}
                  </h3>
                  <div className="space-y-4">
                    {skills.map((skill) => (
                      <div key={skill.name}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-300">{skill.name}</span>
                          <span className="text-gray-500">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className={`h-2 rounded-full bg-gradient-to-r ${skill.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="mt-10 pt-8 border-t border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-neon-cyan" />
                  {a.techStack.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech) => (
                    <motion.span
                      key={tech}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-4 py-2 bg-gray-800/80 border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-neon-cyan/50 hover:text-neon-cyan transition-all cursor-default"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Contact Section - Code Editor Form */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            <span className="bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
              {a.cta.title}
            </span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto text-center">
            {a.cta.subtitle}
          </p>

          <CodeContactForm />
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="relative p-10 md:p-16 bg-gradient-to-br from-gray-900 via-gray-900/90 to-gray-900 border border-gray-800 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 via-transparent to-neon-pink/5" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {a.bottomCta.title}
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
                {a.bottomCta.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px var(--neon-cyan), 0 0 40px rgba(0, 247, 255, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3.5 text-lg bg-neon-cyan hover:bg-cyan-400 text-black font-semibold rounded-xl transition-all"
                  >
                    {a.bottomCta.getStarted}
                  </motion.button>
                </Link>
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3.5 text-lg border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 rounded-xl transition-all"
                  >
                    {a.bottomCta.contactUs}
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer Space */}
      <div className="h-20" />
    </div>
  );
}
