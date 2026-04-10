import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import styles from '../styles/auth.module.css';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/catalog');
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
              <button type="submit" className={`${layout.btnPrimary} ${layout.btnBlock}`}>
                Войти
              </button>
            </form>

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
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/login');
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
              <button type="submit" className={`${layout.btnPrimary} ${layout.btnBlock}`}>
                Создать аккаунт
              </button>
            </form>

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