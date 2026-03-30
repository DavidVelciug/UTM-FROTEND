import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Landing: React.FC = () => {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Письма в будущее
            </h1>
            <p className="hero-description">
              Создайте цифровое наследие, которое откроется в нужный момент.
              Сохраните свои воспоминания для себя и близких.
            </p>
            <div className="hero-stats">
              <div>
                <strong>12k+</strong>
                <span>Капсул создано</span>
              </div>
              <div>
                <strong>8k+</strong>
                <span>Уже открыто</span>
              </div>
            </div>
            <div className="hero-button-container">
              <Link to="/catalog" className="btn-primary-large">
                Перейти к каталогу
              </Link>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2>Как это работает</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Создайте</h3>
              <p>Напишите письмо, загрузите фото или видео</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Запечатайте</h3>
              <p>Выберите дату открытия</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3>Ждите</h3>
              <p>Мы сохраним это в безопасности</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3>Вспоминайте</h3>
              <p>Получите доступ в назначенный день</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;