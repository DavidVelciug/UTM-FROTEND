import React from 'react';

interface HeroProps {
  onCtaClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Письма в будущее
        </h1>
        <p className="hero-description">
          Создайте цифровое наследие, которое откроется в нужный момент.
          Сохраните свои воспоминания для себя и близких.
        </p>
        <button onClick={onCtaClick} className="btn-primary">
          Перейти к каталогу
        </button>
      </div>
    </section>
  );
};

export default Hero;