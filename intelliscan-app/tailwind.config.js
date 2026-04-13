/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        headline: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        // ── Odoo/Zoho Enterprise Palette ──
        brand: {
          DEFAULT: '#714B67',     // Odoo signature purple
          light: '#875A7B',       // Lighter hover state
          dark: '#5B3D54',        // Pressed/active
          50: '#F5EFF4',
          100: '#EBDFE9',
          200: '#D7BFD3',
          300: '#C39FBD',
          400: '#AF7FA7',
          500: '#875A7B',
          600: '#714B67',
          700: '#5B3D54',
          800: '#452E40',
          900: '#2F1F2D',
          950: '#1A1119',
        },
        sidebar: {
          DEFAULT: '#21132E',     // Deep purple-navy sidebar bg
          hover: '#2D1B3D',       // Hover state in sidebar
          active: '#3A2450',      // Active item background
          border: '#3D2650',      // Dividers inside sidebar
          text: '#BBA8C8',        // Muted nav text
          'text-active': '#FFFFFF',
        },
        accent: {
          DEFAULT: '#1890FF',     // Zoho blue for secondary actions
          light: '#40A9FF',
          dark: '#096DD9',
        },
        // Surface system (Odoo-style light grays)
        surface: {
          DEFAULT: '#F0F0F0',
          container: '#FFFFFF',
          'container-low': '#E8E8E8',
          'container-high': '#D5D5D5',
          'container-highest': '#94A3B8',
        },
        'on-surface': {
          DEFAULT: '#1A1A2E',
          variant: '#555566',
        },
        // Keep compatibility with existing pages
        primary: {
          DEFAULT: '#714B67',
          container: '#F5EFF4',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#2F1F2D',
        },
        secondary: {
          DEFAULT: '#1890FF',
          container: '#E6F7FF',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#003A8C',
        },
        tertiary: {
          DEFAULT: '#FA8C16',
          container: '#FFF7E6',
        },
        'on-tertiary': {
          DEFAULT: '#ffffff',
          container: '#AD4E00',
        },
        error: {
          DEFAULT: '#F5222D',
          container: '#FFF1F0',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#A8071A',
        },
        outline: {
          DEFAULT: '#D9D9D9',
          variant: '#E8E8E8',
        },
      },
    },
  },
  plugins: [],
}
