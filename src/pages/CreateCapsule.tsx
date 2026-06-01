import React, { useEffect, useState } from 'react';
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
import styles from '../styles/CreateCapsule.module.css';
import { fetchJson } from '../config/api';
import { getCurrentUserId } from '../auth/session';
import type { CapsuleContentType, CategoryDto, ProductDto, ResponceMsg, TimeCapsuleDto } from '../types/api';
import { resolveMediaUrl } from '../utils/file';
import { uploadFile } from '../utils/upload';

const COVER_PREFIX = '__cover__:';

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
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState('');
  const [openAt, setOpenAt] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [useLocation, setUseLocation] = useState(false);
  const [capsuleMode, setCapsuleMode] = useState<'personal' | 'location' | 'feed' | 'catalog'>('personal');
  const [catalogPrice, setCatalogPrice] = useState('0');
  const [catalogCategoryId, setCatalogCategoryId] = useState<string>('');
  const [catalogCategories, setCatalogCategories] = useState<CategoryDto[]>([]);
  const [latitude, setLatitude] = useState<number | null>(55.7558);
  const [longitude, setLongitude] = useState<number | null>(37.6176);
  const [placeLabel, setPlaceLabel] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showOpenAt = capsuleMode !== 'catalog';
  const showRecipient = capsuleMode === 'personal';
  const showPreviewUpload = true;
  const showLocationOptions = capsuleMode === 'location' || capsuleMode === 'personal';

  useEffect(() => {
    setUseLocation(capsuleMode === 'location');
  }, [capsuleMode]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cats = await fetchJson<CategoryDto[]>('/api/category/getAll');
        if (cancelled) return;
        setCatalogCategories(cats);
        setCatalogCategoryId((prev) => prev || (cats[0] ? String(cats[0].id) : ''));
      } catch {
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const buildFileStoragePath = (): string | null => {
    if (contentType === 2) {
      const attachments = filePaths.map((p) => p.trim()).filter(Boolean);
      const cover = coverImage.trim();
      return `${cover ? `${COVER_PREFIX}${cover}\n` : ''}${attachments.join('\n')}`.trim() || null;
    }
    return (coverImage || null) as any;
  };

  const fetchLatestCreatedCapsule = async (): Promise<TimeCapsuleDto | null> => {
    if (!userId) return null;
    const ownerCapsules = await fetchJson<TimeCapsuleDto[]>(
      `/api/timecapsule/getByOwner?ownerUserId=${userId}`,
    );
    const createdCapsule = ownerCapsules
      .filter((c) => c.title === title)
      .sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime())[0];
    return createdCapsule ?? null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      if (!userId) {
        setStatus('Сначала выполните вход, затем создавайте капсулы.');
        return;
      }

      const openAtUtc = showOpenAt ? new Date(openAt).toISOString() : new Date().toISOString();
      const fileStoragePath = buildFileStoragePath();
      const body = {
        id: 0,
        ownerUserId: userId,
        contentType,
        title,
        textContent: contentType === 0 ? textContent : null,
        linkUrl: contentType === 1 ? linkUrl : null,
        fileStoragePath,
        openAtUtc,
        createdAtUtc: new Date().toISOString(),
        recipientEmail: capsuleMode === 'feed' ? 'feed@memorylane.local' : (showRecipient ? recipientEmail : ''),
        isPublic: capsuleMode === 'feed',
      };
      const res = await fetchJson<ResponceMsg>('/api/timecapsule', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!res.isSuccess) {
        setStatus(res.message);
        return;
      }

      const createdCapsule = await fetchLatestCreatedCapsule();

      if (useLocation && latitude !== null && longitude !== null) {
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

      if (capsuleMode === 'catalog') {
        const catId = Number(catalogCategoryId) || (catalogCategories[0]?.id ?? 3);
        const firstAttachment = filePaths[0] || '';
        const derivedImage =
          coverImage ||
          (contentType === 2 && firstAttachment && /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(firstAttachment)
            ? firstAttachment
            : '') ||
          '/assets/default-capsule-cover.svg';

        const productBody: ProductDto = {
          id: 0,
          name: title,
          price: Number(catalogPrice) || 0,
          description: textContent || linkUrl || 'Капсула из пользовательского каталога',
          image: derivedImage,
          capsuleId: createdCapsule?.id ?? null,
          categoryId: catId,
          category: null,
        };
        await fetchJson<ResponceMsg>('/api/product', {
          method: 'POST',
          body: JSON.stringify(productBody),
        });
      }

      setStatus('Капсула запечатана.');
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Ошибка запроса');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${layout.pageWrapper} ${styles.beautifyPage} ${layout.withBg}`}>
      <Header />
        <main className={`${layout.mainContent} ${styles.fadeInPage}`}>
        <div className={`${page.pageHeader} ${styles.aestheticHeader}`}>
          <h1 className={styles.gradientTitle}>Создание капсулы</h1>
          <p className={styles.subtitle}>Запечатайте сообщение, добавьте место на карте и откройте его в будущем.</p>
        </div>

        <div className={`${page.section} ${styles.formSection}`}>
          <div className={`${styles.createCapsuleCard} ${styles.popInCard}`}>
            <div className={styles.heroPanel}>
              <h2>Новая капсула</h2>
              <p>Заполните данные послания.</p>
            </div>

            <form className={styles.aestheticForm} onSubmit={handleSubmit}>
              <div className={styles.formSplit}>
                <div className={styles.controlGroup}>
                  <label htmlFor="capsule-mode" className={page.label}>Режим капсулы</label>
                  <select
                    id="capsule-mode"
                    className={`${page.select} ${styles.aestheticInput}`}
                    value={capsuleMode}
                    onChange={(e) => setCapsuleMode(e.target.value as any)}
                  >
                    <option value="personal">Личное послание</option>
                    <option value="location">Гео-капсула (10 км)</option>
                    <option value="feed">В публичную ленту</option>
                    <option value="catalog">Выставить в каталог</option>
                  </select>
                </div>
                <div className={styles.controlGroup}>
                  <label htmlFor="capsule-content-type" className={page.label}>Тип контента</label>
                  <select
                    id="capsule-content-type"
                    className={`${page.select} ${styles.aestheticInput}`}
                    value={contentType}
                    onChange={(e) => setContentType(Number(e.target.value) as CapsuleContentType)}
                  >
                    <option value={0}>Текст</option>
                    <option value={1}>Веб-ссылка</option>
                    <option value={2}>Файлы</option>
                  </select>
                </div>
              </div>

              <div className={styles.controlGroup}>
                <label htmlFor="capsule-title" className={page.label}>Заголовок</label>
                <input
                  id="capsule-title"
                  className={`${page.input} ${styles.aestheticInput}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Короткое название послания"
                />
              </div>

              <div className={styles.dynamicContent}>
                {contentType === 0 && (
                  <div className={`${styles.controlGroup} ${styles.slideIn}`}>
                    <label htmlFor="capsule-text" className={page.label}>Текст сообщения</label>
                    <textarea
                      id="capsule-text"
                      className={`${page.textarea} ${styles.aestheticInput} ${styles.aestheticTextarea}`}
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      required
                      placeholder="Напишите ваше послание здесь..."
                    />
                  </div>
                )}

                {contentType === 1 && (
                  <div className={`${styles.controlGroup} ${styles.slideIn}`}>
                    <label htmlFor="capsule-url" className={page.label}>URL ссылки</label>
                    <input
                      id="capsule-url"
                      className={`${page.input} ${styles.aestheticInput}`}
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      required
                      placeholder="https://..."
                    />
                  </div>
                )}

                {contentType === 2 && (
                  <div className={`${styles.fileSection} ${styles.slideIn}`}>
                    <label className={page.label}>Прикрепленные файлы</label>
                    <div className={styles.fileDisplay}>
                      {filePaths.map((path, index) => (
                        <div key={`${path}-${index}`} className={styles.fileItem}>
                          <span>📄</span> File {index + 1}: {path.split('/').pop()}
                        </div>
                      ))}
                      {filePaths.length === 0 && <p className={page.hint}>Файлы еще не выбраны</p>}
                    </div>
                    <button
                      type="button"
                      className={`${layout.btnPrimaryLarge} ${styles.fileBtn}`}
                      onClick={() => document.getElementById('capsule-file-upload')?.click()}
                    >
                      {filePaths.length === 0 ? 'Выбрать файл' : 'Добавить еще файл'}
                    </button>
                    <input id="capsule-file-upload" type="file" style={{ display: 'none' }} onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadFile(file, 'files').then(path => setFilePaths(prev => [...prev, path]));
                    }} />
                  </div>
                )}
              </div>

              {showPreviewUpload && (
                <div className={styles.controlGroup}>
                  <label className={page.label}>Фото-превью (опционально)</label>
                  <div className={styles.previewZone}>
                    <input
                      className={styles.hiddenInput}
                      type="file"
                      id="capsule-cover-upload"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadFile(file, 'capsules').then(setCoverImage);
                      }}
                    />
                    <label htmlFor="capsule-cover-upload" className={styles.previewLabel}>
                      {coverImage ? (
                        <>
                          <img
                            src={resolveMediaUrl(coverImage, '/assets/default-capsule-cover.svg')}
                            alt="Превью"
                            className={styles.imagePreview}
                          />
                          <span className={styles.changeHint}>Нажмите, чтобы изменить</span>
                        </>
                      ) : (
                        <div className={styles.uploadPlaceholder}>
                          <div className={styles.uploadIcon} />
                          <span>Нажмите, чтобы добавить изображение</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}

              <div className={styles.formSplit}>
                {showOpenAt && (
                  <div className={styles.controlGroup}>
                    <label htmlFor="capsule-open-at" className={page.label}>Дата открытия</label>
                    <input
                      id="capsule-open-at"
                      className={`${page.input} ${styles.aestheticInput}`}
                      type="datetime-local"
                      value={openAt}
                      onChange={(e) => setOpenAt(e.target.value)}
                      required
                    />
                  </div>
                )}

                {showRecipient && (
                  <div className={styles.controlGroup}>
                    <label htmlFor="capsule-recipient" className={page.label}>Email получателя</label>
                    <input
                      id="capsule-recipient"
                      className={`${page.input} ${styles.aestheticInput}`}
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      required
                      placeholder="mail@example.com"
                    />
                  </div>
                )}
              </div>

              {capsuleMode === 'catalog' && (
                <div className={`${styles.formSplit} ${styles.slideIn}`}>
                  <div className={styles.controlGroup}>
                    <label htmlFor="catalog-price" className={page.label}>Цена в Credits</label>
                    <input
                      id="catalog-price"
                      className={`${page.input} ${styles.aestheticInput}`}
                      type="number"
                      min={0}
                      value={catalogPrice}
                      onChange={(e) => setCatalogPrice(e.target.value)}
                    />
                  </div>
                  <div className={styles.controlGroup}>
                    <label htmlFor="catalog-category" className={page.label}>Категория</label>
                    <select id="catalog-category" className={`${page.select} ${styles.aestheticInput}`} value={catalogCategoryId} onChange={(e) => setCatalogCategoryId(e.target.value)}>
                      {catalogCategories.length > 0 ? (
                        catalogCategories.map((c) => (
                          <option key={c.id} value={String(c.id)}>
                            {c.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="1">Личное</option>
                          <option value="2">Мечты</option>
                          <option value="3">Публичное</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              )}

              {showLocationOptions && (
                <div className={styles.locationZone}>
                  <label htmlFor="capsule-location-checkbox" className={`${page.row} ${styles.locationCheckbox}`}>
                    <input
                      id="capsule-location-checkbox"
                      type="checkbox"
                      checked={useLocation}
                      onChange={(e) => setUseLocation(e.target.checked)}
                    />
                    <span>Привязать к локации на карте</span>
                  </label>

                  {useLocation && (
                    <div className={`${styles.mapExpand} ${styles.slideIn}`}>
                      <div className={styles.mapWrap}>
                        <MapContainer
                          center={[latitude ?? 55.7558, longitude ?? 37.6176]}
                          zoom={10}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <LocationPicker onPick={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />
                          {latitude !== null && longitude !== null && <Marker position={[latitude, longitude]} />}
                        </MapContainer>
                      </div>
                      <div className={styles.controlGroup}>
                        <label htmlFor="place-label" className={page.label}>Название места</label>
                        <input
                          id="place-label"
                          className={`${page.input} ${styles.aestheticInput}`}
                          value={placeLabel}
                          onChange={(e) => setPlaceLabel(e.target.value)}
                          placeholder="Парк Горького, Москва..."
                        />
                      </div>
                      <div className={styles.coordsLabel}>
                        📍 Координаты: {latitude?.toFixed(5)}, {longitude?.toFixed(5)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.submitZone}>
                <button
                  type="submit"
                  className={`${layout.btnPrimaryLarge} ${layout.btnBlock} ${styles.aestheticSubmit} ${loading ? styles.btnLoading : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Запечатывание...' : 'Запечатать капсулу времени'}
                </button>
                {status && <p className={`${page.hint} ${styles.statusDisplay}`} style={{ animation: 'fadeIn 0.3s' }}>{status}</p>}
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateCapsule;