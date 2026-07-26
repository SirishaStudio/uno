import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageLoader } from '@/components/ui/PageLoader';
import { ROUTES } from '@/constants/routes';

const SplashPage = lazy(() => import('@/pages/SplashPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const CreateRoomPage = lazy(() => import('@/pages/CreateRoomPage'));
const JoinRoomPage = lazy(() => import('@/pages/JoinRoomPage'));
const WaitingRoomPage = lazy(() => import('@/pages/WaitingRoomPage'));
const GamePage = lazy(() => import('@/pages/GamePage'));
const ResultPage = lazy(() => import('@/pages/ResultPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function guard(element: React.ReactNode) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

export function App() {
  return (
    <AppShell>
      <Suspense fallback={<PageLoader label="Loading…" />}>
        <Routes>
          <Route path={ROUTES.splash} element={<SplashPage />} />
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.home} element={guard(<HomePage />)} />
          <Route path={ROUTES.createRoom} element={guard(<CreateRoomPage />)} />
          <Route path={ROUTES.joinRoom} element={guard(<JoinRoomPage />)} />
          <Route path={ROUTES.waitingRoom} element={guard(<WaitingRoomPage />)} />
          <Route path={ROUTES.game} element={guard(<GamePage />)} />
          <Route path={ROUTES.result} element={guard(<ResultPage />)} />
          <Route path={ROUTES.profile} element={guard(<ProfilePage />)} />
          <Route path={ROUTES.settings} element={guard(<SettingsPage />)} />
          <Route path="/" element={<Navigate to={ROUTES.splash} replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
