import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-capsule" element={<CreateCapsule />} />
        <Route path="/my-capsules" element={<MyCapsules />} />
        <Route path="/feed" element={<PublicFeed />} />
        <Route path="/map" element={<MemoryMap />} />
        <Route path="/settings" element={<ProfileSettings />} />
        <Route path="/admin/moderation" element={<AdminModeration />} />
        <Route path="/admin/stats" element={<AdminStats />} />
      </Routes>
    </Router>
  );
}

export default App;
