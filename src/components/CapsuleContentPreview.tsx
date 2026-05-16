import React from 'react';
import type { TimeCapsuleDto } from '../types/api';
import { isImageSource, parseCapsuleStorage, resolveMediaUrl } from '../utils/file';
import styles from '../styles/CapsuleContentPreview.module.css';

type Props = { capsule: TimeCapsuleDto };

function faviconForUrl(url: string): string {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  } catch {
    return '/assets/default-capsule-cover.svg';
  }
}

const DocGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="15" x2="15" y2="15" />
    <line x1="9" y1="11" x2="13" y2="11" />
  </svg>
);

const CapsuleContentPreview: React.FC<Props> = ({ capsule: c }) => {
  if (c.contentType === 1 && c.linkUrl) {
    let host = 'ссылка';
    try {
      host = new URL(c.linkUrl).hostname;
    } catch {
      /* ignore */
    }
    const snippet = (c.previewText || '').trim() || 'Откройте ссылку, чтобы перейти к содержимому.';

    const cover = c.fileStoragePath?.trim() || '';
    const hasCover = Boolean(cover) && isImageSource(cover);
    return (
      <a className={styles.richLinkCard} href={c.linkUrl} target="_blank" rel="noreferrer">
        {hasCover ? (
          <div className={styles.previewFrame}>
            <img
              src={resolveMediaUrl(cover, '/assets/default-capsule-cover.svg')}
              alt=""
              className={styles.previewImg}
              onError={(e) => {
                e.currentTarget.src = '/assets/default-capsule-cover.svg';
              }}
            />
          </div>
        ) : (
          <div className={styles.linkPreviewBanner}>
            <div className={styles.faviconWrap}>
              <img
                src={faviconForUrl(c.linkUrl)}
                alt=""
                className={styles.faviconImg}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = '/assets/default-capsule-cover.svg';
                }}
              />
            </div>
          </div>
        )}
        <div className={styles.richLinkBody}>
          <div className={styles.richHost}>{host}</div>
          <div className={styles.richTitle}>{c.title}</div>
          <div className={styles.richSnippet}>{snippet}</div>
          <div className={styles.richUrl}>{c.linkUrl}</div>
        </div>
      </a>
    );
  }

  if (c.contentType === 2 && c.fileStoragePath) {
    const parsed = parseCapsuleStorage(c.fileStoragePath);
    const cover = parsed.cover;
    const main = parsed.attachments[0] ?? '';
    const fileName = main.split(/[/\\]/).pop() || 'Вложение';
    const fileHref = resolveMediaUrl(main);

    const imageCandidate = (cover && isImageSource(cover)) ? cover : main;

    if (imageCandidate && isImageSource(imageCandidate)) {
      return (
        <div className={styles.previewFrame}>
          <img
            src={resolveMediaUrl(imageCandidate, '/assets/default-capsule-cover.svg')}
            alt=""
            className={styles.previewImg}
            onError={(e) => {
              e.currentTarget.src = '/assets/default-capsule-cover.svg';
            }}
          />
        </div>
      );
    }

    return (
      <div className={styles.fileRichCard}>
        <div className={styles.fileHero}>
          <div className={styles.fileDocIcon}>
            <DocGlyph />
          </div>
        </div>
        <div className={styles.fileMeta}>
          <span className={styles.fileBadge}>Вложение</span>
          <span className={styles.fileName}>{fileName}</span>
          <a className={styles.downloadBtn} href={fileHref} download target="_blank" rel="noreferrer">
            Скачать и открыть
          </a>
        </div>
      </div>
    );
  }

  return null;
};

export default CapsuleContentPreview;
