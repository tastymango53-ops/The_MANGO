/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mango: {
          light: '#FFD166',
          DEFAULT: '#FFB703',
          dark: '#FB8500',
        },
        leaf: {
          light: '#8CB369',
          DEFAULT: '#52796F',
          dark: '#2F3E46',
        },
        offwhite: {
          DEFAULT: '#FFFDF9',
        },
        dark: {
          DEFAULT: '#1E1E1E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'sway': 'sway 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'fall': 'fall 15s linear infinite',
      },
      keyframes: {
        sway: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fall: {
          '0%': { transform: 'translateY(-100px) rotate(0deg)' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
