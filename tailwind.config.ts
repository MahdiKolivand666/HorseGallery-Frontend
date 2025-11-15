import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#315d49",
          50: "#f0f7f4",
          100: "#dceee7",
          200: "#b9dccf",
          300: "#8fc4ae",
          400: "#63a689",
          500: "#44896d",
          600: "#315d49",
          700: "#2a4d3d",
          800: "#243e33",
          900: "#20342b",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Vazirmatn", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

