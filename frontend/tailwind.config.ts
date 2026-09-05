import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        
        // FinShield Premium Cyber Obsidian Palette
        obsidian: {
          950: "#030712",
          900: "#070B14",
          850: "#0B1222",
          800: "#0F172A",
          750: "#141F38",
          700: "#1E293B",
          600: "#334155",
        },
        fin: {
          cyan: "#06B6D4",
          teal: "#14B8A6",
          emerald: "#10B981",
          blue: "#3B82F6",
          indigo: "#6366F1",
          purple: "#8B5CF6",
          amber: "#F59E0B",
          rose: "#F43F5E",
          red: "#EF4444",
        },
        risk: {
          critical: "#EF4444",
          "at-risk": "#F59E0B",
          watch: "#06B6D4",
          healthy: "#10B981",
        },
      },
      boxShadow: {
        "glow-cyan": "0 0 25px -5px rgba(6, 182, 212, 0.4)",
        "glow-teal": "0 0 25px -5px rgba(20, 184, 166, 0.4)",
        "glow-emerald": "0 0 25px -5px rgba(16, 185, 129, 0.4)",
        "glow-amber": "0 0 25px -5px rgba(245, 158, 11, 0.4)",
        "glow-red": "0 0 25px -5px rgba(239, 68, 68, 0.4)",
        "glow-purple": "0 0 25px -5px rgba(139, 92, 246, 0.4)",
        "glass-card": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      backgroundImage: {
        "radial-gradient": "radial-gradient(var(--tw-gradient-stops))",
        "mesh-dark": "radial-gradient(at 0% 0%, rgba(6, 182, 212, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.08) 0px, transparent 50%)",
        "core-glow": "radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(11, 18, 34, 0) 70%)",
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
