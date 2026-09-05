"use client";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Torus, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import type { RiskFactors, RiskCategory } from "@/types";
import { riskColors } from "@/lib/utils";

interface Props {
  factors?: RiskFactors;
  score?: number;
  category?: RiskCategory;
}

export function RiskEnergyField({
  factors,
  score = 63.5,
  category = "watch",
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  const r3 = useRef<THREE.Mesh>(null);
  const r4 = useRef<THREE.Mesh>(null);
  const r5 = useRef<THREE.Mesh>(null);

  const safeFactors = {
    income_stability_score: factors?.income_stability_score ?? 70,
    liquidity_score: factors?.liquidity_score ?? 60,
    debt_burden_score: factors?.debt_burden_score ?? 60,
    payment_behavior_score: factors?.payment_behavior_score ?? 75,
    credit_utilization_score: factors?.credit_utilization_score ?? 65,
  };

  const getColor = (s: number) => {
    if (s >= 70) return "#10B981";
    if (s >= 50) return "#06B6D4";
    if (s >= 30) return "#F59E0B";
    return "#EF4444";
  };

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const mouse = state.pointer;

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.4 + t * 0.1, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.3, 0.05);
    }

    if (r1.current) {
      r1.current.rotation.x = t * 0.4;
      r1.current.rotation.y = t * 0.2;
    }
    if (r2.current) {
      r2.current.rotation.y = -t * 0.35;
      r2.current.rotation.z = t * 0.25;
    }
    if (r3.current) {
      r3.current.rotation.z = t * 0.3;
      r3.current.rotation.x = -t * 0.2;
    }
    if (r4.current) {
      r4.current.rotation.x = -t * 0.25;
      r4.current.rotation.y = t * 0.3;
    }
    if (r5.current) {
      r5.current.rotation.y = t * 0.45;
      r5.current.rotation.z = -t * 0.15;
    }
  });

  const baseColor = riskColors[category] || "#06B6D4";

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={3} color={baseColor} distance={6} />

      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
        {/* Core Resilience Score Display */}
        <mesh>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={baseColor}
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>

        <Html position={[0, 0, 0]} center className="pointer-events-none select-none">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-white drop-shadow-md">
              {Math.round(score)}
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider text-cyan-200">
              Resilience
            </span>
          </div>
        </Html>

        {/* Ring 1: Income Stability (20%) */}
        <Torus ref={r1} args={[1.1, 0.02, 16, 64]} rotation={[0.4, 0, 0]}>
          <meshBasicMaterial color={getColor(safeFactors.income_stability_score)} transparent opacity={0.7} />
        </Torus>

        {/* Ring 2: Liquidity Score (25%) */}
        <Torus ref={r2} args={[1.35, 0.022, 16, 64]} rotation={[-0.5, 0.3, 0]}>
          <meshBasicMaterial color={getColor(safeFactors.liquidity_score)} transparent opacity={0.7} />
        </Torus>

        {/* Ring 3: Debt Burden Score (25%) */}
        <Torus ref={r3} args={[1.6, 0.024, 16, 64]} rotation={[0.3, -0.6, 0]}>
          <meshBasicMaterial color={getColor(safeFactors.debt_burden_score)} transparent opacity={0.7} />
        </Torus>

        {/* Ring 4: Payment Behavior (15%) */}
        <Torus ref={r4} args={[1.85, 0.018, 16, 64]} rotation={[-0.2, 0.8, 0]}>
          <meshBasicMaterial color={getColor(safeFactors.payment_behavior_score)} transparent opacity={0.65} />
        </Torus>

        {/* Ring 5: Credit Utilization (15%) */}
        <Torus ref={r5} args={[2.1, 0.016, 16, 64]} rotation={[0.7, 0.2, 0]}>
          <meshBasicMaterial color={getColor(safeFactors.credit_utilization_score)} transparent opacity={0.6} />
        </Torus>
      </Float>
    </group>
  );
}
