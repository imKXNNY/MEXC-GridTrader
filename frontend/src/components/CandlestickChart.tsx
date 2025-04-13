import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  HistogramData,
  LineData,
  Time
} from 'lightweight-charts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ButtonGroup from '@mui/material/ButtonGroup';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { CandleData, TradeOrder, IndicatorType, IndicatorOptions } from '../types';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateStochastic
} from '../utils/indicators';
import IndicatorParamsDialog from './IndicatorParamsDialog';

interface CandlestickChartProps {
  data: CandleData[];
  orders?: TradeOrder[];
  title?: string;
  height?: number;
  width?: string;
  showIndicatorControls?: boolean;
  showZoomControls?: boolean;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  orders = [],
  title = 'Price Chart',
  height = 500,
  width = '100%',
  showIndicatorControls = true,
  showZoomControls = true
}) => {
  // State for technical indicators and zoom controls
  const [indicators, setIndicators] = useState<Record<string, IndicatorOptions>>({});
  const [timeRange, setTimeRange] = useState<string>('all');
  const [editingIndicator, setEditingIndicator] = useState<string | null>(null);
  const [availableIndicators] = useState([
    { value: IndicatorType.SMA, label: 'Simple Moving Average (SMA)' },
    { value: IndicatorType.EMA, label: 'Exponential Moving Average (EMA)' },
    { value: IndicatorType.BOLLINGER_BANDS, label: 'Bollinger Bands' },
    { value: IndicatorType.RSI, label: 'Relative Strength Index (RSI)' },
    { value: IndicatorType.MACD, label: 'MACD' },
    { value: IndicatorType.STOCHASTIC_RSI, label: 'Stochastic Oscillator' },
  ]);

  // Reference to indicator series
  const indicatorSeries = useRef<Record<string, ISeriesApi<any>>>({});
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeries = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeries = useRef<ISeriesApi<'Histogram'> | null>(null);

  // Add a new indicator
  const addIndicator = (type: IndicatorType) => {
    const id = `${type}_${Date.now()}`;
    let defaultParams: Record<string, number> = {};
    let defaultColor = 'var(--color-primary)';

    switch (type) {
      case IndicatorType.SMA:
        defaultParams = { period: 20 };
        defaultColor = 'var(--color-info)';
        break;
      case IndicatorType.EMA:
        defaultParams = { period: 21 };
        defaultColor = 'var(--color-primary)';
        break;
      case IndicatorType.BOLLINGER_BANDS:
        defaultParams = { period: 20, stdDev: 2 };
        defaultColor = 'var(--color-secondary)';
        break;
      case IndicatorType.RSI:
        defaultParams = { period: 14 };
        defaultColor = 'var(--color-warning)';
        break;
      case IndicatorType.MACD:
        defaultParams = { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 };
        defaultColor = 'var(--color-info)';
        break;
      case IndicatorType.STOCHASTIC_RSI:
        defaultParams = { period: 14, kPeriod: 3, dPeriod: 3 };
        defaultColor = 'var(--color-warning)';
        break;
    }

    // Make sure we don't add duplicate indicators of the same type
    // For indicators that use separate panes (RSI, MACD, Stochastic)
    if (
      (type === IndicatorType.RSI ||
       type === IndicatorType.MACD ||
       type === IndicatorType.STOCHASTIC_RSI) &&
      Object.values(indicators).some(ind => ind.type === type)
    ) {
      console.warn(`Only one ${type} indicator can be added at a time`);
      return;
    }

    setIndicators(prev => ({
      ...prev,
      [id]: {
        enabled: true,
        type,
        params: defaultParams,
        color: defaultColor
      }
    }));

    // Make the corresponding price scale visible when adding indicators
    if (chartRef.current) {
      if (type === IndicatorType.RSI) {
        chartRef.current.priceScale('rsi').applyOptions({ visible: true });
      } else if (type === IndicatorType.MACD) {
        chartRef.current.priceScale('macd').applyOptions({ visible: true });
      } else if (type === IndicatorType.STOCHASTIC_RSI) {
        chartRef.current.priceScale('stoch').applyOptions({ visible: true });
      }
    }
  };

  // Toggle an indicator on/off
  const toggleIndicator = (id: string) => {
    setIndicators(prev => {
      const newEnabled = !prev[id].enabled;
      const type = prev[id].type;

      // Update price scale visibility when toggling indicators
      if (chartRef.current) {
        if (type === IndicatorType.RSI) {
          chartRef.current.priceScale('rsi').applyOptions({ visible: newEnabled });
        } else if (type === IndicatorType.MACD) {
          chartRef.current.priceScale('macd').applyOptions({ visible: newEnabled });
        } else if (type === IndicatorType.STOCHASTIC_RSI) {
          chartRef.current.priceScale('stoch').applyOptions({ visible: newEnabled });
        }
      }

      return {
        ...prev,
        [id]: {
          ...prev[id],
          enabled: newEnabled
        }
      };
    });
  };

  // Remove an indicator
  const removeIndicator = (id: string) => {
    setIndicators(prev => {
      const type = prev[id].type;

      // Update price scale visibility when removing indicators
      if (chartRef.current) {
        // Check if there are other indicators of the same type
        const otherSameType = Object.entries(prev)
          .filter(([key, ind]) => key !== id && ind.type === type && ind.enabled)
          .length > 0;

        if (!otherSameType) {
          if (type === IndicatorType.RSI) {
            chartRef.current.priceScale('rsi').applyOptions({ visible: false });
          } else if (type === IndicatorType.MACD) {
            chartRef.current.priceScale('macd').applyOptions({ visible: false });
          } else if (type === IndicatorType.STOCHASTIC_RSI) {
            chartRef.current.priceScale('stoch').applyOptions({ visible: false });
          }
        }
      }

      const newIndicators = { ...prev };
      delete newIndicators[id];
      return newIndicators;
    });
  };

  // Update indicator parameters
  const updateIndicatorParams = (id: string, params: Record<string, number>) => {
    setIndicators(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        params
      }
    }));
  };

  // Zoom in function
  const handleZoomIn = () => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      // Use applyOptions to zoom in
      const visibleRange = timeScale.getVisibleLogicalRange();
      if (visibleRange) {
        const newRange = {
          from: visibleRange.from + (visibleRange.to - visibleRange.from) * 0.25,
          to: visibleRange.to - (visibleRange.to - visibleRange.from) * 0.25
        };
        timeScale.setVisibleLogicalRange(newRange);
      }
    }
  };

  // Zoom out function
  const handleZoomOut = () => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      // Use applyOptions to zoom out
      const visibleRange = timeScale.getVisibleLogicalRange();
      if (visibleRange) {
        const rangeSize = visibleRange.to - visibleRange.from;
        const newRange = {
          from: Math.max(0, visibleRange.from - rangeSize * 0.25),
          to: visibleRange.to + rangeSize * 0.25
        };
        timeScale.setVisibleLogicalRange(newRange);
      }
    }
  };

  // Reset zoom function
  const handleResetZoom = () => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      timeScale.fitContent();
    }
  };

  // Pan left function
  const handlePanLeft = () => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      const visibleRange = timeScale.getVisibleLogicalRange();
      if (visibleRange) {
        const rangeWidth = visibleRange.to - visibleRange.from;
        timeScale.scrollToPosition(timeScale.scrollPosition() - rangeWidth * 0.2, false);
      }
    }
  };

  // Pan right function
  const handlePanRight = () => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      const visibleRange = timeScale.getVisibleLogicalRange();
      if (visibleRange) {
        const rangeWidth = visibleRange.to - visibleRange.from;
        timeScale.scrollToPosition(timeScale.scrollPosition() + rangeWidth * 0.2, false);
      }
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (_: React.MouseEvent<HTMLElement>, newTimeRange: string) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);

      if (chartRef.current) {
        const timeScale = chartRef.current.timeScale();

        // Calculate the range based on the selected time period
        const now = new Date();
        let fromDate = new Date();

        switch (newTimeRange) {
          case 'day':
            fromDate.setDate(now.getDate() - 1);
            break;
          case 'week':
            fromDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            fromDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            fromDate.setFullYear(now.getFullYear() - 1);
            break;
          case 'all':
          default:
            timeScale.fitContent();
            return;
        }

        // Find the indices in the data array that correspond to the date range
        const fromIndex = data.findIndex(candle => {
          const candleTime = typeof candle.time === 'string' ? new Date(candle.time) : new Date(Number(candle.time) * 1000);
          return candleTime >= fromDate;
        });

        const toIndex = data.length - 1;

        if (fromIndex >= 0) {
          timeScale.setVisibleLogicalRange({
            from: fromIndex,
            to: toIndex
          });
        } else {
          timeScale.fitContent();
        }
      }
    }
  };

  // Handle keyboard shortcuts for zoom and pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard events when the chart is visible
      if (!chartRef.current) return;

      switch (e.key) {
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
        case '_':
          handleZoomOut();
          break;
        case 'ArrowLeft':
          handlePanLeft();
          break;
        case 'ArrowRight':
          handlePanRight();
          break;
        case 'Home':
          handleResetZoom();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up previous chart if it exists
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      candleSeries.current = null;
      volumeSeries.current = null;
      indicatorSeries.current = {};
    }

    // Create chart with multiple panes for indicators
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { color: 'var(--color-background)' },
        textColor: 'var(--color-text)',
      },
      grid: {
        vertLines: { color: 'rgba(var(--color-secondary-rgb), 0.2)' },
        horzLines: { color: 'rgba(var(--color-secondary-rgb), 0.2)' },
      },
      timeScale: {
        borderColor: 'var(--color-secondary)',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: 'var(--color-secondary)',
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'var(--color-info)',
          width: 1,
          style: 1,
          labelBackgroundColor: 'var(--color-info)',
        },
        horzLine: {
          color: 'var(--color-info)',
          width: 1,
          style: 1,
          labelBackgroundColor: 'var(--color-info)',
        },
      },
    });

    // Create additional panes for indicators
    // Pane 1: RSI
    chart.applyOptions({
      rightPriceScale: {
        scaleMargins: {
          top: 0.1,
          bottom: 0.4,
        },
      },
    });

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: 'var(--color-success)',
      downColor: 'var(--color-error)',
      borderVisible: false,
      wickUpColor: 'var(--color-success)',
      wickDownColor: 'var(--color-error)',
    });

    // Format data for candlestick series
    const formattedCandleData: CandlestickData<Time>[] = data.map(candle => ({
      time: (typeof candle.time === 'string' ? new Date(candle.time).getTime() / 1000 : candle.time) as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    candlestickSeries.setData(formattedCandleData);
    candleSeries.current = candlestickSeries;

    // Add volume histogram if volume data is available
    if (data.some(candle => candle.volume !== undefined)) {
      // Create volume series with a separate price scale
      const volumeHistogram = chart.addHistogramSeries({
        color: 'rgba(var(--color-primary-rgb), 0.5)',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume'
      });

      // Apply scale margins to the volume series
      volumeHistogram.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8, // Position the volume series at the bottom 20% of the chart
          bottom: 0,
        },
      });

      // Format data for volume series
      const formattedVolumeData: HistogramData<Time>[] = data.map(candle => ({
        time: (typeof candle.time === 'string' ? new Date(candle.time).getTime() / 1000 : candle.time) as Time,
        value: candle.volume || 0,
        color: candle.close >= candle.open
          ? 'rgba(var(--color-success-rgb), 0.5)'
          : 'rgba(var(--color-error-rgb), 0.5)',
      }));

      volumeHistogram.setData(formattedVolumeData);
      volumeSeries.current = volumeHistogram;
    }

    // Add trade markers
    if (orders && orders.length > 0) {
      // Buy orders (green triangles)
      const buyOrders = orders.filter(order => order.type.toLowerCase().includes('buy'));
      if (buyOrders.length > 0) {
        candlestickSeries.setMarkers(
          buyOrders.map(order => ({
            time: new Date(order.time).getTime() / 1000 as Time,
            position: 'belowBar',
            color: 'var(--color-success)',
            shape: 'arrowUp',
            text: `Buy @ ${order.price.toFixed(2)}`,
          }))
        );
      }

      // Sell orders (red triangles)
      const sellOrders = orders.filter(order => order.type.toLowerCase().includes('sell'));
      if (sellOrders.length > 0) {
        // We need to add these to existing markers, but lightweight-charts doesn't support
        // multiple marker sets on one series, so we'd need a workaround in a real implementation
        // For now, we'll just show a message about this limitation
        console.warn('Multiple marker types not supported in this demo. Only showing buy markers.');
      }
    }

    // Fit content and handle resizing
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    // Store chart reference for cleanup
    chartRef.current = chart;

    // Add technical indicators
    Object.entries(indicators).forEach(([id, indicator]) => {
      if (!indicator.enabled || !chartRef.current) return;

      // Remove existing indicator series if it exists
      if (indicatorSeries.current[id]) {
        chartRef.current.removeSeries(indicatorSeries.current[id]);
        delete indicatorSeries.current[id];
      }

      try {
        // Calculate and add the indicator based on its type
        switch (indicator.type) {
          case IndicatorType.SMA: {
            const { period } = indicator.params;
            const smaData = calculateSMA(data, period);
            const formattedData: LineData<Time>[] = [];

            // Format data for the chart
            data.slice(period - 1).forEach((candle, i) => {
              formattedData.push({
                time: (typeof candle.time === 'string' ? new Date(candle.time).getTime() / 1000 : candle.time) as Time,
                value: smaData[i]
              });
            });

            // Add the line series to the chart
            const series = chart.addLineSeries({
              color: indicator.color,
              lineWidth: 2,
              title: `SMA(${period})`
            });

            series.setData(formattedData);
            indicatorSeries.current[id] = series;
            break;
          }

          case IndicatorType.EMA: {
            const { period } = indicator.params;
            const emaData = calculateEMA(data, period);
            const formattedData: LineData<Time>[] = [];

            // Format data for the chart
            data.slice(period - 1).forEach((candle, i) => {
              formattedData.push({
                time: (typeof candle.time === 'string' ? new Date(candle.time).getTime() / 1000 : candle.time) as Time,
                value: emaData[i]
              });
            });

            // Add the line series to the chart
            const series = chart.addLineSeries({
              color: indicator.color,
              lineWidth: 2,
              title: `EMA(${period})`
            });

            series.setData(formattedData);
            indicatorSeries.current[id] = series;
            break;
          }

          case IndicatorType.BOLLINGER_BANDS: {
            const { period, stdDev } = indicator.params;
            const bbands = calculateBollingerBands(data, period, stdDev);

            // Upper band
            const upperData: LineData<Time>[] = [];
            // Middle band
            const middleData: LineData<Time>[] = [];
            // Lower band
            const lowerData: LineData<Time>[] = [];

            // Format data for the chart
            data.slice(period - 1).forEach((candle, i) => {
              const time = (typeof candle.time === 'string' ? new Date(candle.time).getTime() / 1000 : candle.time) as Time;
              upperData.push({ time, value: bbands.upper[i] });
              middleData.push({ time, value: bbands.middle[i] });
              lowerData.push({ time, value: bbands.lower[i] });
            });

            // Add the line series to the chart
            const upperSeries = chart.addLineSeries({
              color: indicator.color,
              lineWidth: 1,
              title: `BB Upper(${period}, ${stdDev})`,
              lineStyle: 2 // Dashed
            });

            const middleSeries = chart.addLineSeries({
              color: indicator.color,
              lineWidth: 1,
              title: `BB Middle(${period})`,
              lineStyle: 0 // Solid
            });

            const lowerSeries = chart.addLineSeries({
              color: indicator.color,
              lineWidth: 1,
              title: `BB Lower(${period}, ${stdDev})`,
              lineStyle: 2 // Dashed
            });

            upperSeries.setData(upperData);
            middleSeries.setData(middleData);
            lowerSeries.setData(lowerData);

            indicatorSeries.current[`${id}_upper`] = upperSeries;
            indicatorSeries.current[`${id}_middle`] = middleSeries;
            indicatorSeries.current[`${id}_lower`] = lowerSeries;
            break;
          }

          case IndicatorType.RSI: {
            const { period } = indicator.params;
            const rsiData = calculateRSI(data, period);
            const formattedData: LineData<Time>[] = [];

            // Format data for the chart
            data.slice(period).forEach((candle, i) => {
              formattedData.push({
                time: (typeof candle.time === 'string' ? new Date(candle.time).getTime() / 1000 : candle.time) as Time,
                value: rsiData[i]
              });
            });

            // Create a separate pane for RSI
            const rsiSeries = chart.addLineSeries({
              color: indicator.color,
              lineWidth: 2,
              title: `RSI(${period})`,
              priceScaleId: 'rsi'
            });

            // Add horizontal lines for overbought/oversold levels
            const overboughtData: LineData<Time>[] = [];
            const oversoldData: LineData<Time>[] = [];
            const middleData: LineData<Time>[] = [];

            data.slice(period).forEach((candle) => {
              const time = (typeof candle.time === 'string' ? new Date(candle.time).getTime() / 1000 : candle.time) as Time;
              overboughtData.push({ time, value: 70 });
              oversoldData.push({ time, value: 30 });
              middleData.push({ time, value: 50 });
            });

            const overboughtSeries = chart.addLineSeries({
              color: 'rgba(255, 0, 0, 0.5)',
              lineWidth: 1,
              title: 'Overbought (70)',
              priceScaleId: 'rsi',
              lineStyle: 2 // Dashed
            });

            const oversoldSeries = chart.addLineSeries({
              color: 'rgba(0, 255, 0, 0.5)',
              lineWidth: 1,
              title: 'Oversold (30)',
              priceScaleId: 'rsi',
              lineStyle: 2 // Dashed
            });

            const middleSeries = chart.addLineSeries({
              color: 'rgba(128, 128, 128, 0.5)',
              lineWidth: 1,
              title: 'Middle (50)',
              priceScaleId: 'rsi',
              lineStyle: 2 // Dashed
            });

            rsiSeries.setData(formattedData);
            overboughtSeries.setData(overboughtData);
            oversoldSeries.setData(oversoldData);
            middleSeries.setData(middleData);

            indicatorSeries.current[id] = rsiSeries;
            indicatorSeries.current[`${id}_overbought`] = overboughtSeries;
            indicatorSeries.current[`${id}_oversold`] = oversoldSeries;
            indicatorSeries.current[`${id}_middle`] = middleSeries;
            break;
          }

          case IndicatorType.MACD: {
            const { fastPeriod, slowPeriod, signalPeriod } = indicator.params;
            const macdData = calculateMACD(data, fastPeriod, slowPeriod, signalPeriod);

            // Format data for the chart
            const macdLineData: LineData<Time>[] = [];
            const signalLineData: LineData<Time>[] = [];
            const histogramData: HistogramData<Time>[] = [];

            // Offset to align data properly
            const offset = slowPeriod - 1 + signalPeriod - 1;

            data.slice(offset).forEach((candle, i) => {
              const time = (typeof candle.time === 'string' ? new Date(candle.time).getTime() / 1000 : candle.time) as Time;

              if (i < macdData.macd.length) {
                macdLineData.push({ time, value: macdData.macd[i] });
              }

              if (i < macdData.signal.length) {
                signalLineData.push({ time, value: macdData.signal[i] });
              }

              if (i < macdData.histogram.length) {
                histogramData.push({
                  time,
                  value: macdData.histogram[i],
                  color: macdData.histogram[i] >= 0 ? 'rgba(0, 150, 136, 0.8)' : 'rgba(255, 82, 82, 0.8)'
                });
              }
            });

            // Create a separate pane for MACD
            const macdLineSeries = chart.addLineSeries({
              color: indicator.color,
              lineWidth: 2,
              title: `MACD(${fastPeriod},${slowPeriod},${signalPeriod})`,
              priceScaleId: 'macd'
            });

            const signalLineSeries = chart.addLineSeries({
              color: 'rgba(255, 152, 0, 0.8)',
              lineWidth: 1,
              title: `Signal(${signalPeriod})`,
              priceScaleId: 'macd'
            });

            const histogramSeries = chart.addHistogramSeries({
              title: 'Histogram',
              priceScaleId: 'macd'
            });

            macdLineSeries.setData(macdLineData);
            signalLineSeries.setData(signalLineData);
            histogramSeries.setData(histogramData);

            indicatorSeries.current[`${id}_line`] = macdLineSeries;
            indicatorSeries.current[`${id}_signal`] = signalLineSeries;
            indicatorSeries.current[`${id}_histogram`] = histogramSeries;
            break;
          }

          case IndicatorType.STOCHASTIC_RSI: {
            const { period, kPeriod, dPeriod } = indicator.params;
            const stochData = calculateStochastic(data, period, kPeriod, dPeriod);

            // Format data for the chart
            const kLineData: LineData<Time>[] = [];
            const dLineData: LineData<Time>[] = [];

            // Calculate total offset
            const offset = period - 1 + Math.max(kPeriod, 1) - 1 + dPeriod - 1;

            data.slice(offset).forEach((candle, i) => {
              const time = (typeof candle.time === 'string' ? new Date(candle.time).getTime() / 1000 : candle.time) as Time;

              if (i < stochData.k.length) {
                kLineData.push({ time, value: stochData.k[i] });
              }

              if (i < stochData.d.length) {
                dLineData.push({ time, value: stochData.d[i] });
              }
            });

            // Create a separate pane for Stochastic
            const kLineSeries = chart.addLineSeries({
              color: indicator.color,
              lineWidth: 2,
              title: `%K(${period},${kPeriod})`,
              priceScaleId: 'stoch'
            });

            const dLineSeries = chart.addLineSeries({
              color: 'rgba(255, 152, 0, 0.8)',
              lineWidth: 1,
              title: `%D(${dPeriod})`,
              priceScaleId: 'stoch'
            });

            // Add horizontal lines for overbought/oversold levels
            const overboughtData: LineData<Time>[] = [];
            const oversoldData: LineData<Time>[] = [];

            data.slice(offset).forEach((candle) => {
              const time = (typeof candle.time === 'string' ? new Date(candle.time).getTime() / 1000 : candle.time) as Time;
              overboughtData.push({ time, value: 80 });
              oversoldData.push({ time, value: 20 });
            });

            const overboughtSeries = chart.addLineSeries({
              color: 'rgba(255, 0, 0, 0.5)',
              lineWidth: 1,
              title: 'Overbought (80)',
              priceScaleId: 'stoch',
              lineStyle: 2 // Dashed
            });

            const oversoldSeries = chart.addLineSeries({
              color: 'rgba(0, 255, 0, 0.5)',
              lineWidth: 1,
              title: 'Oversold (20)',
              priceScaleId: 'stoch',
              lineStyle: 2 // Dashed
            });

            kLineSeries.setData(kLineData);
            dLineSeries.setData(dLineData);
            overboughtSeries.setData(overboughtData);
            oversoldSeries.setData(oversoldData);

            indicatorSeries.current[`${id}_k`] = kLineSeries;
            indicatorSeries.current[`${id}_d`] = dLineSeries;
            indicatorSeries.current[`${id}_overbought`] = overboughtSeries;
            indicatorSeries.current[`${id}_oversold`] = oversoldSeries;
            break;
          }
        }
      } catch (error) {
        console.error(`Error adding indicator ${indicator.type}:`, error);
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, orders, height, indicators]);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        backgroundColor: 'var(--color-background)',
        border: '1px solid var(--color-secondary)'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            color: 'var(--color-text)',
            fontWeight: 'bold'
          }}
        >
          {title}
        </Typography>

        {showZoomControls && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              size="small"
              aria-label="time range"
              sx={{ mr: 2 }}
            >
              <ToggleButton value="day" aria-label="day">
                1D
              </ToggleButton>
              <ToggleButton value="week" aria-label="week">
                1W
              </ToggleButton>
              <ToggleButton value="month" aria-label="month">
                1M
              </ToggleButton>
              <ToggleButton value="year" aria-label="year">
                1Y
              </ToggleButton>
              <ToggleButton value="all" aria-label="all">
                All
              </ToggleButton>
            </ToggleButtonGroup>

            <ButtonGroup size="small" aria-label="chart navigation">
              <Tooltip title="Pan left (Left arrow)">
                <IconButton onClick={handlePanLeft}>
                  <NavigateBeforeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Pan right (Right arrow)">
                <IconButton onClick={handlePanRight}>
                  <NavigateNextIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom in (+ key)">
                <IconButton onClick={handleZoomIn}>
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom out (- key)">
                <IconButton onClick={handleZoomOut}>
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset view (Home key)">
                <IconButton onClick={handleResetZoom}>
                  <RestartAltIcon />
                </IconButton>
              </Tooltip>
            </ButtonGroup>
          </Box>
        )}
      </Box>
      <Box
        ref={chartContainerRef}
        sx={{
          width,
          height: `${height}px`,
          '.tv-lightweight-charts': {
            fontFamily: 'inherit !important'
          }
        }}
      />

      {showIndicatorControls && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ mb: 1, color: 'var(--color-text)' }}>
            Technical Indicators
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Add Indicator</InputLabel>
                <Select
                  label="Add Indicator"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addIndicator(e.target.value as IndicatorType);
                      e.target.value = '';
                    }
                  }}
                >
                  {availableIndicators.map((indicator) => (
                    <MenuItem key={indicator.value} value={indicator.value}>
                      {indicator.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {Object.entries(indicators).length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'var(--color-text)' }}>
                Active Indicators
              </Typography>
              <Grid container spacing={1}>
                {Object.entries(indicators).map(([id, indicator]) => (
                  <Grid item xs={12} key={id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={indicator.enabled}
                            onChange={() => toggleIndicator(id)}
                            sx={{ color: indicator.color }}
                          />
                        }
                        label={`${indicator.type.toUpperCase()} ${Object.entries(indicator.params)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(', ')}`}
                        sx={{ color: 'var(--color-text)', flexGrow: 1 }}
                      />
                      <Box>
                        <Tooltip title="Edit parameters">
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => setEditingIndicator(id)}
                            sx={{ minWidth: '30px', mr: 1 }}
                          >
                            Edit
                          </Button>
                        </Tooltip>
                        <Tooltip title="Remove indicator">
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => removeIndicator(id)}
                            sx={{ minWidth: '30px' }}
                          >
                            X
                          </Button>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      )}

      {/* Indicator Parameters Dialog */}
      {editingIndicator !== null && indicators[editingIndicator] && (
        <IndicatorParamsDialog
          open={editingIndicator !== null}
          onClose={() => setEditingIndicator(null)}
          indicator={indicators[editingIndicator]}
          indicatorId={editingIndicator}
          onSave={updateIndicatorParams}
        />
      )}
    </Paper>
  );
};

export default CandlestickChart;
