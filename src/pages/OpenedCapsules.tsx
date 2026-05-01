import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import page from '../styles/pageSection.module.css';
import catalog from '../styles/catalog.module.css';
import { getOpenedCapsules } from '../auth/capsuleStore';

const OpenedCapsules: React.FC = () => {
  const items = useMemo(() => getOpenedCapsules(), []);

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <div className={page.pageHeader}>
          <h1>Открытые капсулы</h1>
          <p>Все капсулы, которые вы распаковали из каталога.</p>
        </div>
        <div className={`${page.section} ${layout.container}`}>
          {items.length === 0 && (
            <div className={catalog.emptyState}>
              <p>Вы еще не открывали капсулы</p>
            </div>
          )}
          {items.map((item) => (
            <article key={`${item.id}-${item.openedAtUtc}`} className={page.card}>
              <div className={page.row} style={{ justifyContent: 'space-between' }}>
                <h2>{item.name}</h2>
                <span className={page.badge}>Распакована</span>
              </div>
              <p className={page.muted}>{item.description}</p>
              <p className={page.hint}>Открыта {new Date(item.openedAtUtc).toLocaleString('ru-RU')}</p>
              <Link to={`/capsule-view/${item.id}`} className={layout.btnPrimary}>
                Открыть содержимое
              </Link>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OpenedCapsules;
