import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Slider,
  Box
} from '@mui/material';
import { IndicatorType, IndicatorOptions } from '../types';

interface IndicatorParamsDialogProps {
  open: boolean;
  onClose: () => void;
  indicator: IndicatorOptions;
  indicatorId: string;
  onSave: (id: string, params: Record<string, number>) => void;
}

const IndicatorParamsDialog: React.FC<IndicatorParamsDialogProps> = ({
  open,
  onClose,
  indicator,
  indicatorId,
  onSave
}) => {
  const [params, setParams] = useState<Record<string, number>>(indicator.params);

  const handleChange = (param: string, value: number) => {
    setParams(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const handleSave = () => {
    onSave(indicatorId, params);
    onClose();
  };

  const getParamLabel = (param: string): string => {
    switch (param) {
      case 'period':
        return 'Period';
      case 'fastPeriod':
        return 'Fast Period';
      case 'slowPeriod':
        return 'Slow Period';
      case 'signalPeriod':
        return 'Signal Period';
      case 'stdDev':
        return 'Standard Deviation';
      case 'kPeriod':
        return 'K Period';
      case 'dPeriod':
        return 'D Period';
      default:
        return param.charAt(0).toUpperCase() + param.slice(1).replace(/([A-Z])/g, ' $1');
    }
  };

  const getParamMin = (param: string): number => {
    switch (param) {
      case 'period':
      case 'fastPeriod':
      case 'slowPeriod':
      case 'signalPeriod':
      case 'kPeriod':
      case 'dPeriod':
        return 1;
      case 'stdDev':
        return 0.1;
      default:
        return 1;
    }
  };

  const getParamMax = (param: string): number => {
    switch (param) {
      case 'period':
      case 'slowPeriod':
        return 200;
      case 'fastPeriod':
      case 'signalPeriod':
      case 'kPeriod':
      case 'dPeriod':
        return 50;
      case 'stdDev':
        return 5;
      default:
        return 100;
    }
  };

  const getParamStep = (param: string): number => {
    switch (param) {
      case 'stdDev':
        return 0.1;
      default:
        return 1;
    }
  };

  const getParamDescription = (param: string, type: IndicatorType): string => {
    switch (param) {
      case 'period':
        if (type === IndicatorType.SMA || type === IndicatorType.EMA) {
          return 'Number of periods to calculate the moving average';
        } else if (type === IndicatorType.RSI) {
          return 'Number of periods to calculate the RSI';
        } else if (type === IndicatorType.BOLLINGER_BANDS) {
          return 'Number of periods to calculate the middle band (SMA)';
        } else if (type === IndicatorType.STOCHASTIC_RSI) {
          return 'Number of periods to calculate the Stochastic';
        }
        return 'Number of periods';
      case 'fastPeriod':
        return 'Number of periods for the fast EMA';
      case 'slowPeriod':
        return 'Number of periods for the slow EMA';
      case 'signalPeriod':
        return 'Number of periods for the signal line';
      case 'stdDev':
        return 'Number of standard deviations for the bands';
      case 'kPeriod':
        return 'Number of periods for %K smoothing';
      case 'dPeriod':
        return 'Number of periods for %D smoothing';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Edit {indicator.type.toUpperCase()} Parameters
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {Object.entries(params).map(([param, value]) => (
            <Grid item xs={12} key={param}>
              <Typography gutterBottom>
                {getParamLabel(param)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Slider
                  value={value}
                  min={getParamMin(param)}
                  max={getParamMax(param)}
                  step={getParamStep(param)}
                  onChange={(_, newValue) => handleChange(param, newValue as number)}
                  valueLabelDisplay="auto"
                  sx={{ mr: 2, flexGrow: 1 }}
                />
                <TextField
                  value={value}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value);
                    if (!isNaN(newValue)) {
                      handleChange(param, newValue);
                    }
                  }}
                  type="number"
                  size="small"
                  inputProps={{
                    min: getParamMin(param),
                    max: getParamMax(param),
                    step: getParamStep(param)
                  }}
                  sx={{ width: '80px' }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {getParamDescription(param, indicator.type)}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IndicatorParamsDialog;
