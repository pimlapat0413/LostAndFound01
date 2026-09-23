import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef1fe",
          100: "#dfe5fd",
          200: "#c3cdfb",
          500: "#3d5ff0",
          600: "#2346d8",
          700: "#1c38b4",
          accent: "#6d3ee8",
        },
        ink: "#0f172a",
        surface: "#f5f7fb",
        line: "#e3e7f0",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px -4px rgba(15, 23, 42, 0.06)",
        lift: "0 12px 32px -12px rgba(35, 70, 216, 0.28)",
      },
    },
  },
  plugins: [],
};
export default config;
