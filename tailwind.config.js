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
        // 柠檬黄主色系
        lemon: {
          50: "#FFFBE5",
          100: "#FFF6C2",
          200: "#FFEE8C",
          300: "#FFE85C",
          400: "#FFE14D",
          500: "#FFD60A",
          600: "#F5C400",
          700: "#C99C00",
        },
        // 涂鸦点缀色
        tomato: "#FF5A5F",
        bolt: "#2E9BFF",
        mint: "#31D07A",
        grape: "#8B5CF6",
        // 墨黑（描边用）
        ink: {
          DEFAULT: "#141414",
          soft: "#2B2B2B",
          mute: "#6B6455",
        },
        paper: "#FFFDF5",
      },
      fontFamily: {
        doodle: ['"ZCOOL KuaiLe"', "system-ui", "sans-serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
        mono: ['"SFMono-Regular"', "Menlo", "monospace"],
      },
      boxShadow: {
        sticker: "4px 4px 0 0 #141414",
        "sticker-sm": "3px 3px 0 0 #141414",
        "sticker-lg": "7px 7px 0 0 #141414",
        "sticker-inset": "inset 0 0 0 3px #141414",
      },
      borderWidth: {
        3: "3px",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0) rotate(var(--tw-rotate, 0deg))" },
          "50%": { transform: "translateY(-12px) rotate(var(--tw-rotate, 0deg))" },
        },
        wobble: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-8px)" },
          "40%": { transform: "translateX(8px)" },
          "60%": { transform: "translateX(-5px)" },
          "80%": { transform: "translateX(5px)" },
        },
        rise: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-90px) scale(1.3)", opacity: "0" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        jiggle: {
          "0%, 100%": { transform: "rotate(-2deg) scale(1)" },
          "50%": { transform: "rotate(2deg) scale(1.04)" },
        },
      },
      animation: {
        floaty: "floaty 5s ease-in-out infinite",
        wobble: "wobble 2.4s ease-in-out infinite",
        marquee: "marquee 22s linear infinite",
        pop: "pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        shake: "shake 0.4s ease-in-out",
        rise: "rise 1.4s ease-out forwards",
        "spin-slow": "spinSlow 14s linear infinite",
        jiggle: "jiggle 0.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
