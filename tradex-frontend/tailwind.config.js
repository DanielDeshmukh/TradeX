/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7F3DFF',
          hover: '#6C4FE0',
          muted: '#5A18E9',
          glow: 'rgba(127, 61, 255, 0.2)',
        },
        surface: {
          DEFAULT: '#1A1D29',
          input: '#2B2B2B',
          elevated: '#1C1F24',
        },
        bg: {
          DEFAULT: '#0A0E15',
          secondary: '#0F1117',
        },
        bullish: {
          DEFAULT: '#22c55e',
          muted: '#4ade80',
        },
        bearish: {
          DEFAULT: '#ef4444',
          muted: '#ff6b6b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'brand': '0 0 20px rgba(127, 61, 255, 0.2)',
        'brand-lg': '0 0 40px rgba(127, 61, 255, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

