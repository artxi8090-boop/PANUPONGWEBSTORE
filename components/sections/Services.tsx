"use client";

import { motion } from "framer-motion";
import { Code, Smartphone, Palette, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Service3DCard from "@/components/Service3DCard";

export default function Services() {
  const { t } = useLanguage();

  const services = [
    {
      title: t.services.webDev.title,
      description: t.services.webDev.description,
      icon: <Code size={20} />,
      modelType: "sphere" as const,
      color: "#00f7ff",
    },
    {
      title: t.services.mobileDev.title,
      description: t.services.mobileDev.description,
      icon: <Smartphone size={20} />,
      modelType: "torus" as const,
      color: "#ff2ced",
    },
    {
      title: t.services.uiux.title,
      description: t.services.uiux.description,
      icon: <Palette size={20} />,
      modelType: "icosahedron" as const,
      color: "#7c3aed",
    },
    {
      title: t.services.seo.title,
      description: t.services.seo.description,
      icon: <Search size={20} />,
      modelType: "box" as const,
      color: "#10b981",
    },
  ];

  return (
    <section className="py-24 bg-black/80 relative overflow-hidden" id="services">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-pink/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase bg-neon-cyan/10 text-neon-cyan rounded-full border border-neon-cyan/20 mb-4">
            What We Do
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t.services.heading}</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t.services.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Service3DCard
              key={service.title}
              icon={service.icon}
              title={service.title}
              description={service.description}
              modelType={service.modelType}
              color={service.color}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
