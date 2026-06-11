import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CapsuleContentPreview from '../components/CapsuleContentPreview';
import Pagination from '../components/common/Pagination';
import layout from '../styles/layout.module.css';
import styles from '../styles/sentCapsules.module.css';
import { fetchJson } from '../config/api';
import { getCurrentUserId } from '../auth/session';
import { resolveMediaUrl } from '../utils/file';
import { formatCountdown } from '../utils/date';
import type { TimeCapsuleDto } from '../types/api';
import { useInView } from '../hooks/useInView';

const contentTypeLabels: Record<number, string> = {
  0: 'Текстовое содержимое',
  1: 'Веб-ссылка',
  2: 'Файловое вложение',
};

const SentCapsules: React.FC = () => {
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>(0.2);
  const { ref: sectionRef, inView: sectionInView } = useInView<HTMLDivElement>(0.15);
  const navigate = useNavigate();
  const userId = getCurrentUserId();
  const [items, setItems] = useState<TimeCapsuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [now, setNow] = useState(() => new Date());
  const [lockedCapsule, setLockedCapsule] = useState<TimeCapsuleDto | null>(null);
  const [filterLock, setFilterLock] = useState<'all' | 'locked' | 'unlocked'>('all');
  const [filterByTime, setFilterByTime] = useState<'all' | 'week' | 'month' | '3months' | '12months'>('all');
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

  const filteredAndSorted = useMemo(() => {
    let result = [...items];

    if (filterLock !== 'all') {
      result = result.filter((item) => {
        const openAt = new Date(item.openAtUtc);
        const locked = openAt.getTime() > now.getTime();
        return filterLock === 'locked' ? locked : !locked;
      });
    }

    if (filterByTime !== 'all') {
      const timeLimits: Record<string, number> = {
        week: 7,
        month: 30,
        '3months': 90,
        '12months': 365,
      };
      const maxDays = timeLimits[filterByTime];
      result = result.filter((item) => {
        const date = new Date(item.createdAtUtc);
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= maxDays;
      });
    }

    result.sort((a, b) => {
      return new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime();
    });

    return result;
  }, [items, filterLock, filterByTime, now]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const visible = filteredAndSorted.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

  return (
    <div className={`${layout.pageWrapper} ${layout.withBg}`}>
      <Header />
      <main className={layout.mainContent}>
        <div ref={headerRef} className={`${styles.pageHeader} ${layout.fadeInUp} ${headerInView ? layout.fadeInUpVisible : ''}`}>
          <h1>Присланные капсулы</h1>
          <p>Послания из прошлого, отправленные специально для вас. Дождитесь нужного момента, чтобы раскрыть их тайны.</p>
        </div>

        <div ref={sectionRef} className={`${styles.section} ${layout.container} ${layout.fadeInUp} ${sectionInView ? layout.fadeInUpVisible : ''}`}>
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.loader} />
              <p className={layout.textGradient}>Синхронизация с временным потоком...</p>
            </div>
          )}

          {error && <div className={styles.errorState}>{error}</div>}

          {!loading && !error && (
            <>
              {items.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>В вашем архиве пока пусто. Капсулы появятся здесь, когда кто-то отправит их вам.</p>
                </div>
              ) : (
                <>
                  <div className={styles.filterRow}>
                    <div className={styles.selectWrapper}>
                      <select
                        className={styles.filterSelect}
                        value={filterLock}
                        onChange={(e) => {
                          setFilterLock(e.target.value as 'all' | 'locked' | 'unlocked');
                          setPageIndex(1);
                        }}
                      >
                        <option value="all">Все капсулы</option>
                        <option value="locked">Нельзя открыть</option>
                        <option value="unlocked">Можно открыть</option>
                      </select>
                    </div>

                    <div className={styles.selectWrapper}>
                      <select
                        className={styles.filterSelect}
                        value={filterByTime}
                        onChange={(e) => {
                          setFilterByTime(e.target.value as 'all' | 'week' | 'month' | '3months' | '12months');
                          setPageIndex(1);
                        }}
                      >
                        <option value="all">За всё время</option>
                        <option value="week">Неделя</option>
                        <option value="month">Месяц</option>
                        <option value="3months">3 месяца</option>
                        <option value="12months">12 месяцев</option>
                      </select>
                    </div>
                  </div>

                  {filteredAndSorted.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>Нет капсул, соответствующих выбранным фильтрам.</p>
                    </div>
                  ) : (
                    <>
                      <div className={styles.grid}>
                        {visible.map((item) => {
                          const openAt = new Date(item.openAtUtc);
                          const locked = openAt.getTime() > now.getTime();
                          return (
                            <article key={item.id} className={styles.card}>
                              <div className={styles.cardImage}>
                                <img src="/assets/closecapsule.png" alt="" className={styles.capsuleBg} />
                                <h2 className={styles.cardTitle}>{item.title || 'Безымянная капсула'}</h2>
                                <p className={styles.muted}>{contentTypeLabels[item.contentType] ?? 'Неизвестный тип'}</p>

                                <div className={styles.cardContent}>
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
                                </div>
                              </div>

                              <div className={styles.cardActions}>
                                <div className={styles.actionRow}>
                                  <button
                                    type="button"
                                    className={styles.viewBtn}
                                    onClick={() => {
                                      if (locked) {
                                        setLockedCapsule(item);
                                        return;
                                      }
                                      navigate(`/feed-capsule/${item.id}?source=sent`);
                                    }}
                                  >
                                    {locked ? 'Капсула запечатана' : 'Распаковать сейчас'}
                                  </button>
                                  <div className={styles.infoWrap}>
                                    <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="16" x2="12" y2="12" />
                                      <line x1="12" y1="8" x2="12.01" y2="8" />
                                    </svg>
                                    <div className={styles.tooltip}>
                                      <p className={styles.tooltipItem}>
                                        <span className={styles.tooltipLabel}>Отправитель:</span>
                                        <span>{item.ownerDisplayName || 'Аноним'}</span>
                                      </p>
                                      <p className={styles.tooltipItem}>
                                        <span className={styles.tooltipLabel}>Дата открытия:</span>
                                        <span>{openAt.toLocaleDateString('ru-RU')}</span>
                                      </p>
                                      <p className={styles.tooltipItem}>
                                        <span className={styles.tooltipLabel}>До вскрытия:</span>
                                        <span>{formatCountdown(openAt, now)}</span>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>

                      {filteredAndSorted.length > pageSize && <Pagination page={pageIndex} totalPages={totalPages} onPageChange={(p) => { setPageIndex(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

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

      <Footer />
    </div>
  );
};

export default SentCapsules;
