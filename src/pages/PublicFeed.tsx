import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Pagination from '../components/common/Pagination';
import FeedMessageRow from '../components/feed/FeedMessageRow';
import layout from '../styles/layout.module.css';
import feed from '../styles/PublicFeed.module.css';
import spinner from '../styles/loading.module.css';
import { fetchJson } from '../config/api';
import type { ModerationReportDto, ResponceMsg, TimeCapsuleDto } from '../types/api';
import { getFeedCounts, getFeedUserReaction, toggleFeedReaction } from '../auth/reactions';
import { getCurrentUserEmail } from '../auth/session';
import { useInView } from '../hooks/useInView';

interface SortState {
  date: 'newest' | 'oldest' | null;
  contentTypeFilter: number | null;
  reactions: 'likes' | 'dislikes' | null;
}

const PublicFeed: React.FC = () => {
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>(0.2);
  const { ref: sortRef, inView: sortInView } = useInView<HTMLDivElement>(0.2);

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
  const [sort, setSort] = useState<SortState>({
    date: 'newest',
    contentTypeFilter: null,
    reactions: null,
  });
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

  const filtered = useMemo(() => {
    let result = [...items];

    if (sort.contentTypeFilter !== null) {
      result = result.filter((c) => c.contentType === sort.contentTypeFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAtUtc).getTime();
      const dateB = new Date(b.createdAtUtc).getTime();

      if (sort.date === 'newest') {
        const d = dateB - dateA;
        if (d !== 0) return d;
      } else if (sort.date === 'oldest') {
        const d = dateA - dateB;
        if (d !== 0) return d;
      }

      if (sort.reactions === 'likes') {
        const d = (likes[b.id] ?? 0) - (likes[a.id] ?? 0);
        if (d !== 0) return d;
      } else if (sort.reactions === 'dislikes') {
        const d = (dislikes[b.id] ?? 0) - (dislikes[a.id] ?? 0);
        if (d !== 0) return d;
      }

      return dateB - dateA;
    });

    return result;
  }, [items, sort, likes, dislikes]);

  const paged = filtered.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className={`${layout.pageWrapper} ${layout.withBg}`}>
      <Header />
        <main className={`${layout.mainContent} ${layout.fadeIn} ${feed.feedBackdrop}`}>
        <div ref={headerRef} className={`${feed.pageHeader} ${feed.fadeInUp} ${headerInView ? feed.fadeInUpVisible : ''}`}>
          <h1 className={layout.textGradient}>Публичные воспоминания</h1>
          <p>Общая лента открытых капсул — делитесь моментами прошлого.</p>
        </div>

        <div className={feed.feedLayout}>
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
                paged.map((c, i) => (
                  <FeedMessageRow
                    key={c.id}
                    capsule={c}
                    likes={likes[c.id] ?? 0}
                    dislikes={dislikes[c.id] ?? 0}
                    userReaction={userReactions[c.id] ?? null}
                    onReact={react}
                    onReport={(c) => setReportTarget(c)}
                    delay={((i % 4) + 1) * 100}
                  />
                ))}
            </div>

            {!loadingFeed && totalPages > 1 && <Pagination page={pageIndex} totalPages={totalPages} onPageChange={setPageIndex} />}
          </div>

          <aside ref={sortRef} className={`${feed.sortPanel} ${feed.fadeInUp} ${feed.delay200} ${sortInView ? feed.fadeInUpVisible : ''}`}>
            <div className={feed.sortPanelInner}>
              <h3 className={feed.sortPanelTitle}>Сортировка</h3>

              <div className={feed.sortGroup}>
                <label className={feed.sortLabel}>По дате</label>
                <select
                  className={feed.sortSelect}
                  value={sort.date ?? 'all'}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSort((s) => ({ ...s, date: v === 'all' ? null : v as 'newest' | 'oldest' }));
                    setPageIndex(1);
                  }}
                >
                  <option value="newest">Новые</option>
                  <option value="oldest">Старые</option>
                  <option value="all">Все</option>
                </select>
              </div>

              <div className={feed.sortGroup}>
                <label className={feed.sortLabel}>По типу контента</label>
                <select
                  className={feed.sortSelect}
                  value={sort.contentTypeFilter ?? 'all'}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSort((s) => ({ ...s, contentTypeFilter: v === 'all' ? null : Number(v) }));
                    setPageIndex(1);
                  }}
                >
                  <option value="all">Все</option>
                  <option value="0">Текст</option>
                  <option value="1">Файлы</option>
                  <option value="2">Ссылка</option>
                </select>
              </div>

              <div className={feed.sortGroup}>
                <label className={feed.sortLabel}>По реакциям</label>
                <select
                  className={feed.sortSelect}
                  value={sort.reactions ?? 'all'}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSort((s) => ({ ...s, reactions: v === 'all' ? null : v as 'likes' | 'dislikes' }));
                    setPageIndex(1);
                  }}
                >
                  <option value="likes">Лайки</option>
                  <option value="dislikes">Дизлайки</option>
                  <option value="all">Все</option>
                </select>
              </div>
            </div>
          </aside>
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
