import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './Backtest.css';

interface Results {
  metrics: {
    total_profit: number;
    num_trades: number;
    win_rate: number;
    avg_profit_per_trade: number;
    max_drawdown: number;
    sharpe_ratio: number;
  };
  orders_chart_html: string;
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch('http://127.0.0.1:5000/api/simulate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                symbol,
                interval,
                initial_capital: initialCapital,
                risk_percent: riskPercent,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            setResults(data);
            console.log('Backtest result:', data);
        } else {
            console.error('Error during backtest');
        }
    };

    return (
        <div className="backtest-container">
            <Navbar />
            <form className="backtest-form" onSubmit={handleSubmit}>
                <h1>Backtest Trading Strategy</h1>
                <div className="form-group">
                    <label>
                        Symbol:
                        <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} required />
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        Interval:
                        <select value={interval} onChange={(e) => setInterval(e.target.value)} required>
                            <option value="1m">1 Minute</option>
                            <option value="5m">5 Minutes</option>
                            <option value="15m">15 Minutes</option>
                            <option value="1h">1 Hour</option>
                            <option value="4h">4 Hours</option>
                            <option value="1d">1 Day</option>
                        </select>
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        Initial Capital:
                        <input type="number" value={initialCapital} onChange={(e) => setInitialCapital(Number(e.target.value))} min="0" step="0.01" required />
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        Risk Percent:
                        <input type="number" value={riskPercent} onChange={(e) => setRiskPercent(Number(e.target.value))} min="0" max="100" step="0.1" required />
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        RSI Length:
                        <input type="number" value={rsiLength} onChange={(e) => setRsiLength(Number(e.target.value))} min="1" max="100" required />
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        MACD Fast:
                        <input type="number" value={macdFast} onChange={(e) => setMacdFast(Number(e.target.value))} min="1" max="100" required />
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        MACD Slow:
                        <input type="number" value={macdSlow} onChange={(e) => setMacdSlow(Number(e.target.value))} min="1" max="100" required />
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        MACD Signal:
                        <input type="number" value={macdSignal} onChange={(e) => setMacdSignal(Number(e.target.value))} min="1" max="100" required />
                    </label>
                </div>

                <button className="submit-button" type="submit">Run Backtest</button>
            </form>

            {results && (
                <div className="backtest-results">
                    <h2 style={{ marginTop: 0 }}>Simulation Metrics</h2>
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <span className="metric-label">Total Profit:</span>
                            <span className="metric-value">${results.metrics.total_profit.toFixed(2)}</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Trades:</span>
                            <span className="metric-value">{results.metrics.num_trades}</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Win Rate:</span>
                            <span className="metric-value">{(results.metrics.win_rate * 100).toFixed(2)}%</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Avg Profit/Trade:</span>
                            <span className="metric-value">${results.metrics.avg_profit_per_trade.toFixed(2)}</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Max Drawdown:</span>
                            <span className="metric-value">{(results.metrics.max_drawdown * 100).toFixed(2)}%</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Sharpe Ratio:</span>
                            <span className="metric-value">{results.metrics.sharpe_ratio.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="orders-chart" dangerouslySetInnerHTML={{ __html: results.orders_chart_html }} />
                </div>
            )}
        </div>
    );
};

export default Backtest;
