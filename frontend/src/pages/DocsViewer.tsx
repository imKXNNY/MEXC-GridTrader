import React from 'react';
import Navbar from '@components/Navbar';
import DocsIndex from '@components/DocsIndex';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const DocsViewer: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen pt-10" style={{ backgroundColor: 'var(--color-background)' }}>
      <Navbar />
      <Box component="main" className="flex flex-1 flex-col md:flex-row">
        {/* Left Sidebar (DocsIndex) */}
        <Box className="w-full md:w-auto">
          <DocsIndex />
        </Box>
        {/* Main Documentation Content */}
        <Container maxWidth="md" className="flex-1 p-5 md:p-8">
          <Typography
            variant="h3"
            component="h1"
            sx={{ color: 'var(--color-primary)', mb: 2 }}
          >
            DocsViewer
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--color-secondary)' }}>
            Select a topic from the left to view documentation
          </Typography>
        </Container>
      </Box>
    </div>
  );
};

export default DocsViewer;
