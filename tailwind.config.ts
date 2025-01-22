import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    colors: {
      primary: {
        color: '#162039', // biztech navy
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        color: '#7AD040', // biztech green
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      // Login Page Colors
      login: {
        'page-bg': '#11192E',
        'form-card': '#1C253D',
      },
      // Navbar Page Colors
      navbar: {
        'tab-hover-bg': '#324269',
      },
      // Events Page Colors
      events: {
        'coming-up': '#EC722D',
        'baby-blue': '#B2C9FC',
        'user-card-bg': '#304068',
        'navigation-bg': '#11192E',
        'active-tab-bg': '#1C253D',
        'card-bg': '#263354',
      },
      // Profile Page Colors
      'profile': {
        'card-bg': "#1E2B4D",
        'separator-bg': "#394971"
      },
      // Selected Color Palette
      'biztech-navy': '#162039',
      'biztech-green': '#7AD040',
      'dark-navy': '#0C1221',
      'desat-navy': '#A2A7B3',
      'dark-slate': '#324269',
      'pale-blue': '#C4D5FF',
      'baby-blue': '#B2C9FC',
      'light-blue': '#E0E9FE',
      'light-grey': '#B3B3B3',
      'white-blue': '#F7FAFF',
      'dark-green': '#55922D',
      'light-green': '#AFE38C',
      'neon-green': '#39FF14',
      'white-green': '#F2FAEC',
      'light-red': '#FF8686',
      'divider': '#8DA1D1',
      black: '#000000',
      placeholder: '#D9D9D9',
      white: '#ffffff',
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))',
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
    },
    fontFamily: {
      sans: ['Open Sans', 'sans-serif'],
      poppins: ['Poppins', 'sans-serif'],
      montserrat: ['Montserrat', 'sans-serif'],
      satoshi: ['Satoshi', 'sans-serif'],
      redhat: ['Red Hat Mono', 'monospace'],
    },
    fontWeight: {
      '100': '100',
      '200': '200',
      '300': '300',
      '400': '400',
      '500': '500',
      '600': '600',
      '700': '700',
      '800': '800',
      bold: '700',
    },
    fontSize: {
      xs: '14px',
      sm: '16px',
      md: '20px',
      lg: '24px',
      xl: '32px',
      '2xl': '40px',
      '3xl': '48px',
    },
    extend: {
      screens: {
        'xxs': '360px', // minimum width for mobile
        'xs': '412px', // originally 370
        'mxs': '445px' // medium xs (could prob rename)
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        "gradient": {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'gradient': 'nameGradient 6s ease infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
