"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  thumbnail: string;
  url?: string;
  techStack?: string[];
  color: string;
}

interface Portfolio3DCardProps {
  project: Project;
  index: number;
}

export default function Portfolio3DCard({ project, index }: Portfolio3DCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className="group"
    >
      {project.url ? (
        <Link
          href={project.url}
          target={project.url.startsWith("http") ? "_blank" : undefined}
          rel={project.url.startsWith("http") ? "noopener noreferrer" : undefined}
          className="block"
        >
          <CardInner project={project} isHovered={isHovered} />
        </Link>
      ) : (
        <CardInner project={project} isHovered={isHovered} />
      )}
    </motion.div>
  );
}

function CardInner({ project, isHovered }: { project: Project; isHovered: boolean }) {
  return (
    <div className={`relative bg-gray-900/50 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-500 ${
      isHovered ? "border-neon-cyan/50 shadow-2xl shadow-neon-cyan/20 -translate-y-2" : "border-gray-800"
    }`}>
      {/* Project Screenshot */}
      <div className="relative h-48 bg-black overflow-hidden">
        <img
          src={project.thumbnail}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-black/60 flex items-center justify-center"
        >
          {project.url ? (
            <span className="bg-neon-cyan text-black p-3 rounded-full hover:bg-cyan-400 transition-colors">
              <Eye size={24} />
            </span>
          ) : (
            <button className="bg-neon-cyan text-black p-3 rounded-full">
              <Eye size={24} />
            </button>
          )}
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-neon-cyan transition-colors">
          {project.title}
        </h3>
        <span className="inline-block bg-gray-800 text-neon-cyan px-3 py-1 rounded-full text-sm mb-3">
          {project.category}
        </span>
        <p className="text-gray-400 text-sm">{project.description}</p>
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-xs bg-gray-800/50 text-gray-400 px-2 py-1 rounded"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
}
