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
      <img
        src={resolveMediaUrl(image, '/assets/default-capsule-cover.svg')}
        alt={name}
        className={styles.productImage}
        onError={(e) => {
          e.currentTarget.src = '/assets/default-capsule-cover.svg';
        }}
      />
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{name}</h3>
        <p className={styles.productDescription}>{description}</p>
        {openAtUtc && (
          <p className={styles.productDescription}>
            Дата открытия: {new Date(openAtUtc).toLocaleString('ru-RU')}
          </p>
        )}
        <p className={styles.productPrice}>{price} MDL</p>
        <button
          type="button"
          className={`${styles.likeBtn} ${userReaction === 'like' ? styles.likeBtnLiked : ''}`}
          onClick={() => onLike(id)}
        >
          Лайки: {likesCount}
        </button>
        <button
          type="button"
          className={`${styles.likeBtn} ${userReaction === 'dislike' ? styles.likeBtnLiked : ''}`}
          onClick={() => onDislike(id)}
        >
          Дизлайки: {dislikesCount}
        </button>
        <button
          type="button"
          className={styles.likeBtn}
          onClick={() => {
            setOpened(true);
            onOpen(capsuleId);
          }}
        >
          Распаковать капсулу
        </button>
        {opened && <p className={styles.productDescription}>Капсула добавлена в открытые.</p>}
      </div>
    </div>
  );
};

export default ProductCard;
