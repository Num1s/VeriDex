import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#6655C9',
          50: '#F5F3FC',
          100: '#EBE7F9',
          200: '#D7CFF3',
          300: '#C3B7ED',
          400: '#9687DD',
          500: '#6655C9',
          600: '#5244B5',
          700: '#3E3399',
          800: '#2A227D',
          900: '#1E1960',
        },
        accent: {
          DEFAULT: '#70955B',
          50: '#F3F7F0',
          100: '#E7EFE1',
          200: '#CFDFBD',
          300: '#B7CF99',
          400: '#94B77A',
          500: '#70955B',
          600: '#5A7849',
          700: '#435A37',
          800: '#2D3C25',
          900: '#1F2819',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
