import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'warm-bg': '#FAF8F5',
        'warm-card': '#FFFFFF',
        'warm-border': '#E8E4DF',
        'warm-text': '#2D2A26',
        'warm-muted': '#8B857D',
        sage: '#7C8B6F',
        'sage-dark': '#5B6B4F',
        terracotta: '#C4956A',
        'terracotta-light': '#F0DCC8',
      },
      fontFamily: {
        fraunces: ['var(--font-fraunces)', 'Lora', 'serif'],
        jakarta: ['var(--font-jakarta)', 'DM Sans', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
}

export default config
