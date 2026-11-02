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
        // Official Mahadev Electro Hub Organic Theme Palette
        theme: {
          page: '#FAF9F6',          // Warm Off-White (Main page background)
          cream: '#F3F0E6',         // Soft Cream (Secondary section background)
          surface: '#FFFFFF',       // Pure Warm White (Cards & content surfaces)
          sage: '#A8BFA3',          // Soft Sage Green (Primary accent)
          mint: '#DCE8D5',          // Light Mint Green (Secondary accent)
          primary: '#355E3B',       // Forest Green (Primary buttons)
          primaryHover: '#294A30',  // Deep Forest Green (Button hover)
          heading: '#26352A',       // Deep Charcoal Green (Main headings)
          body: '#50574F',          // Soft Dark Grey (Body text)
          muted: '#7A8277',         // Grey Sage (Muted text)
          border: '#E2E6DC',        // Light Sage Grey (Borders and dividers)
          inputBg: '#FFFFFF',       // Warm White (Input background)
          inputBorder: '#E2E6DC',   // Light Sage Grey border
          inputFocus: '#8BA889',    // Sage Green focus ring
          success: '#2E7D46',       // Green (Success states)
          warning: '#B7791F',       // Warm Amber (Warning states)
          error: '#B94343',         // Muted Red (Error states)
        },
        // Backward-compatibility Brand Mapping
        brand: {
          navbar: '#FAF9F6',
          mainBg: '#FAF9F6',
          secondaryBg: '#F3F0E6',
          card: '#FFFFFF',
          cardHover: '#F3F0E6',
          textPrimary: '#26352A',
          textSecondary: '#50574F',
          border: '#E2E6DC',
          gold: '#355E3B',
          goldHover: '#294A30',
          inputBg: '#FFFFFF',
          inputBorder: '#E2E6DC',
          sale: '#B94343',
          success: '#2E7D46',
          error: '#B94343',
          footer: '#F3F0E6',
          footerText: '#50574F',

          // Compatibility / Semantic Aliases
          primary: '#355E3B',
          primaryHover: '#294A30',
          accent: '#A8BFA3',
          orange: '#355E3B',
          teal: '#355E3B',
          tealHover: '#294A30',
          black: '#26352A',
          charcoal: '#FAF9F6',
          dark: '#FAF9F6',
          light: '#F3F0E6',
          surface: '#FFFFFF',
          offwhite: '#FAF9F6',
          announcement: '#F3F0E6',
          heroBg: '#FAF9F6',
          heroSubtext: '#50574F',
          borderDark: '#E2E6DC',
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
