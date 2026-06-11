import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CapsuleContentPreview from '../components/CapsuleContentPreview';
import SenderInfo from '../components/capsule/SenderInfo';

import layout from '../styles/layout.module.css';
import detail from '../styles/CapsuleDetail.module.css';
import { fetchJson } from '../config/api';
import type { ResponceMsg, TimeCapsuleDto } from '../types/api';
import { parseCapsuleStorage, isImageSource, resolveMediaUrl } from '../utils/file';
import { useInView } from '../hooks/useInView';

const ModerationCapsuleReview: React.FC = () => {
  const { ref: mainRef, inView: mainInView } = useInView<HTMLDivElement>(0.15);
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
      <main ref={mainRef} className={`${layout.mainContent} ${layout.fadeInUp} ${mainInView ? layout.fadeInUpVisible : ''}`}>
        <div className={layout.container} style={{ maxWidth: 800, margin: '2rem auto', padding: '0 5%' }}>
          {!capsule && <div className={layout.textCenter}>Загрузка капсулы...</div>}
              {capsule && (
            <article className={detail.letterEnvelope}>
              <div className={detail.letterHeader}>
                <SenderInfo
                  ownerUserId={capsule.ownerUserId}
                  ownerDisplayName={capsule.ownerDisplayName}
                  createdAtUtc={capsule.createdAtUtc}
                  classes={{
                    root: detail.senderInfo,
                    avatar: detail.avatarLarge,
                    meta: detail.senderMeta,
                    author: detail.author,
                    createdAt: detail.createdAt,
                  }}
                />
                <h1 className={detail.title}>{capsule.title}</h1>
              </div>

              <div className={detail.letterBody}>
                {capsule.previewText && <p className={detail.bodyText}>{capsule.previewText}</p>}

                {capsule.textContent && <p className={detail.bodyText}>{capsule.textContent}</p>}

                {(capsule.contentType === 1 || capsule.contentType === 2) && (
                  <div className={detail.previewSlot}>
                    <CapsuleContentPreview capsule={capsule} />
                  </div>
                )}

                {capsule.contentType === 0 && capsule.fileStoragePath && isImageSource(capsule.fileStoragePath) && (
                  <div className={detail.previewSlot}>
                    <img
                      src={resolveMediaUrl(capsule.fileStoragePath, '/assets/default-capsule-cover.svg')}
                      alt=""
                      onError={(e) => { e.currentTarget.src = '/assets/default-capsule-cover.svg'; }}
                    />
                  </div>
                )}

                {capsule.linkUrl && capsule.contentType !== 1 && (
                  <p className={detail.bodyText}>
                    <a href={capsule.linkUrl} target="_blank" rel="noreferrer">{capsule.linkUrl}</a>
                  </p>
                )}

                {(() => {
                  const attachments = parseCapsuleStorage(capsule.fileStoragePath).attachments;
                  if (attachments.length > 0 && capsule.contentType !== 2) {
                    return (
                      <div className={detail.attachRow}>
                        {attachments.map((path, i) => (
                          <a key={`${path}-${i}`} href={resolveMediaUrl(path)} download className={layout.btnPrimary}>
                            Файл {i + 1}
                          </a>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className={detail.letterFooter} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button type="button" className={layout.btnPrimaryLarge} onClick={() => void resolve(1)} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>Удалить капсулу</button>
                  <button type="button" className={layout.btnPrimaryLarge} onClick={() => void resolve(2)}>Оставить</button>
                  <Link to="/admin/moderation" className={layout.btnPrimaryLarge}>Назад</Link>
                </div>
                {msg && <p style={{ color: 'var(--ml-text-dim)', margin: 0, fontSize: '0.9rem' }}>{msg}</p>}
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ModerationCapsuleReview;
