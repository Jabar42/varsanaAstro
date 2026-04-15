/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        rausch: '#ff385c',
        'near-black': '#222222',
        saffron: '#FF9933',
        forest: '#2D5A27',
        'sacred-sand': '#FAF9F6',
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
