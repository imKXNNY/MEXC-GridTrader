import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '../theme/ThemeProvider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

interface NavItem {
  path: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Dashboard' },
  { path: '/backtest', label: 'Backtest' },
  { path: '/docs', label: 'Documentation' },
  { path: '/results', label: 'Results' },
];

const Navbar: React.FC = () => {
  const { theme } = useTheme();

  return (
    <AppBar
      position="fixed"
      elevation={4}
      sx={{
        backgroundColor: 'var(--color-background)',
        boxShadow: 'var(--shadow-medium)',
        color: 'var(--color-text)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            height: 64,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Link component={RouterLink} to="/" underline="none">
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: 'var(--color-primary)',
                transition: 'color var(--transition-medium)',
                '&:hover': {
                  color: 'var(--color-primary)',
                },
              }}
            >
              MEXC Grid Trading
            </Typography>
          </Link>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                component={RouterLink}
                to={item.path}
                underline="none"
                sx={{
                  fontWeight: 500,
                  color: 'var(--color-text)',
                  transition: 'color var(--transition-medium)',
                  '&:hover': {
                    color: 'var(--color-primary)',
                  },
                }}
              >
                {item.label}
              </Link>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
