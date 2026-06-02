/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sidebar: {
          DEFAULT: "#0F172A",
          light: "#1E293B",
          active: "#2563EB",
        },
        brand: {
          primary: "#2563EB",
          secondary: "#1D4ED8",
          light: "#DBEAFE",
        },
        surface: {
          DEFAULT: "#F8FAFC",
          card: "#FFFFFF",
          border: "#CBD5E1",
        },
        text: {
          primary: "#0F172A",
          secondary: "#475569",
          inverse: "#FFFFFF",
        },
        status: {
          success: "#16A34A",
          warning: "#F59E0B",
          error: "#DC2626",
          info: "#2563EB",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
