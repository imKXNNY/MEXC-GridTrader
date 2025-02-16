import React from 'react';
import Navbar from '@components/Navbar';
import DocsIndex from '@components/DocsIndex';
import './DocsViewer.css';

const DocsViewer: React.FC = () => {
  return (
    <div className="docs-viewer">
      <Navbar />
      <main className="docs-content">
        <DocsIndex />
        <div className="docs-main container">
          <h1>Documentation</h1>
          <p>Select a topic from the left to view documentation</p>
        </div>
      </main>
    </div>
  );
};

export default DocsViewer;
