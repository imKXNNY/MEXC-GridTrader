import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

interface Order {
  price: number;
  profit: number;
  size: number;
  time: string;
  type: string;
}

interface Results {
  orders: Order[];
  drawdown_analysis: {
    drawdown: number;
    len: number;
    moneydown: number;
    max: {
      drawdown: number;
      len: number;
      moneydown: number;
    };
  };
  trade_analysis: {
    len: {
      average: number;
      long: {
        average: number;
        lost: {
          average: number;
          max: number;
          min: number;
          total: number;
        };
        max: number;
        min: number;
        total: number;
        won: {
          average: number;
          max: number;
          min: number;
          total: number;
        };
      };
      lost: {
        average: number;
        max: number;
        min: number;
        total: number;
      };
      max: number;
      min: number;
      short: {
        average: number;
        lost: {
          average: number;
          max: number;
          min: number;
          total: number;
        };
        max: number;
        min: number;
        total: number;
        won: {
          average: number;
          max: number;
          min: number;
          total: number;
        };
      };
      total: number;
      won: {
        average: number;
        max: number;
        min: number;
        total: number;
      };
    };
    long: {
      lost: number;
      pnl: {
        average: number;
        lost: {
          average: number;
          max: number;
          total: number;
        };
        total: number;
        won: {
          average: number;
          max: number;
          total: number;
        };
      };
      total: number;
      won: number;
    };
    lost: {
      pnl: {
        average: number;
        max: number;
        total: number;
      };
      total: number;
    };
    pnl: {
      gross: {
        average: number;
        total: number;
      };
      net: {
        average: number;
        total: number;
      };
    };
    short: {
      lost: number;
      pnl: {
        average: number;
        lost: {
          average: number;
          max: number;
          total: number;
        };
        total: number;
        won: {
          average: number;
          max: number;
          total: number;
        };
      };
      total: number;
      won: number;
    };
    streak: {
      lost: {
        current: number;
        longest: number;
      };
      won: {
        current: number;
        longest: number;
      };
    };
    total: {
      closed: number;
      open: number;
      total: number;
    };
    won: {
      pnl: {
        average: number;
        max: number;
        total: number;
      };
      total: number;
    };
  };
  sharpe_analysis: {
    sharperatio: number;
  };
}

