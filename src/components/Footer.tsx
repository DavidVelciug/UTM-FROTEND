import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>MemoryLane</h3>
          <p>Сохраняйте воспоминания для будущих поколений</p>
          <p>📍 Москва, Россия</p>
          <p>📧 info@memorylane.com</p>
        </div>

        <div className="footer-section">
          <h3>Навигация</h3>
          <ul>
            <li><a href="/">Главная</a></li>
            <li><a href="/catalog">Каталог</a></li>
            <li><a href="/favorites">Избранное</a></li>
            <li><a href="/about">О нас</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Помощь</h3>
          <ul>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/support">Поддержка</a></li>
            <li><a href="/privacy">Конфиденциальность</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 MemoryLane. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer;