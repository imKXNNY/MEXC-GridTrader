/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
        light: 'var(--color-light)',
        dark: 'var(--color-dark)',
        background: 'var(--color-background)',
        text: 'var(--color-text)',
      },
      spacing: {
        small: 'var(--spacing-small)',
        medium: 'var(--spacing-medium)',
        large: 'var(--spacing-large)',
      },
      fontFamily: {
        primary: 'var(--font-family)',
      },
      fontSize: {
        small: 'var(--font-size-small)',
        medium: 'var(--font-size-medium)',
        large: 'var(--font-size-large)',
      },
      fontWeight: {
        normal: 'var(--font-weight-normal)',
        bold: 'var(--font-weight-bold)',
      },
      boxShadow: {
        small: 'var(--shadow-small)',
        medium: 'var(--shadow-medium)',
        large: 'var(--shadow-large)',
      },
      borderRadius: {
        small: 'var(--border-radius-small)',
        medium: 'var(--border-radius-medium)',
        large: 'var(--border-radius-large)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        medium: 'var(--transition-medium)',
        slow: 'var(--transition-slow)',
      },
    },
  },
  plugins: [],
}
