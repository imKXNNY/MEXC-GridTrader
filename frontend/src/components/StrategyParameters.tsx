import React from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import Box from '@mui/material/Box';

interface MomentumStrategyParams {
  rsiLength: number;
  setRsiLength: (value: number) => void;
  macdFast: number;
  setMacdFast: (value: number) => void;
  macdSlow: number;
  setMacdSlow: (value: number) => void;
  macdSignal: number;
  setMacdSignal: (value: number) => void;
}

interface InsideBarStrategyParams {
  minInsideBarSize: number;
  setMinInsideBarSize: (value: number) => void;
  useTrendFilter: boolean;
  setUseTrendFilter: (value: boolean) => void;
  useVolumeFilter: boolean;
  setUseVolumeFilter: (value: boolean) => void;
  volMultiplier: number;
  setVolMultiplier: (value: number) => void;
  useATRTP: boolean;
  setUseATRTP: (value: boolean) => void;
  atrLength: number;
  setAtrLength: (value: number) => void;
  atrMult: number;
  setAtrMult: (value: number) => void;
  rrRatio: number;
  setRrRatio: (value: number) => void;
}

interface StrategyParametersProps {
  strategy: string;
  momentumParams?: MomentumStrategyParams;
  insideBarParams?: InsideBarStrategyParams;
}

