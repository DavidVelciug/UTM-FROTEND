import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import statsStyles from '../styles/AdminStats.module.css';
import { fetchJson } from '../config/api';
import type { AdminStatsDto, CategoryDto, ResponceMsg, TimeSeriesPointDto } from '../types/api';

function AestheticChart({ title, points, icon }: { title: string; points: TimeSeriesPointDto[], icon: string }) {
  const max = useMemo(() => Math.max(1, ...points.map((p) => p.count)), [points]);
  
  return (
    <div className={`${statsStyles.chartCard} ${layout.fadeIn}`}>
      <div className={statsStyles.chartTitle}>
        <span>{icon}</span> {title}
      </div>
      <div className={statsStyles.chartContainer}>
        {points.map((p) => (
          <div key={p.date} className={statsStyles.chartBarWrapper}>
            <div className={statsStyles.barValue}>{p.count}</div>
            <div 
              className={statsStyles.chartBar} 
              style={{ height: `${(p.count / max) * 100}%` }}
            >
            </div>
            <div className={statsStyles.barDate}>
              {new Date(p.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const AdminStats: React.FC = () => {
  const [data, setData] = useState<AdminStatsDto | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryMessage, setCategoryMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [analytics, cats] = await Promise.all([
          fetchJson<AdminStatsDto>('/api/admin/stats/getAnalytics'),
          fetchJson<CategoryDto[]>('/api/category/getAll'),
        ]);
        if (!cancelled) {
          setData(analytics);
          setCategories(cats);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка доступа к данным');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const addCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      const res = await fetchJson<ResponceMsg>('/api/category', {
        method: 'POST',
        body: JSON.stringify({ id: 0, name }),
      });
      setCategoryMessage(res.message);
      const cats = await fetchJson<CategoryDto[]>('/api/category/getAll');
      setCategories(cats);
      setNewCategoryName('');
      setTimeout(() => setCategoryMessage(null), 3000);
    } catch (e: unknown) {
      setCategoryMessage(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  return (
    <div className={`${layout.pageWrapper} ${layout.withBg}`}>
      <Header />
        <main className={layout.mainContent}>
        <div className={statsStyles.pageHeader}>
          <h1>Админ-Панель</h1>
          <p>Мониторинг активности пользователей и глобальная конфигурация экосистемы в реальном времени.</p>
        </div>

        <div className={`${statsStyles.section} ${layout.container}`}>
          {loading && (
            <div className={statsStyles.loadingState}>
              <div className={statsStyles.loader} />
              <p className={statsStyles.muted}>Формируем отчеты...</p>
            </div>
          )}

          {error && <div className={statsStyles.errorState}>{error}</div>}

          {data && (
            <>
              <div className={`${statsStyles.card} ${layout.fadeIn}`}>
                <div className={statsStyles.summary}>
                  <div className={statsStyles.summaryItem}>
                    <span className={statsStyles.summaryLabel}>Новые пользователи</span>
                    <span className={statsStyles.summaryValue}>
                      {data.userRegistrationsByDay.reduce((acc, x) => acc + x.count, 0)}
                    </span>
                  </div>
                  <div className={statsStyles.summaryItem}>
                    <span className={statsStyles.summaryLabel}>Создано капсул</span>
                    <span className={statsStyles.summaryValue}>
                      {data.capsulesCreatedByDay.reduce((acc, x) => acc + x.count, 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={statsStyles.chartGrid}>
                <AestheticChart 
                  icon="👤"
                  title="Динамика регистраций" 
                  points={data.userRegistrationsByDay} 
                />
                <AestheticChart 
                  icon="📦"
                  title="Активность создания капсул" 
                  points={data.capsulesCreatedByDay} 
                />
              </div>
            </>
          )}

          <div className={`${statsStyles.card} ${statsStyles.categoryPanel} ${layout.fadeIn}`}>
            <h2 className={statsStyles.categoryHeading}>Категории платформы</h2>
            <p className={statsStyles.muted}>Управление классификацией контента в глобальном каталоге.</p>
            
            {categoryMessage && <div className={statsStyles.statusMsg}>{categoryMessage}</div>}
            
            <ul className={statsStyles.categoryList}>
              {categories.map((c) => (
                <li key={c.id} className={statsStyles.categoryItem}>
                  <span style={{fontWeight: 700}}>{c.name}</span>
                  <span className={statsStyles.categoryId}>#{c.id}</span>
                </li>
              ))}
            </ul>

            <div className={statsStyles.categoryForm}>
              <input
                className={statsStyles.categoryInput}
                placeholder="Название новой категории..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <button type="button" className={layout.btnPrimaryLarge} onClick={() => void addCategory()}>
                Добавить категорию
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminStats;