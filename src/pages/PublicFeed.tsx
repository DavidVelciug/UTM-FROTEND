import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import page from '../styles/pageSection.module.css';
import catalog from '../styles/catalog.module.css';
import { fetchJson } from '../config/api';
import type { TimeCapsuleDto } from '../types/api';

const PublicFeed: React.FC = () => {
  const [items, setItems] = useState<TimeCapsuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchJson<TimeCapsuleDto[]>('/api/timecapsule/getPublicFeed');
        if (!cancelled) {
          setItems(data);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const preview = (c: TimeCapsuleDto) => {
    if (c.contentType === 1 && c.linkUrl) return c.linkUrl;
    if (c.textContent) return c.textContent.slice(0, 220) + (c.textContent.length > 220 ? '…' : '');
    return c.fileStoragePath ?? 'Содержимое скрыто';
  };

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <div className={page.pageHeader}>
          <h1>Публичные воспоминания</h1>
          <p>Лента уже открытых публичных капсул — как блог воспоминаний.</p>
        </div>
        <div className={`${page.section} ${layout.container}`}>
          {loading && (
            <div className={catalog.loadingState}>
              <div className={catalog.loader} />
              <p>Загружаем ленту…</p>
            </div>
          )}
          {error && (
            <div className={catalog.errorState}>
              <p>❌ {error}</p>
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <div className={catalog.emptyState}>
              <p>Пока нет открытых публичных капсул</p>
            </div>
          )}
          {!loading &&
            !error &&
            items.map((c) => (
              <article key={c.id} className={page.card}>
                <div className={page.row} style={{ justifyContent: 'space-between' }}>
                  <h2>{c.title}</h2>
                  <span className={page.badge}>{c.ownerDisplayName ?? 'Аноним'}</span>
                </div>
                <p className={page.muted}>{preview(c)}</p>
                <p className={page.hint}>
                  Открыта {new Date(c.openAtUtc).toLocaleString('ru-RU')} · Создана{' '}
                  {new Date(c.createdAtUtc).toLocaleDateString('ru-RU')}
                </p>
              </article>
            ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicFeed;