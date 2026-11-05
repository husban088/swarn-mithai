/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      blur: { "3xl": "48px" },
      colors: {
        // Apna Pani palette: black + water blue (gold/champ = blue scale)
        gold: {
          50: "#F7F7F8",
          100: "#EDEDEF",
          200: "#DCDCE0",
          300: "#B9B9C0",
          400: "#3d9bea",
          500: "#1d7fe0",
          600: "#135fb8",
          700: "#0a3a78",
        },
        royal: {
          DEFAULT: "#0B0B0D",
          light: "#1C1C21",
          soft: "#F1F1F3",
          deep: "#040405",
        },
        champ: {
          100: "#eaf4ff",
          200: "#bfdcfa",
          300: "#8cc3f5",
          400: "#3d9bea",
          500: "#1d7fe0",
          600: "#135fb8",
        },
        ink: "#1B1B1B",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ["Manrope", "system-ui", "sans-serif"],
      },
      keyframes: {
        spinSlow: { to: { transform: "rotate(360deg)" } },
        spinRev: { to: { transform: "rotate(-360deg)" } },
        rise: {
          from: { opacity: 0, transform: "translateY(18px)" },
          to: { opacity: 1, transform: "none" },
        },
        modalIn: {
          from: { opacity: 0, transform: "translateY(36px) scale(.95)" },
          to: { opacity: 1, transform: "none" },
        },
        pop: {
          from: { opacity: 0, transform: "scale(.94)" },
          to: { opacity: 1, transform: "none" },
        },
        slideIn: {
          from: { transform: "translateX(100%)" },
          to: { transform: "none" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        fadeUp: {
          from: { opacity: 0, transform: "translateY(26px)" },
          to: { opacity: 1, transform: "none" },
        },
        pageIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        rowIn: {
          from: { opacity: 0, transform: "translateX(28px)" },
          to: { opacity: 1, transform: "none" },
        },
        slideOut: {
          from: { transform: "none" },
          to: { transform: "translateX(100%)" },
        },
        fadeOut: { from: { opacity: 1 }, to: { opacity: 0 } },
        ringSpin: { to: { transform: "rotate(360deg)" } },
        bump: {
          "0%": { transform: "scale(1)" },
          "35%": { transform: "scale(1.35)" },
          "100%": { transform: "scale(1)" },
        },
        glow: {
          "0%,100%": { opacity: 0.45 },
          "50%": { opacity: 0.9 },
        },
        marqueeX: { to: { transform: "translateX(-50%)" } },
        lineGrow: {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        flash: {
          "0%": { boxShadow: "0 0 0 0 rgba(29,127,224,.75)" },
          "100%": { boxShadow: "0 0 0 16px rgba(29,127,224,0)" },
        },
        sheen: {
          from: { transform: "translateX(-120%) skewX(-18deg)" },
          to: { transform: "translateX(220%) skewX(-18deg)" },
        },
      },
      animation: {
        spinSlow: "spinSlow 38s linear infinite",
        floaty: "floaty 7s ease-in-out infinite",
        fadeUp: "fadeUp .9s cubic-bezier(.2,.7,.2,1) both",
        pageIn: "pageIn .3s ease-out both",
        rowIn: "rowIn .55s cubic-bezier(.2,.7,.2,1) both",
        slideOut: "slideOut .32s cubic-bezier(.5,0,.75,0) both",
        fadeOut: "fadeOut .32s ease both",
        ringSpin: "ringSpin .85s linear infinite",
        bump: "bump .5s ease",
        glow: "glow 5s ease-in-out infinite",
        marqueeX: "marqueeX 45s linear infinite",
        lineGrow: "lineGrow 1s cubic-bezier(.2,.7,.2,1) both",
        flash: "flash 1.1s ease-out 1",
        spinRev: "spinRev 60s linear infinite",
        rise: "rise .7s cubic-bezier(.2,.7,.2,1) both",
        pop: "pop .25s ease-out both",
        modalIn: "modalIn .5s cubic-bezier(.2,.8,.2,1) both",
        slideIn: "slideIn .45s cubic-bezier(.2,.8,.2,1) both",
      },
    },
  },
  plugins: [],
};
