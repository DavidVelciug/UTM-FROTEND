import React, { useCallback, useMemo, useState } from 'react';
import statsStyles from '../../styles/AdminStats.module.css';
import type { TimeSeriesPointDto } from '../../types/api';

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

export default CalendarChart;
