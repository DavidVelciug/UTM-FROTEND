import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import layout from '../styles/layout.module.css';
import styles from '../styles/Landing.module.css';
import { fetchJson } from '../config/api';
import { legacyAsset } from '../utils/legacyAsset';

const Landing: React.FC = () => {
  const [createdTotal, setCreatedTotal] = useState<number | null>(null);
  const [openedTotal, setOpenedTotal] = useState<number | null>(null);

  const demoImages = [
    'src/assets/landing/photo4.png',
    'src/assets/landing/photo3.png',
    'src/assets/landing/photo1.png',
    'src/assets/landing/photo2.png',
  ];

  const features = [
    { title: 'Создайте', desc: 'Письмо, фото или видео', icon: 'src/assets/landing/card1.png' },
    { title: 'Запечатайте', desc: 'Выберите дату открытия', icon: 'src/assets/landing/card2.png' },
    { title: 'Ждите', desc: 'Мы сохраним это', icon: 'src/assets/landing/card3.png' },
    { title: 'Вспоминайте', desc: 'Доступ в нужный день', icon: 'src/assets/landing/card4.png' },
  ];

  useEffect(() => {
    let cancelled = false;
    void fetchJson<{ createdTotal: number; openedTotal: number }>('/api/stats/capsuleCounts')
      .then((d) => {
        if (!cancelled) {
          setCreatedTotal(d.createdTotal);
          setOpenedTotal(d.openedTotal);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCreatedTotal(null);
          setOpenedTotal(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fmt = (n: number | null) => (n == null ? '—' : n.toLocaleString('ru-RU'));

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>Письма в будущее</h1>
              <p className={styles.heroDescription}>
                Создайте цифровое наследие, которое откроется в нужный момент. Сохраните воспоминания для близких.
              </p>
              <div className={styles.heroStats}>
                <div className={styles.statItem}>
                  <strong>{fmt(createdTotal)}</strong>
                  <span>Создано капсул</span>
                </div>
                <div className={styles.statItem}>
                  <strong>{fmt(openedTotal)}</strong>
                  <span>Уже открыто</span>
                </div>
              </div>
              <div className={styles.heroButtonContainer}>
                <Link to="/catalog" className={layout.btnPrimaryLarge}>
                  Перейти к каталогу
                </Link>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.scrollColumn}>
                {[...demoImages, ...demoImages].map((img, i) => (
                  <div key={i} className={styles.miniCard}>
                    <img src={legacyAsset(img)} alt="" />
                  </div>
                ))}
              </div>
              <div className={`${styles.scrollColumn} ${styles.scrollReverse}`}>
                {[...demoImages, ...demoImages].map((img, i) => (
                  <div key={i} className={styles.miniCard}>
                    <img src={legacyAsset(img)} alt="" />
                  </div>
                ))}
              </div>
              <div className={styles.visualOverlay}></div>
            </div>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <h2>Как это работает</h2>
          <div className={styles.featuresGrid}>
            {features.map((f, i) => (
              <div key={i} className={styles.featureCard3D}>
                <div className={styles.cardInner}>
                  <div className={styles.layerBase}></div>
                  <div className={styles.layerGlow}></div>
                  <div className={styles.layerImage}>
                    <img src={legacyAsset(f.icon)} alt={f.title} />
                  </div>
                  <div className={styles.layerText}>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
