import React from 'react';
import styles from '../styles/confirmModal.module.css';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm?: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmText = 'Да',
  cancelText = 'Отмена',
  danger = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.body} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttons}>
          {onConfirm && (
            <button
              className={`${styles.confirmBtn} ${danger ? styles.dangerBtn : ''}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          )}
          <button className={styles.cancelBtn} onClick={onCancel}>
            {onConfirm ? cancelText : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
