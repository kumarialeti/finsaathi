import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Insights from './pages/Insights';
import Chat from './pages/Chat';
import Documents from './pages/Documents';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { useAuthStore } from './store/useAuthStore';
import api from './utils/api';

import Register from './pages/Register';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated && !user) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          if (res.data.language && res.data.language !== i18n.language) {
            i18n.changeLanguage(res.data.language);
          }
        } catch (error) {
          console.error('Failed to fetch user', error);
        }
      } else if (user?.language && user.language !== i18n.language) {
        i18n.changeLanguage(user.language);
      }
    };
    fetchUser();
  }, [isAuthenticated, user, setUser, i18n]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="insights" element={<Insights />} />
          <Route path="ask" element={<Chat />} />
          <Route path="documents" element={<Documents />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
