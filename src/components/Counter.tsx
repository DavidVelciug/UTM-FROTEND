import React from 'react';

interface CounterProps {
  count: number;
  likedCount: number;
}

const Counter: React.FC<CounterProps> = ({ count, likedCount }) => {
  return (
    <div className="counter">
      Найдено: <span>{count}</span> капсул | В избранном: <span>{likedCount}</span>
    </div>
  );
};

export default Counter;