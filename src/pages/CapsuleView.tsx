import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import page from '../styles/pageSection.module.css';
import { products } from '../data/products';

const CapsuleView: React.FC = () => {
  const { capsuleId } = useParams<{ capsuleId: string }>();
  const product = products.find((p) => p.id === Number(capsuleId));

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <div className={page.pageHeader}>
          <h1>Содержимое капсулы</h1>
          <p>Информация о пользователе, который создал капсулу.</p>
        </div>
        <div className={`${page.section} ${layout.container}`}>
          {!product && <div className={page.card}>Капсула не найдена.</div>}
          {product && (
            <article className={page.card}>
              <h2>{product.name}</h2>
              <p className={page.muted}>{product.description}</p>
              <p>
                <strong>Автор:</strong> {product.creatorName}
              </p>
              <p>
                <strong>Email автора:</strong> {product.creatorEmail}
              </p>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CapsuleView;
