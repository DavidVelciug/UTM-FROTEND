import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../data/products';
import styles from '../styles/productCard.module.css';

interface ProductListProps {
  products: Product[];
  likesMap: Record<number, number>;
  onLike: (id: number) => void;
  onOpen: (id: number) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, likesMap, onLike, onOpen }) => {
  return (
    <div className={styles.productGrid}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          image={product.image}
          description={product.description}
          likesCount={likesMap[product.id] ?? 0}
          onLike={onLike}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
};

export default ProductList;
