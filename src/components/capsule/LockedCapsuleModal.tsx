import React from 'react';
import { formatCountdown } from '../../utils/date';

interface LockedCapsuleModalProps {
  openAtUtc: string;
  now: Date;
}

const LockedCapsuleModal: React.FC<LockedCapsuleModalProps> = ({ openAtUtc, now }) => (
  <div
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'grid', placeItems: 'center', zIndex: 1000,
    }}
  >
    <div
      style={{
        width: 'min(520px, 92vw)', background: 'var(--surface-light)',
        border: '1px solid var(--border)', borderRadius: '24px', padding: '1.75rem',
      }}
    >
      <h2>Ждите время</h2>
      <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, fontSize: '0.95rem' }}>Получатель не может открыть капсулу раньше указанного времени.</p>
      <p style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent)', fontFeatureSettings: '"tnum"', marginTop: '1rem' }}>До открытия: {formatCountdown(new Date(openAtUtc), now)}</p>
    </div>
  </div>
);

export default LockedCapsuleModal;
