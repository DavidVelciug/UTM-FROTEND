import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import layout from '../styles/layout.module.css';
import styles from '../styles/memoryMap.module.css';
import { fetchJson } from '../config/api';
import type { CapsuleLocationDto, TimeCapsuleDto, UserAccountDto } from '../types/api';
import ConfirmModal from '../components/ConfirmModal';
import { getCurrentUserId } from '../auth/session';
import { getCapsuleThumbnailUrl } from '../utils/file';
import { useInView } from '../hooks/useInView';

const MemoryMap: React.FC = () => {
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>(0.2);
  const { ref: sectionRef, inView: sectionInView } = useInView<HTMLDivElement>(0.15);
  const [locations, setLocations] = useState<CapsuleLocationDto[]>([]);
  const [capsules, setCapsules] = useState<TimeCapsuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myPosition, setMyPosition] = useState<[number, number] | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const currentUserId = getCurrentUserId();
  const navigate = useNavigate();
  const [lockFilter, setLockFilter] = useState<'all' | 'available' | 'locked'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 0 | 1 | 2>('all');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    const DefaultIcon = L.icon({
      iconRetinaUrl: iconRetina,
      iconUrl: icon,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    void fetchJson<UserAccountDto>(`/api/user/id?id=${currentUserId}`)
      .then((u) => setCurrentUserEmail(u.email))
      .catch(() => setCurrentUserEmail(null));
  }, [currentUserId]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition((pos) => {
      setMyPosition([pos.coords.latitude, pos.coords.longitude]);
    });
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  const distanceKm = (aLat: number, aLng: number, bLat: number, bLng: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const aa =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * (2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa)));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [loc, cap] = await Promise.all([
          fetchJson<CapsuleLocationDto[]>('/api/capsulelocation/getAll'),
          fetchJson<TimeCapsuleDto[]>('/api/timecapsule/getAll'),
        ]);
        if (!cancelled) {
          setLocations(loc);
          setCapsules(cap);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка загрузки данных');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const titleById = useMemo(
    () => Object.fromEntries(capsules.map((c) => [c.id, c.title])),
    [capsules],
  );
  const capsuleById = useMemo(() => Object.fromEntries(capsules.map((c) => [c.id, c])), [capsules]);
  const visibleLocations = useMemo(
    () =>
      locations.filter((l) => {
        const capsule = capsuleById[l.capsuleId];
        if (!capsule) return false;
        const canAccess =
          capsule.isPublic ||
          capsule.ownerUserId === currentUserId ||
          (currentUserEmail !== null &&
            capsule.recipientEmail.toLowerCase() === currentUserEmail.toLowerCase());
        if (!canAccess) return false;
        if (lockFilter === 'available' && capsule.isLocked) return false;
        if (lockFilter === 'available' && myPosition) {
          const dist = distanceKm(myPosition[0], myPosition[1], l.latitude, l.longitude);
          if (dist > 10) return false;
        }
        if (lockFilter === 'locked' && !capsule.isLocked) return false;
        if (typeFilter !== 'all' && capsule.contentType !== typeFilter) return false;
        return true;
      }),
    [capsuleById, currentUserEmail, currentUserId, locations, lockFilter, typeFilter, myPosition],
  );

  const center: [number, number] =
    visibleLocations.length > 0 ? [visibleLocations[0].latitude, visibleLocations[0].longitude] : [48.8566, 2.3522];

  return (
    <div className={`${layout.pageWrapper} ${layout.withBg}`}>
      <Header />
        <main className={layout.mainContent}>
        <div ref={headerRef} className={`${styles.pageHeader} ${layout.fadeInUp} ${headerInView ? layout.fadeInUpVisible : ''}`}>
          <h1>География Памяти</h1>
          <p>Исследуйте капсулы времени, оставленные в самых значимых уголках мира.</p>
        </div>

        <div ref={sectionRef} className={`${styles.section} ${layout.container} ${layout.fadeInUp} ${sectionInView ? layout.fadeInUpVisible : ''}`}>
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.loader} />
              <p className={layout.textGradient}>Синхронизация координат...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorState}>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div>
              <p className={styles.muted}>
                Ваши воспоминания привязаны к реальности. Капсулы становятся доступны, когда вы находитесь рядом.
              </p>

              <div className={styles.filterRow}>
                <div className={styles.selectWrapper}>
                  <svg className={styles.selectIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <select
                    className={styles.filterSelect}
                    value={lockFilter}
                    onChange={(e) => setLockFilter(e.target.value as 'all' | 'available' | 'locked')}
                  >
                    <option value="all">Все статусы</option>
                    <option value="available">Можно открыть</option>
                    <option value="locked">Нельзя открыть</option>
                  </select>
                </div>
                <div className={styles.selectWrapper}>
                  <svg className={styles.selectIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <select
                    className={styles.filterSelect}
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value) as 0 | 1 | 2)}
                  >
                    <option value="all">Все типы</option>
                    <option value={0}>Текст</option>
                    <option value={1}>Ссылка</option>
                    <option value={2}>Файлы</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.mapWrap}>
                <MapContainer center={center} zoom={visibleLocations.length ? 13 : 5}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {visibleLocations.map((l) => {
                    const cap = capsuleById[l.capsuleId];
                    return (
                    <Marker key={l.id} position={[l.latitude, l.longitude]}>
                      {cap && (
                        <Tooltip direction="top" offset={[0, -36]} opacity={1}>
                          <div className={styles.tipWrapper}>
                            <div className={styles.tipInner}>
                              <img
                                src={getCapsuleThumbnailUrl(cap)}
                                alt=""
                                className={styles.tipImg}
                              />
                              <div className={styles.tipTitle}>{cap.title}</div>
                            </div>
                          </div>
                        </Tooltip>
                      )}
                      <Popup>
                        <div className={styles.tipWrapper}>
                          <div className={styles.tipInner}>
                            <div className={styles.popTitle}>{titleById[l.capsuleId] ?? `Капсула #${l.capsuleId}`}</div>
                            <div className={styles.popLabel}>{l.placeLabel}</div>
                            {myPosition ? (
                              <>
                                <div className={styles.popDist}>
                                  Расстояние: <strong>{distanceKm(myPosition[0], myPosition[1], l.latitude, l.longitude).toFixed(2)} км</strong>
                                </div>
                                <button
                                  type="button"
                                  className={styles.popupButton}
                                  onClick={() => {
                                    const dist = distanceKm(myPosition[0], myPosition[1], l.latitude, l.longitude);
                                    if (dist <= 10) {
                                      navigate(`/feed-capsule/${l.capsuleId}?source=map`);
                                      return;
                                    }
                                    setAlertMsg('Доступ запрещен. Вам нужно быть в радиусе 10 км от этой точки.');
                                  }}
                                >
                                  Погрузиться
                                </button>
                              </>
                            ) : (
                              <div className={styles.popNoGps}>Включите GPS для доступа</div>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                    );
                  })}
                </MapContainer>
              </div>
              <p className={styles.mapHint}>Картографические данные предоставлены сообществом OpenStreetMap</p>
            </div>
          )}
        </div>
      </main>
      <ConfirmModal
        open={!!alertMsg}
        title="Доступ запрещен"
        message={alertMsg ?? ''}
        onCancel={() => setAlertMsg(null)}
      />
      <Footer />
    </div>
  );
};

export default MemoryMap;