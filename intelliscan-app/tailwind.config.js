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
        primary: {
          DEFAULT: '#3f51b5',
          container: '#e8eaf6',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#1a237e',
        },
        secondary: {
          DEFAULT: '#009688',
          container: '#e0f2f1',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#004d40',
        },
        tertiary: {
          DEFAULT: '#ff9800',
          container: '#fff3e0',
        },
        'on-tertiary': {
          DEFAULT: '#ffffff',
          container: '#e65100',
        },
        error: {
          DEFAULT: '#f44336',
          container: '#ffebee',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#b71c1c',
        },
        surface: {
          DEFAULT: '#f8fafc',
          container: '#f1f5f9',
          'container-low': '#e2e8f0',
          'container-high': '#cbd5e1',
          'container-highest': '#94a3b8',
        },
        'on-surface': {
          DEFAULT: '#0f172a',
          variant: '#475569',
        },
        outline: {
          DEFAULT: '#94a3b8',
          variant: '#cbd5e1',
        }
      },
    },
  },
  plugins: [],
}
