import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Секция Контактов */}
        <div className={styles.footerSection}>
          <div className={styles.brandWrapper}>
            <img src="src/assets/icons/logo.png" alt="MemoryLane" className={styles.mainIcon} />
            <h3 className={styles.brandTitle}>MemoryLane</h3>
          </div>
          <p className={styles.description}>Сохраняйте воспоминания для будущих поколений</p>
          
          <div className={styles.contactItem}>
            <img src="src/assets/icons/location.png" alt="Location" className={styles.staticIcon} />
            <span>Кишинев, Молдова</span>
          </div>
          
          <div className={styles.contactItem}>
            <img src="src/assets/icons/email.png" alt="Email" className={styles.staticIcon} />
            <a href="mailto:info@memorylane.com">info@memorylane.com</a>
          </div>
        </div>

        {/* Навигация */}
        <div className={styles.footerSection}>
          <h3>Навигация</h3>
          <ul className={styles.navList}>
            <li>
              <Link to="/" className={styles.animatedLink}>
                <img src="src/assets/icons/favor.png" alt="" className={styles.linkIcon} />
                <span>Главная</span>
              </Link>
            </li>
            <li>
              <Link to="/catalog" className={styles.animatedLink}>
                <img src="src/assets/icons/catalog.png" alt="" className={styles.linkIcon} />
                <span>Каталог</span>
              </Link>
            </li>
            <li>
              <Link to="/feed" className={styles.animatedLink}>
                <img src="src/assets/icons/feed.png" alt="" className={styles.linkIcon} />
                <span>Публичная лента</span>
              </Link>
            </li>
            <li>
              <Link to="/map" className={styles.animatedLink}>
                <img src="src/assets/icons/map.png" alt="" className={styles.linkIcon} />
                <span>Карта</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Помощь */}
        <div className={styles.footerSection}>
          <h3>Помощь</h3>
          <ul className={styles.navList}>
            <li>
              <Link to="/faq" className={styles.animatedLink}>
                <img src="src/assets/icons/faq.png" alt="" className={styles.linkIcon} />
                <span>FAQ</span>
              </Link>
            </li>
            <li>
              <Link to="/support" className={styles.animatedLink}>
                <img src="src/assets/icons/support.png" alt="" className={styles.linkIcon} />
                <span>Поддержка</span>
              </Link>
            </li>
            <li>
              <Link to="/privacy" className={styles.animatedLink}>
                <img src="src/assets/icons/privacy.png" alt="" className={styles.linkIcon} />
                <span>Конфиденциальность</span>
              </Link>
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