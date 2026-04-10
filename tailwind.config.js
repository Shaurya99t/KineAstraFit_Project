/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        accentSoft: "rgb(var(--color-accent-soft) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        glass: "0 18px 60px rgba(15, 23, 42, 0.18)",
      },
      backgroundImage: {
        "mesh-light":
          "radial-gradient(circle at 20% 20%, rgba(14,165,233,0.22), transparent 34%), radial-gradient(circle at 80% 0%, rgba(244,114,182,0.18), transparent 28%), radial-gradient(circle at 60% 80%, rgba(45,212,191,0.16), transparent 32%)",
        "mesh-dark":
          "radial-gradient(circle at 20% 20%, rgba(34,211,238,0.15), transparent 34%), radial-gradient(circle at 80% 0%, rgba(251,146,60,0.12), transparent 28%), radial-gradient(circle at 60% 80%, rgba(56,189,248,0.14), transparent 32%)",
      },
    },
  },
  plugins: [],
};
