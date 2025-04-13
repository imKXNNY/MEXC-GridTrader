import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import BacktestList from '../components/BacktestList';
import { BacktestResult } from '../types';

const Backtests: React.FC = () => {
  const navigate = useNavigate();

  const handleViewBacktest = (backtest: BacktestResult) => {
    navigate(`/results/${backtest.timestamp}`);
  };

  return (
    <div>
      <Navbar />
      <Container maxWidth="lg" className="mt-8">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Backtest Results
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/backtest')}
          >
            New Backtest
          </Button>
        </Box>

        <BacktestList onViewBacktest={handleViewBacktest} />
      </Container>
    </div>
  );
};

export default Backtests;
