import React from 'react';
import Navbar from '@components/Navbar';
import './ResultDetail.css';

interface TradeResult {
  id: string;
  pair: string;
  profit: number;
  duration: string;
  strategy: string;
  timestamp: string;
}

const ResultDetail: React.FC = () => {
  const result: TradeResult = {
    id: '12345',
    pair: 'BTC/USDT',
    profit: 150.25,
    duration: '2h 15m',
    strategy: 'Grid Trading',
    timestamp: '2023-10-15 14:30:00'
  };

  return (
    <div className="result-detail">
      <Navbar />
      <main className="result-content container">
        <h1>Trade Result Details</h1>
        <div className="result-info">
          <div className="info-row">
            <span className="info-label">Trade ID:</span>
            <span className="info-value">{result.id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Pair:</span>
            <span className="info-value">{result.pair}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Profit:</span>
            <span className="info-value">${result.profit.toFixed(2)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Duration:</span>
            <span className="info-value">{result.duration}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Strategy:</span>
            <span className="info-value">{result.strategy}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Timestamp:</span>
            <span className="info-value">{result.timestamp}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultDetail;
