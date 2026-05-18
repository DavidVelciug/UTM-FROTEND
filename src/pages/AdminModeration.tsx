import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import styles from '../styles/adminModeration.module.css';
import { fetchJson } from '../config/api';
import type { ModerationReportDto, ProductDto, ResponceMsg, TimeCapsuleDto } from '../types/api';

const AdminModeration: React.FC = () => {
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
    if (!window.confirm('Удалить эту капсулу навсегда?')) return;
    try {
      const res = await fetchJson<ResponceMsg>(`/api/timecapsule/id?id=${id}`, { method: 'DELETE' });
      setInfo(res.message);
      await load();
    } catch (e: unknown) {
      setInfo(e instanceof Error ? e.message : 'Ошибка');
    }
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
    if (!window.confirm('Удалить товар из каталога?')) return;
    try {
      const res = await fetchJson<ResponceMsg>(`/api/product/id?id=${id}`, { method: 'DELETE' });
      setInfo(res.message);
      await load();
    } catch (e: unknown) {
      setInfo(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  return (
    <div className={`${layout.pageWrapper} ${layout.withBg}`}>
      <Header />
        <main className={layout.mainContent}>
        <div className={styles.pageHeader}>
          <h1 className={layout.fadeIn}>Модерация</h1>
          <p className={layout.fadeIn}>Эстетичная панель управления безопасностью и контентом платформы.</p>
          <div className={`${styles.tabContainer} ${layout.fadeIn}`}>
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
            <div className={layout.fadeIn}>
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
                        <span className={styles.muted}>Автор жалобы: <span style={{color: 'var(--ml-text-main)'}}>{r.reporterDisplayName || 'Аноним'}</span></span>
                      </div>
                      <div className={layout.row} style={{marginTop: '2rem', gap: '0.5rem'}}>
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
                      <div className={layout.row} style={{marginTop: '2rem', justifyContent: 'space-between'}}>
                        <span className={styles.muted}>Публичный доступ</span>
                        <button className={styles.dangerBtn} onClick={() => deleteCapsule(c.id)}>Удалить</button>
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
                      <div className={layout.row} style={{marginTop: '2rem', justifyContent: 'space-between'}}>
                        <span className={layout.textGradient}>{item.price} pts</span>
                        <button className={styles.dangerBtn} onClick={() => void deleteCatalogItem(item.id)}>Убрать</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className={styles.pagination}>
                <button className={layout.btnPrimary} onClick={() => {
                   if(tab==='reports') setReportsPage(p=>p-1);
                   if(tab==='public') setPublicPage(p=>p-1);
                   if(tab==='catalog') setCatalogPage(p=>p-1);
                }} disabled={tab==='reports'?reportsPage<=1:tab==='public'?publicPage<=1:catalogPage<=1}>←</button>
                <span className={styles.muted}>Page {tab==='reports'?reportsPage:tab==='public'?publicPage:catalogPage}</span>
                <button className={layout.btnPrimary} onClick={() => {
                   if(tab==='reports') setReportsPage(p=>p+1);
                   if(tab==='public') setPublicPage(p=>p+1);
                   if(tab==='catalog') setCatalogPage(p=>p+1);
                }} disabled={tab==='reports'?reportsPage>=Math.ceil(reports.length/pageSize):tab==='public'?publicPage>=Math.ceil(publicCapsules.length/pageSize):catalogPage>=Math.ceil(catalogItems.length/pageSize)}>→</button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminModeration;