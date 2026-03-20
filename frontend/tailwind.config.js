/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0e151b",
        slate: "#4b5563",
        sand: "#f8fafc",
        moss: "#2563eb",
        fog: "#e5e7eb",
        sky: "#38bdf8",
        sun: "#fbbf24",
        blush: "#f472b6",
        navy: "#0f172a",
      },
      fontFamily: {
        display: ["\"Fraunces\"", "serif"],
        body: ["\"Inter\"", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
