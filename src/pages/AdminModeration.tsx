import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import page from '../styles/pageSection.module.css';
import catalog from '../styles/catalog.module.css';
import { fetchJson } from '../config/api';
import type { ModerationReportDto, ResponceMsg, TimeCapsuleDto } from '../types/api';

const AdminModeration: React.FC = () => {
  const [capsules, setCapsules] = useState<TimeCapsuleDto[]>([]);
  const [reports, setReports] = useState<ModerationReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [c, r] = await Promise.all([
        fetchJson<TimeCapsuleDto[]>('/api/timecapsule/getAll'),
        fetchJson<ModerationReportDto[]>('/api/moderationreport/getAll'),
      ]);
      setCapsules(c);
      setReports(r);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const publicCapsules = useMemo(() => capsules.filter((x) => x.isPublic), [capsules]);

  const deleteCapsule = async (id: number) => {
    setInfo(null);
    try {
      const res = await fetchJson<ResponceMsg>(`/api/timecapsule/id?id=${id}`, { method: 'DELETE' });
      setInfo(res.message);
      await load();
    } catch (e: unknown) {
      setInfo(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  const deleteReport = async (id: number) => {
    setInfo(null);
    try {
      const res = await fetchJson<ResponceMsg>(`/api/moderationreport/id?id=${id}`, { method: 'DELETE' });
      setInfo(res.message);
      await load();
    } catch (e: unknown) {
      setInfo(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <div className={page.pageHeader}>
          <h1>Админ: модерация</h1>
          <p>Публичные капсулы и жалобы. Удаление спама — через удаление капсулы или жалобы.</p>
        </div>
        <div className={`${page.section} ${layout.container}`}>
          {loading && (
            <div className={catalog.loadingState}>
              <div className={catalog.loader} />
            </div>
          )}
          {error && <div className={catalog.errorState}>❌ {error}</div>}
          {info && <p className={page.muted}>{info}</p>}

          <div className={page.card}>
            <h2>Публичные капсулы</h2>
            {publicCapsules.length === 0 && <p className={page.muted}>Нет публичных записей</p>}
            {publicCapsules.map((c) => (
              <div key={c.id} className={page.row} style={{ justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span>
                  #{c.id} {c.title}
                </span>
                <button type="button" className={layout.btnPrimary} onClick={() => deleteCapsule(c.id)}>
                  Удалить
                </button>
              </div>
            ))}
          </div>

          <div className={page.card}>
            <h2>Жалобы</h2>
            {reports.length === 0 && <p className={page.muted}>Жалоб нет</p>}
            {reports.map((r) => (
              <div key={r.id} className={page.card} style={{ marginBottom: '0.5rem' }}>
                <p>
                  <strong>Капсула #{r.capsuleId}</strong> — {r.reporterEmail}
                </p>
                <p className={page.muted}>{r.reason}</p>
                <button type="button" className={layout.btnPrimary} onClick={() => deleteReport(r.id)}>
                  Закрыть (удалить жалобу)
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminModeration;
