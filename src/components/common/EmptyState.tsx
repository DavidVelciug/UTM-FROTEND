import React, { type ReactNode } from 'react';
import layout from '../../styles/layout.module.css';

interface EmptyStateProps {
  message: string;
  children?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, children }) => (
  <div className={layout.pageWrapper} style={{ placeItems: 'center', padding: '3rem 1rem', textAlign: 'center' }}>
    <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginBottom: '1rem' }}>{message}</p>
    {children}
  </div>
);

export default EmptyState;
