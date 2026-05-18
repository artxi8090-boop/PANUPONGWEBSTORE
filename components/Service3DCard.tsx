"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Torus, Icosahedron, Box } from "@react-three/drei";

interface Model3DProps {
  type: "sphere" | "torus" | "box" | "icosahedron";
  color: string;
  isHovered: boolean;
}

function Model3D({ type, color, isHovered }: Model3DProps) {
  const scale = isHovered ? 1.3 : 0.8;

  return (
    <Float speed={2} rotationIntensity={isHovered ? 2 : 0.5} floatIntensity={isHovered ? 2 : 0.5}>
      {type === "sphere" && (
        <Sphere args={[1, 64, 64]} scale={scale}>
          <MeshDistortMaterial
            color={color}
            distort={0.4}
            speed={3}
            roughness={0.1}
            metalness={0.9}
          />
        </Sphere>
      )}
      {type === "torus" && (
        <Torus args={[1, 0.4, 16, 100]} scale={scale}>
          <meshStandardMaterial
            color={color}
            wireframe={!isHovered}
            transparent
            opacity={isHovered ? 0.9 : 0.4}
            metalness={0.8}
            roughness={0.2}
          />
        </Torus>
      )}
      {type === "box" && (
        <Box args={[1.5, 1.5, 1.5]} scale={scale}>
          <MeshDistortMaterial
            color={color}
            distort={0.2}
            speed={2}
            roughness={0.3}
            metalness={0.7}
            transparent
            opacity={0.85}
          />
        </Box>
      )}
      {type === "icosahedron" && (
        <Icosahedron args={[1, 0]} scale={scale}>
          <meshStandardMaterial
            color={color}
            wireframe={!isHovered}
            transparent
            opacity={isHovered ? 0.9 : 0.4}
            metalness={0.8}
            roughness={0.2}
          />
        </Icosahedron>
      )}
    </Float>
  );
}

interface Service3DCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  modelType: "sphere" | "torus" | "box" | "icosahedron";
  color: string;
  delay?: number;
}

export default function Service3DCard({ icon, title, description, modelType, color, delay = 0 }: Service3DCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <div className={`relative bg-gray-900/50 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-500 ${
        isHovered ? "border-neon-cyan/50 shadow-2xl shadow-neon-cyan/20 -translate-y-2" : "border-gray-800"
      }`}>
        {/* 3D Model Area */}
        <div className="relative h-40 bg-gray-800/30">
          <Canvas camera={{ position: [0, 0, 4], fov: 50 }} style={{ background: "transparent" }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1.5} color={color} />
            <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ffffff" />
            <Model3D type={modelType} color={color} isHovered={isHovered} />
          </Canvas>

          {/* Icon Overlay */}
          <div className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-gray-900/80 flex items-center justify-center text-neon-cyan">
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-neon-cyan transition-colors">
            {title}
          </h3>
          <p className="text-gray-400 text-sm mb-4">{description}</p>
          <motion.span
            className="inline-block text-neon-cyan font-medium text-sm"
            animate={{ x: isHovered ? 5 : 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            เรียนรู้เพิ่มเติม →
          </motion.span>
        </div>

        {/* Glow Effect */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${
          color === "#00f7ff" ? "from-neon-cyan/10 to-transparent" :
          color === "#ff2ced" ? "from-neon-pink/10 to-transparent" :
          "from-purple-500/10 to-transparent"
        } opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
      </div>
    </motion.div>
  );
}
