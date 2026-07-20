/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#6366f1',
          accent: '#f472b6',
          secondary: '#38bdf8',
        },
        bg: {
          base: '#050816',
          card: '#0b1228',
          elevated: '#111a33',
        },
        text: {
          primary: '#f3f6ff',
          muted: '#9aa6c7',
          subtle: '#6d7a95',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99, 102, 241, 0.18), 0 18px 45px rgba(4, 8, 20, 0.35)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

