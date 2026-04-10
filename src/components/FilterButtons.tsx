import React from 'react';
import styles from '../styles/filterButtons.module.css';

interface FilterButtonsProps {
  categories: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({ categories, activeFilter, onFilterChange }) => {
  return (
    <div className={styles.filterButtons}>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={`${styles.filterBtn} ${activeFilter === category ? styles.filterBtnActive : ''}`}
          onClick={() => onFilterChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;