const Backtest: React.FC = () => {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1h');
  const [initialCapital, setInitialCapital] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1.0);
  const [rsiLength, setRsiLength] = useState(14);
  const [macdFast, setMacdFast] = useState(12);
  const [macdSlow, setMacdSlow] = useState(26);
  const [macdSignal, setMacdSignal] = useState(9);
  const [results, setResults] = useState<Results | null>(null);
  const [fetchingResults, setFetchingResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFetchingResults(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symbol,
          interval,
          initial_capital: initialCapital,
          risk_percent: riskPercent
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        console.log('Backtest result:', data);
      } else {
        throw new Error('Error during backtest');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError('Failed: ' + error.message);
      } else {
        setError('Failed: An unknown error occurred');
      }
    } finally {
      setFetchingResults(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pt-16" style={{ backgroundColor: 'var(--color-background)' }}>
      <Navbar />
      <Container maxWidth="md" className="py-4">
        {/* Backtest Form */}
        <Paper className="p-6 mb-8" elevation={3} sx={{ backgroundColor: 'var(--color-background)' }}>
          <Typography
            variant="h4"
            component="h1"
            className="font-bold"
            sx={{ color: 'var(--color-primary)', mb: 2 }}
          >
            Backtest Trading Strategy
          </Typography>
          <Box component="form" onSubmit={handleSubmit} className="space-y-4">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ style: { color: 'var(--color-text)' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'var(--color-secondary)' },
                      color: 'var(--color-text)'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel sx={{ color: 'var(--color-text)' }}>Interval</InputLabel>
                  <Select
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    label="Interval"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-secondary)' },
                      color: 'var(--color-text)'
                    }}
                  >
                    <MenuItem value="1m">1 Minute</MenuItem>
                    <MenuItem value="5m">5 Minutes</MenuItem>
                    <MenuItem value="15m">15 Minutes</MenuItem>
                    <MenuItem value="1h">1 Hour</MenuItem>
                    <MenuItem value="4h">4 Hours</MenuItem>
                    <MenuItem value="1d">1 Day</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Initial Capital"
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Number(e.target.value))}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  InputLabelProps={{ style: { color: 'var(--color-text)' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'var(--color-secondary)' },
                      color: 'var(--color-text)'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Risk Percent"
                  type="number"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(Number(e.target.value))}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
                  InputLabelProps={{ style: { color: 'var(--color-text)' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'var(--color-secondary)' },
                      color: 'var(--color-text)'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="RSI Length"
                  type="number"
                  value={rsiLength}
                  onChange={(e) => setRsiLength(Number(e.target.value))}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{ inputProps: { min: 1, max: 100 } }}
                  InputLabelProps={{ style: { color: 'var(--color-text)' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'var(--color-secondary)' },
                      color: 'var(--color-text)'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="MACD Fast"
                  type="number"
                  value={macdFast}
                  onChange={(e) => setMacdFast(Number(e.target.value))}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{ inputProps: { min: 1, max: 100 } }}
                  InputLabelProps={{ style: { color: 'var(--color-text)' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'var(--color-secondary)' },
                      color: 'var(--color-text)'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="MACD Slow"
                  type="number"
                  value={macdSlow}
                  onChange={(e) => setMacdSlow(Number(e.target.value))}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{ inputProps: { min: 1, max: 100 } }}
                  InputLabelProps={{ style: { color: 'var(--color-text)' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'var(--color-secondary)' },
                      color: 'var(--color-text)'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="MACD Signal"
                  type="number"
                  value={macdSignal}
                  onChange={(e) => setMacdSignal(Number(e.target.value))}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{ inputProps: { min: 1, max: 100 } }}
                  InputLabelProps={{ style: { color: 'var(--color-text)' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'var(--color-secondary)' },
                      color: 'var(--color-text)'
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Box className="mt-4">
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: 'var(--color-primary)',
                  '&:hover': { backgroundColor: 'var(--color-info)' }
                }}
              >
                Run Backtest
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Error Message */}
        {error && (
          <Typography variant="body1" sx={{ color: 'red', mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* Loading or Results */}
        {fetchingResults ? (
          <Box className="flex justify-center items-center min-h-[200px]">
            <Typography variant="h6" sx={{ color: 'var(--color-light)' }}>
              Loading...
            </Typography>
          </Box>
        ) : (
          results && (
            <Box className="space-y-6">
              {/* Simulation Metrics */}
              <Paper className="p-6" elevation={3} sx={{ backgroundColor: 'var(--color-dark)' }}>
                <Typography
                  variant="h5"
                  component="h2"
                  className="mb-4 font-bold"
                  sx={{ color: 'var(--color-light)' }}
                >
                  Simulation Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      className="p-4"
                      elevation={2}
                      sx={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 1 }}
                    >
                      <Typography variant="subtitle2" sx={{ color: 'var(--color-text)' }}>
                        Total Profit:
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ color: 'var(--color-text)', fontWeight: 'bold', mt: 1 }}
                      >
                        ${results.trade_analysis.pnl.net.total.toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      className="p-4"
                      elevation={2}
                      sx={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 1 }}
                    >
                      <Typography variant="subtitle2" sx={{ color: 'var(--color-text)' }}>
                        Trades:
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ color: 'var(--color-text)', fontWeight: 'bold', mt: 1 }}
                      >
                        {results.trade_analysis.total.total}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      className="p-4"
                      elevation={2}
                      sx={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 1 }}
                    >
                      <Typography variant="subtitle2" sx={{ color: 'var(--color-text)' }}>
                        Win Rate:
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ color: 'var(--color-text)', fontWeight: 'bold', mt: 1 }}
                      >
                        {(results.trade_analysis.won.total / results.trade_analysis.total.total * 100).toFixed(2)}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      className="p-4"
                      elevation={2}
                      sx={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 1 }}
                    >
                      <Typography variant="subtitle2" sx={{ color: 'var(--color-text)' }}>
                        Avg Profit/Trade:
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ color: 'var(--color-text)', fontWeight: 'bold', mt: 1 }}
                      >
                        ${results.trade_analysis.pnl.net.average.toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      className="p-4"
                      elevation={2}
                      sx={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 1 }}
                    >
                      <Typography variant="subtitle2" sx={{ color: 'var(--color-text)' }}>
                        Max Drawdown:
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ color: 'var(--color-text)', fontWeight: 'bold', mt: 1 }}
                      >
                        {results.drawdown_analysis.drawdown.toFixed(2)}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      className="p-4"
                      elevation={2}
                      sx={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 1 }}
                    >
                      <Typography variant="subtitle2" sx={{ color: 'var(--color-text)' }}>
                        Sharpe Ratio:
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ color: 'var(--color-text)', fontWeight: 'bold', mt: 1 }}
                      >
                        {results.sharpe_analysis.sharperatio.toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>

              {/* Trade Orders */}
              <Paper className="p-6" elevation={3} sx={{ backgroundColor: 'var(--color-dark)' }}>
                <Box className="flex flex-col gap-4">
                  <Box className="flex justify-between items-center">
                    <Typography
                      variant="h5"
                      component="h2"
                      className="font-bold"
                      sx={{ color: 'var(--color-text)' }}
                    >
                      Trade Orders
                    </Typography>
                    <Box className="flex gap-2">
                      <Button variant="outlined" disabled>
                        Download
                      </Button>
                      <Button variant="outlined" disabled>
                        Save
                      </Button>
                    </Box>
                  </Box>
                  <TableContainer component={Paper} sx={{ maxHeight: '80vh' }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'var(--color-text)' }}>Time</TableCell>
                          <TableCell sx={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'var(--color-text)' }}>Type</TableCell>
                          <TableCell sx={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'var(--color-text)' }}>Price</TableCell>
                          <TableCell sx={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'var(--color-text)' }}>Size</TableCell>
                          <TableCell sx={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'var(--color-text)' }}>Profit</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {results.orders
                          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                          .map((order, i) => (
                            <TableRow key={i}>
                              <TableCell>{order.time}</TableCell>
                              <TableCell>{order.type.toUpperCase()}</TableCell>
                              <TableCell>{order.price} $</TableCell>
                              <TableCell>{order.size}</TableCell>
                              <TableCell>{order.profit.toFixed(2)} $</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Paper>
            </Box>
          )
        )}
      </Container>
    </div>
  );
};

export default Backtest;
