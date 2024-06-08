import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      'primary': {
        'color': '#162039', // biztech navy
      },
      'secondary': {
        'color': '#7AD040', // biztech green
      },
      // Login Page Colors
      'login': {
        'page-bg': '#11192E',
        'form-card': '#1C253D',
      },
      // Events Page Colors
      'events': {
        'navigation-bg': '#11192E',
        'active-tab-bg': '#1C253D',
      },
      // Selected Color Palette
      'biztech-navy': '#162039',
      'biztech-green': '#7AD040',
      'dark-navy': '#0C1221',
      'desat-navy': '#A2A7B3',
      'baby-blue': '#B2C9FC',
      'light-blue': '#E0E9FE',
      'white-blue': '#F7FAFF',
      'dark-green': '#55922D',
      'light-green': '#AFE38C',
      'white-green': '#F2FAEC',
      'light-red': '#FF8686',
      'black': "#000000",
    },
    fontFamily: {
      sans: ['Open Sans', 'sans-serif'],
      poppins: ['Poppins', 'sans-serif'],
      montserrat: ['Montserrat', 'sans-serif'],
    },
    fontWeight: {
      '400': '400',
      '500': '500',
      '600': '600',
    },
    fontSize: {
      'xs': '14px',
      'sm': '16px',
      'md': '20px',
      'lg': '24px',
      'xl': '32px',
      '2xl': '40px',
      '3xl': '48px',
    },
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
