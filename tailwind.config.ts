import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0e17",
          card: "#111827",
          hover: "#1a2234",
        },
        accent: {
          red: "#ef4444",
          amber: "#f59e0b",
          green: "#22c55e",
          blue: "#3b82f6",
          cyan: "#06b6d4",
        },
        border: {
          subtle: "#1e293b",
          active: "#334155",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(239, 68, 68, 0.3)" },
          "100%": { boxShadow: "0 0 20px rgba(239, 68, 68, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
