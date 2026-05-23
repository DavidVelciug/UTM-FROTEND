import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import styles from '../styles/openedCapsules.module.css';
import { getOpenedCapsules } from '../auth/capsuleStore';
import { fetchJson } from '../config/api';
import { getCurrentUserId } from '../auth/session';
import type { TimeCapsuleDto } from '../types/api';

const OpenedCapsules: React.FC = () => {
  const userId = getCurrentUserId();
  const [items, setItems] = useState(getOpenedCapsules());
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void fetchJson<TimeCapsuleDto[]>(`/api/timecapsule/getOpenedForUser?userId=${userId}`)
      .then((serverCapsules) => {
        const local = getOpenedCapsules();
        const merged = [...local];
        serverCapsules.forEach((c) => {
          if (!merged.some((x) => x.id === c.id)) {
            merged.push({
              ...c,
              openedAtUtc: c.openedAtUtc ?? c.openAtUtc,
              openedFrom: c.openedFrom ?? (c.ownerUserId === userId ? 'Моя капсула' : c.isPublic ? 'Публичная капсула' : 'Присланная капсула'),
            });
          }
        });
        setItems(merged);
      })
      .catch(() => setItems(getOpenedCapsules()))
      .finally(() => setLoading(false));
  }, [userId]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const paginatedItems = items.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

  return (
    <div className={`${layout.pageWrapper} ${layout.withBg}`}>
      <Header />
        <main className={layout.mainContent}>
        <div className={styles.pageHeader}>
          <h1 className={layout.fadeIn}>Открытые капсулы</h1>
          <p className={layout.fadeIn}>Ваша персональная коллекция воспоминаний. Здесь хранятся все капсулы, которые вы когда-либо распаковали.</p>
        </div>

        <div className={`${styles.section} ${layout.container}`}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.loader} />
              <p className={layout.textGradient}>Синхронизация архивов...</p>
            </div>
          ) : (
            <>
              {items.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Ваша коллекция пока пуста. Распакуйте свою первую капсулу, чтобы она появилась здесь.</p>
                </div>
              ) : (
                <div className={`${styles.grid} ${layout.fadeIn}`}>
                    {paginatedItems.map((item) => (
                    <article key={item.id} className={styles.card}>
                      <div className={styles.cardImage}>
                        <h2 className={styles.cardTitle}>{item.title}</h2>
                        <p className={styles.muted}>{item.previewText || 'Эта капсула успешно открыта и доступна для просмотра в любое время.'}</p>

                        <div className={styles.cardContent}>
                          <div className={styles.infoGroup}>
                            <p className={styles.hint}>Тип капсулы: <span>{item.isPublic ? 'Публичная' : 'Приватная'}</span></p>
                            <p className={styles.hint}>Дата открытия: <span>{new Date(item.openedAtUtc ?? item.openAtUtc).toLocaleDateString('ru-RU')}</span></p>
                            <p className={styles.hint}>Источник: <span>{item.openedFrom ?? 'Неизвестно'}</span></p>
                          </div>
                        </div>
                      </div>

                      <div className={styles.cardActions}>
                        <Link to={`/capsule-view/${item.id}`} className={styles.viewBtn}>
                          Открыть содержимое
                        </Link>
                      </div>
                    </article>
                    ))}
                </div>
              )}

              {items.length > pageSize && (
                <div className={styles.pagination}>
                  <button 
                    type="button" 
                    className={layout.btnPrimary} 
                    disabled={pageIndex <= 1} 
                    onClick={() => {
                      setPageIndex((p) => p - 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Назад
                  </button>
                  <span className={styles.pageNumber}>{pageIndex} / {totalPages}</span>
                  <button 
                    type="button" 
                    className={layout.btnPrimary} 
                    disabled={pageIndex >= totalPages} 
                    onClick={() => {
                      setPageIndex((p) => p + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Вперед
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OpenedCapsules;