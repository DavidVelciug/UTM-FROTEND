import React from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import layout from '../../styles/layout.module.css';
import page from '../../styles/pageSection.module.css';
import { useInView } from '../../hooks/useInView';

interface InfoPageLayoutProps {
  title: string;
  subtitle: string;
  sections: { title: string; text: string }[];
}

const InfoPageLayout: React.FC<InfoPageLayoutProps> = ({ title, subtitle, sections }) => {
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>(0.2);
  const { ref: sectionRef, inView: sectionInView } = useInView<HTMLDivElement>(0.15);

  return (
    <div className={`${layout.pageWrapper} ${layout.withBg}`}>
      <Header />
        <main className={layout.mainContent}>
          <div ref={headerRef} className={`${page.pageHeader} ${layout.fadeInUp} ${headerInView ? layout.fadeInUpVisible : ''}`}>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div ref={sectionRef} className={`${page.section} ${layout.container} ${layout.fadeInUp} ${sectionInView ? layout.fadeInUpVisible : ''}`}>
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
