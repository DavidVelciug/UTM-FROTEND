import React from 'react';
import layout from '../../styles/layout.module.css';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div className={layout.pageWrapper} style={{ placeItems: 'center', padding: '4rem 1rem', textAlign: 'center' }}>
    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
    <p style={{ color: 'var(--danger)', fontWeight: 700, marginBottom: '0.5rem' }}>Ошибка</p>
    <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        style={{
          padding: '0.65rem 1.8rem',
          borderRadius: 9999,
          border: 'none',
          background: 'var(--gradient-primary)',
          color: '#fff',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Повторить
      </button>
    )}
  </div>
);

export default ErrorState;
