import React from 'react';
import { resolveMediaUrl, resolveUserAvatar } from '../../utils/file';

interface SenderInfoClassNames {
  root?: string;
  avatar?: string;
  meta?: string;
  author?: string;
  createdAt?: string;
}

interface SenderInfoProps {
  ownerUserId: number;
  ownerDisplayName?: string | null;
  createdAtUtc: string;
  avatarUrl?: string | null;
  classes?: SenderInfoClassNames;
}

const SenderInfo: React.FC<SenderInfoProps> = ({
  ownerUserId,
  ownerDisplayName,
  createdAtUtc,
  avatarUrl,
  classes = {},
}) => {
  const avatarSrc = avatarUrl || resolveUserAvatar(ownerUserId, ownerDisplayName);

  return (
    <div className={classes.root}>
      <img
        src={resolveMediaUrl(avatarSrc, '/assets/default-avatar.svg')}
        alt=""
        className={classes.avatar}
        onError={(e) => { e.currentTarget.src = '/assets/default-avatar.svg'; }}
      />
      <div className={classes.meta}>
        <span className={classes.author}>{ownerDisplayName || 'Аноним'}</span>
        <span className={classes.createdAt}>
          {new Date(createdAtUtc).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
      </div>
    </div>
  );
};

export default SenderInfo;
