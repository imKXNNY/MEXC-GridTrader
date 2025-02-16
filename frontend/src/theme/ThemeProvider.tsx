import React from 'react';
import { theme } from './theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ 
      '--color-primary': theme.colors.primary,
      '--color-secondary': theme.colors.secondary,
      '--color-success': theme.colors.success,
      '--color-danger': theme.colors.danger,
      '--color-warning': theme.colors.warning,
      '--color-info': theme.colors.info,
      '--color-light': theme.colors.light,
      '--color-dark': theme.colors.dark,
      '--spacing-small': theme.spacing.small,
      '--spacing-medium': theme.spacing.medium,
      '--spacing-large': theme.spacing.large,
    } as React.CSSProperties}>
      {children}
    </div>
  );
};
