import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import layout from '../styles/layout.module.css';
import page from '../styles/pageSection.module.css';
import spinner from '../styles/loading.module.css';
import profile from '../styles/ProfileSettings.module.css';
import { fetchJson } from '../config/api';
import { getCurrentUserId } from '../auth/session';
import { getAvatar, setAvatar } from '../auth/avatar';
import type { ResponceMsg, UserAccountDto } from '../types/api';
import { resolveMediaUrl } from '../utils/file';
import { uploadFile } from '../utils/upload';

const ProfileSettings: React.FC = () => {
  const userId = getCurrentUserId();
  const [user, setUser] = useState<UserAccountDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [avatar, setAvatarState] = useState(getAvatar());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!userId) {
          setError('Сначала выполните вход.');
          return;
        }
        setLoading(true);
        const u = await fetchJson<UserAccountDto>(`/api/user/id?id=${userId}`);
        if (!cancelled) {
          setUser(u);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setMsg(null);
    try {
      const res = await fetchJson<ResponceMsg>('/api/user', {
        method: 'PUT',
        body: JSON.stringify(user),
      });
      setAvatar(avatar);
      setMsg(res.message);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  return (
    <div className={`${layout.pageWrapper} ${layout.withBg}`}>
      <Header />
        <main className={`${layout.mainContent} ${layout.fadeIn}`}>
        <div className={page.pageHeader}>
          <h1 className={layout.textGradient}>Настройки профиля</h1>
          <p>Ваше личное пространство в Memory Lane.</p>
        </div>
        <div className={`${page.section} ${layout.container}`}>
          {loading && (
            <div className={spinner.loadingState}>
              <div className={spinner.loader} />
            </div>
          )}
          {error && <div className={spinner.errorState}>{error}</div>}
          
          {user && (
            <form className={profile.settingsFormContainer} onSubmit={save}>
              <div className={profile.card}>
                <div className={profile.profileAesthetics}>
                  <div className={profile.avatarUploadWrapper}>
                    <img
                      src={resolveMediaUrl(avatar, '/assets/default-avatar.svg')}
                      alt="Аватар"
                      className={profile.avatarCircle}
                      onError={(e) => { e.currentTarget.src = '/assets/default-avatar.svg'; }}
                    />
                    <label className={profile.avatarEditOverlay}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                      </svg>
                      <span>Обновить</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          void uploadFile(file, 'avatars').then(setAvatarState).catch((err: unknown) => {
                            setMsg(err instanceof Error ? err.message : 'Ошибка загрузки');
                          });
                        }}
                      />
                    </label>
                  </div>
                  <div className={profile.profileQuickInfo}>
                    <h3>{user.displayName || 'Пользователь'}</h3>
                    <p className={profile.hint}>{user.email}</p>
                  </div>
                </div>

                <div className={profile.formGrid}>
                  <label className={profile.label}>
                    Электронная почта
                    <input
                      className={profile.input}
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                      required
                      type="email"
                    />
                  </label>
                  <label className={profile.label}>
                    Отображаемое имя
                    <input
                      className={profile.input}
                      value={user.displayName}
                      onChange={(e) => setUser({ ...user, displayName: e.target.value })}
                      placeholder="Как вас называть?"
                    />
                  </label>
                  <button type="submit" className={`${layout.btnPrimaryLarge} ${layout.btnBlock}`}>
                    Сохранить изменения
                  </button>
                  {msg && <p className={profile.statusMsg}>{msg}</p>}
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileSettings;