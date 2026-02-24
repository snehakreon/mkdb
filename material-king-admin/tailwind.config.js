export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'mk-red': { DEFAULT: '#ED1C24', 600: '#C71920' },
        'mk-gray': { DEFAULT: '#4D4D4D' },
      },
      fontFamily: {
        'century-gothic': ['"Century Gothic"', 'Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
