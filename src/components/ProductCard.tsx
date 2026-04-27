import React, { useState } from 'react';
import styles from '../styles/productCard.module.css';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  likesCount: number;
  onLike: (id: number) => void;
  onOpen: (id: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, image, description, likesCount, onLike, onOpen }) => {
  const [liked, setLiked] = useState<boolean>(false);

  const handleLike = () => {
    setLiked(true);
    onLike(id);
  };

  return (
    <div className={styles.productCard}>
      <img src={image} alt={name} className={styles.productImage} />
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{name}</h3>
        <p className={styles.productDescription}>{description}</p>
        <p className={styles.productPrice}>{price} MDL</p>
        <button
          type="button"
          className={`${styles.likeBtn} ${liked ? styles.likeBtnLiked : ''}`}
          onClick={handleLike}
          disabled={liked}
        >
          ❤️ Лайки: {likesCount}
        </button>
        <button type="button" className={styles.likeBtn} onClick={() => onOpen(id)}>
          Распаковать капсулу
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
