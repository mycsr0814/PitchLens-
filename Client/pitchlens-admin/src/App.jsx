import { useState } from 'react';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import PresentationsPage from './pages/PresentationsPage';
import { getAdminName, getMyInfo, isLoggedIn, logout } from './utils/api';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [page, setPage] = useState('dashboard');
  const [adminName, setAdminName] = useState(getAdminName());

  const handleLoginSuccess = async () => {
    setLoggedIn(true);
    try {
      const me = await getMyInfo();
      if (me.name) {
        localStorage.setItem('pitchlens_admin_name', me.name);
        setAdminName(me.name);
      }
    } catch {
      setAdminName(getAdminName());
    }
  };

  const handleLogout = async () => {
    await logout();
    setLoggedIn(false);
    setPage('dashboard');
    setAdminName('');
  };

  if (!loggedIn) {
    return <LoginPage onSuccess={handleLoginSuccess} />;
  }

  const content = {
    dashboard: <DashboardPage />,
    users: <UsersPage />,
    presentations: <PresentationsPage />,
  }[page] || <DashboardPage />;

  return (
    <AdminLayout
      page={page}
      onNavigate={setPage}
      onLogout={handleLogout}
      adminName={adminName}
    >
      {content}
    </AdminLayout>
  );
}
