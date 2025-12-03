/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        mont: ['Montserrat', 'sans-serif'],
        pop: ['Poppins', 'sans-serif'],
        ooohbaby: ['"Oooh Baby"', "cursive"],
        baloo: ['"Baloo 2"', 'cursive'],
      },
      colors: {
        background: '#FFF6F1',
        categorybg: '#312214',
        cardbg: '#553E28',
        categbg: '#442F1B',
       
    },
    },
  },
  plugins: [],
}