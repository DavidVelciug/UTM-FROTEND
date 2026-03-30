import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          MemoryLane
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">
            Главная
          </Link>
          <Link to="/catalog" className="nav-link">
            Каталог
          </Link>
          <Link to="/favorites" className="nav-link">
            Избранное
          </Link>
          <Link to="/about" className="nav-link">
            О нас
          </Link>
          <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
            Войти
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;