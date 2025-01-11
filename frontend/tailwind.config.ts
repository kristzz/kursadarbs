import type { Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        sm: "640px",    // Mobile screens
        lg: "1024px",   // Tablet landscape mode
        xl: "1280px",   // Desktop screens
      },
      colors: {
        backgroundc: '#000000',
        textc: '#ededed',
        primaryc: '#5c1a8c',
        secondaryc: '#2d2969',
        accentc: '#89239e',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;