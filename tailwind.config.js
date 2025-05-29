/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'gradient-start': '#7f00ff',
        'gradient-middle': '#e100ff',
        'gradient-end': '#00ffe7',
        'neon-purple': '#bb00ff',
        'neon-pink': '#ff00d4',
        'neon-blue': '#00d4ff',
        'neon-teal': '#00ffe7',
        'neon-lime': '#a6ff00'
      },
      boxShadow: {
        'neon-glow': '0 0 8px #bb00ff, 0 0 20px #e100ff, 0 0 30px #00ffe7'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['dark']
  }
}