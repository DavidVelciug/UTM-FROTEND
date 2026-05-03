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
          <button type="button" className={styles.themeSwitchCircle} onClick={toggleTheme}>
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>

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
              <summary className={styles.menuSummary}>
                Разделы
                <svg className={styles.arrowIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </summary>
              <div className={styles.menuItems}>
                <Link to="/create-capsule" className={styles.menuItem}>Создать капсулу</Link>
                <Link to="/my-capsules" className={styles.menuItem}>Мои капсулы</Link>
                <Link to="/opened-capsules" className={styles.menuItem}>Открытые капсулы</Link>
                <Link to="/map" className={styles.menuItem}>Карта</Link>
                {canAccess(role, 'moderation') && (
                  <Link to="/admin/moderation" className={styles.menuItem}>Модерация</Link>
                )}
                {canAccess(role, 'stats') && (
                  <Link to="/admin/stats" className={styles.menuItem}>Статистика</Link>
                )}
                {canAccess(role, 'stats') && (
                  <Link to="/admin/users" className={styles.menuItem}>Пользователи</Link>
                )}
              </div>
            </details>
          )}

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