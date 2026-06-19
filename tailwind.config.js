/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: {
          950: '#0d0d10',
          900: '#1a1a1e',
          800: '#26262c',
          700: '#3a3a42',
          600: '#54545e',
          500: '#737380',
        },
        paper: {
          50: '#faf8f3',
          100: '#f5f1e8',
          200: '#ebe4d4',
        },
        accent: {
          DEFAULT: '#c2410c',
          soft: '#ea580c',
          deep: '#9a3412',
        },
        feedback: {
          confusing: '#2563eb',
          slow: '#7c3aed',
          funny: '#ca8a04',
          cute: '#db2777',
          detail: '#dc2626',
        },
        role: {
          editor: '#0891b2',
          assistant: '#059669',
          fan: '#d97706',
        }
      },
      fontFamily: {
        display: ['"Noto Serif SC"', 'Georgia', 'serif'],
        body: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
        'pop-in': 'pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-up': 'fade-up 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.8)', opacity: '0' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.7)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'shimmer': {
          '0%': { 'background-position': '-1000px 0' },
          '100%': { 'background-position': '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};
