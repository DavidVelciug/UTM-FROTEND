import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/header.module.css';
import layout from '../../styles/layout.module.css';
import { canAccess, canUseExtendedFeatures, getRole, logout, subscribeSessionChange } from '../../auth/session';
import { getAvatar } from '../../auth/avatar';
import { resolveMediaUrl } from '../../utils/file';
import { useTheme } from '../../theme/ThemeProvider';

const Header: React.FC = () => {
  const [role, setRole] = useState(getRole());
  const [avatar, setAvatar] = useState(getAvatar());
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    return subscribeSessionChange(() => {
      setRole(getRole());
      setAvatar(getAvatar());
    });
  }, []);
  const showExtended = canUseExtendedFeatures(role);

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
          <Link to="/settings" className={styles.navLink}>
            Настройки
          </Link>
          {showExtended && (
            <Link to="/feed" className={styles.navLink}>
              Лента
            </Link>
          )}

          {showExtended && (
            <details className={styles.sectionsMenu}>
              <summary className={styles.menuSummary}>Разделы</summary>
              <div className={styles.menuItems}>
                <Link to="/create-capsule" className={styles.menuItem}>
                  Создать капсулу
                </Link>
                <Link to="/my-capsules" className={styles.menuItem}>
                  Мои капсулы
                </Link>
                <Link to="/opened-capsules" className={styles.menuItem}>
                  Открытые капсулы
                </Link>
                <Link to="/map" className={styles.menuItem}>
                  Карта
                </Link>
                {canAccess(role, 'moderation') && (
                  <Link to="/admin/moderation" className={styles.menuItem}>
                    Модерация
                  </Link>
                )}
                {canAccess(role, 'stats') && (
                  <Link to="/admin/stats" className={styles.menuItem}>
                    Статистика
                  </Link>
                )}
                {canAccess(role, 'stats') && (
                  <Link to="/admin/users" className={styles.menuItem}>
                    Пользователи
                  </Link>
                )}
              </div>
            </details>
          )}

          <button type="button" className={styles.themeSwitch} onClick={toggleTheme}>
            {theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
          </button>

          {role === 'guest' ? (
            <Link to="/login" className={`${layout.btnPrimary} ${styles.navBtn}`}>
              Войти
            </Link>
          ) : (
            <div className={styles.userBlock}>
              <img
                src={resolveMediaUrl(avatar, '/assets/default-avatar.svg')}
                alt="avatar"
                className={styles.avatar}
                onError={(e) => {
                  e.currentTarget.src = '/assets/default-avatar.svg';
                }}
              />
              <Link to="/" className={`${layout.btnPrimary} ${styles.navBtn}`} onClick={() => logout()}>
                Выйти
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
