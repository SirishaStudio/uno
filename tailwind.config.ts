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
    },
  },
  plugins: [],
};
export default config;
