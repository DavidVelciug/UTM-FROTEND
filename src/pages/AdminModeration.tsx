import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Pagination from '../components/common/Pagination';
import layout from '../styles/layout.module.css';
import styles from '../styles/adminModeration.module.css';
import { fetchJson } from '../config/api';
import { getAvatar } from '../auth/avatar';
import { getCurrentUserEmail } from '../auth/session';
import { resolveMediaUrl } from '../utils/file';
import type { ModerationReportDto, ProductDto, ResponceMsg, TimeCapsuleDto } from '../types/api';
import ConfirmModal from '../components/ConfirmModal';
import { useInView } from '../hooks/useInView';

const AdminModeration: React.FC = () => {
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>(0.2);
  const { ref: contentRef, inView: contentInView } = useInView<HTMLDivElement>(0.15);
  const [capsules, setCapsules] = useState<TimeCapsuleDto[]>([]);
  const [reports, setReports] = useState<ModerationReportDto[]>([]);
  const [catalogItems, setCatalogItems] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [reportsPage, setReportsPage] = useState(1);
  const [publicPage, setPublicPage] = useState(1);
  const [catalogPage, setCatalogPage] = useState(1);
  const pageSize = 12;
  const [tab, setTab] = useState<'reports' | 'public' | 'catalog'>('reports');
  const [confirmAction, setConfirmAction] = useState<{ message: string; action: () => void } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [c, r, p] = await Promise.all([
        fetchJson<TimeCapsuleDto[]>('/api/timecapsule/getAll'),
        fetchJson<ModerationReportDto[]>('/api/moderationreport/getAll'),
        fetchJson<ProductDto[]>('/api/product/getAll'),
      ]);
      setCapsules(c);
      setReports(r);
      setCatalogItems(p);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка связи с сервером');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const publicCapsules = useMemo(() => capsules.filter((x) => x.isPublic), [capsules]);
  const pagedReports = reports.slice((reportsPage - 1) * pageSize, reportsPage * pageSize);
  const pagedPublic = publicCapsules.slice((publicPage - 1) * pageSize, publicPage * pageSize);
  const pagedCatalog = catalogItems.slice((catalogPage - 1) * pageSize, catalogPage * pageSize);

  const deleteCapsule = async (id: number) => {
    setConfirmAction({
      message: 'Удалить эту капсулу навсегда?',
      action: async () => {
        setConfirmAction(null);
        try {
          const res = await fetchJson<ResponceMsg>(`/api/timecapsule/id?id=${id}`, { method: 'DELETE' });
          setInfo(res.message);
          await load();
        } catch (e: unknown) {
          setInfo(e instanceof Error ? e.message : 'Ошибка');
        }
      },
    });
  };

  const updateReport = async (report: ModerationReportDto, status: number) => {
    try {
      const res = await fetchJson<ResponceMsg>('/api/moderationreport', {
        method: 'PUT',
        body: JSON.stringify({ ...report, status }),
      });
      setInfo(res.message);
      await load();
    } catch (e: unknown) {
      setInfo(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  const acceptReportAndBanPost = async (report: ModerationReportDto) => {
    await updateReport(report, 1);
    await deleteCapsule(report.capsuleId);
  };

  const deleteCatalogItem = async (id: number) => {
    setConfirmAction({
      message: 'Удалить товар из каталога?',
      action: async () => {
        setConfirmAction(null);
        try {
          const res = await fetchJson<ResponceMsg>(`/api/product/id?id=${id}`, { method: 'DELETE' });
          setInfo(res.message);
          await load();
        } catch (e: unknown) {
          setInfo(e instanceof Error ? e.message : 'Ошибка');
        }
      },
    });
  };

  return (
    <div className={`${layout.pageWrapper} ${layout.withBg}`}>
      <Header />
        <main className={layout.mainContent}>
        <div ref={headerRef} className={`${styles.pageHeader} ${layout.fadeInUp} ${headerInView ? layout.fadeInUpVisible : ''}`}>
          <h1>Модерация</h1>
          <p>Эстетичная панель управления безопасностью и контентом платформы.</p>
          <div className={styles.tabContainer}>
            <button className={`${styles.tabBtn} ${tab === 'reports' ? styles.activeTab : ''}`} onClick={() => setTab('reports')}>Жалобы ({reports.length})</button>
            <button className={`${styles.tabBtn} ${tab === 'public' ? styles.activeTab : ''}`} onClick={() => setTab('public')}>Публикации ({publicCapsules.length})</button>
            <button className={`${styles.tabBtn} ${tab === 'catalog' ? styles.activeTab : ''}`} onClick={() => setTab('catalog')}>Каталог ({catalogItems.length})</button>
          </div>
        </div>

        <div className={`${styles.section} ${layout.container}`}>
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.loader} />
              <span className={layout.textGradient}>Загружаем данные...</span>
            </div>
          )}

          {error && <div className={styles.errorState}><h3>Упс!</h3><p>{error}</p></div>}
          
          {!loading && !error && (
            <div ref={contentRef} className={`${layout.fadeInUp} ${contentInView ? layout.fadeInUpVisible : ''}`}>
              {tab === 'reports' && (
                <div className={styles.grid}>
                  {reports.length === 0 && <div className={styles.card} style={{gridColumn: '1/-1', textAlign: 'center'}}>Жалоб пока нет</div>}
                  {pagedReports.map((r) => (
                    <article key={r.id} className={styles.card}>
                      <div className={layout.row} style={{justifyContent: 'space-between', marginBottom: '1rem'}}>
                        <span className={styles.idBadge}>REPORT #{r.id}</span>
                        <div className={layout.row}>
                          <span className={styles.statusIndicator} style={{background: r.status === 0 ? '#6366f1' : r.status === 1 ? '#10b981' : '#ef4444'}}></span>
                          <span style={{fontSize: '0.8rem', fontWeight: 700}}>{r.status === 0 ? 'NEW' : r.status === 1 ? 'ACCEPTED' : 'REJECTED'}</span>
                        </div>
                      </div>
                      <p style={{minHeight: '60px', fontWeight: 500}}>{r.reason}</p>
                      <div className={styles.innerCard}>
                        <span className={styles.muted}>Капсула: <span style={{color: 'var(--ml-text-main)'}}>#{r.capsuleId}</span></span><br/>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem'}}>
                          <img
                            src={(() => {
                              const currentEmail = getCurrentUserEmail();
                              const isMe = r.reporterEmail && currentEmail && r.reporterEmail.toLowerCase() === currentEmail.toLowerCase();
                              return isMe ? resolveMediaUrl(getAvatar(), '/assets/default-avatar.svg') : '/assets/default-avatar.svg';
                            })()}
                            alt=""
                            className={styles.reporterAvatar}
                            onError={(e) => { e.currentTarget.src = '/assets/default-avatar.svg'; }}
                          />
                          <span className={styles.muted}>Автор жалобы: <span style={{color: 'var(--ml-text-main)'}}>{r.reporterDisplayName || 'Аноним'}</span></span>
                        </div>
                      </div>
                      <div style={{marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                        <Link to={`/admin/moderation/review?capsuleId=${r.capsuleId}&reportId=${r.id}`} className={styles.actionBtn}>Обзор</Link>
                        <button className={styles.dangerBtn} onClick={() => void acceptReportAndBanPost(r)}>Бан</button>
                        <button className={styles.actionBtn} style={{background: 'rgba(255,255,255,0.05)', color: 'white'}} onClick={() => void updateReport(r, 2)}>Skip</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {tab === 'public' && (
                <div className={styles.grid}>
                  {pagedPublic.map((c) => (
                    <article key={c.id} className={styles.card}>
                      <span className={styles.idBadge}>CAPSULE #{c.id}</span>
                      <h3 style={{marginTop: '1rem'}}>{c.title || 'Untitled Archive'}</h3>
                      <div style={{marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem'}}>
                        <span className={styles.muted}>Публичный доступ</span>
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          <Link to={`/feed-capsule/${c.id}?source=moderation`} className={styles.actionBtn}>Обзор</Link>
                          <button className={styles.dangerBtn} onClick={() => deleteCapsule(c.id)}>Удалить</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {tab === 'catalog' && (
                <div className={styles.grid}>
                  {pagedCatalog.map((item) => (
                    <article key={item.id} className={styles.card}>
                      <span className={styles.idBadge}>PRODUCT #{item.id}</span>
                      <h3 style={{marginTop: '1rem'}}>{item.name}</h3>
                      <div style={{marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem'}}>
                        <span className={layout.textGradient}>{item.price} pts</span>
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          {item.capsuleId != null && (
                            <Link to={`/feed-capsule/${item.capsuleId}?source=moderation`} className={styles.actionBtn}>Обзор</Link>
                          )}
                          <button className={styles.dangerBtn} onClick={() => void deleteCatalogItem(item.id)}>Убрать</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {(() => {
                const page = tab === 'reports' ? reportsPage : tab === 'public' ? publicPage : catalogPage;
                const total = tab === 'reports' ? Math.ceil(reports.length / pageSize) : tab === 'public' ? Math.ceil(publicCapsules.length / pageSize) : Math.ceil(catalogItems.length / pageSize);
                const setPage = (p: number) => { if (tab === 'reports') setReportsPage(p); else if (tab === 'public') setPublicPage(p); else setCatalogPage(p); };
                return <Pagination page={page} totalPages={total} onPageChange={setPage} />;
              })()}
            </div>
          )}
        </div>
      </main>
      <ConfirmModal
        open={!!confirmAction}
        title="Подтверждение"
        message={confirmAction?.message ?? ''}
        danger
        onConfirm={confirmAction?.action}
        onCancel={() => setConfirmAction(null)}
      />
      <Footer />
    </div>
  );
};

export default AdminModeration;