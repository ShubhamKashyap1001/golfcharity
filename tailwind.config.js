/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        black: '#0A0A0A',
        'off-black': '#111111',
        'dark': '#161616',
        'dark-card': '#1C1C1C',
        'border': '#2A2A2A',
        'border-light': '#333333',
        gold: {
          50: '#FFF9E6',
          100: '#FFF0B3',
          200: '#FFE066',
          300: '#FFD700',
          400: '#FFC200',
          500: '#F5A623',
          600: '#D4870A',
          700: '#A8650A',
          800: '#7C4A08',
          900: '#4F2F06',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        ruby: {
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-in': 'slideIn 0.5s ease forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'number-spin': 'numberSpin 0.3s ease',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'draw-reveal': 'drawReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245, 166, 35, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(245, 166, 35, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        numberSpin: {
          '0%': { transform: 'rotateX(90deg)', opacity: '0' },
          '100%': { transform: 'rotateX(0deg)', opacity: '1' },
        },
        drawReveal: {
          '0%': { transform: 'scale(0.5) rotateY(180deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotateY(0deg)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F5A623 0%, #FFD700 50%, #F5A623 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0A0A0A 0%, #161616 100%)',
        'card-gradient': 'linear-gradient(135deg, #1C1C1C 0%, #222222 100%)',
        'hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(245,166,35,0.15) 0%, transparent 60%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },
      boxShadow: {
        'gold': '0 0 30px rgba(245, 166, 35, 0.3)',
        'gold-lg': '0 0 60px rgba(245, 166, 35, 0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
};
