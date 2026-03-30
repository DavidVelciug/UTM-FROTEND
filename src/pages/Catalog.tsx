import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import FilterButtons from '../components/FilterButtons';
import ProductList from '../components/ProductList';
import Counter from '../components/Counter';
import { products as mockProducts, Product } from '../data/products';

const Catalog: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<string>("Все");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [likedCount, setLikedCount] = useState<number>(0);

  const categories = ["Все", ...new Set(mockProducts.map(p => p.category))];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProducts(mockProducts);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Ошибка при загрузке");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "Все" || product.category === filter;
    return matchesSearch && matchesFilter;
  });

  const handleLike = (id: number, liked: boolean) => {
    setLikedCount(prev => liked ? prev + 1 : prev - 1);
  };

  return (
    <div className="catalog-page">
      <Header />
      <main className="main-content">
        <div className="catalog-header-section">
          <h1>Архив воспоминаний</h1>
          <p>Исследуйте капсулы времени, созданные другими людьми</p>
        </div>
        
        <div className="container">
          <div className="catalog-controls">
            <Counter count={filteredProducts.length} likedCount={likedCount} />
            <SearchBar value={search} onChange={setSearch} />
            <FilterButtons 
              categories={categories} 
              activeFilter={filter} 
              onFilterChange={setFilter} 
            />
          </div>
          
          {loading && (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Загружаем капсулы времени...</p>
            </div>
          )}
          
          {error && (
            <div className="error-state">
              <p>❌ Ошибка: {error}</p>
              <button onClick={() => window.location.reload()} className="btn-primary">
                Попробовать снова
              </button>
            </div>
          )}
          
          {!loading && !error && filteredProducts.length > 0 && (
            <ProductList products={filteredProducts} onLike={handleLike} />
          )}
          
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="empty-state">
              <p>🔍 Ничего не найдено</p>
              <p className="empty-hint">Попробуйте изменить параметры поиска</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog;