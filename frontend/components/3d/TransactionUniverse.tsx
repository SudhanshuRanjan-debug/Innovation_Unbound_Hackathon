"use client";
import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { formatCurrency } from "@/lib/utils";
import { sounds } from "@/lib/audio";

interface CategoryNode {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  trend: string;
  pos: [number, number, number];
}

const DEFAULT_CATEGORIES: CategoryNode[] = [
  { id: "sal", name: "Salary Inflow", amount: 85000, percentage: 100, color: "#10B981", trend: "Stable", pos: [0, 2.2, 0] },
  { id: "emi", name: "Loan EMIs", amount: 22000, percentage: 25.9, color: "#F59E0B", trend: "+0%", pos: [-2.2, 0.8, 0.6] },
  { id: "rent", name: "Rent & Housing", amount: 15000, percentage: 17.6, color: "#8B5CF6", trend: "+0%", pos: [2.0, 0.9, -0.5] },
  { id: "dining", name: "Dining & Social", amount: 7200, percentage: 8.5, color: "#EF4444", trend: "+28% Surge", pos: [-1.8, -1.2, 0.8] },
  { id: "shopping", name: "Shopping", amount: 6800, percentage: 8.0, color: "#EC4899", trend: "+14%", pos: [1.9, -1.0, 0.7] },
  { id: "util", name: "Utilities", amount: 3500, percentage: 4.1, color: "#06B6D4", trend: "Normal", pos: [-0.6, -1.8, -0.6] },
  { id: "fuel", name: "Fuel & Travel", amount: 4200, percentage: 4.9, color: "#3B82F6", trend: "-5%", pos: [0.8, -1.7, -0.4] },
];

export function TransactionUniverse({ onSelectCategory }: { onSelectCategory?: (cat: CategoryNode) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryNode | null>(null);

  // Pre-generate connection lines
  const connectionLines = useMemo(() => {
    return DEFAULT_CATEGORIES.map((cat) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...cat.pos),
      ]);
      const material = new THREE.LineBasicMaterial({
        color: cat.color,
        transparent: true,
        opacity: 0.35,
      });
      return { id: cat.id, line: new THREE.Line(geometry, material) };
    });
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      const mouse = state.pointer;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.35 + t * 0.08, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.25, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#06B6D4" distance={8} />

      {/* Central Core Node */}
      <mesh>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial
          color="#06B6D4"
          emissive="#06B6D4"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      <Html position={[0, -0.65, 0]} center className="pointer-events-none select-none">
        <span className="text-[10px] uppercase font-bold text-cyan-300 bg-obsidian-950/80 px-2 py-0.5 rounded border border-cyan-500/30 whitespace-nowrap">
          Cash Flow Core
        </span>
      </Html>

      {/* Connection Filaments */}
      {connectionLines.map(({ id, line }) => (
        <primitive key={id} object={line} />
      ))}

      {/* Orbital Category Nodes */}
      {DEFAULT_CATEGORIES.map((cat) => {
        const isHovered = activeCategory?.id === cat.id;
        const radius = Math.max(0.18, Math.min(0.35, (cat.amount / 85000) * 0.35));

        return (
          <Float key={cat.id} speed={2} floatIntensity={0.3}>
            <mesh
              position={cat.pos}
              onPointerOver={(e) => {
                e.stopPropagation();
                setActiveCategory(cat);
              }}
              onPointerOut={() => setActiveCategory(null)}
              onClick={() => {
                sounds.click();
                onSelectCategory?.(cat);
              }}
            >
              <sphereGeometry args={[isHovered ? radius * 1.25 : radius, 24, 24]} />
              <meshStandardMaterial
                color={cat.color}
                emissive={cat.color}
                emissiveIntensity={isHovered ? 1.0 : 0.4}
                roughness={0.2}
                metalness={0.7}
              />
            </mesh>

            <Html position={[cat.pos[0], cat.pos[1] - radius - 0.22, cat.pos[2]]} center className="pointer-events-none select-none">
              <span className="text-[10px] font-semibold text-slate-300 bg-obsidian-950/70 px-1.5 py-0.5 rounded border border-white/5 whitespace-nowrap">
                {cat.name}
              </span>
            </Html>
          </Float>
        );
      })}

      {/* Active Category Floating Card */}
      {activeCategory && (
        <Html position={[activeCategory.pos[0], activeCategory.pos[1] + 0.65, activeCategory.pos[2]]} center>
          <div className="bg-obsidian-950/95 border border-cyan-500/40 px-3 py-2 rounded-xl text-center shadow-2xl backdrop-blur-md pointer-events-none whitespace-nowrap space-y-0.5">
            <p className="text-xs font-bold text-white">
              {activeCategory.name}: {formatCurrency(activeCategory.amount)}
            </p>
            <p className="text-[10px] font-semibold" style={{ color: activeCategory.color }}>
              {activeCategory.percentage}% of income · {activeCategory.trend}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
