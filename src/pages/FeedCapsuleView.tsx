import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SenderInfo from '../components/capsule/SenderInfo';
import LockedCapsuleModal from '../components/capsule/LockedCapsuleModal';
import layout from '../styles/layout.module.css';
import detail from '../styles/CapsuleDetail.module.css';
import { fetchJson } from '../config/api';
import type { TimeCapsuleDto } from '../types/api';
import { getCurrentUserId } from '../auth/session';
import { addOpenedCapsule } from '../auth/capsuleStore';
import { parseCapsuleStorage, isImageSource, isVideoSource, isAudioSource, resolveMediaUrl } from '../utils/file';
import { useInView } from '../hooks/useInView';

const sourceLabel: Record<string, string> = {
  catalog: 'Капсула каталога',
  feed: 'Публичная капсула',
  sent: 'Присланная капсула',
  map: 'Гео-капсула',
};

const FeedCapsuleView: React.FC = () => {
  const { ref: mainRef, inView: mainInView } = useInView<HTMLDivElement>(0.15);
  const { capsuleId } = useParams<{ capsuleId: string }>();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source') || (searchParams.has('price') ? 'catalog' : 'feed');
  const hasPrice = searchParams.has('price');
  const catalogPrice = Number(searchParams.get('price')) || 0;
  const [capsule, setCapsule] = useState<TimeCapsuleDto | null>(null);
  const [now, setNow] = useState(() => new Date());
  const userId = getCurrentUserId();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!capsuleId || !userId) return;
    void fetchJson<TimeCapsuleDto>(`/api/timecapsule/idForUser?id=${capsuleId}&viewerUserId=${userId}`)
      .then((data) => {
        setCapsule(data);
        if (!data.isLocked && source !== 'opened') {
          addOpenedCapsule(data, sourceLabel[source] ?? 'Публичная капсула', hasPrice ? catalogPrice : undefined);
        }
      })
      .catch(() => setCapsule(null));
  }, [capsuleId, userId, source]);

  return (
    <div className={`${layout.pageWrapper} ${layout.withBg}`}>
      <Header />
        <main ref={mainRef} className={`${layout.mainContent} ${layout.fadeInUp} ${mainInView ? layout.fadeInUpVisible : ''}`}>
        <div className={`${layout.container} ${detail.wrap}`}>
          {!capsule && <div>Капсула не найдена.</div>}
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
                {hasPrice && (
                  <div style={{ marginTop: 10, fontWeight: 800, fontSize: '1.3rem', color: '#fff', background: 'linear-gradient(135deg, #e57373, #c62828)', display: 'inline-block', padding: '6px 18px', borderRadius: 999 }}>
                    {catalogPrice} MDL
                  </div>
                )}
              </div>

              <div className={detail.letterBody}>
                {capsule.previewText && <p className={detail.bodyText}>{capsule.previewText}</p>}

                {capsule.isLocked && <p className={detail.bodyText}>Содержимое скрыто до времени открытия.</p>}

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
              </div>

              {!capsule.isLocked && (() => {
                const parsed = parseCapsuleStorage(capsule.fileStoragePath);
                const cover = parsed.cover;
                const attachments = parsed.attachments;
                const mainFile = attachments[0] ?? null;

                const items: React.ReactNode[] = [];

                if (cover && isImageSource(cover) && capsule.contentType !== 2) {
                  items.push(
                    <div className={detail.previewSlot} key="cover">
                      <img
                        src={resolveMediaUrl(cover, '/assets/default-capsule-cover.svg')}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.src = '/assets/default-capsule-cover.svg';
                        }}
                      />
                    </div>
                  );
                }

                if (capsule.contentType === 2 && attachments.length > 0) {
                  items.push(
                    <div key="files" style={{ paddingLeft: 45 }}>
                      {attachments.map((path, index) => {
                        const fileName = path.split(/[/\\]/).pop() || `Файл ${index + 1}`;
                        return (
                          <div key={`${path}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <a href={resolveMediaUrl(path)} download style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 36, height: 36, borderRadius: 8,
                              background: 'var(--surface-hover, #f0f0f0)', cursor: 'pointer',
                              textDecoration: 'none', flexShrink: 0,
                            }}>
                              <img src="/assets/icons/download.png" alt="Скачать" width="20" height="20" style={{ display: 'block' }} />
                            </a>
                            <span style={{ fontSize: '0.92rem', color: 'var(--text, #333)', wordBreak: 'break-all' }}>{fileName}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                } else if (capsule.contentType === 1 && capsule.linkUrl) {
                  if (mainFile && isImageSource(mainFile)) {
                    items.push(
                      <div className={detail.previewSlot} key="link-cover">
                        <img
                          src={resolveMediaUrl(mainFile, '/assets/default-capsule-cover.svg')}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.src = '/assets/default-capsule-cover.svg';
                          }}
                        />
                      </div>
                    );
                  }
                  items.push(
                    <div className={detail.previewSlot} key="link">
                      <a href={capsule.linkUrl} target="_blank" rel="noreferrer" className={detail.linkCard}>
                        <span className={detail.linkTitle}>{capsule.title}</span>
                        <span className={detail.linkUrl}>{capsule.linkUrl}</span>
                      </a>
                    </div>
                  );
                } else if (capsule.contentType === 0) {
                  const fileToShow = mainFile || capsule.fileStoragePath;

                  if (fileToShow && isImageSource(fileToShow)) {
                    items.push(
                      <div className={detail.previewSlot} key="file">
                        <img
                          src={resolveMediaUrl(fileToShow, '/assets/default-capsule-cover.svg')}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.src = '/assets/default-capsule-cover.svg';
                          }}
                        />
                      </div>
                    );
                  } else if (fileToShow && isVideoSource(fileToShow)) {
                    items.push(
                      <div className={detail.previewSlot} key="file">
                        <video controls style={{ width: '100%', maxHeight: 420, display: 'block' }}>
                          <source src={resolveMediaUrl(fileToShow)} />
                        </video>
                      </div>
                    );
                  } else if (fileToShow && isAudioSource(fileToShow)) {
                    items.push(
                      <div className={detail.previewSlot} style={{ padding: '1.5rem' }} key="file">
                        <audio controls style={{ width: '100%', display: 'block' }}>
                          <source src={resolveMediaUrl(fileToShow)} />
                        </audio>
                      </div>
                    );
                  } else if (capsule.fileStoragePath) {
                    items.push(
                      <div className={detail.attachRow} key="file">
                        <a href={resolveMediaUrl(capsule.fileStoragePath)} download className={layout.btnPrimary}>
                          Скачать файл
                        </a>
                      </div>
                    );
                  }
                }

                return items.length > 0 ? items : null;
              })()}

              {!hasPrice && (
                <div className={detail.letterFooter}>
                  <p className={detail.bodyText} style={{ fontSize: '0.88rem', color: 'var(--text-dim)' }}>
                    Получатель: {capsule.recipientEmail}
                  </p>
                </div>
              )}
            </article>
          )}
          {capsule?.isLocked && <LockedCapsuleModal openAtUtc={capsule.openAtUtc} now={now} />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FeedCapsuleView;
