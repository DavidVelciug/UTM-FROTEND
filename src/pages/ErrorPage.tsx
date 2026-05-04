import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import page from '../styles/pageSection.module.css';

type Props = {
  code: 401 | 402 | 403 | 404 | 500;
  title: string;
  message: string;
};

const ErrorPage: React.FC<Props> = ({ code, title, message }) => (
  <div className={layout.pageWrapper}>
    <Header />
    <main className={layout.mainContent}>
      <section className={`${page.section} ${layout.container}`}>
        <article className={page.card}>
          <h1>{code} — {title}</h1>
          <p className={page.muted}>{message}</p>
        </article>
      </section>
    </main>
    <Footer />
  </div>
);

export default ErrorPage;
