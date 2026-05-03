import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Catalog from './pages/Catalog';
import { LoginPage, RegisterPage } from './pages/Auth';
import CreateCapsule from './pages/CreateCapsule';
import MyCapsules from './pages/MyCapsules';
import PublicFeed from './pages/PublicFeed';
import MemoryMap from './pages/MemoryMap';
import ProfileSettings from './pages/ProfileSettings';
import AdminModeration from './pages/AdminModeration';
import AdminStats from './pages/AdminStats';
import AdminUsers from './pages/AdminUsers';
import OpenedCapsules from './pages/OpenedCapsules';
import CapsuleView from './pages/CapsuleView';
import FeedCapsuleView from './pages/FeedCapsuleView';
import ErrorPage from './pages/ErrorPage';
import ModerationCapsuleReview from './pages/ModerationCapsuleReview';
import FAQ from './pages/FAQ';
import Support from './pages/Support';
import Privacy from './pages/Privacy';
import { canAccess, canUseExtendedFeatures, getRole } from './auth/session';

type GuardType = 'extended' | 'moderation' | 'stats';

const ProtectedRoute: React.FC<{ guard: GuardType; element: React.ReactElement }> = ({
  guard,
  element,
}) => {
  const role = getRole();

  if (guard === 'extended' && !canUseExtendedFeatures(role)) {
    return <Navigate to="/login" replace />;
  }

  if (guard === 'moderation' && !canAccess(role, 'moderation')) {
    return <Navigate to="/" replace />;
  }

  if (guard === 'stats' && !canAccess(role, 'stats')) {
    return <Navigate to="/" replace />;
  }

  return element;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/create-capsule"
          element={<ProtectedRoute guard="extended" element={<CreateCapsule />} />}
        />
        <Route
          path="/my-capsules"
          element={<ProtectedRoute guard="extended" element={<MyCapsules />} />}
        />
        <Route
          path="/opened-capsules"
          element={<ProtectedRoute guard="extended" element={<OpenedCapsules />} />}
        />
        <Route path="/capsule-view/:capsuleId" element={<ProtectedRoute guard="extended" element={<CapsuleView />} />} />
        <Route path="/feed" element={<ProtectedRoute guard="extended" element={<PublicFeed />} />} />
        <Route path="/feed-capsule/:capsuleId" element={<ProtectedRoute guard="extended" element={<FeedCapsuleView />} />} />
        <Route path="/map" element={<ProtectedRoute guard="extended" element={<MemoryMap />} />} />
        <Route path="/settings" element={<ProfileSettings />} />
        <Route
          path="/admin/moderation"
          element={<ProtectedRoute guard="moderation" element={<AdminModeration />} />}
        />
        <Route
          path="/admin/moderation/review"
          element={<ProtectedRoute guard="moderation" element={<ModerationCapsuleReview />} />}
        />
        <Route path="/admin/stats" element={<ProtectedRoute guard="stats" element={<AdminStats />} />} />
        <Route path="/admin/users" element={<ProtectedRoute guard="stats" element={<AdminUsers />} />} />
        <Route path="/error/401" element={<ErrorPage code={401} title="Не авторизован" message="Войдите в систему, чтобы продолжить." />} />
        <Route path="/error/402" element={<ErrorPage code={402} title="Требуется оплата" message="Для доступа к разделу нужен активный тариф." />} />
        <Route path="/error/403" element={<ErrorPage code={403} title="Доступ запрещен" message="У вас нет прав на этот раздел." />} />
        <Route path="/error/404" element={<ErrorPage code={404} title="Страница не найдена" message="Проверьте адрес страницы." />} />
        <Route path="/error/500" element={<ErrorPage code={500} title="Ошибка сервера" message="Произошла внутренняя ошибка, попробуйте позже." />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/support" element={<Support />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<Navigate to="/error/404" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
