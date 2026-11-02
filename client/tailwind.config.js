/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '380px',
      },
      colors: {
        brand: {
          // Croma RGB Gradient Palette
          rgbBlack: '#000000',
          rgbCharcoal: '#111111',
          rgbBurgundy: '#501B28',
          rgbPurple: '#28162C',
          rgbAmber: '#6B451B',
          rgbGoldenOrange: '#8A5A16',

          // Premium Croma-Inspired Dark Theme Palette
          navbar: '#000000',
          mainBg: '#181818',
          secondaryBg: '#202020',
          card: '#242424',
          cardHover: '#2D2D2D',
          textPrimary: '#FFFFFF',
          textSecondary: '#B3B3B3',
          border: '#383838',
          gold: '#D6A52A',
          goldHover: '#E5B93B',
          inputBg: '#242424',
          inputBorder: '#444444',
          sale: '#E53935',
          success: '#16803D',
          error: '#D92D20',
          footer: '#000000',
          footerText: '#FFFFFF',

          // Compatibility / Semantic Aliases
          primary: '#D6A52A',
          primaryHover: '#E5B93B',
          accent: '#D6A52A',
          orange: '#D6A52A',
          teal: '#D6A52A',
          tealHover: '#E5B93B',
          black: '#000000',
          charcoal: '#181818',
          dark: '#181818',
          light: '#202020',
          surface: '#242424',
          offwhite: '#242424',
          announcement: '#000000',
          heroBg: '#181818',
          heroSubtext: '#B3B3B3',
          borderDark: '#383838',
        }
      },
      fontFamily: {
        sans: ['var(--font-site)', 'Xmind Variable', 'Xmind', 'Baloo 2', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['var(--font-heading)', 'Xmind Variable', 'Xmind', 'Baloo 2', 'system-ui', '-apple-system', 'sans-serif'],
        devanagari: ['Baloo 2', 'sans-serif'],
        xmind: ['Xmind Variable', 'Xmind', 'system-ui', 'sans-serif'],
        baloo: ['Baloo 2', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
