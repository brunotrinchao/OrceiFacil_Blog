/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
    './content/**/*.md'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0870f8',
          dark: '#0055c8',
          soft: '#e9f3ff',
          hover: '#005edb'
        },
        ink: {
          DEFAULT: '#0c1424',
          muted: '#61708a',
          light: '#f8fafc'
        },
        navy: {
          DEFAULT: '#07111f',
          dark: '#020617'
        },
        surface: {
          DEFAULT: '#ffffff',
          soft: '#f4f7fb',
          line: '#dfe6f0'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme('colors.ink.DEFAULT'),
            maxWidth: '68ch',
            a: {
              color: theme('colors.brand.DEFAULT'),
              '&:hover': {
                color: theme('colors.brand.dark'),
              },
              fontWeight: '600',
              textDecoration: 'underline',
              textUnderlineOffset: '4px'
            },
            h1: {
              fontFamily: theme('fontFamily.sans').join(', '),
              fontWeight: '800',
              color: theme('colors.ink.DEFAULT'),
              letterSpacing: '-0.025em'
            },
            h2: {
              fontFamily: theme('fontFamily.sans').join(', '),
              fontWeight: '700',
              color: theme('colors.ink.DEFAULT'),
              letterSpacing: '-0.02em',
              marginTop: '2em',
              marginBottom: '0.8em'
            },
            h3: {
              fontFamily: theme('fontFamily.sans').join(', '),
              fontWeight: '600',
              color: theme('colors.ink.DEFAULT'),
              marginTop: '1.6em',
              marginBottom: '0.6em'
            },
            code: {
              color: theme('colors.brand.dark'),
              backgroundColor: theme('colors.brand.soft'),
              padding: '0.25rem 0.4rem',
              borderRadius: '0.375rem',
              fontWeight: '500'
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            blockquote: {
              borderLeftColor: theme('colors.brand.DEFAULT'),
              backgroundColor: theme('colors.surface.soft'),
              padding: '1rem 1.5rem',
              borderRadius: '0 0.5rem 0.5rem 0',
              fontStyle: 'normal',
              color: theme('colors.ink.muted')
            }
          }
        }
      })
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
}
