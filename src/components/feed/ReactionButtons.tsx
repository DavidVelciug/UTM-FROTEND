import React from 'react';
import feed from '../../styles/PublicFeed.module.css';

interface ReactionButtonsProps {
  capsuleId: number;
  likes: number;
  dislikes: number;
  userReaction: 'like' | 'dislike' | null;
  onReact: (id: number, reaction: 'like' | 'dislike') => void;
}

const ReactionButtons: React.FC<ReactionButtonsProps> = ({ capsuleId, likes, dislikes, userReaction, onReact }) => (
  <div className={feed.reactionsInline}>
    <button type="button" className={`${feed.reactIconBtn} ${userReaction === 'like' ? feed.activeLike : ''}`} onClick={() => onReact(capsuleId, 'like')}>
      <span className={feed.emoji}>👍</span>
      <span className={feed.count}>{likes}</span>
    </button>
    <button type="button" className={`${feed.reactIconBtn} ${userReaction === 'dislike' ? feed.activeDislike : ''}`} onClick={() => onReact(capsuleId, 'dislike')}>
      <span className={feed.emoji}>👎</span>
      <span className={feed.count}>{dislikes}</span>
    </button>
  </div>
);

export default ReactionButtons;
