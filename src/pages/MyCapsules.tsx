import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import page from '../styles/pageSection.module.css';
import catalog from '../styles/catalog.module.css';
import { fetchJson } from '../config/api';
import { getCurrentUserId } from '../auth/session';
import type { TimeCapsuleDto } from '../types/api';

function formatCountdown(target: Date, now: Date): string {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 'Открыта';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return `${days}д ${hours}ч ${mins}м ${secs}с`;
}

const MyCapsules: React.FC = () => {
  const userId = getCurrentUserId();
  const [items, setItems] = useState<TimeCapsuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

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
          setError('Сначала выполните вход.');
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
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка загрузки');
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

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <div className={page.pageHeader}>
          <h1>Мои капсулы</h1>
          <p>Запечатанные сообщения и таймер до даты открытия для текущего аккаунта.</p>
        </div>
        <div className={`${page.section} ${layout.container}`}>
          {loading && (
            <div className={catalog.loadingState}>
              <div className={catalog.loader} />
              <p className={page.muted}>Загружаем ваши капсулы…</p>
            </div>
          )}
          {error && (
            <div className={catalog.errorState}>
              <p>❌ {error}</p>
              <p className={page.hint}>Убедитесь, что API запущен и доступен по proxy /api.</p>
            </div>
          )}
          {!loading && !error && sorted.length === 0 && (
            <div className={catalog.emptyState}>
              <p>Капсул пока нет</p>
              <p className={catalog.emptyHint}>Создайте первую на странице «Создание капсулы».</p>
            </div>
          )}
          {!loading &&
            !error &&
            sorted.map((c) => {
              const open = new Date(c.openAtUtc);
              const sealed = open.getTime() > now.getTime();
              return (
                <div key={c.id} className={page.card}>
                  <div className={page.row} style={{ justifyContent: 'space-between' }}>
                    <h2>{c.title}</h2>
                    <span className={sealed ? page.badge : `${page.badge} ${page.badgeWarn}`}>
                      {sealed ? 'Запечатано' : 'Открыта'}
                    </span>
                  </div>
                  <p className={page.muted}>
                    Тип: {c.contentType === 0 ? 'Текст' : c.contentType === 1 ? 'Ссылка' : 'Файл'} · Получатель:{' '}
                    {c.recipientEmail}
                  </p>
                  <p className={page.muted}>
                    Открытие: {open.toLocaleString('ru-RU')}
                    {sealed && (
                      <>
                        {' '}
                        · До открытия: <strong>{formatCountdown(open, now)}</strong>
                      </>
                    )}
                  </p>
                </div>
              );
            })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyCapsules;
