import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import layout from '../styles/layout.module.css';
import feed from '../styles/PublicFeed.module.css';
import spinner from '../styles/loading.module.css';
import { fetchJson } from '../config/api';
import type { ModerationReportDto, ResponceMsg, TimeCapsuleDto } from '../types/api';
import { getFeedCounts, getFeedUserReaction, toggleFeedReaction } from '../auth/reactions';
import { isImageSource, resolveMediaUrl, resolveUserAvatar } from '../utils/file';
import { getAvatarByUserId } from '../auth/avatar';
import CapsuleContentPreview from '../components/CapsuleContentPreview';
import { getCurrentUserEmail } from '../auth/session';

const PublicFeed: React.FC = () => {
  const [items, setItems] = useState<TimeCapsuleDto[]>([]);
  const [likes, setLikes] = useState<Record<number, number>>({});
  const [dislikes, setDislikes] = useState<Record<number, number>>({});
  const [userReactions, setUserReactions] = useState<Record<number, 'like' | 'dislike' | null>>({});
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<TimeCapsuleDto | null>(null);
  const [reportText, setReportText] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;

  const refreshReactions = (capsules: TimeCapsuleDto[]) => {
    const nextLikes: Record<number, number> = {};
    const nextDislikes: Record<number, number> = {};
    const nextUser: Record<number, 'like' | 'dislike' | null> = {};
    capsules.forEach((capsule) => {
      const counts = getFeedCounts(capsule.id);
      nextLikes[capsule.id] = counts.likes;
      nextDislikes[capsule.id] = counts.dislikes;
      nextUser[capsule.id] = getFeedUserReaction(capsule.id);
    });
    setLikes(nextLikes);
    setDislikes(nextDislikes);
    setUserReactions(nextUser);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingFeed(true);
        const data = await fetchJson<TimeCapsuleDto[]>('/api/timecapsule/getPublicFeed');
        if (!cancelled) {
          setItems(data);
          refreshReactions(data);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка');
      } finally {
        if (!cancelled) setLoadingFeed(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const react = (capsuleId: number, reaction: 'like' | 'dislike') => {
    toggleFeedReaction(capsuleId, reaction);
    refreshReactions(items);
  };

  const reportCapsule = async (capsule: TimeCapsuleDto) => {
    const payload: ModerationReportDto = {
      id: 0,
      capsuleId: capsule.id,
      reporterEmail: getCurrentUserEmail() || 'guest@memorylane.local',
      reason: reportText.trim() || 'Жалоба на контент',
      status: 0,
      createdAtUtc: new Date().toISOString(),
    };
    try {
      const res = await fetchJson<ResponceMsg>('/api/moderationreport', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setInfo(res.message);
    } catch {
      setInfo('Ошибка при отправке');
    }
    setReportTarget(null);
    setReportText('');
  };

  const sorted = [...items].sort((a, b) => (likes[b.id] ?? 0) - (likes[a.id] ?? 0));
  const paged = sorted.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={`${layout.mainContent} ${layout.fadeIn} ${feed.feedBackdrop}`}>
        <div className={feed.pageHeader}>
          <h1 className={layout.textGradient}>Публичные воспоминания</h1>
          <p>Общая лента открытых капсул — делитесь моментами прошлого.</p>
        </div>

        <div className={feed.feedContainer}>
          {loadingFeed && (
            <div className={spinner.loadingState}>
              <div className={spinner.loader} />
            </div>
          )}

          {error && <div className={spinner.errorState}>{error}</div>}

          {info && <div className={feed.statusMsg}>{info}</div>}

          <div className={feed.chatTimeline}>
            {!loadingFeed &&
              !error &&
              paged.map((c) => (
                <div key={c.id} className={feed.messageRow}>
                  <div className={feed.avatarSpace}>
                    <img
                      src={getAvatarByUserId(c.ownerUserId) || resolveUserAvatar(c.ownerUserId, c.ownerDisplayName)}
                      alt="avatar"
                      className={feed.chatAvatar}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/default-avatar.svg';
                      }}
                    />
                  </div>

                  <div className={feed.messageBubble}>
                    <div className={feed.messageInfo}>
                      <span className={feed.authorName}>{c.ownerDisplayName || 'Аноним'}</span>
                      <span className={feed.userTag}>Участник</span>
                      <span className={feed.messageTime}>
                        {new Date(c.createdAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button type="button" className={feed.reportTrigger} onClick={() => setReportTarget(c)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                          <line x1="4" y1="22" x2="4" y2="15" />
                        </svg>
                      </button>
                    </div>

                    <div className={feed.messageContent}>
                      <h2 className={feed.capsuleTitle}>{c.title}</h2>
                      <p className={feed.capsuleText}>
                        {c.previewText || 'Внутри этой капсулы находится ценное воспоминание.'}
                      </p>

                      {(c.contentType === 1 || c.contentType === 2) && <CapsuleContentPreview capsule={c} />}

                      {c.contentType === 0 && isImageSource(c.fileStoragePath) && (
                        <div className={feed.messageAttachment}>
                          <img
                            src={resolveMediaUrl(c.fileStoragePath, '/assets/default-capsule-cover.svg')}
                            alt="content"
                            className={feed.attachImg}
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>

                    <div className={feed.messageFooter}>
                      <div className={feed.reactionsInline}>
                        <button
                          type="button"
                          className={`${feed.reactIconBtn} ${userReactions[c.id] === 'like' ? feed.activeLike : ''}`}
                          onClick={() => react(c.id, 'like')}
                        >
                          <span className={feed.emoji}>👍</span>
                          <span className={feed.count}>{likes[c.id] ?? 0}</span>
                        </button>
                        <button
                          type="button"
                          className={`${feed.reactIconBtn} ${userReactions[c.id] === 'dislike' ? feed.activeDislike : ''}`}
                          onClick={() => react(c.id, 'dislike')}
                        >
                          <span className={feed.emoji}>👎</span>
                          <span className={feed.count}>{dislikes[c.id] ?? 0}</span>
                        </button>
                      </div>
                      <Link to={`/feed-capsule/${c.id}`} className={feed.unpackBtn}>
                        Распаковать
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {!loadingFeed && sorted.length > pageSize && (
            <div className={feed.paginationMini}>
              <button type="button" disabled={pageIndex <= 1} onClick={() => setPageIndex((p) => p - 1)}>
                ←
              </button>
              <span>
                {pageIndex} / {Math.ceil(sorted.length / pageSize)}
              </span>
              <button
                type="button"
                disabled={pageIndex >= Math.ceil(sorted.length / pageSize)}
                onClick={() => setPageIndex((p) => p + 1)}
              >
                →
              </button>
            </div>
          )}
        </div>
      </main>

      {reportTarget && (
        <div className={feed.modalOverlay}>
          <div className={feed.modalBody}>
            <h3 className={feed.modalTitle}>Пожаловаться</h3>
            <p className={feed.muted}>Опишите причину нарушения в капсуле «{reportTarget.title}»</p>
            <textarea
              className={feed.modalInput}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Текст жалобы..."
            />
            <div className={feed.modalButtons}>
              <button type="button" className={feed.cancelBtn} onClick={() => setReportTarget(null)}>
                Отмена
              </button>
              <button type="button" className={feed.confirmBtn} onClick={() => void reportCapsule(reportTarget)}>
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PublicFeed;
