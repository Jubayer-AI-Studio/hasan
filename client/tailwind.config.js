/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sophia: {
          bg: '#070814',
          surface: '#0E1026',
          card: 'rgba(17, 20, 48, 0.72)',
          border: 'rgba(121, 40, 202, 0.28)',
          neon: '#00DFD8',
          violet: '#7928CA',
          pink: '#FF0080',
          gold: '#FFD700',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -3px rgba(0, 223, 216, 0.45)',
        'glow-violet': '0 0 25px -3px rgba(121, 40, 202, 0.5)',
        'glow-gold': '0 0 20px -3px rgba(255, 215, 0, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
