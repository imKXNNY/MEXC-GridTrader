import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { PlayArrow as PlayArrowIcon, Stop as StopIcon } from '@mui/icons-material';
import { STRATEGY_TYPES } from '../utils/constants';

interface ParameterRange {
  name: string;
  min: number;
  max: number;
  step: number;
  current?: number;
}

interface OptimizationResult {
  parameters: Record<string, number>;
  profit: number;
  trades: number;
  winRate: number;
  sharpeRatio: number;
}

interface StrategyOptimizerProps {
  strategy: string;
  onOptimizationComplete?: (results: OptimizationResult[]) => void;
}

const StrategyOptimizer: React.FC<StrategyOptimizerProps> = ({
  strategy,
  onOptimizationComplete
}) => {
  // State for parameter ranges
  const [parameterRanges, setParameterRanges] = useState<ParameterRange[]>([]);
  const [optimizationMethod, setOptimizationMethod] = useState<string>('grid');
  const [optimizationMetric, setOptimizationMetric] = useState<string>('profit');
  const [maxIterations, setMaxIterations] = useState<number>(100);
  const [running, setRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize parameter ranges based on strategy
  React.useEffect(() => {
    if (strategy === STRATEGY_TYPES.MOMENTUM) {
      setParameterRanges([
        { name: 'rsi_length', min: 5, max: 30, step: 1, current: 14 },
        { name: 'macd_fast', min: 5, max: 20, step: 1, current: 12 },
        { name: 'macd_slow', min: 15, max: 40, step: 1, current: 26 },
        { name: 'macd_signal', min: 5, max: 15, step: 1, current: 9 }
      ]);
    } else if (strategy === STRATEGY_TYPES.INSIDE_BAR) {
      setParameterRanges([
        { name: 'minInsideBarSize', min: 0.1, max: 1.0, step: 0.1, current: 0.5 },
        { name: 'volMultiplier', min: 0.5, max: 2.0, step: 0.1, current: 1.1 },
        { name: 'atrLength', min: 5, max: 30, step: 1, current: 14 },
        { name: 'atrMult', min: 0.5, max: 3.0, step: 0.1, current: 1.5 },
        { name: 'rr_ratio', min: 1.0, max: 5.0, step: 0.5, current: 2.5 }
      ]);
    }
  }, [strategy]);

  // Handle parameter range change
  const handleRangeChange = (index: number, field: 'min' | 'max' | 'step', value: number) => {
    const updatedRanges = [...parameterRanges];
    updatedRanges[index][field] = value;
    setParameterRanges(updatedRanges);
  };

  // Start optimization
  const handleStartOptimization = () => {
    setRunning(true);
    setProgress(0);
    setResults([]);
    setError(null);

    // Mock optimization process
    const totalIterations = maxIterations;
    let currentIteration = 0;
    const mockResults: OptimizationResult[] = [];

    const interval = setInterval(() => {
      currentIteration++;
      setProgress(Math.floor((currentIteration / totalIterations) * 100));

      // Generate a mock result
      const mockResult: OptimizationResult = {
        parameters: {},
        profit: Math.random() * 5000 - 1000,
        trades: Math.floor(Math.random() * 100) + 10,
        winRate: Math.random() * 0.6 + 0.2,
        sharpeRatio: Math.random() * 2
      };

      // Generate random parameters within the specified ranges
      parameterRanges.forEach(range => {
        const randomValue = Math.floor(Math.random() * ((range.max - range.min) / range.step)) * range.step + range.min;
        mockResult.parameters[range.name] = randomValue;
      });

      mockResults.push(mockResult);
      setResults([...mockResults]);

      if (currentIteration >= totalIterations) {
        clearInterval(interval);
        setRunning(false);

        // Sort results by the selected optimization metric
        const sortedResults = [...mockResults].sort((a, b) => {
          if (optimizationMetric === 'profit') {
            return b.profit - a.profit;
          } else if (optimizationMetric === 'sharpeRatio') {
            return b.sharpeRatio - a.sharpeRatio;
          } else if (optimizationMetric === 'winRate') {
            return b.winRate - a.winRate;
          }
          return 0;
        });

        setResults(sortedResults);

        if (onOptimizationComplete) {
          onOptimizationComplete(sortedResults);
        }
      }
    }, 100);

    // Cleanup function
    return () => clearInterval(interval);
  };

  // Stop optimization
  const handleStopOptimization = () => {
    setRunning(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Strategy Parameter Optimization
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Optimization Method</InputLabel>
            <Select
              value={optimizationMethod}
              onChange={(e) => setOptimizationMethod(e.target.value)}
              label="Optimization Method"
              disabled={running}
            >
              <MenuItem value="grid">Grid Search</MenuItem>
              <MenuItem value="genetic">Genetic Algorithm</MenuItem>
              <MenuItem value="bayesian">Bayesian Optimization</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Optimization Metric</InputLabel>
            <Select
              value={optimizationMetric}
              onChange={(e) => setOptimizationMetric(e.target.value)}
              label="Optimization Metric"
              disabled={running}
            >
              <MenuItem value="profit">Net Profit</MenuItem>
              <MenuItem value="sharpeRatio">Sharpe Ratio</MenuItem>
              <MenuItem value="winRate">Win Rate</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Maximum Iterations"
            type="number"
            value={maxIterations}
            onChange={(e) => setMaxIterations(parseInt(e.target.value))}
            fullWidth
            disabled={running}
            InputProps={{ inputProps: { min: 10, max: 1000 } }}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Parameter Ranges
          </Typography>
        </Grid>

        {parameterRanges.map((param, index) => (
          <Grid item xs={12} key={param.name}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {param.name}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Min"
                    type="number"
                    value={param.min}
                    onChange={(e) => handleRangeChange(index, 'min', parseFloat(e.target.value))}
                    fullWidth
                    disabled={running}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Max"
                    type="number"
                    value={param.max}
                    onChange={(e) => handleRangeChange(index, 'max', parseFloat(e.target.value))}
                    fullWidth
                    disabled={running}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Step"
                    type="number"
                    value={param.step}
                    onChange={(e) => handleRangeChange(index, 'step', parseFloat(e.target.value))}
                    fullWidth
                    disabled={running}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            {running ? (
              <Button
                variant="contained"
                color="error"
                startIcon={<StopIcon />}
                onClick={handleStopOptimization}
              >
                Stop Optimization
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={handleStartOptimization}
                disabled={parameterRanges.length === 0}
              >
                Start Optimization
              </Button>
            )}

            {running && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {progress}% Complete
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {results.length > 0 && (
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Top Results
            </Typography>
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameters</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sharpe</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.slice(0, 10).map((result, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {Object.entries(result.parameters).map(([key, value]) => (
                            <Chip
                              key={key}
                              label={`${key}: ${value}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${result.profit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${result.profit.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(result.winRate * 100).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.sharpeRatio.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default StrategyOptimizer;
