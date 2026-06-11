import React from 'react';
import { Link } from 'react-router-dom';
import feed from '../../styles/PublicFeed.module.css';
import type { TimeCapsuleDto } from '../../types/api';
import { getAvatarByUserId } from '../../auth/avatar';
import { isImageSource, parseCapsuleStorage, resolveMediaUrl, resolveUserAvatar } from '../../utils/file';
import CapsuleContentPreview from '../CapsuleContentPreview';
import { useInView } from '../../hooks/useInView';

interface FeedMessageRowProps {
  capsule: TimeCapsuleDto;
  likes: number;
  dislikes: number;
  userReaction: 'like' | 'dislike' | null;
  onReact: (id: number, reaction: 'like' | 'dislike') => void;
  onReport: (c: TimeCapsuleDto) => void;
  delay: number;
}

const FeedMessageRow: React.FC<FeedMessageRowProps> = ({ capsule: c, likes, dislikes, userReaction, onReact, onReport, delay }) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);

  return (
    <div ref={ref} className={`${feed.messageRow} ${feed.fadeInUp} ${feed[`delay${delay}` as keyof typeof feed]} ${inView ? feed.fadeInUpVisible : ''}`}>
      <div className={feed.avatarSpace}>
        <img
          src={getAvatarByUserId(c.ownerUserId) || resolveUserAvatar(c.ownerUserId, c.ownerDisplayName)}
          alt="avatar"
          className={feed.chatAvatar}
          onError={(e) => { e.currentTarget.src = '/assets/default-avatar.svg'; }}
        />
      </div>

      <div className={feed.messageBubble}>
        <div className={feed.messageInfo}>
          <span className={feed.authorName}>{c.ownerDisplayName || 'Аноним'}</span>
          <span className={feed.userTag}>Участник</span>
          <span className={feed.messageTime}>
            {new Date(c.createdAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button type="button" className={feed.reportTrigger} onClick={() => onReport(c)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </button>
        </div>

        <div className={feed.messageContent}>
          <h2 className={feed.capsuleTitle}>{c.title}</h2>
          <p className={feed.capsuleText}>{c.previewText || 'Внутри этой капсулы находится ценное воспоминание.'}</p>

          {c.contentType === 1 && <CapsuleContentPreview capsule={c} />}
          {c.contentType === 2 && (() => {
            const parsed = parseCapsuleStorage(c.fileStoragePath);
            const cover = parsed.cover;
            if (cover && isImageSource(cover)) {
              return (
                <div className={feed.messageAttachment}>
                  <img src={resolveMediaUrl(cover, '/assets/default-capsule-cover.svg')} alt="preview" className={feed.attachImg} loading="lazy" />
                </div>
              );
            }
            return null;
          })()}

          {(c.contentType === 0 || c.contentType === 1) && isImageSource(c.fileStoragePath) && (
            <div className={feed.messageAttachment}>
              <img src={resolveMediaUrl(c.fileStoragePath, '/assets/default-capsule-cover.svg')} alt="content" className={feed.attachImg} loading="lazy" />
            </div>
          )}
        </div>

        <div className={feed.messageFooter}>
          <div className={feed.reactionsInline}>
            <button type="button" className={`${feed.reactIconBtn} ${userReaction === 'like' ? feed.activeLike : ''}`} onClick={() => onReact(c.id, 'like')}>
              <span className={feed.emoji}>👍</span>
              <span className={feed.count}>{likes}</span>
            </button>
            <button type="button" className={`${feed.reactIconBtn} ${userReaction === 'dislike' ? feed.activeDislike : ''}`} onClick={() => onReact(c.id, 'dislike')}>
              <span className={feed.emoji}>👎</span>
              <span className={feed.count}>{dislikes}</span>
            </button>
          </div>
          <Link to={`/feed-capsule/${c.id}?source=feed`} className={feed.unpackBtn}>
            Распаковать
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeedMessageRow;
