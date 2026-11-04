/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        fondo: "rgb(var(--c-fondo) / <alpha-value>)",
        card: "rgb(var(--c-card) / <alpha-value>)",
        soft: "rgb(var(--c-soft) / <alpha-value>)",
        tinta: "rgb(var(--c-tinta) / <alpha-value>)",
        subtinta: "rgb(var(--c-subtinta) / <alpha-value>)",
        acc: {
          DEFAULT: "rgb(var(--c-acc) / <alpha-value>)",
          fuerte: "rgb(var(--c-acc-fuerte) / <alpha-value>)",
          suave: "rgb(var(--c-acc-suave) / <alpha-value>)",
        },
        borde: "rgb(var(--c-borde) / <alpha-value>)",
        onacc: "rgb(var(--c-onacc) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.45s ease-out",
        "pop": "pop 0.28s cubic-bezier(.175,.885,.32,1.275)",
        "rise": "rise 0.4s ease-out both",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        rise: {
          "0%": { transform: "scaleY(0.4)", opacity: 0.4 },
          "100%": { transform: "scaleY(1)", opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
