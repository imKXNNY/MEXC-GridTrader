import React from 'react';
import Navbar from '@components/Navbar';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface TradeResult {
  id: string;
  pair: string;
  profit: number;
  duration: string;
  strategy: string;
  timestamp: string;
}

const ResultDetail: React.FC = () => {
  const result: TradeResult = {
    id: '12345',
    pair: 'BTC/USDT',
    profit: 150.25,
    duration: '2h 15m',
    strategy: 'Grid Trading',
    timestamp: '2023-10-15 14:30:00',
  };

  const infoRows = [
    { label: 'Trade ID:', value: result.id },
    { label: 'Pair:', value: result.pair },
    { label: 'Profit:', value: `$${result.profit.toFixed(2)}` },
    { label: 'Duration:', value: result.duration },
    { label: 'Strategy:', value: result.strategy },
    { label: 'Timestamp:', value: result.timestamp },
  ];

  return (
    <div className="flex flex-col min-h-screen pt-10" style={{ backgroundColor: 'var(--color-background)' }}>
      <Navbar />
      <Container maxWidth="sm" className="flex-1 py-8 px-4">
        <Typography
          variant="h3"
          component="h1"
          className="mb-8 font-bold"
          sx={{ color: 'var(--color-primary)' }}
        >
          Trade Result Details
        </Typography>
        <Paper
          elevation={3}
          className="p-6 rounded-lg"
          sx={{
            backgroundColor: 'white',
            boxShadow: 'var(--shadow-medium)',
          }}
        >
          <Box className="space-y-4">
            {infoRows.map((row, index) => (
              <Box
                key={index}
                className="flex flex-col md:flex-row justify-between py-2 border-b last:border-b-0"
                sx={{ borderColor: 'var(--color-border, #e0e0e0)' }}
              >
                <Typography
                  variant="body1"
                  className="font-medium"
                  sx={{ color: 'var(--color-secondary)' }}
                >
                  {row.label}
                </Typography>
                <Typography
                  variant="body1"
                  className="font-bold"
                  sx={{ color: 'var(--color-primary)' }}
                >
                  {row.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default ResultDetail;
