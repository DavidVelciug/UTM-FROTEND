import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import styles from '../styles/sentCapsules.module.css';
import { fetchJson } from '../config/api';
import { getCurrentUserId } from '../auth/session';
import type { TimeCapsuleDto } from '../types/api';
import { isImageSource, resolveMediaUrl } from '../utils/file';

function formatCountdown(target: Date, now: Date): string {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 'Можно открыть';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return `${days}д ${hours}ч ${mins}м ${secs}с`;
}

const SentCapsules: React.FC = () => {
  const navigate = useNavigate();
  const userId = getCurrentUserId();
  const [items, setItems] = useState<TimeCapsuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [now, setNow] = useState(() => new Date());
  const [lockedCapsule, setLockedCapsule] = useState<TimeCapsuleDto | null>(null);
  const pageSize = 9;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    void fetchJson<TimeCapsuleDto[]>(`/api/timecapsule/getByRecipient?recipientUserId=${userId}`)
      .then((data) => {
        setItems(data);
        setError(null);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Ошибка загрузки данных');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime()),
    [items],
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const visible = sorted.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <div className={styles.pageHeader}>
          <h1 className={layout.fadeIn}>Присланные капсулы</h1>
          <p className={layout.fadeIn}>Послания из прошлого, отправленные специально для вас. Дождитесь нужного момента, чтобы раскрыть их тайны.</p>
        </div>

        <div className={`${styles.section} ${layout.container}`}>
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.loader} />
              <p className={layout.textGradient}>Синхронизация с временным потоком...</p>
            </div>
          )}

          {error && <div className={styles.errorState}>{error}</div>}

          {!loading && !error && visible.length === 0 && (
            <div className={styles.emptyState}>
              <p>В вашем архиве пока пусто. Капсулы появятся здесь, когда кто-то отправит их вам.</p>
            </div>
          )}

          {!loading && !error && (
            <div className={`${styles.grid} ${layout.fadeIn}`}>
              {visible.map((item) => {
                const openAt = new Date(item.openAtUtc);
                const locked = openAt.getTime() > now.getTime();
                return (
                  <article key={item.id} className={styles.card}>
                    <h2>{item.title || 'Безымянная капсула'}</h2>
                    <p className={styles.muted}>{item.previewText || 'Короткое превью содержимого недоступно.'}</p>
                    
                    <div className={styles.mediaWrapper}>
                      <img
                        className={styles.coverImage}
                        src={resolveMediaUrl(item.fileStoragePath, '/assets/default-capsule-cover.svg')}
                        alt={item.title}
                        onError={(e) => {
                          e.currentTarget.src = '/assets/default-capsule-cover.svg';
                        }}
                      />
                    </div>

                    <div className={styles.infoGroup}>
                      <p className={styles.hint}>Отправитель: <span>{item.ownerDisplayName || 'Аноним'}</span></p>
                      <p className={styles.hint}>Дата открытия: <span>{openAt.toLocaleDateString('ru-RU')}</span></p>
                      <p className={styles.hint}>До вскрытия: <span>{formatCountdown(openAt, now)}</span></p>
                    </div>

                    <button
                      type="button"
                      className={layout.btnPrimary}
                      style={{ marginTop: '1.5rem', width: '100%', filter: locked ? 'grayscale(0.8)' : 'none' }}
                      onClick={() => {
                        if (locked) {
                          setLockedCapsule(item);
                          return;
                        }
                        navigate(`/capsule-view/${item.id}`);
                      }}
                    >
                      {locked ? 'Капсула запечатана' : 'Распаковать сейчас'}
                    </button>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && !error && sorted.length > pageSize && (
            <div className={styles.pagination}>
              <button type="button" className={layout.btnPrimary} disabled={pageIndex <= 1} onClick={() => setPageIndex((p) => p - 1)}>
                Назад
              </button>
              <span className={styles.pageNumber}>{pageIndex} / {totalPages}</span>
              <button type="button" className={layout.btnPrimary} disabled={pageIndex >= totalPages} onClick={() => setPageIndex((p) => p + 1)}>
                Вперед
              </button>
            </div>
          )}

          {lockedCapsule && (
            <div className={styles.modalOverlay} onClick={() => setLockedCapsule(null)}>
              <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                <h2 className={layout.textGradient}>Время еще не пришло</h2>
                <p className={styles.muted}>
                  Это послание защищено временным замком. Оно станет доступным для чтения {new Date(lockedCapsule.openAtUtc).toLocaleString('ru-RU')}.
                </p>
                <div className={styles.infoGroup} style={{ border: 'none', marginBottom: '1.5rem' }}>
                  <p className={styles.hint}>Осталось ждать: <span>{formatCountdown(new Date(lockedCapsule.openAtUtc), now)}</span></p>
                </div>
                <button type="button" className={layout.btnPrimary} onClick={() => setLockedCapsule(null)}>
                  Вернуться к списку
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SentCapsules;