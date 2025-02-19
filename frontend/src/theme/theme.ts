export type Theme = {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    light: string;
    dark: string;
    background: string;
    text: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
    fontWeight: {
      normal: number;
      bold: number;
    };
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
  zIndex: {
    modal: number;
    dropdown: number;
    tooltip: number;
  };
  transitions: {
    fast: string;
    medium: string;
    slow: string;
  };
};

export const lightTheme: Theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    background: '#ffffff',
    text: '#212529',
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    fontSize: {
      small: '0.875rem',
      medium: '1rem',
      large: '1.25rem',
    },
    fontWeight: {
      normal: 400,
      bold: 600,
    },
  },
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.12)',
    medium: '0 4px 6px rgba(0,0,0,0.12)',
    large: '0 8px 24px rgba(0,0,0,0.12)',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },
  zIndex: {
    modal: 1000,
    dropdown: 100,
    tooltip: 10,
  },
  transitions: {
    fast: '0.1s ease',
    medium: '0.2s ease',
    slow: '0.3s ease',
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    primary: '#0d6efd',
    secondary: '#5c636a',
    success: '#218838',
    danger: '#c82333',
    warning: '#e0a800',
    info: '#138496',
    light: '#2d3338',
    dark: '#1a1e21',
    background: '#121212',
    text: '#f8f9fa',
  },
};
