import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SearchBar from '../components/filters/SearchBar';
import ProductList from '../components/catalog/ProductList';
import Pagination from '../components/common/Pagination';
import layout from '../styles/layout.module.css';
import styles from '../styles/Catalog.module.css';
import spinner from '../styles/loading.module.css';
import { fetchJson } from '../config/api';
import type { CategoryDto, ProductDto } from '../types/api';
import { getCatalogCounts, getCatalogUserReaction, toggleCatalogReaction } from '../auth/reactions';
import { useInView } from '../hooks/useInView';

const TABS = ['Все', 'Личное', 'Мечты', 'Публичное', 'Прошлое'];

const Catalog: React.FC = () => {
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>(0.2);
  const { ref: controlsRef, inView: controlsInView } = useInView<HTMLDivElement>(0.2);

  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<string>('Все');
  const [sortByPrice, setSortByPrice] = useState<'asc' | 'desc'>('asc');
  const [sortByNewest, setSortByNewest] = useState<'all' | 'newest'>('all');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [likesMap, setLikesMap] = useState<Record<number, number>>({});
  const [dislikesMap, setDislikesMap] = useState<Record<number, number>>({});
  const [userReactions, setUserReactions] = useState<Record<number, 'like' | 'dislike' | null>>({});
  const navigate = useNavigate();
  const pageSize = 8;

  const refreshReactions = (items: ProductDto[]) => {
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
        const mapped: ProductDto[] = data.map((p) => ({
          ...p,
          price: Number(p.price),
          category: p.category || (catMap.get(p.categoryId) ?? 'Без категории'),
          image: p.image || '/assets/default-capsule-cover.svg',
          description: p.description || 'Без описания',
          creatorName: p.creatorName || 'Пользователь',
          creatorEmail: p.creatorEmail || 'hidden@memorylane.local',
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

  const filteredProducts = useMemo(
    () =>
      products
        .filter((product) => {
          const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
          const matchesFilter = filter === 'Все' || product.category === filter;
          return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
          if (sortByNewest === 'newest') return b.id - a.id;
          return sortByPrice === 'asc' ? a.price - b.price : b.price - a.price;
        }),
    [filter, products, search, sortByNewest, sortByPrice],
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
    const product = products.find((p) => p.capsuleId === capsuleId);
    const price = product?.price ?? 0;
    navigate(`/feed-capsule/${capsuleId}?source=catalog&price=${price}`);
  };

  return (
    <div className={`${layout.pageWrapper} ${styles.catalogPage} ${layout.withBg}`}>
      <Header />
        <main className={layout.mainContent}>
          <div ref={headerRef} className={`${styles.catalogHeaderSection} ${styles.fadeInUp} ${headerInView ? styles.fadeInUpVisible : ''}`}>
            <h1>Архив воспоминаний</h1>
            <p>Исследуйте капсулы времени, созданные другими людьми</p>
          </div>

          <div className={layout.container}>
            <div ref={controlsRef} className={`${styles.catalogControls} ${styles.fadeInUp} ${styles.delay100} ${controlsInView ? styles.fadeInUpVisible : ''}`}>
              <SearchBar value={search} onChange={setSearch} />

              <div className={styles.tabGroup}>
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`${styles.tabBtn} ${filter === tab ? styles.tabBtnActive : ''}`}
                    onClick={() => { setFilter(tab); setPage(1); }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className={styles.filterRow}>
                <div className={styles.selectWrapper}>
                  <svg className={styles.selectIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <select
                    className={styles.filterSelect}
                    value={sortByNewest}
                    onChange={(e) => setSortByNewest(e.target.value as 'all' | 'newest')}
                  >
                    <option value="all">All Items</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                <div className={styles.selectWrapper}>
                  <svg className={styles.selectIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="3" x2="12" y2="21" />
                    <polyline points="8 7 12 3 16 7" />
                    <polyline points="16 17 12 21 8 17" />
                  </svg>
                  <select
                    className={styles.filterSelect}
                    value={sortByPrice}
                    onChange={(e) => setSortByPrice(e.target.value as 'asc' | 'desc')}
                  >
                    <option value="asc">Sort by Price ↑</option>
                    <option value="desc">Sort by Price ↓</option>
                  </select>
                </div>
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
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
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
