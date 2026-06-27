/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        // Default body font across the whole app.
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Elegant serif for big titles — gives the "artisan cafe" feel.
        display: ['Fraunces', 'Georgia', 'serif'],
        mont: ['Montserrat', 'sans-serif'],
        pop: ['Poppins', 'sans-serif'],
        ooohbaby: ['"Oooh Baby"', "cursive"],
        baloo: ['"Baloo 2"', 'cursive'],
      },
      colors: {
        background: '#F5E0CC',
        categorybg: '#1A120B',
        cardbg: '#FFF8F0',
        categbg: '#EDD6C0',
    },
    },
  },
  plugins: [],
}