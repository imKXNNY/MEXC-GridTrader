import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from '@mui/material';

const ThemeSwitcher: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Button 
      variant="contained" 
      onClick={toggleTheme}
      sx={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 1000
      }}
    >
      Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
    </Button>
  );
};

export default ThemeSwitcher;
