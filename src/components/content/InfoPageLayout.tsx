import React from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';

import layout from '../../styles/layout.module.css';
import page from '../../styles/pageSection.module.css';

interface InfoPageLayoutProps {
  title: string;
  subtitle: string;
  sections: { title: string; text: string }[];
}

const InfoPageLayout: React.FC<InfoPageLayoutProps> = ({ title, subtitle, sections }) => {
  return (
    <div className={`${layout.pageWrapper} ${layout.withBg}`}>
      <Header />
        <main className={layout.mainContent}>
          <div className={page.pageHeader}>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className={`${page.section} ${layout.container}`}>
            {sections.map((section) => (
              <article key={section.title} className={page.card}>
                <h2>{section.title}</h2>
                <p className={page.muted}>{section.text}</p>
              </article>
            ))}
          </div>
        </main>
      <Footer />
    </div>
  );
};

export default InfoPageLayout;
