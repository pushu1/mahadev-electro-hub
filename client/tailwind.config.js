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
        // Official Mahadev Electro Hub Dark-Green & High-Contrast Theme Palette
        theme: {
          page: '#FAF9F6',          // Warm Off-White (Main page background)
          cream: '#F3F0E6',         // Soft Cream (Secondary section background)
          surface: '#FFFFFF',       // Pure Warm White (Cards & content surfaces)
          sage: '#356B3D',          // Secondary Green
          mint: '#DCE8D5',          // Light Mint Green (Selected/active background)
          primary: '#24532F',       // Primary Dark Green (Primary buttons)
          primaryHover: '#183D22',  // Dark Green Hover
          secondary: '#356B3D',     // Secondary Green
          heading: '#171C17',       // Darker Nearly Black (Main headings)
          body: '#252A25',          // Dark Charcoal (Body text)
          muted: '#596358',         // Deep Grey Sage (Muted text & placeholders)
          border: '#D5DDD2',        // Muted Sage Border (Borders and dividers)
          inputBg: '#FFFFFF',       // Warm White (Input background)
          inputBorder: '#D5DDD2',   // Border
          inputFocus: '#24532F',    // Dark Green focus ring
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
          textPrimary: '#171C17',
          textSecondary: '#252A25',
          border: '#D5DDD2',
          gold: '#24532F',
          goldHover: '#183D22',
          inputBg: '#FFFFFF',
          inputBorder: '#D5DDD2',
          sale: '#B94343',
          success: '#2E7D46',
          error: '#B94343',
          footer: '#F3F0E6',
          footerText: '#252A25',

          // Compatibility / Semantic Aliases
          primary: '#24532F',
          primaryHover: '#183D22',
          accent: '#356B3D',
          orange: '#24532F',
          teal: '#24532F',
          tealHover: '#183D22',
          black: '#171C17',
          charcoal: '#FAF9F6',
          dark: '#FAF9F6',
          light: '#F3F0E6',
          surface: '#FFFFFF',
          offwhite: '#FAF9F6',
          announcement: '#F3F0E6',
          heroBg: '#FAF9F6',
          heroSubtext: '#252A25',
          borderDark: '#D5DDD2',
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
