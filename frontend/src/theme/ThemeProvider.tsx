import React, { createContext, useContext, useState } from 'react';
import { Theme, lightTheme, darkTheme } from './theme';


interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const themeStyles = {
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-success': theme.colors.success,
    '--color-danger': theme.colors.danger,
    '--color-warning': theme.colors.warning,
    '--color-info': theme.colors.info,
    '--color-light': theme.colors.light,
    '--color-dark': theme.colors.dark,
    '--color-background': theme.colors.background,
    '--color-text': theme.colors.text,
    '--spacing-small': theme.spacing.small,
    '--spacing-medium': theme.spacing.medium,
    '--spacing-large': theme.spacing.large,
    '--font-family': theme.typography.fontFamily,
    '--font-size-small': theme.typography.fontSize.small,
    '--font-size-medium': theme.typography.fontSize.medium,
    '--font-size-large': theme.typography.fontSize.large,
    '--font-weight-normal': theme.typography.fontWeight.normal,
    '--font-weight-bold': theme.typography.fontWeight.bold,
    '--shadow-small': theme.shadows.small,
    '--shadow-medium': theme.shadows.medium,
    '--shadow-large': theme.shadows.large,
    '--border-radius-small': theme.borderRadius.small,
    '--border-radius-medium': theme.borderRadius.medium,
    '--border-radius-large': theme.borderRadius.large,
    '--transition-fast': theme.transitions.fast,
    '--transition-medium': theme.transitions.medium,
    '--transition-slow': theme.transitions.slow,
  } as React.CSSProperties;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      <div style={themeStyles}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
