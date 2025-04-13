import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import Dashboard from './pages/Dashboard';
import Backtest from './pages/Backtest';
import Results from './pages/Results';
import Backtests from './pages/Backtests';
import Optimize from './pages/Optimize';
import ResultDetail from './pages/ResultDetail';
import DocsViewer from './pages/DocsViewer';
import ThemeSwitcher from './components/ThemeSwitcher';
import './index.css';

const styleElement = document.createElement('style');
document.head.appendChild(styleElement);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/backtest" element={<Backtest />} />
          <Route path="/backtests" element={<Backtests />} />
          <Route path="/optimize" element={<Optimize />} />
          <Route path="/docs" element={<DocsViewer />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/result-detail/:id" element={<ResultDetail />} />
        </Routes>
        <ThemeSwitcher />
      </BrowserRouter>
    </ThemeProvider>

  </StrictMode>
);
