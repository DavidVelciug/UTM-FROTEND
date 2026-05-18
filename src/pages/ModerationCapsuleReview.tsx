import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

import layout from '../styles/layout.module.css';
import page from '../styles/pageSection.module.css';
import { fetchJson } from '../config/api';
import type { ResponceMsg, TimeCapsuleDto } from '../types/api';

const ModerationCapsuleReview: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const capsuleId = Number(params.get('capsuleId') || 0);
  const reportId = Number(params.get('reportId') || 0);
  const [capsule, setCapsule] = useState<TimeCapsuleDto | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!capsuleId) return;
    void fetchJson<TimeCapsuleDto>(`/api/timecapsule/id?id=${capsuleId}`).then(setCapsule).catch(() => setCapsule(null));
  }, [capsuleId]);

  const resolve = async (status: 1 | 2) => {
    if (!reportId || !capsuleId) return;
    const reportRes = await fetchJson<ResponceMsg>('/api/moderationreport', {
      method: 'PUT',
      body: JSON.stringify({ id: reportId, capsuleId, reporterEmail: '', reason: '', status, createdAtUtc: new Date().toISOString() }),
    });
    if (status === 1) {
      await fetchJson<ResponceMsg>(`/api/timecapsule/id?id=${capsuleId}`, { method: 'DELETE' });
    }
    setMsg(reportRes.message);
    navigate('/admin/moderation');
  };

  return (
    <div className={`${layout.pageWrapper} ${layout.withBg}`}>
      <Header />
        <main className={layout.mainContent}>
          <div className={`${page.section} ${layout.container}`}>
            <article className={page.card}>
              <h1>Проверка капсулы #{capsuleId}</h1>
              {capsule && (
                <>
                  <h2>{capsule.title}</h2>
                  <p className={page.muted}>{capsule.previewText || 'Превью'}</p>
                </>
              )}
              <div className={page.row}>
                <button type="button" className={layout.btnPrimary} onClick={() => void resolve(1)}>Удалить капсулу</button>
                <button type="button" className={layout.btnPrimary} onClick={() => void resolve(2)}>Не удалять</button>
              </div>
              {msg && <p className={page.muted}>{msg}</p>}
            </article>
          </div>
        </main>
      <Footer />
    </div>
  );
};

export default ModerationCapsuleReview;
