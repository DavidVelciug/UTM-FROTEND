import React from 'react';
import layout from '../../styles/layout.module.css';
import loading from '../../styles/loading.module.css';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Загрузка...' }) => (
  <div className={layout.pageWrapper} style={{ placeItems: 'center', padding: '4rem 1rem' }}>
    <div className={loading.spinner} />
    <p style={{ color: 'var(--text-dim)', marginTop: '1rem' }}>{message}</p>
  </div>
);

export default LoadingState;
