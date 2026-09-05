"use client";
import React, { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import type { CashFlowForecast, DailyProjection } from "@/types";

interface Props {
  forecast?: CashFlowForecast;
  onSelectDate?: (projection: DailyProjection) => void;
}

export function CashFlow3DTimeline({ forecast, onSelectDate }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredNode, setHoveredNode] = useState<{
    date: string;
    balance: number;
    inflow?: number;
    outflow?: number;
    pos: [number, number, number];
  } | null>(null);

  const projections = forecast?.daily_projections || [];

  const { lineObject, eventNodes } = useMemo(() => {
    if (!projections.length) return { lineObject: null, eventNodes: [] };

    const sampleStep = Math.max(1, Math.floor(projections.length / 30));
    const sampled = projections.filter((_, i) => i % sampleStep === 0);

    const maxBal = Math.max(...projections.map((p) => p.projected_balance), 80000);
    const minBal = Math.min(...projections.map((p) => p.projected_balance), 0);
    const range = maxBal - minBal || 1;

    const points: THREE.Vector3[] = [];
    const nodes: any[] = [];

    sampled.forEach((p, index) => {
      const x = (index / (sampled.length - 1)) * 10 - 5;
      const y = ((p.projected_balance - minBal) / range) * 3.2 - 1.4;
      const z = Math.sin(index * 0.4) * 0.4;

      points.push(new THREE.Vector3(x, y, z));

      if (p.inflows > 10000 || p.outflows > 10000 || p.projected_balance < 5000) {
        nodes.push({
          date: p.date,
          balance: p.projected_balance,
          inflow: p.inflows,
          outflow: p.outflows,
          type: p.inflows > 10000 ? "salary" : p.projected_balance < 5000 ? "danger" : "expense",
          pos: [x, y, z] as [number, number, number],
          raw: p,
        });
      }
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x06b6d4, linewidth: 3 });
    const line = new THREE.Line(geometry, material);

    return { lineObject: line, eventNodes: nodes };
  }, [projections]);

  useFrame((state) => {
    if (groupRef.current) {
      const mouse = state.pointer;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.25, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.15, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 6, 6]} intensity={1.2} />

      {/* Trajectory Luminous Spline */}
      {lineObject && <primitive object={lineObject} />}

      {/* Danger Zone Reference Grid */}
      <gridHelper args={[11, 22, 0xef4444, 0x1e293b]} position={[0, -1.3, 0]} />

      {/* Axis Marker HTML Overlays */}
      <Html position={[-5, -1.6, 0]} center className="pointer-events-none select-none">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Past</span>
      </Html>
      <Html position={[0, -1.6, 0]} center className="pointer-events-none select-none">
        <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-obsidian-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
          Today
        </span>
      </Html>
      <Html position={[5, -1.6, 0]} center className="pointer-events-none select-none">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">+90 Days</span>
      </Html>

      {/* Interactive Milestone Nodes */}
      {eventNodes.map((node, i) => {
        const isSalary = node.type === "salary";
        const isDanger = node.type === "danger";
        const color = isSalary ? "#10B981" : isDanger ? "#EF4444" : "#F59E0B";

        return (
          <Float key={i} speed={2} floatIntensity={0.2}>
            <mesh
              position={node.pos}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredNode(node);
              }}
              onPointerOut={() => setHoveredNode(null)}
              onClick={() => onSelectDate?.(node.raw)}
            >
              <sphereGeometry args={[isDanger ? 0.22 : 0.18, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.8}
                roughness={0.2}
              />
            </mesh>
          </Float>
        );
      })}

      {/* Hover Tooltip in HTML */}
      {hoveredNode && (
        <Html position={[hoveredNode.pos[0], hoveredNode.pos[1] + 0.6, hoveredNode.pos[2]]} center>
          <div className="bg-obsidian-950/95 border border-cyan-500/40 px-3 py-2 rounded-xl text-center shadow-2xl backdrop-blur-md pointer-events-none whitespace-nowrap space-y-0.5">
            <p className="text-[11px] font-bold text-white">
              {formatDateShort(hoveredNode.date)}: {formatCurrency(hoveredNode.balance)}
            </p>
            {hoveredNode.inflow ? (
              <p className="text-[10px] text-emerald-400 font-semibold">+{formatCurrency(hoveredNode.inflow)} Inflow</p>
            ) : null}
            {hoveredNode.outflow ? (
              <p className="text-[10px] text-rose-400 font-semibold">-{formatCurrency(hoveredNode.outflow)} Outflow</p>
            ) : null}
          </div>
        </Html>
      )}
    </group>
  );
}
