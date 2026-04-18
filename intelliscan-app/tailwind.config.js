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
        brand: {
          DEFAULT: '#FFB800',     // Solar Gold
          light: '#FFD60A',
          dark: '#CC9200',
          50: '#FFFBE6',
          100: '#FFF1B8',
          200: '#FFE58F',
          300: '#FFD666',
          400: '#FFC53D',
          500: '#FFB800',
          600: '#D48806',
          700: '#AD6800',
          800: '#874D00',
          900: '#613400',
          950: '#3D1C00',
        },
        sidebar: {
          DEFAULT: '#050505',     // Abyssal Black
          hover: '#0F0F11',
          active: '#141416',
          border: '#141416',
          text: '#A1A1AA',
          'text-active': '#FFFFFF',
        },
        accent: {
          DEFAULT: '#FFB800',
          light: '#FFD60A',
          dark: '#CC9200',
        },
        surface: {
          DEFAULT: '#050505',
          container: '#09090B',
          'container-low': '#121214',
          'container-high': '#1F1F23',
          'container-highest': '#27272A',
        },
        'on-surface': {
          DEFAULT: '#FAFAF9',
          variant: '#A1A1AA',
        },
        primary: {
          DEFAULT: '#FFB800',
          container: '#FFFBE6',
        },
        'on-primary': {
          DEFAULT: '#000000',
          container: '#613400',
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
