import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import styles from '../styles/openedCapsules.module.css';
import { getOpenedCapsules, type OpenedCapsuleItem } from '../auth/capsuleStore';
import { fetchJson } from '../config/api';
import { getCurrentUserId } from '../auth/session';
import type { TimeCapsuleDto } from '../types/api';

const normalizeOpenedFrom = (val: string | null | undefined): string | undefined => {
  if (!val) return undefined;
  const map: Record<string, string> = {
    'Лента': 'Публичная капсула',
    'Каталог': 'Капсула каталога',
    'Присланные капсулы': 'Присланная капсула',
  };
  return map[val] ?? val;
};

const normalizeItems = (items: OpenedCapsuleItem[]): OpenedCapsuleItem[] =>
  items.map((c) => ({
    ...c,
    openedFrom: normalizeOpenedFrom(c.openedFrom) ?? c.openedFrom,
  }));

const OpenedCapsules: React.FC = () => {
  const userId = getCurrentUserId();
  const [items, setItems] = useState(normalizeItems(getOpenedCapsules()));
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [sortByMode, setSortByMode] = useState<'all' | 'Моя капсула' | 'Присланная капсула' | 'Публичная капсула' | 'Гео-капсула' | 'Капсула каталога'>('all');
  const [filterByTime, setFilterByTime] = useState<'all' | 'week' | 'month' | '3months' | '12months'>('all');
  const [filterByContentType, setFilterByContentType] = useState<'all' | 'text' | 'link' | 'file'>('all');
  const pageSize = 9;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void fetchJson<TimeCapsuleDto[]>(`/api/timecapsule/getOpenedForUser?userId=${userId}`)
      .then((serverCapsules) => {
        const local = normalizeItems(getOpenedCapsules());
        const merged = [...local];
        serverCapsules.forEach((c) => {
          if (!merged.some((x) => x.id === c.id)) {
            const normalized = normalizeOpenedFrom(c.openedFrom);
            merged.push({
              ...c,
              openedAtUtc: c.openedAtUtc ?? c.openAtUtc,
              openedFrom: normalized ?? (c.ownerUserId === userId ? 'Моя капсула' : c.isPublic ? 'Публичная капсула' : 'Присланная капсула'),
            });
          }
        });
        setItems(merged);
      })
      .catch(() => setItems(normalizeItems(getOpenedCapsules())))
      .finally(() => setLoading(false));
  }, [userId]);

  const sortedAndFiltered = useMemo(() => {
    let result = [...items];

    if (sortByMode !== 'all') {
      result = result.filter((item) => (item.openedFrom ?? '') === sortByMode);
    }

    if (filterByContentType !== 'all') {
      const typeMap: Record<string, number> = { text: 0, link: 1, file: 2 };
      result = result.filter((item) => item.contentType === typeMap[filterByContentType]);
    }

    if (filterByTime !== 'all') {
      const now = new Date();
      const timeLimits: Record<string, number> = {
        week: 7,
        month: 30,
        '3months': 90,
        '12months': 365,
      };
      const maxDays = timeLimits[filterByTime];
      result = result.filter((item) => {
        const date = new Date(item.openedAtUtc ?? item.openAtUtc);
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= maxDays;
      });
    }

    return result;
  }, [items, sortByMode, filterByTime, filterByContentType]);

  const totalPages = Math.max(1, Math.ceil(sortedAndFiltered.length / pageSize));
  const paginatedItems = sortedAndFiltered.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

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
                <>
                  <div className={styles.filterRow}>
                    <div className={styles.selectWrapper}>
                      <select
                        className={styles.filterSelect}
                        value={sortByMode}
                        onChange={(e) => {
                          setSortByMode(e.target.value as 'all' | 'Моя капсула' | 'Присланная капсула' | 'Публичная капсула' | 'Гео-капсула' | 'Капсула каталога');
                          setPageIndex(1);
                        }}
                      >
                        <option value="all">Все режимы</option>
                        <option value="Моя капсула">Моя капсула</option>
                        <option value="Присланная капсула">Присланные капсулы</option>
                        <option value="Публичная капсула">Публичная капсула</option>
                        <option value="Гео-капсула">Гео-капсула</option>
                        <option value="Капсула каталога">Капсула каталога</option>
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

                    <div className={styles.selectWrapper}>
                      <select
                        className={styles.filterSelect}
                        value={filterByContentType}
                        onChange={(e) => {
                          setFilterByContentType(e.target.value as 'all' | 'text' | 'link' | 'file');
                          setPageIndex(1);
                        }}
                      >
                        <option value="all">Все типы</option>
                        <option value="text">Текстовой</option>
                        <option value="link">Веб-ссылка</option>
                        <option value="file">Файлы</option>
                      </select>
                    </div>
                  </div>

                  {sortedAndFiltered.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>Нет капсул, соответствующих выбранным фильтрам.</p>
                    </div>
                  ) : (
                    <>
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

                      {sortedAndFiltered.length > pageSize && (
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
                </>
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