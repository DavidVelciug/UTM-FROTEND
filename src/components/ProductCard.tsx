import React, { useState } from 'react';
import styles from '../styles/ProductCard.module.css';
import { resolveMediaUrl } from '../utils/file';

interface ProductCardProps {
  id: number;
  capsuleId?: number | null;
  name: string;
  price: number;
  image: string;
  description: string;
  creatorName?: string;
  openAtUtc?: string;
  likesCount: number;
  dislikesCount: number;
  userReaction: 'like' | 'dislike' | null;
  onLike: (id: number) => void;
  onDislike: (id: number) => void;
  onOpen: (capsuleId: number | null | undefined) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  capsuleId,
  name,
  price,
  image,
  description,
  creatorName,
  openAtUtc,
  likesCount,
  dislikesCount,
  userReaction,
  onLike,
  onDislike,
  onOpen,
}) => {
  const [opened, setOpened] = useState<boolean>(false);

  return (
    <div className={styles.productCard}>
      <div className={styles.cardImageWrap}>
        <img
          src={resolveMediaUrl(image, '/assets/default-capsule-cover.svg')}
          alt={name}
          className={styles.cardImage}
          onError={(e) => {
            e.currentTarget.src = '/assets/default-capsule-cover.svg';
          }}
        />
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>Капсула: {name}</h3>
        <p className={styles.cardAuthor}>
          Автор: <span className={styles.authorName}>{creatorName || 'Пользователь'}</span> <span className={styles.authorStatus}>(Подтвержден)</span>
        </p>
        <span className={styles.priceBadge}>{price} MDL</span>
        <p className={styles.cardDescription}>{description}</p>
        {openAtUtc && (
          <p className={styles.cardDate}>
            Дата открытия: {new Date(openAtUtc).toLocaleString('ru-RU')}
          </p>
        )}
        <div className={styles.cardFooter}>
          <div className={styles.reactions}>
            <button
              type="button"
              className={`${styles.reactBtn} ${userReaction === 'like' ? styles.reactBtnLiked : ''}`}
              onClick={() => onLike(id)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={userReaction === 'like' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                <polyline points="7 22 7 13" />
              </svg>
              {likesCount}
            </button>
            <button
              type="button"
              className={`${styles.reactBtn} ${userReaction === 'dislike' ? styles.reactBtnDisliked : ''}`}
              onClick={() => onDislike(id)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={userReaction === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
                <polyline points="17 2 17 11" />
              </svg>
              {dislikesCount}
            </button>
          </div>
          <button
            type="button"
            className={styles.unpackBtn}
            onClick={() => {
              setOpened(true);
              onOpen(capsuleId);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            Распаковать капсулу
          </button>
        </div>
        {opened && <p className={styles.openedHint}>Капсула добавлена в открытые.</p>}
      </div>
    </div>
  );
};

export default ProductCard;
