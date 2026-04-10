import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../data/products';
import styles from '../styles/productCard.module.css';

interface ProductListProps {
  products: Product[];
  onLike: (id: number, liked: boolean) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onLike }) => {
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
          onLike={onLike}
        />
      ))}
    </div>
  );
};

export default ProductList;