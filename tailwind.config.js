/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      },
    },
  },
  plugins: [],
}
