"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Torus, Icosahedron } from "@react-three/drei";
import * as THREE from "three";

function AnimatedSphere({ position, color, speed, distort }: { position: [number, number, number]; color: string; speed: number; distort: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.3;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function AnimatedTorus({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed;
      meshRef.current.rotation.z = state.clock.elapsedTime * speed * 0.5;
    }
  });

  return (
    <Float speed={speed * 0.5} rotationIntensity={1} floatIntensity={0.5}>
      <Torus ref={meshRef} args={[1.5, 0.4, 16, 100]} position={position}>
        <meshStandardMaterial
          color={color}
          wireframe
          transparent
          opacity={0.3}
        />
      </Torus>
    </Float>
  );
}

function AnimatedIcosahedron({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.5;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.8} floatIntensity={1.5}>
      <Icosahedron ref={meshRef} args={[0.8, 0]} position={position}>
        <meshStandardMaterial
          color={color}
          wireframe
          transparent
          opacity={0.4}
        />
      </Icosahedron>
    </Float>
  );
}

function Particles({ count = 200 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#00f7ff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function Hero3DBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f7ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff2ced" />

        <AnimatedSphere position={[-2, 1, -2]} color="#00f7ff" speed={0.5} distort={0.4} />
        <AnimatedSphere position={[2, -1, -3]} color="#ff2ced" speed={0.3} distort={0.3} />
        <AnimatedSphere position={[0, 2, -4]} color="#7c3aed" speed={0.4} distort={0.5} />

        <AnimatedTorus position={[-3, -2, -2]} color="#00f7ff" speed={0.2} />
        <AnimatedTorus position={[3, 2, -3]} color="#ff2ced" speed={0.15} />

        <AnimatedIcosahedron position={[0, 0, -2]} color="#00f7ff" speed={0.3} />
        <AnimatedIcosahedron position={[-2, -1, -3]} color="#ff2ced" speed={0.25} />

        <Particles count={300} />
      </Canvas>
    </div>
  );
}
