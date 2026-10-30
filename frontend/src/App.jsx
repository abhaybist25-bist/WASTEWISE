import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages - Public
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Pages - Marketplace (public browse)
import MarketplacePage from './pages/marketplace/MarketplacePage';
import DonationDetailPage from './pages/marketplace/DonationDetailPage';

// Pages - Donor
import DonorDashboard from './pages/donor/DonorDashboard';
import CreateDonationPage from './pages/donor/CreateDonationPage';
import MyDonationsPage from './pages/donor/MyDonationsPage';
import DonorClaimsPage from './pages/donor/DonorClaimsPage';
import DonorInsightsPage from './pages/donor/DonorInsightsPage';

// Pages - Recipient
import RecipientDashboard from './pages/recipient/RecipientDashboard';
import RecommendationsPage from './pages/recipient/RecommendationsPage';
import MyClaimsPage from './pages/recipient/MyClaimsPage';

// Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrganizationsPage from './pages/admin/AdminOrganizationsPage';
import AdminDonationsPage from './pages/admin/AdminDonationsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Spinner
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <LoadingSpinner fullscreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <LoadingSpinner fullscreen />;
  if (isAuthenticated) {
    if (role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'ROLE_DONOR') return <Navigate to="/donor" replace />;
    if (role === 'ROLE_RECIPIENT') return <Navigate to="/recipient" replace />;
    return <Navigate to="/marketplace" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/marketplace/:id" element={<DonationDetailPage />} />
        <Route path="/donations/:id" element={<DonationDetailPage />} />
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        {/* Donor routes */}
        <Route path="/donor" element={<ProtectedRoute allowedRoles={['ROLE_DONOR']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DonorDashboard />} />
          <Route path="create" element={<CreateDonationPage />} />
          <Route path="donations" element={<MyDonationsPage />} />
          <Route path="claims" element={<DonorClaimsPage />} />
          <Route path="insights" element={<DonorInsightsPage />} />
        </Route>

        {/* Recipient routes */}
        <Route path="/recipient" element={<ProtectedRoute allowedRoles={['ROLE_RECIPIENT']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<RecipientDashboard />} />
          <Route path="recommendations" element={<RecommendationsPage />} />
          <Route path="claims" element={<MyClaimsPage />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="organizations" element={<AdminOrganizationsPage />} />
          <Route path="donations" element={<AdminDonationsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

