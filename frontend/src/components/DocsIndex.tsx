import React from 'react';
import './DocsIndex.css';

interface DocItem {
  title: string;
  description: string;
  link: string;
}

const DOC_ITEMS: DocItem[] = [
  {
    title: 'Getting Started',
    description: 'Learn how to set up and configure the trading bot',
    link: '/docs/getting-started'
  },
  {
    title: 'Strategy Configuration',
    description: 'Understand and customize trading strategies',
    link: '/docs/strategy-config'
  },
  {
    title: 'API Integration',
    description: 'Connect with MEXC exchange API',
    link: '/docs/api-integration'
  }
];

const DocsIndex: React.FC = () => {
  return (
    <div className="docs-index">
      <h2 className="docs-title">Documentation</h2>
      <div className="docs-list">
        {DOC_ITEMS.map((doc) => (
          <div key={doc.link} className="doc-item">
            <h3 className="doc-title">
              <a href={doc.link} className="doc-link">
                {doc.title}
              </a>
            </h3>
            <p className="doc-description">{doc.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocsIndex;
