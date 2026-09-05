"use client";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Cylinder, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { formatCurrency } from "@/lib/utils";

interface Props {
  monthlySurplus?: number;
  totalEmi?: number;
  projectedScore?: number;
  scoreDelta?: number;
  emiIncrease?: number;
}

export function SimulatorVisualizer3D({
  monthlySurplus = 9000,
  totalEmi = 22000,
  projectedScore = 63.5,
  scoreDelta = 0,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const surplusCylinder = useRef<THREE.Mesh>(null);
  const emiCylinder = useRef<THREE.Mesh>(null);

  const safeSurplus = Math.max(0, monthlySurplus);
  const safeEmi = Math.max(0, totalEmi);

  // Normalize surplus height (clamped between 0.3 and 2.4)
  const surplusHeight = Math.max(0.3, Math.min(2.4, (safeSurplus / 40000) * 2.0));
  // Normalize EMI height
  const emiHeight = Math.max(0.3, Math.min(2.4, (safeEmi / 50000) * 2.0));

  const surplusColor = safeSurplus > 15000 ? "#10B981" : safeSurplus > 5000 ? "#F59E0B" : "#EF4444";
  const emiColor = safeEmi > 35000 ? "#EF4444" : safeEmi > 25000 ? "#F59E0B" : "#06B6D4";

  useFrame((state) => {
    if (groupRef.current) {
      const mouse = state.pointer;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.3, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.2, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 6, 6]} intensity={1.5} />

      <Float speed={1.5} floatIntensity={0.2}>
        {/* Left Column: Monthly Free Cash Surplus */}
        <group position={[-1.4, 0, 0]}>
          <Cylinder
            ref={surplusCylinder}
            args={[0.45, 0.45, surplusHeight, 32]}
            position={[0, surplusHeight / 2 - 1.0, 0]}
          >
            <meshStandardMaterial
              color={surplusColor}
              emissive={surplusColor}
              emissiveIntensity={0.5}
              roughness={0.2}
              metalness={0.7}
              transparent
              opacity={0.9}
            />
          </Cylinder>

          <Html position={[0, -1.35, 0]} center className="pointer-events-none select-none">
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-obsidian-950/70 px-1.5 py-0.5 rounded whitespace-nowrap">
              Free Surplus
            </span>
          </Html>
          <Html position={[0, surplusHeight - 0.75, 0]} center className="pointer-events-none select-none">
            <span className="text-xs font-bold text-white bg-obsidian-950/80 px-2 py-0.5 rounded border border-white/10 whitespace-nowrap">
              {formatCurrency(safeSurplus, true)}
            </span>
          </Html>
        </group>

        {/* Right Column: Total Monthly EMI */}
        <group position={[1.4, 0, 0]}>
          <Cylinder
            ref={emiCylinder}
            args={[0.45, 0.45, emiHeight, 32]}
            position={[0, emiHeight / 2 - 1.0, 0]}
          >
            <meshStandardMaterial
              color={emiColor}
              emissive={emiColor}
              emissiveIntensity={0.5}
              roughness={0.2}
              metalness={0.7}
              transparent
              opacity={0.9}
            />
          </Cylinder>

          <Html position={[0, -1.35, 0]} center className="pointer-events-none select-none">
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-obsidian-950/70 px-1.5 py-0.5 rounded whitespace-nowrap">
              Total EMI
            </span>
          </Html>
          <Html position={[0, emiHeight - 0.75, 0]} center className="pointer-events-none select-none">
            <span className="text-xs font-bold text-white bg-obsidian-950/80 px-2 py-0.5 rounded border border-white/10 whitespace-nowrap">
              {formatCurrency(safeEmi, true)}
            </span>
          </Html>
        </group>

        {/* Top Floating Resilience Impact Badge in 3D */}
        <group position={[0, 1.4, 0]}>
          <mesh>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial
              color={
                projectedScore >= 70
                  ? "#10B981"
                  : projectedScore >= 50
                  ? "#06B6D4"
                  : projectedScore >= 30
                  ? "#F59E0B"
                  : "#EF4444"
              }
              emissive={
                projectedScore >= 70
                  ? "#10B981"
                  : projectedScore >= 50
                  ? "#06B6D4"
                  : projectedScore >= 30
                  ? "#F59E0B"
                  : "#EF4444"
              }
              emissiveIntensity={0.6}
            />
          </mesh>

          <Html position={[0, 0, 0]} center className="pointer-events-none select-none">
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-white">{Math.round(projectedScore)}</span>
              <span
                className={`text-[9px] font-bold ${
                  scoreDelta >= 0 ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {scoreDelta >= 0 ? "+" : ""}
                {scoreDelta.toFixed(1)} pts
              </span>
            </div>
          </Html>
        </group>
      </Float>
    </group>
  );
}
