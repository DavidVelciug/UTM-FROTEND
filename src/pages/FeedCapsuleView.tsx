import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import page from '../styles/pageSection.module.css';
import { fetchJson } from '../config/api';
import type { TimeCapsuleDto } from '../types/api';

const FeedCapsuleView: React.FC = () => {
  const { capsuleId } = useParams<{ capsuleId: string }>();
  const [capsule, setCapsule] = useState<TimeCapsuleDto | null>(null);

  useEffect(() => {
    if (!capsuleId) return;
    void fetchJson<TimeCapsuleDto>(`/api/timecapsule/id?id=${capsuleId}`).then(setCapsule).catch(() => setCapsule(null));
  }, [capsuleId]);

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <div className={page.pageHeader}>
          <h1>Капсула из ленты</h1>
        </div>
        <div className={`${page.section} ${layout.container}`}>
          {!capsule && <div className={page.card}>Капсула не найдена.</div>}
          {capsule && (
            <article className={page.card}>
              <h2>{capsule.title}</h2>
              <p className={page.muted}>{capsule.textContent || capsule.linkUrl || capsule.fileStoragePath || 'Нет данных'}</p>
              <p>Автор: {capsule.ownerDisplayName || 'Аноним'}</p>
              <p>Получатель: {capsule.recipientEmail}</p>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FeedCapsuleView;
