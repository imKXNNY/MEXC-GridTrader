import React from 'react';
import Navbar from '@components/Navbar';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <main className="dashboard-content container">
        <h1>Dashboard</h1>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Profit</h3>
            <p>$0.00</p>
          </div>
          <div className="stat-card">
            <h3>Active Trades</h3>
            <p>0</p>
          </div>
          <div className="stat-card">
            <h3>Completed Trades</h3>
            <p>0</p>
          </div>
        </div>
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <p>No recent activity</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
