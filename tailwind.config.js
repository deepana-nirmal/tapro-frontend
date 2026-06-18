/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10B981',
        secondary: '#F59E0B',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#f59e0b',
        info: '#10B981',
        dark: '#020617',
        light: '#F8FAFC',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'panel': '0 20px 48px rgba(15, 23, 42, 0.08)',
        'panel-dark': '0 20px 48px rgba(2, 6, 23, 0.32)',
      },
      backgroundImage: {
        'grid-soft': 'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)',
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
