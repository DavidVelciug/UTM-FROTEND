import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import statsStyles from '../styles/AdminStats.module.css';
import { fetchJson } from '../config/api';
import type { AdminStatsDto, CategoryDto, ResponceMsg, TimeSeriesPointDto, UserAccountDto, TimeCapsuleDto } from '../types/api';

function categoryDeleteUrl(id: number): string {
  return `/api/category/id?id=${id}`;
}

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

interface DetailItem {
  createdAtUtc: string;
}

interface CalendarChartProps<T extends DetailItem> {
  title: string;
  points: TimeSeriesPointDto[];
  icon: string;
  accentCssVar: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  detailTitle: string;
  emptyDetail: string;
}

function CalendarChart<T extends DetailItem>({ title, points, icon, accentCssVar, items, renderItem, detailTitle, emptyDetail }: CalendarChartProps<T>) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const countByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of points) {
      const key = (p.date.split('T')[0] || p.date).slice(0, 10);
      map.set(key, p.count);
    }
    return map;
  }, [points]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, T[]>();
    for (const item of items) {
      const key = (item.createdAtUtc.split('T')[0] || item.createdAtUtc).slice(0, 10);
      const arr = map.get(key);
      if (arr) arr.push(item);
      else map.set(key, [item]);
    }
    return map;
  }, [items]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;

  const prevMonth = useCallback(() => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  }, [month]);

  const nextMonth = useCallback(() => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  }, [month]);

  const dateKey = (d: number) => `${year}-${pad(month + 1)}-${pad(d)}`;

  const cells: (number | null)[] = Array.from({ length: startOffset }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const total = points.reduce((s, p) => s + p.count, 0);
  const selectedItems = selectedDate ? itemsByDate.get(selectedDate) ?? [] : [];

  return (
    <div className={statsStyles.calendarCard}>
      <div className={statsStyles.calendarTitleRow}>
        <span className={statsStyles.calendarIcon}>{icon}</span>
        <span className={statsStyles.calendarTitle}>{title}</span>
        <span className={statsStyles.calendarTotal}>+{total}</span>
      </div>

      <div className={statsStyles.calendarNav}>
        <button className={statsStyles.navBtn} onClick={prevMonth} aria-label="Предыдущий месяц">‹</button>
        <span className={statsStyles.monthLabel}>{MONTHS[month]} {year}</span>
        <button className={statsStyles.navBtn} onClick={nextMonth} aria-label="Следующий месяц">›</button>
      </div>

      <div className={statsStyles.calendarGrid}>
        {WEEKDAYS.map(wd => (
          <div key={wd} className={statsStyles.weekdayHeader}>{wd}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} className={statsStyles.dayCell} />;
          const key = dateKey(day);
          const cnt = countByDate.get(key);
          const isSelected = key === selectedDate;
          return (
            <div
              key={key}
              className={`${statsStyles.dayCell} ${cnt != null ? statsStyles.hasData : ''} ${isSelected ? statsStyles.selected : ''}`}
              onClick={cnt != null ? () => setSelectedDate(selectedDate === key ? null : key) : undefined}
              role={cnt != null ? 'button' : undefined}
              tabIndex={cnt != null ? 0 : undefined}
              onKeyDown={cnt != null ? (e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedDate(selectedDate === key ? null : key); } : undefined}
            >
              <span className={statsStyles.dayNumber}>{day}</span>
              {cnt != null && (
                <span className={statsStyles.dayCount} style={{ background: `var(${accentCssVar})` }}>
                  {cnt}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className={statsStyles.detailSection}>
          <div className={statsStyles.detailHeader}>{detailTitle} — {selectedDate}</div>
          {selectedItems.length === 0 ? (
            <div className={statsStyles.detailEmpty}>{emptyDetail}</div>
          ) : (
            <div className={statsStyles.detailList}>
              {selectedItems.map((item, idx) => (
                <div key={idx} className={statsStyles.detailItem}>
                  {renderItem(item)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const AdminStats: React.FC = () => {
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

          <div className={`${statsStyles.card} ${statsStyles.categoryPanel} ${layout.fadeIn}`}>
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
