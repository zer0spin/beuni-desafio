/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta BeUni conforme PRD
        'beuni-orange': {
          50: '#fff7f0',
          100: '#ffeee1',
          200: '#ffd4b3',
          300: '#ffbb85',
          400: '#ff9f4d',
          500: '#FF6600', // Laranja Primário (Destaque)
          600: '#e55a00',
          700: '#cc4e00',
          800: '#b24200',
          900: '#993600',
        },
        'beuni-brown': {
          50: '#faf7f4',
          100: '#f5f0e9',
          200: '#ebe0d2',
          300: '#ddc7af',
          400: '#c9a584',
          500: '#a8876b',
          600: '#8b6b4f',
          700: '#6d5540',
          800: '#592318', // Marrom Escuro (Texto e CTAs secundários)
          900: '#4a1e14',
        },
        'beuni-cream': '#FBF8F3', // Branco "Off-white" (Fundo Principal)
        'beuni-text': '#333333', // Cinza/Chumbo (Texto Corpo)
        // Primary brand colors (mapeamento para compatibilidade)
        primary: {
          50: '#fff7f0',
          100: '#ffeee1',
          200: '#ffd4b3',
          300: '#ffbb85',
          400: '#ff9f4d',
          500: '#FF6600',
          600: '#e55a00',
          700: '#cc4e00',
          800: '#b24200',
          900: '#993600',
        },
        // Secondary colors (mapeamento para compatibilidade)
        secondary: {
          50: '#faf7f4',
          100: '#f5f0e9',
          200: '#ebe0d2',
          300: '#ddc7af',
          400: '#c9a584',
          500: '#a8876b',
          600: '#8b6b4f',
          700: '#6d5540',
          800: '#592318',
          900: '#4a1e14',
        },
        // Success, warning, error colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        // Fonte Principal conforme PRD: moderna e de excelente legibilidade
        // Similar à Circular Std ou Plus Jakarta Sans
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};