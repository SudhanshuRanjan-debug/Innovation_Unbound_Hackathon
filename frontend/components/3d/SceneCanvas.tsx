"use client";
import React, { Suspense, useRef, useEffect, useState, Component, ErrorInfo } from "react";
import { Canvas } from "@react-three/fiber";
import { useWebGLSupport } from "@/lib/hooks/useWebGLSupport";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface Props {
  children: React.ReactNode;
  className?: string;
  camera?: { position?: [number, number, number]; fov?: number };
  fallback2D?: React.ReactNode;
  dpr?: [number, number];
  interactive?: boolean;
}

class CanvasErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("FinShield 3D Canvas Error caught:", error?.message || error);
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="w-full h-full flex items-center justify-center bg-obsidian-900/60 rounded-2xl border border-cyan-500/20 text-xs text-cyan-400 p-4 text-center">
            2D Telemetry Fallback Active
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export function SceneCanvas({
  children,
  className = "w-full h-full min-h-[300px]",
  camera = { position: [0, 0, 5], fov: 45 },
  fallback2D,
  dpr = [1, 2],
  interactive = true,
}: Props) {
  const isWebGLSupported = useWebGLSupport();
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Client-side hydration guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Viewport intersection observer to pause rendering when offscreen
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mounted]);

  // Clean SSR and WebGL fallback state
  if (!mounted || !isWebGLSupported) {
    return (
      <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
        {fallback2D || (
          <div className="w-full h-full flex items-center justify-center bg-obsidian-900/40 rounded-2xl border border-white/5 text-xs text-slate-400 p-4 text-center">
            FinShield Telemetry Matrix
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${interactive ? "pointer-events-auto" : "pointer-events-none"} ${className}`}
    >
      <CanvasErrorBoundary fallback={fallback2D}>
        <Canvas
          camera={camera}
          dpr={prefersReduced ? [1, 1] : dpr}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          frameloop={isVisible ? "always" : "never"}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
