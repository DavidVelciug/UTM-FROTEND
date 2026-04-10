import React, { useState } from 'react';
import styles from '../styles/productCard.module.css';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  onLike: (id: number, liked: boolean) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, image, description, onLike }) => {
  const [liked, setLiked] = useState<boolean>(false);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    onLike(id, newLiked);
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
        >
          {liked ? '❤️ В избранном' : '🤍 В избранное'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;