// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HousePage from './pages/HousePage';
import HouseLogPage from './pages/HouseLogPage';
import TenantPage from './pages/TenantPage';
import TenantDashboard from './pages/TenantDashboard';
import Layout from './components/common/Layout';

const PrivateRoute = ({ children, ownerOnly = false }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  const isOwner = user?.role === 'owner';
  
  if (ownerOnly && !isOwner) return <Navigate to="/tenant-dashboard" replace />;
  
  return children;
};

export default function App() {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const isOwner = user?.role === 'owner';

  return (
    <Routes>
      {/* Public Login */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <LoginPage /> : <Navigate to={isOwner ? "/dashboard" : "/tenant-dashboard"} replace />} 
      />

      {/* Owner Routes (role='owner') */}
      <Route path="/" element={<PrivateRoute ownerOnly><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="houses" element={<HousePage />} />
        <Route path="house-logs" element={<HouseLogPage />} />
        <Route path="tenants" element={<TenantPage />} />
      </Route>

      {/* Tenant Routes (role='tenant') */}
      <Route path="/tenant-dashboard" element={<PrivateRoute><Layout tenant /></PrivateRoute>}>
        <Route index element={<TenantDashboard />} />
        {/* Add tenant-specific: <Route path="payments" element={<TenantPayments />} /> */}
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={isOwner ? "/dashboard" : "/tenant-dashboard"} replace />} />
    </Routes>
  );
}