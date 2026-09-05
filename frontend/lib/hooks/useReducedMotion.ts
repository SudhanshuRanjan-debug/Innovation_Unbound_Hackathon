"use client";
import { useState, useEffect } from "react";

export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    try {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReduced(mediaQuery.matches);

      const onChange = () => {
        setPrefersReduced(mediaQuery.matches);
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", onChange);
        return () => mediaQuery.removeEventListener("change", onChange);
      } else if ((mediaQuery as any).addListener) {
        (mediaQuery as any).addListener(onChange);
        return () => (mediaQuery as any).removeListener(onChange);
      }
    } catch {
      // ignore
    }
  }, []);

  return prefersReduced;
}
