import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // We'll create this later

interface NavItem {
  path: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Dashboard' },
  { path: '/docs', label: 'Documentation' },
  { path: '/results', label: 'Results' }
];

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          MEXC Grid Trading
        </Link>
      </div>
      <ul className="navbar-nav">
        {NAV_ITEMS.map((item) => (
          <li key={item.path} className="nav-item">
            <Link to={item.path} className="nav-link">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
