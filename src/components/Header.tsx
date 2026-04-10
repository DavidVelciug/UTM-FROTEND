import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/header.module.css';
import layout from '../styles/layout.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link to="/" className={styles.logo}>
          MemoryLane
        </Link>
        <nav className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>
            Главная
          </Link>
          <Link to="/catalog" className={styles.navLink}>
            Каталог
          </Link>
          <Link to="/create-capsule" className={styles.navLink}>
            Создать капсулу
          </Link>
          <Link to="/my-capsules" className={styles.navLink}>
            Мои капсулы
          </Link>
          <Link to="/feed" className={styles.navLink}>
            Лента
          </Link>
          <Link to="/map" className={styles.navLink}>
            Карта
          </Link>
          <Link to="/settings" className={styles.navLink}>
            Настройки
          </Link>
          <Link to="/admin/moderation" className={styles.navLink}>
            Модерация
          </Link>
          <Link to="/admin/stats" className={styles.navLink}>
            Статистика
          </Link>
          <Link to="/login" className={`${layout.btnPrimary} ${styles.navBtn}`}>
            Войти
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;