"use client";
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
}

export function ParticleField({
  count = 240,
  color = "#06B6D4",
  size = 0.035,
  speed = 0.3,
}: Props) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const mouse = state.pointer;

    // Smooth GPU rotation & floating motion
    pointsRef.current.rotation.y = t * 0.04 * speed + mouse.x * 0.1;
    pointsRef.current.rotation.x = Math.sin(t * 0.05 * speed) * 0.08 - mouse.y * 0.08;
    pointsRef.current.position.y = Math.sin(t * 0.2 * speed) * 0.15;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
