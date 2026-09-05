"use client";
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sphere, Torus, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import type { RiskCategory } from "@/types";

interface Props {
  score?: number;
  category?: RiskCategory;
  scale?: number;
  interactive?: boolean;
}

export function FinancialCore({
  score = 63.5,
  category = "watch",
  scale = 1.2,
  interactive = true,
}: Props) {
  const coreRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Compute colors and dynamics based on risk category
  const config = useMemo(() => {
    switch (category) {
      case "healthy":
        return {
          primaryColor: "#10B981",
          secondaryColor: "#06B6D4",
          wireColor: "#34D399",
          distort: 0.22,
          speed: 1.5,
          roughness: 0.15,
          metalness: 0.8,
          ringSpeed: 0.4,
          particleCount: 160,
          particleColor: "#6EE7B7",
        };
      case "at_risk":
        return {
          primaryColor: "#F59E0B",
          secondaryColor: "#EF4444",
          wireColor: "#FBBF24",
          distort: 0.48,
          speed: 3.2,
          roughness: 0.25,
          metalness: 0.6,
          ringSpeed: 0.9,
          particleCount: 220,
          particleColor: "#FDE68A",
        };
      case "critical":
        return {
          primaryColor: "#EF4444",
          secondaryColor: "#8B5CF6",
          wireColor: "#F87171",
          distort: 0.72,
          speed: 5.0,
          roughness: 0.35,
          metalness: 0.5,
          ringSpeed: 1.6,
          particleCount: 280,
          particleColor: "#FCA5A5",
        };
      case "watch":
      default:
        return {
          primaryColor: "#06B6D4",
          secondaryColor: "#3B82F6",
          wireColor: "#38BDF8",
          distort: 0.32,
          speed: 2.2,
          roughness: 0.2,
          metalness: 0.75,
          ringSpeed: 0.6,
          particleCount: 180,
          particleColor: "#7DD3FC",
        };
    }
  }, [category]);

  // Generate particle positions around the core
  const particleGeo = useMemo(() => {
    const count = config.particleCount;
    const positions = new Float32Array(count * 3);
    const radius = 2.0;

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = radius * (0.8 + Math.random() * 0.7);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, [config.particleCount]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const mouse = state.pointer;

    // Smooth hover tilt
    if (coreRef.current && interactive) {
      coreRef.current.rotation.x = THREE.MathUtils.lerp(
        coreRef.current.rotation.x,
        mouse.y * 0.35 + Math.sin(t * 0.5) * 0.1,
        0.05
      );
      coreRef.current.rotation.y = THREE.MathUtils.lerp(
        coreRef.current.rotation.y,
        mouse.x * 0.45 + t * 0.2,
        0.05
      );
    }

    // Spin rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * config.ringSpeed * 0.7;
      ring1Ref.current.rotation.y = t * config.ringSpeed * 0.5;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * config.ringSpeed * 0.6;
      ring2Ref.current.rotation.z = t * config.ringSpeed * 0.4;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = t * config.ringSpeed * 0.5;
      ring3Ref.current.rotation.x = -t * config.ringSpeed * 0.3;
    }

    // Orbit particles
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.15 * config.ringSpeed;
      particlesRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    }
  });

  return (
    <group ref={coreRef} scale={scale}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} color={config.secondaryColor} />
      <pointLight position={[-4, -3, -2]} intensity={2} color={config.primaryColor} />
      <pointLight position={[0, 0, 0]} intensity={3} color={config.primaryColor} distance={4} />

      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.5}>
        {/* Core Crystalline Fluid Sphere */}
        <Sphere ref={meshRef} args={[1.0, 64, 64]}>
          <MeshDistortMaterial
            color={config.primaryColor}
            emissive={config.secondaryColor}
            emissiveIntensity={0.4}
            roughness={config.roughness}
            metalness={config.metalness}
            distort={config.distort}
            speed={config.speed}
            transparent
            opacity={0.88}
          />
        </Sphere>

        {/* Outer Translucent Wire Shield */}
        <Sphere args={[1.16, 24, 24]}>
          <meshStandardMaterial
            color={config.wireColor}
            wireframe
            transparent
            opacity={0.25}
            emissive={config.primaryColor}
            emissiveIntensity={0.3}
          />
        </Sphere>

        {/* Concentric Energy Orbit Rings */}
        <Torus ref={ring1Ref} args={[1.5, 0.015, 16, 64]} rotation={[Math.PI / 4, 0, 0]}>
          <meshBasicMaterial color={config.primaryColor} transparent opacity={0.6} />
        </Torus>

        <Torus ref={ring2Ref} args={[1.75, 0.012, 16, 64]} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
          <meshBasicMaterial color={config.secondaryColor} transparent opacity={0.5} />
        </Torus>

        <Torus ref={ring3Ref} args={[2.0, 0.01, 16, 64]} rotation={[Math.PI / 6, -Math.PI / 4, 0]}>
          <meshBasicMaterial color={config.wireColor} transparent opacity={0.4} />
        </Torus>

        {/* Ambient Particle Halo */}
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particleGeo, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.045}
            color={config.particleColor}
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            sizeAttenuation
          />
        </points>
      </Float>
    </group>
  );
}
