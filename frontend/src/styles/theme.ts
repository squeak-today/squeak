export const theme = {
  colors: {
    text: {
      primary: '#000000',
      secondary: '#333333'
    },
    selected: '#fad48f',
    background: '#fbfbfb',
    border: '#e0e0e0',
    danger: '#e74c3c',
    languages: {
      french: {
        bg: '#E6F3FF', // Pastel blue
      },
      spanish: {
        bg: '#FFE8D6', // Pastel orange
      }
    },
    cefr: {
      beginner: {
        bg: '#E6F4EA',
        text: '#1B873B'
      },
      intermediate: {
        bg: '#FEF7E0',
        text: '#B95000'
      },
      advanced: {
        bg: '#FCE8E8',
        text: '#D93026'
      },
      A: {
        bg: '#E6F4EA',
        text: '#1B873B'
      },
      B: {
        bg: '#FEF7E0',
        text: '#774800'
      },
      C: {
        bg: '#FCE8E8',
        text: '#D93026'
      }
    },
    streak: {
      none: '#f0f0f0',
      short: '#B3FFB3',  // 5-19 days
      medium: '#FFD6B3', // 20-59 days
      long: '#FFB3B3',   // 60+ days
    }
  },
  elevation: {
    base: '0 2px 4px rgba(0, 0, 0, 0.15)',
    hover: '0 4px 6px rgba(0, 0, 0, 0.15)'
  },
  typography: {
    fontFamily: {
      primary: "'Lora', serif",
      secondary: "'Montserrat', sans-serif"
    },
    fontSize: {
      sm: '0.75rem',
      base: '1rem',
      md: '1.25rem',
      lg: '1.5rem',
      xl: '3rem',
      xxl: '3.5rem'
    }
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
    xl: '4rem'
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1200px'
  }
}