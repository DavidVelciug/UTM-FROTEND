import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CapsuleContentPreview from '../components/CapsuleContentPreview';
import layout from '../styles/layout.module.css';
import detail from '../styles/CapsuleDetail.module.css';
import { fetchJson } from '../config/api';
import type { TimeCapsuleDto } from '../types/api';
import { getCurrentUserId } from '../auth/session';
import { addOpenedCapsule } from '../auth/capsuleStore';
import { extractAttachmentPaths, isImageSource, resolveMediaUrl, resolveUserAvatar } from '../utils/file';
import { getAvatarByUserId } from '../auth/avatar';

function formatCountdown(target: Date, now: Date): string {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 'Можно открыть';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return `${days}д ${hours}ч ${mins}м ${secs}с`;
}

const CapsuleView: React.FC = () => {
  const { capsuleId } = useParams<{ capsuleId: string }>();
  const userId = getCurrentUserId();
  const [capsule, setCapsule] = useState<TimeCapsuleDto | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!capsuleId || !userId) return;
    void fetchJson<TimeCapsuleDto>(`/api/timecapsule/idForUser?id=${capsuleId}&viewerUserId=${userId}`)
      .then((c) => {
        setCapsule(c);
        if (!c.isLocked) {
          addOpenedCapsule(c, c.isPublic ? 'Капсула каталога' : 'Присланная капсула');
        }
      })
      .catch(() => setCapsule(null));
  }, [capsuleId, userId]);

  const avatarSrc =
    capsule ? getAvatarByUserId(capsule.ownerUserId) || resolveUserAvatar(capsule.ownerUserId, capsule.ownerDisplayName) : '';

  return (
    <div className={`${layout.pageWrapper} ${layout.withBg}`}>
      <Header />
        <main className={`${layout.mainContent} ${layout.fadeIn}`}>
        <div className={`${layout.container} ${detail.wrap}`}>
          {!capsule && <div className={layout.container}>Капсула не найдена.</div>}
          {capsule && (
            <article>
              <div className={detail.messageShell}>
                <img
                  src={avatarSrc}
                  alt=""
                  className={detail.avatar}
                  onError={(e) => {
                    e.currentTarget.src = '/assets/default-avatar.svg';
                  }}
                />
                <div className={detail.bubble}>
                  <div className={detail.metaRow}>
                    <span className={detail.author}>{capsule.ownerDisplayName || 'Аноним'}</span>
                    <span className={detail.createdAt}>
                      {new Date(capsule.createdAtUtc).toLocaleString('ru-RU', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  {!capsule.isLocked && (capsule.contentType === 1 || capsule.contentType === 2) && (
                    <div className={detail.previewSlot}>
                      <CapsuleContentPreview capsule={capsule} />
                    </div>
                  )}

                  {!capsule.isLocked &&
                    capsule.contentType === 0 &&
                    isImageSource(capsule.fileStoragePath) && (
                      <div className={detail.previewSlot}>
                        <img
                          src={resolveMediaUrl(capsule.fileStoragePath, '/assets/default-capsule-cover.svg')}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.src = '/assets/default-capsule-cover.svg';
                          }}
                        />
                      </div>
                    )}

                  <h1 className={detail.title}>{capsule.title}</h1>

                  {!capsule.isLocked && capsule.previewText && (
                    <p className={detail.bodyText}>{capsule.previewText}</p>
                  )}

                  {capsule.isLocked && (
                    <p className={detail.bodyText}>Содержимое скрыто до времени открытия.</p>
                  )}

                  {!capsule.isLocked && capsule.textContent && (
                    <p className={detail.bodyText}>{capsule.textContent}</p>
                  )}

                  {!capsule.isLocked && capsule.linkUrl && capsule.contentType !== 1 && (
                    <p className={detail.bodyText}>
                      <a href={capsule.linkUrl} target="_blank" rel="noreferrer">
                        {capsule.linkUrl}
                      </a>
                    </p>
                  )}

                  {!capsule.isLocked &&
                    (() => {
                      const attachments = extractAttachmentPaths(capsule.fileStoragePath);
                      return (
                        attachments.length > 0 &&
                        !isImageSource(capsule.fileStoragePath) &&
                        capsule.contentType !== 2 && (
                          <div className={detail.attachRow}>
                            {attachments.map((path, index) => (
                              <a key={`${path}-${index}`} href={resolveMediaUrl(path)} download className={layout.btnPrimary}>
                                Файл {index + 1}
                              </a>
                            ))}
                          </div>
                        )
                      );
                    })()}
                </div>
              </div>
            </article>
          )}
          {capsule?.isLocked && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'grid',
                placeItems: 'center',
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  width: 'min(520px, 92vw)',
                  background: 'var(--surface-light)',
                  border: '1px solid var(--border)',
                  borderRadius: '24px',
                  padding: '1.75rem',
                }}
              >
                <h2>Ждите время</h2>
                <p className={detail.bodyText}>Получатель не может открыть капсулу раньше указанного времени.</p>
                <p className={detail.lockedBanner}>До открытия: {formatCountdown(new Date(capsule.openAtUtc), now)}</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CapsuleView;
