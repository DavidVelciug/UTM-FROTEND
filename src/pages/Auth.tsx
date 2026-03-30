import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/catalog');
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <div className="auth-page">
          <div className="auth-card">
            <h2>С возвращением</h2>
            <p>Войдите, чтобы управлять своими капсулами</p>
            
            <form className="auth-form" onSubmit={handleSubmit}>
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
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Войти
              </button>
            </form>

            <Link to="#" className="forgot-link">
              Забыли пароль?
            </Link>
            
            <p className="auth-note">
              Нет аккаунта?{' '}
              <Link to="/register">Зарегистрироваться</Link>
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
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <div className="auth-page">
          <div className="auth-card">
            <h2>Регистрация</h2>
            <p>Присоединяйтесь к хранилищу воспоминаний</p>
            
            <form className="auth-form" onSubmit={handleSubmit}>
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
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Создать аккаунт
              </button>
            </form>
            
            <p className="auth-note">
              Уже есть аккаунт?{' '}
              <Link to="/login">Войти</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};