const StrategyParameters: React.FC<StrategyParametersProps> = ({
  strategy,
  momentumParams,
  insideBarParams
}) => {
  const renderMomentumParams = () => {
    if (!momentumParams) return null;
    
    const {
      rsiLength, setRsiLength,
      macdFast, setMacdFast,
      macdSlow, setMacdSlow,
      macdSignal, setMacdSignal
    } = momentumParams;

    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ color: 'var(--color-text)', mb: 2 }}>
            Momentum Strategy Parameters
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="Length of the RSI indicator period">
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
          </Tooltip>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="Fast period for MACD calculation">
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
          </Tooltip>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="Slow period for MACD calculation">
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
          </Tooltip>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Tooltip title="Signal period for MACD calculation">
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
          </Tooltip>
        </Grid>
      </Grid>
    );
  };

  const renderInsideBarParams = () => {
    if (!insideBarParams) return null;
    
    const {
      minInsideBarSize, setMinInsideBarSize,
      useTrendFilter, setUseTrendFilter,
      useVolumeFilter, setUseVolumeFilter,
      volMultiplier, setVolMultiplier,
      useATRTP, setUseATRTP,
      atrLength, setAtrLength,
      atrMult, setAtrMult,
      rrRatio, setRrRatio
    } = insideBarParams;

    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ color: 'var(--color-text)', mb: 2 }}>
            Inside Bar Strategy Parameters
          </Typography>
        </Grid>
        
        {/* Inside Bar Size */}
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Minimum size of inside bar as percentage of previous bar">
              <TextField
                label="Min Inside Bar Size (%)"
                type="number"
                value={minInsideBarSize}
                onChange={(e) => setMinInsideBarSize(Number(e.target.value))}
                required
                fullWidth
                variant="outlined"
                InputProps={{ inputProps: { min: 0.1, max: 10, step: 0.1 } }}
                InputLabelProps={{ style: { color: 'var(--color-text)' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'var(--color-secondary)' },
                    color: 'var(--color-text)'
                  }
                }}
              />
            </Tooltip>
            <Tooltip title="Minimum size of inside bar as percentage of previous bar">
              <InfoIcon sx={{ ml: 1, color: 'var(--color-info)' }} />
            </Tooltip>
          </Box>
        </Grid>
        
        {/* Filters */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            control={
              <Switch
                checked={useTrendFilter}
                onChange={(e) => setUseTrendFilter(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ color: 'var(--color-text)' }}>Use Trend Filter</Typography>
                <Tooltip title="Filter trades based on EMA trend direction">
                  <InfoIcon sx={{ ml: 1, color: 'var(--color-info)', fontSize: '1rem' }} />
                </Tooltip>
              </Box>
            }
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            control={
              <Switch
                checked={useVolumeFilter}
                onChange={(e) => setUseVolumeFilter(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ color: 'var(--color-text)' }}>Use Volume Filter</Typography>
                <Tooltip title="Filter trades based on volume threshold">
                  <InfoIcon sx={{ ml: 1, color: 'var(--color-info)', fontSize: '1rem' }} />
                </Tooltip>
              </Box>
            }
          />
        </Grid>
        
        {/* Volume Multiplier */}
        {useVolumeFilter && (
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Volume must be greater than SMA(20) * this multiplier">
                <TextField
                  label="Volume Multiplier"
                  type="number"
                  value={volMultiplier}
                  onChange={(e) => setVolMultiplier(Number(e.target.value))}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0.1, max: 5, step: 0.1 } }}
                  InputLabelProps={{ style: { color: 'var(--color-text)' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'var(--color-secondary)' },
                      color: 'var(--color-text)'
                    }
                  }}
                />
              </Tooltip>
              <Tooltip title="Volume must be greater than SMA(20) * this multiplier">
                <InfoIcon sx={{ ml: 1, color: 'var(--color-info)' }} />
              </Tooltip>
            </Box>
          </Grid>
        )}
        
        {/* ATR Settings */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            control={
              <Switch
                checked={useATRTP}
                onChange={(e) => setUseATRTP(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ color: 'var(--color-text)' }}>Use ATR for Take Profit</Typography>
                <Tooltip title="Use ATR-based take profit instead of fixed R:R ratio">
                  <InfoIcon sx={{ ml: 1, color: 'var(--color-info)', fontSize: '1rem' }} />
                </Tooltip>
              </Box>
            }
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Period length for ATR calculation">
              <TextField
                label="ATR Length"
                type="number"
                value={atrLength}
                onChange={(e) => setAtrLength(Number(e.target.value))}
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
            </Tooltip>
            <Tooltip title="Period length for ATR calculation">
              <InfoIcon sx={{ ml: 1, color: 'var(--color-info)' }} />
            </Tooltip>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="ATR multiplier for take profit calculation">
              <TextField
                label="ATR Multiplier"
                type="number"
                value={atrMult}
                onChange={(e) => setAtrMult(Number(e.target.value))}
                required
                fullWidth
                variant="outlined"
                InputProps={{ inputProps: { min: 0.1, max: 10, step: 0.1 } }}
                InputLabelProps={{ style: { color: 'var(--color-text)' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'var(--color-secondary)' },
                    color: 'var(--color-text)'
                  }
                }}
              />
            </Tooltip>
            <Tooltip title="ATR multiplier for take profit calculation">
              <InfoIcon sx={{ ml: 1, color: 'var(--color-info)' }} />
            </Tooltip>
          </Box>
        </Grid>
        
        {/* Risk-Reward Ratio */}
        {!useATRTP && (
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Risk-Reward ratio for take profit calculation">
                <TextField
                  label="Risk-Reward Ratio"
                  type="number"
                  value={rrRatio}
                  onChange={(e) => setRrRatio(Number(e.target.value))}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0.1, max: 10, step: 0.1 } }}
                  InputLabelProps={{ style: { color: 'var(--color-text)' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'var(--color-secondary)' },
                      color: 'var(--color-text)'
                    }
                  }}
                />
              </Tooltip>
              <Tooltip title="Risk-Reward ratio for take profit calculation">
                <InfoIcon sx={{ ml: 1, color: 'var(--color-info)' }} />
              </Tooltip>
            </Box>
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <div className="mt-4">
      {strategy === 'momentum' && renderMomentumParams()}
      {strategy === 'ib_price_action' && renderInsideBarParams()}
    </div>
  );
};

export default StrategyParameters;
