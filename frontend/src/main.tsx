import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@theme/ThemeProvider';
import { Dashboard, DocsViewer, ResultDetail } from '@pages';
import './index.css';

const styleElement = document.createElement('style');
document.head.appendChild(styleElement);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/docs" element={<DocsViewer />} />
          <Route path="/results/:id" element={<ResultDetail />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
