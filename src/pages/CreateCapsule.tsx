import React, { useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import page from '../styles/pageSection.module.css';
import styles from '../styles/createCapsule.module.css';
import { fetchJson } from '../config/api';
import { getCurrentUserId } from '../auth/session';
import type { CapsuleContentType, ResponceMsg, TimeCapsuleDto } from '../types/api';

const DefaultIcon = L.icon({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type LocationPickerProps = {
  onPick: (lat: number, lng: number) => void;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const CreateCapsule: React.FC = () => {
  const userId = getCurrentUserId();
  const [contentType, setContentType] = useState<CapsuleContentType>(0);
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [filePath, setFilePath] = useState('');
  const [openAt, setOpenAt] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [useLocation, setUseLocation] = useState(true);
  const [latitude, setLatitude] = useState<number | null>(55.7558);
  const [longitude, setLongitude] = useState<number | null>(37.6176);
  const [placeLabel, setPlaceLabel] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      if (!userId) {
        setStatus('Сначала выполните вход, затем создавайте капсулы.');
        return;
      }

      const openAtUtc = new Date(openAt).toISOString();
      const body = {
        id: 0,
        ownerUserId: userId,
        contentType,
        title,
        textContent: contentType === 0 ? textContent : null,
        linkUrl: contentType === 1 ? linkUrl : null,
        fileStoragePath: contentType === 2 ? filePath : null,
        openAtUtc,
        createdAtUtc: new Date().toISOString(),
        recipientEmail,
        isPublic,
      };
      const res = await fetchJson<ResponceMsg>('/api/timecapsule', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!res.isSuccess) {
        setStatus(`✗ ${res.message}`);
        return;
      }

      if (useLocation && latitude !== null && longitude !== null) {
        const ownerCapsules = await fetchJson<TimeCapsuleDto[]>(
          `/api/timecapsule/getByOwner?ownerUserId=${userId}`,
        );
        const createdCapsule = ownerCapsules
          .filter((c) => c.title === title)
          .sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime())[0];

        if (createdCapsule) {
          await fetchJson<ResponceMsg>('/api/capsulelocation', {
            method: 'POST',
            body: JSON.stringify({
              id: 0,
              capsuleId: createdCapsule.id,
              latitude,
              longitude,
              placeLabel: placeLabel || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            }),
          });
        }
      }

      setStatus('✓ Капсула создана и сохранена.');
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Ошибка запроса');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <div className={page.pageHeader}>
          <h1>Создание капсулы</h1>
          <p>Запечатайте сообщение, добавьте место на карте и откройте его в будущем.</p>
        </div>
        <div className={page.section}>
          <div className={`${page.card} ${layout.container} ${styles.createCapsuleCard}`}>
            <div className={styles.heroPanel}>
              <h2>Новая капсула</h2>
              <p>Заполните данные и при желании прикрепите точку на карте.</p>
            </div>
            <form className={page.formGrid} onSubmit={handleSubmit}>
              <label className={page.label}>
                Тип капсулы
                <select
                  className={page.select}
                  value={contentType}
                  onChange={(e) => setContentType(Number(e.target.value) as CapsuleContentType)}
                >
                  <option value={0}>Текст</option>
                  <option value={1}>Ссылка</option>
                  <option value={2}>Файл (путь хранения)</option>
                </select>
              </label>
              <label className={page.label}>
                Заголовок
                <input
                  className={page.input}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Короткое название"
                />
              </label>
              {contentType === 0 && (
                <label className={page.label}>
                  Текст сообщения
                  <textarea
                    className={page.textarea}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    required
                  />
                </label>
              )}
              {contentType === 1 && (
                <label className={page.label}>
                  URL ссылки
                  <input
                    className={page.input}
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    required
                    placeholder="https://"
                  />
                </label>
              )}
              {contentType === 2 && (
                <label className={page.label}>
                  Путь к файлу на сервере
                  <input
                    className={page.input}
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
                    required
                    placeholder="/storage/capsules/file.pdf"
                  />
                  <span className={page.hint}>Демо: укажите строку пути, загрузка файла упрощена.</span>
                </label>
              )}
              <label className={page.label}>
                Дата и время открытия
                <input
                  className={page.input}
                  type="datetime-local"
                  value={openAt}
                  onChange={(e) => setOpenAt(e.target.value)}
                  required
                />
              </label>
              <label className={page.label}>
                Email адресата
                <input
                  className={page.input}
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  required
                />
              </label>
              <div className={styles.locationPanel}>
                <label className={`${page.row} ${page.muted}`}>
                  <input
                    type="checkbox"
                    checked={useLocation}
                    onChange={(e) => setUseLocation(e.target.checked)}
                  />
                  Привязать капсулу к локации на карте
                </label>
                {useLocation && (
                  <>
                    <div className={styles.mapWrap}>
                      <MapContainer
                        center={[latitude ?? 55.7558, longitude ?? 37.6176]}
                        zoom={10}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationPicker onPick={(lat, lng) => {
                          setLatitude(lat);
                          setLongitude(lng);
                        }} />
                        {latitude !== null && longitude !== null && <Marker position={[latitude, longitude]} />}
                      </MapContainer>
                    </div>
                    <label className={page.label}>
                      Название места
                      <input
                        className={page.input}
                        value={placeLabel}
                        onChange={(e) => setPlaceLabel(e.target.value)}
                        placeholder="Например: Парк Горького, Москва"
                      />
                    </label>
                    <div className={styles.coords}>
                      Координаты: {latitude?.toFixed(5)}, {longitude?.toFixed(5)}
                    </div>
                  </>
                )}
              </div>
              <label className={`${page.row} ${page.muted}`}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                Сделать публичной после открытия (попадёт в ленту)
              </label>
              <button type="submit" className={`${layout.btnPrimary} ${layout.btnBlock}`} disabled={loading}>
                {loading ? 'Сохранение…' : 'Запечатать капсулу'}
              </button>
              {status && <p className={page.muted}>{status}</p>}
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateCapsule;