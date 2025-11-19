import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		screens: {
  			xs: '475px'
  		},
  		colors: {
  			primary: {
  				'50': '#f0f7f4',
  				'100': '#dceee7',
  				'200': '#b9dccf',
  				'300': '#8fc4ae',
  				'400': '#63a689',
  				'500': '#44896d',
  				'600': '#315d49',
  				'700': '#2a4d3d',
  				'800': '#243e33',
  				'900': '#20342b',
  				DEFAULT: '#315d49',
  			}
  		}
  	}
  },
  plugins: [require("daisyui"), require("tailwindcss-animate")],
  daisyui: {
    themes: false, // disable daisyUI themes to use our custom colors
    base: true,
    styled: true,
    utils: true,
  },
};

export default config;

