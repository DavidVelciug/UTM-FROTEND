import React from 'react';
import styles from '../styles/counter.module.css';

interface CounterProps {
  count: number;
  likedCount: number;
}

const Counter: React.FC<CounterProps> = ({ count, likedCount }) => {
  return (
    <div className={styles.counter} style={{ alignSelf: 'center' }}>
      Показано: <span>{count}</span> из каталога · В избранном: <span>{likedCount}</span>
    </div>
  );
};

export default Counter;