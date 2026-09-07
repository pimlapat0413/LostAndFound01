/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00366f',
        'primary-container': '#004c99',
        secondary: '#54606a',
        'secondary-container': '#d8e4f1',
        surface: '#f8f9ff',
        'on-surface': '#0d1c2f',
        outline: '#c2c6d3',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        jakarta: ['var(--font-jakarta)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}