import React, { useState } from 'react';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  onLike: (id: number, liked: boolean) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  id, 
  name, 
  price, 
  image, 
  description,
  onLike 
}) => {
  const [liked, setLiked] = useState<boolean>(false);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    onLike(id, newLiked);
  };

  return (
    <div className="product-card">
      <img src={image} alt={name} className="product-image" />
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <p className="product-description">{description}</p>
        <p className="product-price">{price} MDL</p>
        <button 
          className={`like-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          {liked ? '❤️ В избранном' : '🤍 В избранное'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;