/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg0: '#030712',
        bg1: '#070d24',
        bg2: '#0c1538',
        bg3: '#131f4e',
        ink: '#ffffff',
        mut: '#93c5fd',
        mut2: '#60a5fa',
        cyan: '#38bdf8',
        cobalt: '#2563eb',
        flagYellow: '#f2c14e',
        flagOrange: '#ef8550',
        flagRed: '#f25c70',
        flagGreen: '#5cc9a0',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', '"SF Mono"', '"Cascadia Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        glass: '0 24px 64px -18px rgba(2, 6, 23, 0.75)',
        glow: '0 0 32px rgba(56, 189, 248, 0.25)',
      },
      backdropBlur: {
        glass: '36px',
      }
    },
  },
  plugins: [],
}
