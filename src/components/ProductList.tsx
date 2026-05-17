import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../data/products';
import styles from '../styles/ProductCard.module.css';

interface ProductListProps {
  products: Product[];
  likesMap: Record<number, number>;
  dislikesMap: Record<number, number>;
  userReactions: Record<number, 'like' | 'dislike' | null>;
  onLike: (id: number) => void;
  onDislike: (id: number) => void;
  onOpen: (capsuleId: number | null | undefined) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  likesMap,
  dislikesMap,
  userReactions,
  onLike,
  onDislike,
  onOpen,
}) => {
  return (
    <div className={styles.productGrid}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          capsuleId={product.capsuleId}
          name={product.name}
          price={product.price}
          image={product.image}
          description={product.description}
          likesCount={likesMap[product.id] ?? 0}
          dislikesCount={dislikesMap[product.id] ?? 0}
          userReaction={userReactions[product.id] ?? null}
          onLike={onLike}
          onDislike={onDislike}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
};

export default ProductList;
