import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Alert
} from '@mui/material';
import Navbar from '../components/Navbar';
import StrategyOptimizer from '../components/StrategyOptimizer';
import { STRATEGY_TYPES, TIMEFRAMES } from '../utils/constants';

interface OptimizationResult {
  parameters: Record<string, number>;
  profit: number;
  trades: number;
  winRate: number;
  sharpeRatio: number;
}

const Optimize: React.FC = () => {
  // Basic parameters
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1h');
  const [initialCapital, setInitialCapital] = useState(10000);
  const [strategy, setStrategy] = useState(STRATEGY_TYPES.MOMENTUM);

  // Results
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([]);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartOptimization = () => {
    // Validate inputs
    if (!symbol) {
      setError('Symbol is required');
      return;
    }

    if (initialCapital <= 0) {
      setError('Initial capital must be greater than 0');
      return;
    }

    setError(null);
    setShowOptimizer(true);
  };

  const handleOptimizationComplete = (results: OptimizationResult[]) => {
    setOptimizationResults(results);
  };

  return (
    <div>
      <Navbar />
      <Container maxWidth="lg" className="mt-8">
        <Typography variant="h4" component="h1" gutterBottom>
          Strategy Optimization
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Optimization Settings
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Timeframe</InputLabel>
                <Select
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  label="Timeframe"
                >
                  {TIMEFRAMES.map((tf) => (
                    <MenuItem key={tf.value} value={tf.value}>
                      {tf.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Initial Capital"
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(Number(e.target.value))}
                fullWidth
                required
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Strategy</InputLabel>
                <Select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  label="Strategy"
                >
                  <MenuItem value={STRATEGY_TYPES.MOMENTUM}>Momentum</MenuItem>
                  <MenuItem value={STRATEGY_TYPES.INSIDE_BAR}>Inside Bar</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleStartOptimization}
                >
                  Configure Optimization
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {showOptimizer && (
          <StrategyOptimizer
            strategy={strategy}
            onOptimizationComplete={handleOptimizationComplete}
          />
        )}

        {optimizationResults.length > 0 && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Best Parameters
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Result
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Parameters</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {Object.entries(optimizationResults[0].parameters).map(([key, value]) => (
                      <Paper key={key} sx={{ px: 1, py: 0.5, borderRadius: 1 }}>
                        <Typography variant="body2">
                          <strong>{key}:</strong> {value}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="textSecondary">Profit</Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: optimizationResults[0].profit > 0 ? 'success.main' : 'error.main',
                          fontWeight: 'bold'
                        }}
                      >
                        ${optimizationResults[0].profit.toFixed(2)}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="textSecondary">Win Rate</Typography>
                      <Typography variant="body1">
                        {(optimizationResults[0].winRate * 100).toFixed(2)}%
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="textSecondary">Sharpe Ratio</Typography>
                      <Typography variant="body1">
                        {optimizationResults[0].sharpeRatio.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  // Apply the best parameters and navigate to backtest page
                  // This would be implemented in a real application
                  console.log('Applying best parameters:', optimizationResults[0].parameters);
                }}
              >
                Apply Best Parameters
              </Button>
            </Box>
          </Paper>
        )}
      </Container>
    </div>
  );
};

export default Optimize;
