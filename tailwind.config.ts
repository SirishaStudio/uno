import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0B0C",
        panel: "#131517",
        card: "#161819",
        line: "#2A2D30",
        uno: {
          red: "#E5484D",
          yellow: "#F0B429",
          green: "#2FB170",
          blue: "#3E7BFA",
          wild: "#B9B9B9",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      keyframes: {
        throw: {
          "0%": { transform: "translate(var(--fx,0), var(--fy,0)) rotate(var(--fr,0)) scale(0.9)", opacity: "0.4" },
          "100%": { transform: "translate(0,0) rotate(0deg) scale(1)", opacity: "1" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(240,180,41,0.55)" },
          "100%": { boxShadow: "0 0 0 14px rgba(240,180,41,0)" },
        },
        popIn: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        spinArrow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(180deg)" },
        },
      },
      animation: {
        throw: "throw 320ms cubic-bezier(.2,.8,.2,1)",
        pulseRing: "pulseRing 1.2s ease-out infinite",
        popIn: "popIn 180ms ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
