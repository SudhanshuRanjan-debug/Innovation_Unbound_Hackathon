"use client";
import { useState, useEffect } from "react";

export function useMousePosition() {
  const [mouse, setMouse] = useState({ x: 0, y: 0, normalizedX: 0, normalizedY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setMouse({
        x: e.clientX,
        y: e.clientY,
        normalizedX: (e.clientX / width) * 2 - 1, // [-1, 1]
        normalizedY: -(e.clientY / height) * 2 + 1, // [-1, 1]
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return mouse;
}
