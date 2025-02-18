import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './Backtest.css';

interface Results {
  orders: [
    {
      price: number;
      profit: number;
      size: number;
      time: string;
      type: string;
    }
  ];
  drawdown_analysis: {
      drawdown: number;
      len: number;
      moneydown: number;
      max: {
        drawdown: number;
        len: number;
        moneydown: number;
      }
  }
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
  }
  sharpe_analysis: {
    sharperatio: number;
  }
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

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {fetchingResults && <div className="backtest-loading"><p>Loading...</p></div> || results && (
                <div className="backtest-results">
                    <div className='backtest-metrics'>
                        <h2 style={{ marginTop: 0 }}>Simulation Metrics</h2>
                        <div className="metrics-grid">
                            <div className="metric-card">
                                <span className="metric-label">Total Profit:</span>
                                <span className="metric-value">${results.trade_analysis.pnl.net.total.toFixed(2)}</span>
                            </div>
                            <div className="metric-card">
                                <span className="metric-label">Trades:</span>
                                <span className="metric-value">{results.trade_analysis.total.total}</span>
                            </div>
                            <div className="metric-card">
                                <span className="metric-label">Win Rate:</span>
                                <span className="metric-value">{(results.trade_analysis.won.total / results.trade_analysis.total.total * 100).toFixed(2)}%</span>
                            </div>
                            <div className="metric-card">
                                <span className="metric-label">Avg Profit/Trade:</span>
                                <span className="metric-value">${results.trade_analysis.pnl.net.average.toFixed(2)}</span>
                            </div>
                            <div className="metric-card">
                                <span className="metric-label">Max Drawdown:</span>
                                <span className="metric-value">{(results.drawdown_analysis.drawdown).toFixed(2)}%</span>
                            </div>
                            <div className="metric-card">
                                <span className="metric-label">Sharpe Ratio:</span>
                                <span className="metric-value">{results.sharpe_analysis.sharperatio.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="backtest-orders">
                        <div className="title-container">
                            <h2 style={{ marginTop: 0 }}>Trade Orders </h2>
                            <div className="actions">
                                <button disabled>Download</button>
                                <button disabled>Save</button>
                            </div>
                        </div>
                        
                        <table className="order-table">
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2">Time</th>
                                    <th className="border px-4 py-2">Type</th>
                                    <th className="border px-4 py-2">Price</th>
                                    <th className="border px-4 py-2">Size</th>
                                    <th className="border px-4 py-2">Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.orders.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).map((order, i) => (
                                    <tr key={i}>
                                        <td className="border px-4 py-2">{order.time}</td>
                                        <td className="border px-4 py-2">{order.type.toUpperCase()}</td>
                                        <td className="border px-4 py-2">{order.price}&nbsp;$</td>
                                        <td className="border px-4 py-2">{order.size}</td>
                                        <td className="border px-4 py-2">{order.profit.toFixed(2)}&nbsp;$</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Backtest;
