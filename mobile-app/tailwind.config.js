/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media', // Enable dark mode via prefers-color-scheme
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          DEFAULT: '#3B82F6',
          50: '#EBF2FE',
          100: '#D7E6FD',
          200: '#AFCCFB',
          300: '#87B3F9',
          400: '#5F99F7',
          500: '#3B82F6',
          600: '#2563EB', // brand-2
          700: '#1557C5',
          800: '#10439E',
          900: '#0A2F77',
        },
        // Primary (alias for brand)
        primary: {
          DEFAULT: '#3B82F6',
          50: '#EBF2FE',
          100: '#D7E6FD',
          200: '#AFCCFB',
          300: '#87B3F9',
          400: '#5F99F7',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1557C5',
          800: '#10439E',
          900: '#0A2F77',
        },
        // Semantic colors
        ok: '#22c55e',
        warn: '#f59e0b',
        danger: '#ef4444',
        ink: '#0f172a',
        muted: '#64748b',
        card: '#ffffff',
        bg: '#f6f7fb',
      },
      fontSize: {
        // Type scale - consistent hierarchy
        'display': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }], // 40px
        'h1': ['2rem', { lineHeight: '1.25', fontWeight: '700' }], // 32px
        'h2': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }], // 24px
        'h3': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }], // 20px
        'h4': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }], // 18px
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }], // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }], // 14px
        'caption': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }], // 12px
        'caption-sm': ['0.6875rem', { lineHeight: '1.5', fontWeight: '400' }], // 11px
      },
      boxShadow: {
        'card': '0 6px 24px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 12px 32px rgba(15, 23, 42, 0.12)',
      },
      borderRadius: {
        'card': '16px', // rounded-2xl alias
      },
      spacing: {
        'card-p': '20px', // p-5
        'gap-el': '16px', // gap-4
        'gap-section': '24px', // gap-6
      },
      minHeight: {
        'tap': '44px', // Minimum tap target
      },
      minWidth: {
        'tap': '44px',
      },
    },
  },
  plugins: [],
}
