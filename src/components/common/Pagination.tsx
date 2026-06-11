import React from 'react';
import styles from '../../styles/Pagination.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <button type="button" className={styles.paginationBtn} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Назад
      </button>
      <span className={styles.pageIndicator}>{page} / {totalPages}</span>
      <button type="button" className={styles.paginationBtn} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Вперёд
      </button>
    </div>
  );
};

export default Pagination;
