/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        rausch: '#52185B',
        'rausch-light': '#97448E',
        'near-black': '#222222',
        'secondary-gray': '#6a6a6a',
        saffron: '#F7941E',
        'saffron-light': '#FAAF3E',
        forest: '#779B05',
        'forest-light': '#95AD02',
        'sacred-sand': '#FAF9F6',
        'light-surface': '#f7f7f7',
      },
      boxShadow: {
        airbnb: '0 0 0 1px rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      letterSpacing: {
        tightest: '-0.02em',
      },
      aspectRatio: {
        hero: '16 / 10',
      },
    },
  },
  plugins: [],
};
