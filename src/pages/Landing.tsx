import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import styles from '../styles/landing.module.css';

const Landing: React.FC = () => {
  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Письма в будущее</h1>
            <p className={styles.heroDescription}>
              Создайте цифровое наследие, которое откроется в нужный момент. Сохраните свои воспоминания для себя и
              близких.
            </p>
            <div className={styles.heroStats}>
              <div>
                <strong>12k+</strong>
                <span>Капсул создано</span>
              </div>
              <div>
                <strong>8k+</strong>
                <span>Уже открыто</span>
              </div>
            </div>
            <div className={styles.heroButtonContainer}>
              <Link to="/catalog" className={layout.btnPrimaryLarge}>
                Перейти к каталогу
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <h2>Как это работает</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📝</div>
              <h3>Создайте</h3>
              <p>Напишите письмо, загрузите фото или видео</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔒</div>
              <h3>Запечатайте</h3>
              <p>Выберите дату открытия</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⏰</div>
              <h3>Ждите</h3>
              <p>Мы сохраним это в безопасности</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>✨</div>
              <h3>Вспоминайте</h3>
              <p>Получите доступ в назначенный день</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;