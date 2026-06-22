/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        mb: {
          bg: '#0a0f1a',
          'bg-soft': '#0f1628',
          surface: '#151d2f',
          'surface-elevated': '#1c2740',
          border: '#2a3650',
          text: '#e8edf7',
          muted: '#8b9ab8',
          accent: '#5eead4',
          'accent-hover': '#2dd4bf',
          primary: '#818cf8',
          'primary-hover': '#6366f1',
          danger: '#f87171',
          warning: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        display: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(94, 234, 212, 0.35)',
        card: '0 8px 32px -8px rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        'mb-mesh':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(129, 140, 248, 0.18), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(45, 212, 191, 0.12), transparent)',
      },
    },
  },
  plugins: [],
};
