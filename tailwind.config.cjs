/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/**/*.mjs', './src/templates/**/*.mjs', './src/js/**/*.js'],
  theme: {
    // "nav" is where the desktop navigation fits without its links colliding (tested in tests/run.mjs).
    screens: { sm: '640px', md: '768px', lg: '1024px', nav: '1100px', xl: '1280px' },
    extend: {
      colors: {
        brand: {
          burgundy: '#8A181A',
          burgundydark: '#6E1315',
          cream: '#F1DEC0',
          creamlight: '#FBF4E7',
          terracotta: '#D9945E',
          // Terracotta darkened for small text: 5.6:1 on creamlight. Use terracotta only for decoration or on dark.
          terracottadark: '#8F4A1C',
          deepgreen: '#246B2E',
          ink: '#1F1F1F',
        },
      },
      fontFamily: {
        display: ['Fredoka', 'ui-rounded', 'system-ui', 'sans-serif'],
        body: ['Poppins', 'system-ui', '-apple-system', 'Segoe UI', 'Arial', 'sans-serif'],
        accent: ['"Special Elite"', 'ui-monospace', 'Courier New', 'monospace'],
      },
      boxShadow: {
        base: '0 10px 24px -8px rgba(31,31,31,0.18), 0 2px 6px -2px rgba(138,24,26,0.08)',
        lifted: '0 20px 32px -10px rgba(31,31,31,0.22), 0 6px 12px -6px rgba(138,24,26,0.14)',
      },
    },
  },
  plugins: [],
};
