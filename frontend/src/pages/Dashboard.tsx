import React from 'react';
import Navbar from '@components/Navbar';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen pt-10" style={{ backgroundColor: 'var(--color-background)' }}>
      <Navbar />
      <Container maxWidth="lg" className="flex-1 py-8 px-4">
        <Typography
          variant="h3"
          component="h1"
          className="font-bold"
          sx={{ color: 'var(--color-primary)', mb: 4 }}
        >
          Dashboard
        </Typography>
        <Box
          className="grid gap-6 mb-8"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
        >
          {[
            { title: 'Total Profit', value: '$0.00' },
            { title: 'Active Trades', value: '0' },
            { title: 'Completed Trades', value: '0' },
          ].map((stat) => (
            <Paper
              key={stat.title}
              elevation={3}
              className="p-6 rounded-lg transition-shadow hover:shadow-lg"
              sx={{
                backgroundColor: 'var(--color-background)',
              }}
            >
              <Typography
                variant="h5"
                component="h3"
                className="mb-2 font-semibold"
                sx={{ color: 'var(--color-primary)' }}
              >
                {stat.title}
              </Typography>
              <Typography
                variant="h4"
                component="p"
                className="font-bold"
                sx={{ color: 'var(--color-text)' }}
              >
                {stat.value}
              </Typography>
            </Paper>
          ))}
        </Box>
        <Paper
          elevation={3}
          className="p-6 rounded-lg"
          sx={{
            backgroundColor: 'var(--color-background)',
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            className="mb-4 font-semibold"
            sx={{ color: 'var(--color-text)' }}
          >
            Recent Activity
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--color-text)' }}>
            No recent activity
          </Typography>
        </Paper>
      </Container>
    </div>
  );
};

export default Dashboard;
