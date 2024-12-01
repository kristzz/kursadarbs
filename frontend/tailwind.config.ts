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
        md: "768px",    // Tablet portrait mode
        lg: "1024px",   // Tablet landscape mode
        xl: "1280px",   // Desktop screens
        "2xl": "1536px", // Large desktops
      },
      colors: {
        // dark mode
        darkBrown: '#26211f',
        darkWhite: '#f3f1f1',
        darkGreen: '#4ba975',

        // light mode
        lightWhite: '#fdfffe',
        lightGray: '#242521',
        lightbrown: '#93603f',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;