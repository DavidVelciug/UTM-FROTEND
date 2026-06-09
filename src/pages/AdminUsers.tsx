import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import styles from '../styles/adminUsers.module.css';
import { fetchJson } from '../config/api';
import { getAvatarByUserId } from '../auth/avatar';
import { resolveUserAvatar } from '../utils/file';
import type { ResponceMsg, UserAccountDto } from '../types/api';

type SortMode = 'newest' | 'oldest' | 'name-asc';
type SearchMode = 'name' | 'email';
type EditableRole = 'user' | 'moderator';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserAccountDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [searchMode, setSearchMode] = useState<SearchMode>('name');
  const [query, setQuery] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchJson<UserAccountDto[]>('/api/user/getAll');
      setUsers(data);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const visibleUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = users.filter((u) => {
      if (!q) return true;
      if (searchMode === 'email') return u.email.toLowerCase().includes(q);
      return u.displayName.toLowerCase().includes(q);
    });

    return filtered.sort((a, b) => {
      if (sortMode === 'name-asc') {
        return a.displayName.localeCompare(b.displayName, 'ru-RU');
      }
      if (sortMode === 'oldest') {
        return new Date(a.createdAtUtc).getTime() - new Date(b.createdAtUtc).getTime();
      }
      return new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime();
    });
  }, [query, searchMode, sortMode, users]);

  const pagedUsers = visibleUsers.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

  const updateRole = async (user: UserAccountDto, role: EditableRole) => {
    setMessage(null);
    try {
      const res = await fetchJson<ResponceMsg>('/api/user', {
        method: 'PUT',
        body: JSON.stringify({ ...user, role }),
      });
      setMessage(res.message);
      await loadUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Ошибка изменения роли');
    }
  };

  return (
    <div className={`${layout.pageWrapper} ${layout.withBg}`}>
      <Header />
        <main className={layout.mainContent}>
        <div className={styles.pageHeader}>
          <h1 className={layout.fadeIn}>Управление пользователями</h1>
          <p className={layout.fadeIn}>Администрирование ролей, поиск и фильтрация участников сообщества.</p>
        </div>

        <div className={`${styles.section} ${layout.container}`}>
          <div className={`${styles.card} ${layout.fadeIn}`}>
            <div className={styles.row}>
              <input
                className={styles.input}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPageIndex(1); }}
                placeholder="Поиск по имени или почте..."
              />
              <select className={styles.select} value={searchMode} onChange={(e) => setSearchMode(e.target.value as SearchMode)}>
                <option value="name">По имени</option>
                <option value="email">По почте</option>
              </select>
              <select className={styles.select} value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
                <option value="name-asc">По алфавиту</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.loader} />
              <p className={styles.muted}>Синхронизация данных...</p>
            </div>
          )}

          {error && <div className={styles.errorState}>{error}</div>}
          
          {message && <div className={styles.card} style={{borderColor: 'var(--ml-primary-color)', textAlign: 'center'}}>{message}</div>}

          {!loading && !error && (
            <div className={layout.fadeIn}>
              {pagedUsers.map((u) => (
                <article key={u.id} className={styles.card}>
                  <div className={styles.userRow}>
                    <img
                      className={styles.avatar}
                      src={getAvatarByUserId(u.id) || resolveUserAvatar(u.id, u.displayName)}
                      alt=""
                      onError={(e) => { e.currentTarget.src = '/assets/default-avatar.svg'; }}
                    />
                    <div className={styles.userInfo}>
                      <strong className={styles.userName}>{u.displayName}</strong>
                      <span className={styles.muted}>{u.email}</span>
                    </div>
                    <span className={styles.badge}>{u.role}</span>
                  </div>
                  
                  <div className={styles.row} style={{ marginTop: '1.5rem', justifyContent: 'space-between', borderTop: '1px solid var(--ml-border-light)', paddingTop: '1.5rem' }}>
                    <span className={styles.muted}>Регистрация: {new Date(u.createdAtUtc).toLocaleDateString('ru-RU')}</span>
                    {u.role !== 'admin' && (
                      <div className={styles.row}>
                        <button type="button" className={layout.btnPrimary} onClick={() => updateRole(u, 'user')}>
                          Сделать пользователем
                        </button>
                        <button type="button" className={layout.btnPrimary} onClick={() => updateRole(u, 'moderator')}>
                          Назначить модератором
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}

              {visibleUsers.length > pageSize && (
                <div className={styles.pagination}>
                  <button type="button" className={layout.btnPrimary} disabled={pageIndex <= 1} onClick={() => setPageIndex((p) => p - 1)}>
                    Назад
                  </button>
                  <span className={styles.muted}>Страница {pageIndex} из {Math.ceil(visibleUsers.length / pageSize)}</span>
                  <button type="button" className={layout.btnPrimary} disabled={pageIndex >= Math.ceil(visibleUsers.length / pageSize)} onClick={() => setPageIndex((p) => p + 1)}>
                    Вперед
                  </button>
                </div>
              )}

              {visibleUsers.length === 0 && (
                <div className={styles.errorState}>
                  <p>Пользователи не найдены по вашему запросу</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUsers;