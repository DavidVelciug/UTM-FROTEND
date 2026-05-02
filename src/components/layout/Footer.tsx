import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>MemoryLane</h3>
          <p>Сохраняйте воспоминания для будущих поколений</p>
          <p>Кишинев, Молдова</p>
          <p>info@memorylane.com</p>
        </div>

        <div className={styles.footerSection}>
          <h3>Навигация</h3>
          <ul>
            <li>
              <Link to="/">Главная</Link>
            </li>
            <li>
              <Link to="/catalog">Каталог</Link>
            </li>
            <li>
              <Link to="/feed">Публичная лента</Link>
            </li>
            <li>
              <Link to="/map">Карта</Link>
            </li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3>Помощь</h3>
          <ul>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
            <li>
              <Link to="/support">Поддержка</Link>
            </li>
            <li>
              <Link to="/privacy">Конфиденциальность</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; 2026 MemoryLane. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer;
