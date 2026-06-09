import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import styles from '../styles/myCapsule.module.css';
import { fetchJson } from '../config/api';
import { getCurrentUserId } from '../auth/session';
import { parseCapsuleStorage } from '../utils/file';
import { uploadFile } from '../utils/upload';
import ConfirmModal from '../components/ConfirmModal';
import type { CapsuleLocationDto, ProductDto, ResponceMsg, TimeCapsuleDto } from '../types/api';

const COVER_PREFIX = '__cover__:';

const DefaultIcon = L.icon({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function formatCountdown(target: Date, now: Date): string {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 'Открыта';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return `${days}д ${hours}ч ${mins}м ${secs}с`;
}

function getContentTypeName(type: number): string {
  switch (type) {
    case 0: return '📝 Текст';
    case 1: return '🔗 Ссылка';
    case 2: return '📁 Файл';
    default: return '📦 Капсула';
  }
}

type EditMeta = {
  product?: ProductDto | null;
  location?: CapsuleLocationDto | null;
  editingPrice: string;
  editingLat: number;
  editingLng: number;
  editingPlaceLabel: string;
  fileCover: string;
  fileList: string[];
};

const MapController: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
};

const LocationPicker: React.FC<{ onPick: (lat: number, lng: number) => void }> = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LOC_DEFAULT_LAT = 55.7558;
const LOC_DEFAULT_LNG = 37.6176;

function isLocationDefault(lat: number, lng: number): boolean {
  return Math.abs(lat - LOC_DEFAULT_LAT) < 0.01 && Math.abs(lng - LOC_DEFAULT_LNG) < 0.01;
}

const MyCapsules: React.FC = () => {
  const userId = getCurrentUserId();
  const [items, setItems] = useState<TimeCapsuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMeta, setEditMeta] = useState<EditMeta | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!userId) {
          setItems([]);
          setError('Сначала выполните вход в систему.');
          return;
        }
        setLoading(true);
        const data = await fetchJson<TimeCapsuleDto[]>(
          `/api/timecapsule/getByOwner?ownerUserId=${userId}`,
        );
        if (!cancelled) {
          setItems(data);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Не удалось загрузить капсулы');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime()),
    [items],
  );

  useEffect(() => {
    if (editingId === null) {
      setEditMeta(null);
      return;
    }
    const cap = items.find((x) => x.id === editingId);
    let fileCover = '';
    let fileList: string[] = [];
    if (cap) {
      if (cap.contentType === 2) {
        const parsed = parseCapsuleStorage(cap.fileStoragePath);
        fileCover = parsed.cover ?? '';
        fileList = [...parsed.attachments];
      } else {
        fileCover = cap.fileStoragePath ?? '';
        fileList = [];
      }
    }
    setEditMeta({
      product: null,
      location: null,
      editingPrice: '0',
      editingLat: LOC_DEFAULT_LAT,
      editingLng: LOC_DEFAULT_LNG,
      editingPlaceLabel: '',
      fileCover,
      fileList,
    });
    let cancelled = false;
    (async () => {
      try {
        const [products, location] = await Promise.all([
          fetchJson<ProductDto[]>('/api/product/getAll'),
          fetchJson<CapsuleLocationDto | null>(`/api/capsulelocation/byCapsule?capsuleId=${editingId}`).catch(() => null),
        ]);
        if (cancelled) return;
        const prod = products.find((p) => p.capsuleId === editingId) ?? null;
        setEditMeta((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            product: prod,
            editingPrice: prod ? String(prod.price) : prev.editingPrice,
            location: location ?? undefined,
            editingLat: location?.latitude ?? prev.editingLat,
            editingLng: location?.longitude ?? prev.editingLng,
            editingPlaceLabel: location?.placeLabel ?? prev.editingPlaceLabel,
          };
        });
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [editingId]);

  const buildFileStoragePath = (): string | null => {
    if (!editMeta) return null;
    if (capsuleBeingEdited?.contentType === 2) {
      const lines: string[] = [];
      if (editMeta.fileCover) lines.push(`${COVER_PREFIX}${editMeta.fileCover}`);
      lines.push(...editMeta.fileList);
      return lines.join('\n') || null;
    }
    return editMeta.fileCover || null;
  };

  const capsuleBeingEdited = items.find((x) => x.id === editingId) ?? null;

  const saveCapsule = async (capsule: TimeCapsuleDto) => {
    try {
      const updatedCapsule = editMeta
        ? { ...capsule, fileStoragePath: buildFileStoragePath() }
        : capsule;
      const [res] = await Promise.all([
        fetchJson<ResponceMsg>('/api/timecapsule', {
          method: 'PUT',
          body: JSON.stringify(updatedCapsule),
        }),
        (async () => {
          if (!editMeta) return;
          if (editMeta.product) {
            await fetchJson<ResponceMsg>('/api/product', {
              method: 'PUT',
              body: JSON.stringify({ ...editMeta.product, price: Number(editMeta.editingPrice) || 0 }),
            });
          }
          if (editMeta.location) {
            await fetchJson<ResponceMsg>('/api/capsulelocation', {
              method: 'PUT',
              body: JSON.stringify({
                ...editMeta.location,
                latitude: editMeta.editingLat,
                longitude: editMeta.editingLng,
                placeLabel: editMeta.editingPlaceLabel || `${editMeta.editingLat.toFixed(5)}, ${editMeta.editingLng.toFixed(5)}`,
              }),
            });
          } else if (!isLocationDefault(editMeta.editingLat, editMeta.editingLng)) {
            await fetchJson<ResponceMsg>('/api/capsulelocation', {
              method: 'POST',
              body: JSON.stringify({
                id: 0,
                capsuleId: capsule.id,
                latitude: editMeta.editingLat,
                longitude: editMeta.editingLng,
                placeLabel: editMeta.editingPlaceLabel || `${editMeta.editingLat.toFixed(5)}, ${editMeta.editingLng.toFixed(5)}`,
              }),
            });
          }
        })(),
      ]);
      if (res.isSuccess) {
        setEditingId(null);
        setError(null);
      } else {
        setError(res.message);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка при сохранении');
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const deleteCapsule = async (capsuleId: number) => {
    if (!userId) return;
    try {
      const res = await fetchJson<ResponceMsg>(
        `/api/timecapsule/owner?id=${capsuleId}&ownerUserId=${userId}`,
        { method: 'DELETE' },
      );
      if (!res.isSuccess) {
        setError(res.message);
        return;
      }
      setItems((prev) => prev.filter((x) => x.id !== capsuleId));
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка при удалении');
    }
  };

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const visible = sorted.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

  return (
    <div className={`${layout.pageWrapper} ${layout.withBg}`}>
      <Header />
        <main className={layout.mainContent}>
        <div className={styles.pageHeader}>
          <div className={layout.container}>
            <h1>Мои Капсулы</h1>
            <p>Ваша персональная коллекция запечатанных во времени посланий. Управляйте своими капсулами и следите за таймерами.</p>
          </div>
        </div>

        <div className={`${styles.section} ${layout.container}`}>
          {loading && (
            <div className={`${styles.loadingState} ${layout.fadeIn}`}>
              <div className={styles.loader} />
              <p className={styles.muted}>Синхронизация с временным потоком...</p>
            </div>
          )}

          {error && (
            <div className={`${styles.errorState} ${layout.fadeIn}`}>
              <div className={styles.errorIcon}>⚠️</div>
              <p>{error}</p>
              <p className={styles.muted} style={{ fontSize: '0.9rem' }}>Проверьте подключение или повторите попытку позже.</p>
            </div>
          )}

          {!loading && !error && sorted.length === 0 && (
            <div className={`${styles.emptyState} ${layout.fadeIn}`}>
              <div className={styles.emptyIcon}>⏳</div>
              <p>Здесь пока пусто</p>
              <p className={styles.emptyHint}>Вы еще не создали ни одной капсулы времени. Самое время оставить послание в будущее!</p>
              <a href="/create" className={`${layout.btnPrimaryLarge} ${layout.mt2}`}>Создать первую капсулу</a>
            </div>
          )}

          {!loading && !error && visible.map((c) => {
            const open = new Date(c.openAtUtc);
            const sealed = open.getTime() > now.getTime();
            
            return (
              <div key={c.id} className={`${styles.card} ${layout.fadeIn}`}>
                <div className={styles.cardHeader}>
                  <h2>{c.title || 'Без названия'}</h2>
                  <span className={`${styles.badge} ${sealed ? styles.badgeSealed : styles.badgeOpen}`}>
                    {sealed ? '🔒 Запечатано' : '🔓 Открыта'}
                  </span>
                </div>

                <div className={styles.cardInfo}>
                  <p className={styles.muted}>
                    <span>Тип содержимого:</span> 
                    <strong>{getContentTypeName(c.contentType)}</strong>
                  </p>
                  
                  {editingId === c.id ? (
                    <div className={styles.formGrid}>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Название капсулы</label>
                        <input
                          className={styles.input}
                          value={c.title}
                          placeholder="Введите название"
                          onChange={(e) =>
                            setItems((prev) => prev.map((x) => (x.id === c.id ? { ...x, title: e.target.value } : x)))
                          }
                        />
                      </div>

                      {editMeta && (
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Превью / Обложка</label>
                          {editMeta.fileCover && (
                            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img
                                  src={(() => {
                                    const src = editMeta.fileCover.trim();
                                    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) return src;
                                    return src.startsWith('/') ? src : `/${src}`;
                                  })()}
                                  alt="preview"
                                  style={{ maxWidth: 200, maxHeight: 120, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--ml-border-light)' }}
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditMeta((prev) => prev ? { ...prev, fileCover: '' } : null)}
                                  style={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: 'rgba(0,0,0,0.6)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    backdropFilter: 'blur(4px)',
                                  }}
                                  title="Удалить обложку"
                                >
                                  🗑
                                </button>
                              </div>
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                              className={styles.input}
                              style={{ flex: 1 }}
                              value={editMeta.fileCover}
                              placeholder="URL обложки"
                              onChange={(e) =>
                                setEditMeta((prev) => prev ? { ...prev, fileCover: e.target.value } : null)
                              }
                            />
                            <input
                              id={`cover-all-${c.id}`}
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const path = await uploadFile(file, 'capsules');
                                  setEditMeta((prev) => prev ? { ...prev, fileCover: path } : null);
                                } catch (err: unknown) {
                                  setError(err instanceof Error ? err.message : 'Ошибка загрузки обложки');
                                }
                                e.target.value = '';
                              }}
                            />
                            <button
                              type="button"
                              className={`${layout.btnPrimary} ${layout.btnSecondary}`}
                              style={{ whiteSpace: 'nowrap', padding: '0 1rem', background: 'var(--ml-border-light)', color: 'var(--ml-text-main)' }}
                              onClick={() => document.getElementById(`cover-all-${c.id}`)?.click()}
                            >
                              Загрузить
                            </button>
                          </div>
                        </div>
                      )}

                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Текстовое содержимое</label>
                        <textarea
                          className={`${styles.input} ${styles.textarea}`}
                          rows={5}
                          value={c.textContent ?? ''}
                          placeholder="Введите текст"
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((x) => (x.id === c.id ? { ...x, textContent: e.target.value } : x)),
                            )
                          }
                        />
                      </div>

                      {c.contentType === 1 && (
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Ссылка</label>
                          <input
                            className={styles.input}
                            value={c.linkUrl ?? ''}
                            placeholder="https://example.com"
                            onChange={(e) =>
                              setItems((prev) =>
                                prev.map((x) => (x.id === c.id ? { ...x, linkUrl: e.target.value } : x)),
                              )
                            }
                          />
                        </div>
                      )}

                      {c.contentType === 2 && editMeta && (
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Файлы</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {editMeta.fileList.map((file, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  background: 'var(--ml-card-bg)',
                                  border: '1px solid var(--ml-border-light)',
                                  borderRadius: 8,
                                  padding: '0.4rem 0.75rem',
                                  fontSize: '0.85rem',
                                }}
                              >
                                <span style={{ flex: 1, wordBreak: 'break-all', color: 'var(--ml-text-main)' }}>{file}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditMeta((prev) =>
                                      prev ? { ...prev, fileList: prev.fileList.filter((_, i) => i !== idx) } : null,
                                    )
                                  }
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ff4d4d',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    padding: '0 0.25rem',
                                    lineHeight: 1,
                                  }}
                                  title="Удалить файл"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75rem' }}>
                            <input
                              id={`file-upload-${c.id}`}
                              type="file"
                              style={{ display: 'none' }}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const path = await uploadFile(file, 'files');
                                  setEditMeta((prev) =>
                                    prev ? { ...prev, fileList: [...prev.fileList, path] } : null,
                                  );
                                } catch (err: unknown) {
                                  setError(err instanceof Error ? err.message : 'Ошибка загрузки файла');
                                }
                                e.target.value = '';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => document.getElementById(`file-upload-${c.id}`)?.click()}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 2rem',
                                background: 'var(--ml-gradient-aesthetic)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 40,
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 4px 16px rgba(var(--ml-primary-rgb), 0.3)',
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 6px 24px rgba(var(--ml-primary-rgb), 0.4)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(var(--ml-primary-rgb), 0.3)';
                              }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                              Добавить файл
                            </button>
                          </div>
                        </div>
                      )}

                      {editMeta?.product && (
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Цена (каталог)</label>
                          <input
                            className={styles.input}
                            type="number"
                            min="0"
                            step="0.01"
                            value={editMeta.editingPrice}
                            onChange={(e) =>
                              setEditMeta((prev) => prev ? { ...prev, editingPrice: e.target.value } : null)
                            }
                          />
                        </div>
                      )}

                      {editMeta && (
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Гео-позиция (нажмите на карте чтобы изменить)</label>
                          <div style={{ height: 250, maxWidth: 600, marginLeft: 250, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--ml-border-light)' }}>
                            <MapContainer
                              center={[editMeta.editingLat, editMeta.editingLng]}
                              zoom={13}
                              style={{ width: '100%', height: '100%' }}
                            >
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <Marker position={[editMeta.editingLat, editMeta.editingLng]} />
                              <MapController lat={editMeta.editingLat} lng={editMeta.editingLng} />
                              <LocationPicker
                                onPick={(lat, lng) =>
                                  setEditMeta((prev) => prev ? { ...prev, editingLat: lat, editingLng: lng, editingPlaceLabel: `${lat.toFixed(5)}, ${lng.toFixed(5)}` } : null)
                                }
                              />
                            </MapContainer>
                          </div>
                        </div>
                      )}

                      {c.recipientEmail && c.recipientEmail !== 'feed@memorylane.local' && (
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Email получателя</label>
                          <input
                            className={styles.input}
                            type="email"
                            value={c.recipientEmail}
                            placeholder="email@example.com"
                            onChange={(e) =>
                              setItems((prev) =>
                                prev.map((x) => (x.id === c.id ? { ...x, recipientEmail: e.target.value } : x)),
                              )
                            }
                          />
                        </div>
                      )}

                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Дата открытия</label>
                        <input
                          className={styles.input}
                          type="datetime-local"
                          value={
                            c.openAtUtc
                              ? new Date(c.openAtUtc).toISOString().slice(0, 16)
                              : ''
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              const localDate = new Date(val);
                              setItems((prev) =>
                                prev.map((x) =>
                                  x.id === c.id ? { ...x, openAtUtc: localDate.toISOString() } : x,
                                ),
                              );
                            }
                          }}
                        />
                      </div>

                      <div className={styles.row} style={{marginTop: '0.5rem'}}>
                        <button type="button" className={layout.btnPrimary} onClick={() => void saveCapsule(c)}>
                          💾 Сохранить изменения
                        </button>
                        <button type="button" className={`${layout.btnPrimary} ${layout.btnSecondary}`} style={{background: 'var(--ml-border-light)', color: 'var(--ml-text-main)'}} onClick={() => setEditingId(null)}>
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.muted}>
                      <span>Получатель:</span>
                      <strong>👤 {c.recipientEmail}</strong>
                    </p>
                  )}

                  <p className={styles.muted}>
                    <span>Дата открытия:</span>
                    <strong>📅 {open.toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                  </p>
                  
                  {sealed && (
                    <p className={styles.muted}>
                      <span>До вскрытия осталось:</span>
                      <span className={styles.countdown}>{formatCountdown(open, now)}</span>
                    </p>
                  )}
                </div>

                {editingId !== c.id && (
                  <div className={styles.cardActions}>
                    <button type="button" className={layout.btnPrimary} onClick={() => setEditingId(c.id)}>
                      ✏️ Редактировать
                    </button>
                    <button type="button" className={`${layout.btnPrimary} ${styles.btnDelete}`} style={{background: 'rgba(255,77,77,0.15)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)'}} onClick={() => setDeleteConfirm(c.id)}>
                      🗑️ Удалить
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {!loading && !error && sorted.length > pageSize && (
            <div className={styles.pagination}>
              <button 
                type="button" 
                className={layout.btnPrimary} 
                disabled={pageIndex <= 1} 
                onClick={() => { setPageIndex((p) => p - 1); window.scrollTo(0, 0); }}
                style={{padding: '0.5rem 1.8rem'}}
              >
                Назад
              </button>
              <span className={styles.pageInfo}>{pageIndex} / {totalPages}</span>
              <button 
                type="button" 
                className={layout.btnPrimary} 
                disabled={pageIndex >= totalPages} 
                onClick={() => { setPageIndex((p) => p + 1); window.scrollTo(0, 0); }}
                style={{padding: '0.5rem 1.8rem'}}
              >
                Вперёд
              </button>
            </div>
          )}
        </div>
      </main>
      <ConfirmModal
        open={deleteConfirm !== null}
        title="Удаление капсулы"
        message="Вы уверены, что хотите удалить эту капсулу навсегда?"
        danger
        onConfirm={async () => {
          const id = deleteConfirm;
          setDeleteConfirm(null);
          if (id !== null) await deleteCapsule(id);
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
      <Footer />
    </div>
  );
};

export default MyCapsules;