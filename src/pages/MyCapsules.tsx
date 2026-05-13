import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import styles from '../styles/myCapsule.module.css';
import { fetchJson } from '../config/api';
import { getCurrentUserId } from '../auth/session';
import type { ResponceMsg, TimeCapsuleDto } from '../types/api';

function formatCountdown(target: Date, now: Date): string {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 'Открыта';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return `${days}д ${hours}ч ${mins}м ${secs}с`;
}

function getContentTypeName(type: number): string {
  switch (type) {
    case 0: return '📝 Текст';
    case 1: return '🔗 Ссылка';
    case 2: return '📁 Файл';
    default: return '📦 Капсула';
  }
}

const MyCapsules: React.FC = () => {
  const userId = getCurrentUserId();
  const [items, setItems] = useState<TimeCapsuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!userId) {
          setItems([]);
          setError('Сначала выполните вход в систему.');
          return;
        }
        setLoading(true);
        const data = await fetchJson<TimeCapsuleDto[]>(
          `/api/timecapsule/getByOwner?ownerUserId=${userId}`,
        );
        if (!cancelled) {
          setItems(data);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Не удалось загрузить капсулы');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime()),
    [items],
  );

  const saveCapsule = async (capsule: TimeCapsuleDto) => {
    try {
      const res = await fetchJson<ResponceMsg>('/api/timecapsule', {
        method: 'PUT',
        body: JSON.stringify(capsule),
      });
      if (res.isSuccess) {
        setEditingId(null);
        setError(null);
      } else {
        setError(res.message);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка при сохранении');
    }
  };

  const deleteCapsule = async (capsuleId: number) => {
    if (!userId || !window.confirm('Вы уверены, что хотите удалить эту капсулу навсегда?')) return;
    try {
      const res = await fetchJson<ResponceMsg>(
        `/api/timecapsule/owner?id=${capsuleId}&ownerUserId=${userId}`,
        { method: 'DELETE' },
      );
      if (!res.isSuccess) {
        setError(res.message);
        return;
      }
      setItems((prev) => prev.filter((x) => x.id !== capsuleId));
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка при удалении');
    }
  };

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const visible = sorted.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <div className={styles.pageHeader}>
          <div className={layout.container}>
            <h1>Мои Капсулы</h1>
            <p>Ваша персональная коллекция запечатанных во времени посланий. Управляйте своими капсулами и следите за таймерами.</p>
          </div>
        </div>

        <div className={`${styles.section} ${layout.container}`}>
          {loading && (
            <div className={`${styles.loadingState} ${layout.fadeIn}`}>
              <div className={styles.loader} />
              <p className={styles.muted}>Синхронизация с временным потоком...</p>
            </div>
          )}

          {error && (
            <div className={`${styles.errorState} ${layout.fadeIn}`}>
              <div className={styles.errorIcon}>⚠️</div>
              <p>{error}</p>
              <p className={styles.muted} style={{ fontSize: '0.9rem' }}>Проверьте подключение или повторите попытку позже.</p>
            </div>
          )}

          {!loading && !error && sorted.length === 0 && (
            <div className={`${styles.emptyState} ${layout.fadeIn}`}>
              <div className={styles.emptyIcon}>⏳</div>
              <p>Здесь пока пусто</p>
              <p className={styles.emptyHint}>Вы еще не создали ни одной капсулы времени. Самое время оставить послание в будущее!</p>
              <a href="/create" className={`${layout.btnPrimaryLarge} ${layout.mt2}`}>Создать первую капсулу</a>
            </div>
          )}

          {!loading && !error && visible.map((c) => {
            const open = new Date(c.openAtUtc);
            const sealed = open.getTime() > now.getTime();
            
            return (
              <div key={c.id} className={`${styles.card} ${layout.fadeIn}`}>
                <div className={styles.cardHeader}>
                  <h2>{c.title || 'Без названия'}</h2>
                  <span className={`${styles.badge} ${sealed ? styles.badgeSealed : styles.badgeOpen}`}>
                    {sealed ? '🔒 Запечатано' : '🔓 Открыта'}
                  </span>
                </div>

                <div className={styles.cardInfo}>
                  <p className={styles.muted}>
                    <span>Тип содержимого:</span> 
                    <strong>{getContentTypeName(c.contentType)}</strong>
                  </p>
                  
                  {editingId === c.id ? (
                    <div className={styles.formGrid}>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Название капсулы</label>
                        <input
                          className={styles.input}
                          value={c.title}
                          placeholder="Введите название"
                          onChange={(e) =>
                            setItems((prev) => prev.map((x) => (x.id === c.id ? { ...x, title: e.target.value } : x)))
                          }
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Email получателя</label>
                        <input
                          className={styles.input}
                          type="email"
                          value={c.recipientEmail}
                          placeholder="email@example.com"
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((x) => (x.id === c.id ? { ...x, recipientEmail: e.target.value } : x)),
                            )
                          }
                        />
                      </div>
                      <div className={styles.row} style={{marginTop: '0.5rem'}}>
                        <button type="button" className={layout.btnPrimary} onClick={() => void saveCapsule(c)}>
                          💾 Сохранить изменения
                        </button>
                        <button type="button" className={`${layout.btnPrimary} ${layout.btnSecondary}`} style={{background: 'var(--ml-border-light)', color: 'var(--ml-text-main)'}} onClick={() => setEditingId(null)}>
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.muted}>
                      <span>Получатель:</span>
                      <strong>👤 {c.recipientEmail}</strong>
                    </p>
                  )}

                  <p className={styles.muted}>
                    <span>Дата открытия:</span>
                    <strong>📅 {open.toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                  </p>
                  
                  {sealed && (
                    <p className={styles.muted}>
                      <span>До вскрытия осталось:</span>
                      <span className={styles.countdown}>{formatCountdown(open, now)}</span>
                    </p>
                  )}
                </div>

                {editingId !== c.id && (
                  <div className={styles.cardActions}>
                    <button type="button" className={layout.btnPrimary} onClick={() => setEditingId(c.id)}>
                      ✏️ Редактировать
                    </button>
                    <button type="button" className={`${layout.btnPrimary} ${styles.btnDelete}`} style={{background: 'rgba(255,77,77,0.15)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)'}} onClick={() => void deleteCapsule(c.id)}>
                      🗑️ Удалить
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {!loading && !error && sorted.length > pageSize && (
            <div className={styles.pagination}>
              <button 
                type="button" 
                className={layout.btnPrimary} 
                disabled={pageIndex <= 1} 
                onClick={() => { setPageIndex((p) => p - 1); window.scrollTo(0, 0); }}
                style={{padding: '0.5rem 1rem'}}
              >
                ← Назад
              </button>
              <span className={styles.pageInfo}>{pageIndex} / {totalPages}</span>
              <button 
                type="button" 
                className={layout.btnPrimary} 
                disabled={pageIndex >= totalPages} 
                onClick={() => { setPageIndex((p) => p + 1); window.scrollTo(0, 0); }}
                style={{padding: '0.5rem 1rem'}}
              >
                Вперед →
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyCapsules;