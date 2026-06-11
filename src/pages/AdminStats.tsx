import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CalendarChart from '../components/charts/CalendarChart';
import layout from '../styles/layout.module.css';
import statsStyles from '../styles/AdminStats.module.css';
import { fetchJson } from '../config/api';
import type { AdminStatsDto, CategoryDto, ResponceMsg, UserAccountDto, TimeCapsuleDto } from '../types/api';
import { useInView } from '../hooks/useInView';

const AdminStats: React.FC = () => {
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>(0.2);
  const { ref: sectionRef, inView: sectionInView } = useInView<HTMLDivElement>(0.15);
  const [data, setData] = useState<AdminStatsDto | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [users, setUsers] = useState<UserAccountDto[]>([]);
  const [capsules, setCapsules] = useState<TimeCapsuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryMessage, setCategoryMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [analytics, cats, allUsers, allCapsules] = await Promise.all([
          fetchJson<AdminStatsDto>('/api/admin/stats/getAnalytics'),
          fetchJson<CategoryDto[]>('/api/category/getAll'),
          fetchJson<UserAccountDto[]>('/api/user/getAll'),
          fetchJson<TimeCapsuleDto[]>('/api/timecapsule/getAll'),
        ]);
        if (!cancelled) {
          setData(analytics);
          setCategories(cats);
          setUsers(allUsers);
          setCapsules(allCapsules);
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

  const deleteCategory = async (id: number) => {
    try {
      const res = await fetchJson<ResponceMsg>(categoryDeleteUrl(id), { method: 'DELETE' });
      setCategoryMessage(res.message);
      const cats = await fetchJson<CategoryDto[]>('/api/category/getAll');
      setCategories(cats);
      setTimeout(() => setCategoryMessage(null), 3000);
    } catch (e: unknown) {
      setCategoryMessage(e instanceof Error ? e.message : 'Ошибка при удалении');
    }
  };

  return (
    <div className={`${layout.pageWrapper} ${layout.withBg}`}>
      <Header />
      <main className={layout.mainContent}>
        <div ref={headerRef} className={`${statsStyles.pageHeader} ${layout.fadeInUp} ${headerInView ? layout.fadeInUpVisible : ''}`}>
          <h1>Админ-Панель</h1>
          <p>Мониторинг активности пользователей и глобальная конфигурация экосистемы в реальном времени.</p>
        </div>

        <div ref={sectionRef} className={`${statsStyles.section} ${layout.container} ${layout.fadeInUp} ${sectionInView ? layout.fadeInUpVisible : ''}`}>
          {loading && (
            <div className={statsStyles.loadingState}>
              <div className={statsStyles.loader} />
              <p className={statsStyles.muted}>Формируем отчеты...</p>
            </div>
          )}

          {error && <div className={statsStyles.errorState}>{error}</div>}

          {data && (
            <div className={statsStyles.calendarGridWrapper}>
              <CalendarChart<TimeCapsuleDto>
                icon="📦"
                title="Активность создания капсул"
                points={data.capsulesCreatedByDay}
                accentCssVar="--ml-calendar-cap"
                items={capsules}
                detailTitle="Созданные капсулы"
                emptyDetail="В этот день капсулы не создавались"
                renderItem={(c) => (
                  <>
                    <span className={statsStyles.detailItemTitle}>{c.title}</span>
                    <span className={statsStyles.detailItemMeta}>
                      {c.ownerDisplayName ?? `#${c.ownerUserId}`}
                      {' · '}
                      {c.isPublic ? 'публичная' : 'приватная'}
                    </span>
                  </>
                )}
              />
              <CalendarChart<UserAccountDto>
                icon="👤"
                title="Динамика регистраций"
                points={data.userRegistrationsByDay}
                accentCssVar="--ml-calendar-reg"
                items={users}
                detailTitle="Зарегистрированные пользователи"
                emptyDetail="В этот день никто не зарегистрировался"
                renderItem={(u) => (
                  <>
                    <span className={statsStyles.detailItemTitle}>{u.displayName}</span>
                    <span className={statsStyles.detailItemMeta}>
                      {u.email}
                      {' · '}
                      {u.role}
                    </span>
                  </>
                )}
              />
            </div>
          )}

          <div className={`${statsStyles.card} ${statsStyles.categoryPanel}`}>
            <h2 className={statsStyles.categoryHeading}>Категории в каталоге</h2>
            <p className={statsStyles.muted}>Управление классификацией контента в глобальном каталоге.</p>

            {categoryMessage && <div className={statsStyles.statusMsg}>{categoryMessage}</div>}

            <ul className={statsStyles.categoryList}>
              {categories.map((c) => (
                <li key={c.id} className={statsStyles.categoryItem}>
                  <div className={statsStyles.categoryInfo}>
                    <span className={statsStyles.categoryName}>{c.name}</span>
                    <span className={statsStyles.categoryId}>#{c.id}</span>
                  </div>
                  <button
                    className={statsStyles.deleteCatBtn}
                    onClick={() => void deleteCategory(c.id)}
                    aria-label={`Удалить категорию ${c.name}`}
                  >
                    ✕
                  </button>
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
