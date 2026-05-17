import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SearchBar from '../components/filters/SearchBar';
import FilterButtons from '../components/filters/FilterButtons';
import ProductList from '../components/catalog/ProductList';
import { Product } from '../data/products';
import layout from '../styles/layout.module.css';
import styles from '../styles/Catalog.module.css';
import spinner from '../styles/loading.module.css';
import { fetchJson } from '../config/api';
import type { CategoryDto, ProductDto } from '../types/api';
import { getCatalogCounts, getCatalogUserReaction, toggleCatalogReaction } from '../auth/reactions';

const Catalog: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<string>('Все');
  const [sortByPrice, setSortByPrice] = useState<'asc' | 'desc'>('asc');
  const [tab, setTab] = useState<'all' | 'new'>('all');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [likesMap, setLikesMap] = useState<Record<number, number>>({});
  const [dislikesMap, setDislikesMap] = useState<Record<number, number>>({});
  const [userReactions, setUserReactions] = useState<Record<number, 'like' | 'dislike' | null>>({});
  const navigate = useNavigate();
  const pageSize = 8;

  const refreshReactions = (items: Product[]) => {
    const likes: Record<number, number> = {};
    const dislikes: Record<number, number> = {};
    const user: Record<number, 'like' | 'dislike' | null> = {};

    items.forEach((item) => {
      const counts = getCatalogCounts(item.id);
      likes[item.id] = counts.likes;
      dislikes[item.id] = counts.dislikes;
      user[item.id] = getCatalogUserReaction(item.id);
    });

    setLikesMap(likes);
    setDislikesMap(dislikes);
    setUserReactions(user);
  };

  const loadProducts = async () => {
      try {
        setLoading(true);
        const [data, cats] = await Promise.all([
          fetchJson<ProductDto[]>('/api/product/getAll'),
          fetchJson<CategoryDto[]>('/api/category/getAll'),
        ]);
        const catMap = new Map<number, string>(cats.map((c) => [c.id, c.name]));
        setCategoryNames(cats.map((c) => c.name));
        const mapped: Product[] = data.map((p) => ({
          id: p.id,
          capsuleId: p.capsuleId ?? null,
          name: p.name,
          price: Number(p.price),
          category: p.category || (catMap.get(p.categoryId) ?? 'Без категории'),
          image: p.image || '/assets/default-capsule-cover.svg',
          description: p.description || 'Без описания',
          creatorName: 'Пользователь',
          creatorEmail: 'hidden@memorylane.local',
        }));
        setProducts(mapped);
        refreshReactions(mapped);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Ошибка при загрузке');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadProducts();
  }, []);

  useEffect(() => {
    const onFocus = () => void loadProducts();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const categories = useMemo(() => ['Все', ...new Set(categoryNames.length ? categoryNames : products.map((p) => p.category))], [categoryNames, products]);

  const filteredProducts = useMemo(
    () =>
      products
        .filter((product) => {
          const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
          const matchesFilter = filter === 'Все' || product.category === filter;
          const matchesTab = tab === 'all' || product.id > Math.max(0, products.length - pageSize);
          return matchesSearch && matchesFilter && matchesTab;
        })
        .sort((a, b) => (sortByPrice === 'asc' ? a.price - b.price : b.price - a.price)),
    [filter, pageSize, products, search, sortByPrice, tab],
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paged = useMemo(
    () => filteredProducts.slice((page - 1) * pageSize, page * pageSize),
    [filteredProducts, page, pageSize],
  );

  const handleLike = (id: number) => {
    toggleCatalogReaction(id, 'like');
    refreshReactions(products);
  };

  const handleDislike = (id: number) => {
    toggleCatalogReaction(id, 'dislike');
    refreshReactions(products);
  };

  const handleOpen = (capsuleId: number | null | undefined) => {
    if (!capsuleId) {
      setError('У этой позиции каталога нет связанной капсулы. Пересоздайте капсулу в режиме каталога.');
      return;
    }
    navigate(`/capsule-view/${capsuleId}`);
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
            <SearchBar value={search} onChange={setSearch} />
            <FilterButtons categories={categories} activeFilter={filter} onFilterChange={setFilter} />
            <div className={styles.catalogControls}>
              <select
                className={layout.btnPrimary}
                value={sortByPrice}
                onChange={(e) => setSortByPrice(e.target.value as 'asc' | 'desc')}
              >
                <option value="asc">Цена: по возрастанию</option>
                <option value="desc">Цена: по убыванию</option>
              </select>
              <select
                className={layout.btnPrimary}
                value={tab}
                onChange={(e) => {
                  setTab(e.target.value as 'all' | 'new');
                  setPage(1);
                }}
              >
                <option value="all">Все товары</option>
                <option value="new">Новые товары</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className={spinner.loadingState}>
              <div className={spinner.loader} />
              <p>Загружаем капсулы времени...</p>
            </div>
          )}

          {error && (
            <div className={spinner.errorState}>
              <p>Ошибка: {error}</p>
              <button type="button" onClick={() => window.location.reload()} className={layout.btnPrimary}>
                Попробовать снова
              </button>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <>
              <ProductList
                products={paged}
                likesMap={likesMap}
                dislikesMap={dislikesMap}
                userReactions={userReactions}
                onLike={handleLike}
                onDislike={handleDislike}
                onOpen={handleOpen}
              />
              <div className={styles.catalogControls}>
                <button
                  type="button"
                  className={layout.btnPrimary}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Назад
                </button>
                <span>{page} / {totalPages}</span>
                <button
                  type="button"
                  className={layout.btnPrimary}
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Вперёд
                </button>
              </div>
            </>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className={spinner.emptyState}>
              <p>Ничего не найдено</p>
              <p className={spinner.emptyHint}>Попробуйте изменить параметры поиска</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog;
