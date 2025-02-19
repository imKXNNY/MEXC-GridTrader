import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';

interface DocItem {
  title: string;
  description: string;
  link: string;
}

const DOC_ITEMS: DocItem[] = [
  {
    title: 'Getting Started',
    description: 'Learn how to set up and configure the trading bot',
    link: '/docs/getting-started',
  },
  {
    title: 'Strategy Configuration',
    description: 'Understand and customize trading strategies',
    link: '/docs/strategy-config',
  },
  {
    title: 'API Integration',
    description: 'Connect with MEXC exchange API',
    link: '/docs/api-integration',
  },
];

const DocsIndex: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4, px: 2 }}>
      <Typography
        variant="h5"
        component="h2"
        sx={{ fontWeight: 'bold', color: 'var(--color-text)', mt: 3, mb: 1 }}
      >
        Available Documents:
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {DOC_ITEMS.map((doc) => (
          <Paper
            key={doc.link}
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 'var(--border-radius-medium)',
              boxShadow: 'var(--shadow-medium)',
              transition: 'box-shadow var(--transition-medium)',
              backgroundColor: 'var(--color-background)',
              '&:hover': { boxShadow: 'var(--shadow-large)' },
            }}
          >
            <Typography
              variant="h5"
              component="h3"
              sx={{ fontWeight: 600, color: 'var(--color-text)' }}
            >
              <Link
                component={RouterLink}
                to={doc.link}
                underline="hover"
                sx={{
                  color: 'var(--color-primary)',
                  transition: 'color var(--transition-medium)',
                  '&:hover': { color: 'var(--color-primary)' },
                }}
              >
                {doc.title}
              </Link>
            </Typography>
            <Typography
              variant="body1"
              sx={{ mt: 1, color: 'var(--color-text)', opacity: 0.7 }}
            >
              {doc.description}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Container>
  );
};

export default DocsIndex;
