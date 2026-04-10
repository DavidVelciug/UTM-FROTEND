import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import FilterButtons from '../components/FilterButtons';
import ProductList from '../components/ProductList';
import Counter from '../components/Counter';
import { products as mockProducts, Product } from '../data/products';
import layout from '../styles/layout.module.css';
import styles from '../styles/catalog.module.css';

const Catalog: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<string>('Все');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [likedCount, setLikedCount] = useState<number>(0);

  const categories = ['Все', ...new Set(mockProducts.map((p) => p.category))];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setProducts(mockProducts);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Ошибка при загрузке');
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'Все' || product.category === filter;
    return matchesSearch && matchesFilter;
  });

  const handleLike = (_id: number, liked: boolean) => {
    setLikedCount((prev) => (liked ? prev + 1 : prev - 1));
  };

  return (
    <div className={styles.catalogPage}>
      <Header />
      <main className={layout.mainContent}>
        <div className={styles.catalogHeaderSection}>
          <h1>Архив воспоминаний</h1>
          <p>Исследуйте капсулы времени, созданные другими людьми</p>
        </div>

        <div className={layout.container}>
          <div className={styles.catalogControls}>
            <Counter count={filteredProducts.length} likedCount={likedCount} />
            <SearchBar value={search} onChange={setSearch} />
            <FilterButtons categories={categories} activeFilter={filter} onFilterChange={setFilter} />
          </div>

          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.loader} />
              <p>Загружаем капсулы времени...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorState}>
              <p>❌ Ошибка: {error}</p>
              <button type="button" onClick={() => window.location.reload()} className={layout.btnPrimary}>
                Попробовать снова
              </button>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <ProductList products={filteredProducts} onLike={handleLike} />
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className={styles.emptyState}>
              <p>🔍 Ничего не найдено</p>
              <p className={styles.emptyHint}>Попробуйте изменить параметры поиска</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog;