/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        rail: {
          gray: "#2D2D2D",
          red: "#E53935",
          green: "#43A047",
          blue: "#1565C0",
          orange: "#FF8F00",
          brown: "#5D4037",
          dark: "#1A1A1A",
          steel: "#37474F",
          light: "#ECEFF1",
        },
      },
      fontFamily: {
        display: ["Rajdhani", "sans-serif"],
        body: ["Noto Sans SC", "sans-serif"],
      },
      animation: {
        "pulse-red": "pulse-red 1.5s ease-in-out infinite",
        "slide-in": "slide-in 0.3s ease-out",
        "shake": "shake 0.5s ease-in-out",
      },
      keyframes: {
        "pulse-red": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(229, 57, 53, 0.7)" },
          "50%": { boxShadow: "0 0 0 8px rgba(229, 57, 53, 0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
      },
    },
  },
  plugins: [],
};
