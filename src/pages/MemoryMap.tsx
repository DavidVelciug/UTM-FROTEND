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
import styles from '../styles/MemoryMap.module.css';
import { fetchJson } from '../config/api';
import type { CapsuleLocationDto, TimeCapsuleDto, UserAccountDto } from '../types/api';
import { getCurrentUserId } from '../auth/session';
import { addOpenedCapsule } from '../auth/capsuleStore';
import { getCapsuleThumbnailUrl } from '../utils/file';

const MemoryMap: React.FC = () => {
  const [locations, setLocations] = useState<CapsuleLocationDto[]>([]);
  const [capsules, setCapsules] = useState<TimeCapsuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myPosition, setMyPosition] = useState<[number, number] | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const currentUserId = getCurrentUserId();
  const navigate = useNavigate();

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
        if (new Date(capsule.openAtUtc).getTime() > Date.now()) return false;
        return (
          capsule.isPublic ||
          capsule.ownerUserId === currentUserId ||
          (currentUserEmail !== null &&
            capsule.recipientEmail.toLowerCase() === currentUserEmail.toLowerCase())
        );
      }),
    [capsuleById, currentUserEmail, currentUserId, locations],
  );

  const center: [number, number] =
    visibleLocations.length > 0 ? [visibleLocations[0].latitude, visibleLocations[0].longitude] : [48.8566, 2.3522];

  return (
    <div className={`${layout.pageWrapper} ${layout.withBg}`}>
      <Header />
        <main className={layout.mainContent}>
        <div className={styles.pageHeader}>
          <h1 className={layout.fadeIn}>География Памяти</h1>
          <p className={layout.fadeIn}>Исследуйте капсулы времени, оставленные в самых значимых уголках мира.</p>
        </div>

        <div className={`${styles.section} ${layout.container}`}>
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
            <div className={layout.fadeIn}>
              <p className={styles.muted}>
                Ваши воспоминания привязаны к реальности. Капсулы становятся доступны, когда вы находитесь рядом.
              </p>
              
              <div className={styles.mapWrap}>
                <MapContainer center={center} zoom={visibleLocations.length ? 13 : 5}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {visibleLocations.map((l) => {
                    const cap = capsuleById[l.capsuleId];
                    return (
                    <Marker key={l.id} position={[l.latitude, l.longitude]}>
                      {cap && (
                        <Tooltip direction="top" offset={[0, -36]} opacity={1}>
                          <div className={styles.tipInner}>
                            <img
                              src={getCapsuleThumbnailUrl(cap)}
                              alt=""
                              className={styles.tipImg}
                            />
                            <div className={styles.tipTitle}>{cap.title}</div>
                          </div>
                        </Tooltip>
                      )}
                      <Popup>
                        <div className={styles.tipInner}>
                          <strong style={{fontSize: '1.1rem'}}>{titleById[l.capsuleId] ?? `Капсула #${l.capsuleId}`}</strong>
                          <div style={{margin: '8px 0', opacity: 0.8}}>{l.placeLabel}</div>
                          {myPosition ? (
                            <>
                              <div style={{fontSize: '0.85rem'}}>
                                Расстояние: <strong>{distanceKm(myPosition[0], myPosition[1], l.latitude, l.longitude).toFixed(2)} км</strong>
                              </div>
                              <button
                                type="button"
                                className={styles.popupButton}
                                onClick={() => {
                                  const dist = distanceKm(myPosition[0], myPosition[1], l.latitude, l.longitude);
                                  if (dist <= 10) {
                                    const cap = capsuleById[l.capsuleId];
                                    if (cap) addOpenedCapsule(cap, 'Гео-капсула');
                                    navigate(`/feed-capsule/${l.capsuleId}`);
                                    return;
                                  }
                                  window.alert('Доступ запрещен. Вам нужно быть в радиусе 10 км от этой точки.');
                                }}
                              >
                                Погрузиться
                              </button>
                            </>
                          ) : (
                            <div style={{fontSize: '0.8rem', color: '#ef4444'}}>Включите GPS для доступа</div>
                          )}
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
      <Footer />
    </div>
  );
};

export default MemoryMap;