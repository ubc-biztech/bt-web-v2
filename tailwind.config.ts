import type { Config } from "tailwindcss";
const { fontFamily } = require("tailwindcss/defaultTheme");

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontFamily: {
      sans: ["var(--font-urbanist)", ...fontFamily.sans],
      redhat: ["Red Hat Mono", "monospace"],
    },
    fontWeight: {
      "100": "100",
      "200": "200",
      "300": "300",
      "400": "400",
      "500": "500",
      "600": "600",
      "700": "700",
      "800": "800",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    fontSize: {
      xs: "14px",
      sm: "16px",
      md: "20px",
      lg: "24px",
      xl: "32px",
      "2xl": "40px",
      "3xl": "48px",
    },
    extend: {
      colors: {
        "bt-blue": {
          0: "#BDC8E3FF",
          100: "#A2B1D5FF",
          200: "#7282A8FF",
          300: "#3B4866FF",
          400: "#26324DFF",
          500: "#1B253DFF",
          600: "#0D172CFF",
          700: "#0B111EFF",
        },
        "bt-green": {
          0: "#C6F4B4FF",
          100: "#ADE198FF",
          200: "#8AD96AFF",
          300: "#75D450FF",
          400: "#70E442FF",
          500: "#5CC433FF",
          700: "#53B12EFF",
          900: "#408F20FF",
        },
        "bt-red": {
          0: "#FFE4E8",
          100: "#FFB8C2",
          200: "#FF8A9E",
          300: "#FF647E",
          400: "#E53E5A",
          500: "#C12A45",
          600: "#9A1E34",
          700: "#731525",
          800: "#4D0D18",
        },
        "bt-pink": "#FF9AF8",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        divider: "#8DA1D1",
        black: "#000000",
        placeholder: "#D9D9D9",
        white: "#ffffff",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      boxShadow: {
        'inner-blue-concave': 'inset 4px 4px 16px rgba(96, 116, 165, 0.5)',
        'inner-blue-convex': 'inset 2px -2px 8px rgba(15,15,60,0.5)',
        'inner-white-md': 'inset 0 0 32px rgba(255,255,255,0.1)',
        'inner-white-lg': 'inset 0 0 64px rgba(255,255,255,0.1)',
        'inner-white-xl': 'inset 0 0 96px rgba(255,255,255,0.1)',
      },
      screens: {
        xxs: "360px", // minimum width for mobile
        xs: "412px", // originally 370
        mxs: "445px", // medium xs (could prob rename)
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        gradient: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        gradient: "nameGradient 6s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
