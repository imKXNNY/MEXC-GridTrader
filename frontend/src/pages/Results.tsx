import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  BarChart as BarChartIcon,
  TableChart as TableChartIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import CandlestickChart from '../components/CandlestickChart';
import BacktestManagement from '../components/BacktestManagement';
import BacktestService from '../services/BacktestService';
import { BacktestResult } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`backtest-tabpanel-${index}`}
      aria-labelledby={`backtest-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `backtest-tab-${index}`,
    'aria-controls': `backtest-tabpanel-${index}`,
  };
}

const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [backtest, setBacktest] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchBacktest = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const result = await BacktestService.getBacktest(id);
        setBacktest(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch backtest');
      } finally {
        setLoading(false);
      }
    };

    fetchBacktest();
  }, [id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSave = async (name: string, notes: string) => {
    if (!id) return;

    try {
      await BacktestService.updateBacktest(id, { name, notes });
      // Refresh the backtest data
      const result = await BacktestService.getBacktest(id);
      setBacktest(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update backtest');
    }
  };

  const handleArchive = async () => {
    if (!id || !backtest) return;

    try {
      if (backtest.archived) {
        await BacktestService.unarchiveBacktest(id);
      } else {
        await BacktestService.archiveBacktest(id);
      }
      // Refresh the backtest data
      const result = await BacktestService.getBacktest(id);
      setBacktest(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive/unarchive backtest');
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await BacktestService.deleteBacktest(id);
      navigate('/backtests');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete backtest');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <Container maxWidth="lg" className="mt-8">
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        </Container>
      </div>
    );
  }

  if (error || !backtest) {
    return (
      <div>
        <Navbar />
        <Container maxWidth="lg" className="mt-8">
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Backtest not found'}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/backtests')}
            variant="outlined"
          >
            Back to Backtests
          </Button>
        </Container>
      </div>
    );
  }

  // Calculate profit metrics
  const initialCapital = backtest.params.initial_capital;
  const finalCapital = backtest.final_value;
  const profit = finalCapital - initialCapital;
  const profitPercent = initialCapital > 0 ? (profit / initialCapital) * 100 : 0;
  const isProfitable = profit > 0;

  // Get trade metrics
  const totalTrades = backtest.orders.length / 2; // Assuming each trade has an entry and exit

  return (
    <div>
      <Navbar />
      <Container maxWidth="lg" className="mt-8">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/backtests')}
              variant="outlined"
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4" component="h1">
              {backtest.name || `${backtest.params.symbol} - ${backtest.params.interval}`}
            </Typography>
            {backtest.archived && (
              <Chip label="Archived" color="default" sx={{ ml: 2 }} />
            )}
          </Box>
          <BacktestManagement
            onSave={handleSave}
            onArchive={handleArchive}
            onDelete={handleDelete}
          />
        </Box>

        {/* Summary Card */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Symbol</Typography>
              <Typography variant="h6">{backtest.params.symbol}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Timeframe</Typography>
              <Typography variant="h6">{backtest.params.interval}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Strategy</Typography>
              <Typography variant="h6">{backtest.params.strategy_type}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Date</Typography>
              <Typography variant="h6">
                {new Date(parseInt(backtest.timestamp) * 1000).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Initial Capital</Typography>
              <Typography variant="h6">${initialCapital.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Final Capital</Typography>
              <Typography variant="h6">${finalCapital.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Profit/Loss</Typography>
              <Typography
                variant="h6"
                sx={{ color: isProfitable ? 'success.main' : 'error.main' }}
              >
                ${profit.toFixed(2)} ({profitPercent.toFixed(2)}%)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Total Trades</Typography>
              <Typography variant="h6">{totalTrades}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="backtest tabs"
            variant="fullWidth"
          >
            <Tab icon={<BarChartIcon />} label="Chart" {...a11yProps(0)} />
            <Tab icon={<TableChartIcon />} label="Trades" {...a11yProps(1)} />
            <Tab icon={<SettingsIcon />} label="Parameters" {...a11yProps(2)} />
          </Tabs>
        </Box>

        {/* Chart Tab */}
        <TabPanel value={tabValue} index={0}>
          {backtest.candles ? (
            <CandlestickChart
              data={backtest.candles}
              orders={backtest.orders}
              title={`${backtest.params.symbol} - ${backtest.params.interval} - ${backtest.params.strategy_type.toUpperCase()}`}
              height={500}
            />
          ) : (
            <Alert severity="info">
              No chart data available for this backtest.
            </Alert>
          )}
        </TabPanel>

        {/* Trades Tab */}
        <TabPanel value={tabValue} index={1}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Trade Orders</Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backtest.orders.map((order, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.type.toUpperCase()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.size}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${order.profit > 0 ? 'text-green-500' : order.profit < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                        ${order.profit.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </TabPanel>

        {/* Parameters Tab */}
        <TabPanel value={tabValue} index={2}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Strategy Parameters</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">Strategy Type</Typography>
                <Typography variant="body1">{backtest.params.strategy_type}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">Initial Capital</Typography>
                <Typography variant="body1">${backtest.params.initial_capital}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">Risk Percent</Typography>
                <Typography variant="body1">{backtest.params.risk_percent}%</Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>Strategy-Specific Parameters</Typography>
              </Grid>

              {backtest.params.strategy_type === 'momentum' && (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">RSI Length</Typography>
                    <Typography variant="body1">{backtest.params.box_params.rsi_length}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">MACD Fast</Typography>
                    <Typography variant="body1">{backtest.params.box_params.macd_fast}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">MACD Slow</Typography>
                    <Typography variant="body1">{backtest.params.box_params.macd_slow}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">MACD Signal</Typography>
                    <Typography variant="body1">{backtest.params.box_params.macd_signal}</Typography>
                  </Grid>
                </>
              )}

              {backtest.params.strategy_type === 'ib_price_action' && (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">Min Inside Bar Size</Typography>
                    <Typography variant="body1">{backtest.params.box_params.minInsideBarSize}%</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">Use Trend Filter</Typography>
                    <Typography variant="body1">{backtest.params.box_params.useTrendFilter ? 'Yes' : 'No'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">Use Volume Filter</Typography>
                    <Typography variant="body1">{backtest.params.box_params.useVolumeFilter ? 'Yes' : 'No'}</Typography>
                  </Grid>
                  {backtest.params.box_params.useVolumeFilter && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2" color="textSecondary">Volume Multiplier</Typography>
                      <Typography variant="body1">{backtest.params.box_params.volMultiplier}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">Use ATR Take Profit</Typography>
                    <Typography variant="body1">{backtest.params.box_params.useATRTP ? 'Yes' : 'No'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">ATR Length</Typography>
                    <Typography variant="body1">{backtest.params.box_params.atrLength}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">ATR Multiplier</Typography>
                    <Typography variant="body1">{backtest.params.box_params.atrMult}</Typography>
                  </Grid>
                  {!backtest.params.box_params.useATRTP && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2" color="textSecondary">Risk-Reward Ratio</Typography>
                      <Typography variant="body1">{backtest.params.box_params.rr_ratio}</Typography>
                    </Grid>
                  )}
                </>
              )}
            </Grid>
          </Paper>
        </TabPanel>
      </Container>
    </div>
  );
};

export default Results;
