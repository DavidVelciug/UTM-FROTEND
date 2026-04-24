import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import styles from '../styles/auth.module.css';
import { setCurrentUser, setRole, type AppRole } from '../auth/session';
import { fetchJson } from '../config/api';
import type { UserAccountDto, UserLoginResultDto } from '../types/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setSelectedRole] = useState<AppRole>('user');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const result = await fetchJson<UserLoginResultDto>('/api/user/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });
      if (!result.isSuccess || !result.userId) {
        setRole('guest');
        setError(result.message || 'Пользователь не найден.');
        return;
      }

      setRole(role);
      setCurrentUser(result.userId, result.displayName);
      navigate('/catalog');
    } catch (err: unknown) {
      setRole('guest');
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <div className={styles.authPage}>
          <div className={styles.authCard}>
            <h2>С возвращением</h2>
            <p>Войдите, чтобы управлять своими капсулами</p>

            <form className={styles.authForm} onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email адрес"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <select value={role} onChange={(e) => setSelectedRole(e.target.value as AppRole)} required>
                <option value="user">Пользователь</option>
                <option value="moderator">Модератор</option>
                <option value="admin">Администратор</option>
              </select>
              <button type="submit" className={`${layout.btnPrimary} ${layout.btnBlock}`}>
                {loading ? 'Входим…' : 'Войти'}
              </button>
            </form>
            {error && <p className={styles.authNote}>❌ {error}</p>}

            <Link to="#" className={styles.forgotLink}>
              Забыли пароль?
            </Link>

            <p className={styles.authNote}>
              Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setSelectedRole] = useState<AppRole>('user');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const payload: UserAccountDto = {
        id: 0,
        email,
        displayName: name,
        role: role === 'guest' ? 'user' : role,
        password,
        createdAtUtc: new Date().toISOString(),
        notifyEmailEnabled: true,
        notifyPushEnabled: true,
        loginAlertsEnabled: true,
      };
      const result = await fetchJson<{ isSuccess: boolean; message: string }>('/api/user', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!result.isSuccess) {
        setError(result.message);
        return;
      }

      setRole('guest');
      navigate('/login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <div className={styles.authPage}>
          <div className={styles.authCard}>
            <h2>Регистрация</h2>
            <p>Присоединяйтесь к хранилищу воспоминаний</p>

            <form className={styles.authForm} onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email адрес"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <select value={role} onChange={(e) => setSelectedRole(e.target.value as AppRole)} required>
                <option value="user">Пользователь</option>
                <option value="moderator">Модератор</option>
                <option value="admin">Администратор</option>
              </select>
              <button type="submit" className={`${layout.btnPrimary} ${layout.btnBlock}`}>
                {loading ? 'Создаём…' : 'Создать аккаунт'}
              </button>
            </form>
            {error && <p className={styles.authNote}>❌ {error}</p>}

            <p className={styles.authNote}>
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
