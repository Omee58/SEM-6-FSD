import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SidebarLayout from './components/layout/SidebarLayout';

import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotFound from './pages/NotFound';
import ServiceDetail from './pages/ServiceDetail';

import ClientDashboard from './pages/client/ClientDashboard';
import ClientServices from './pages/client/ClientServices';
import ClientBookings from './pages/client/ClientBookings';
import ClientProfile from './pages/client/ClientProfile';
import BudgetPlanner from './pages/client/BudgetPlanner';
import VendorPublicProfile from './pages/client/VendorPublicProfile';

import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorBookings from './pages/vendor/VendorBookings';
import VendorServices from './pages/vendor/VendorServices';
import VendorProfile from './pages/vendor/VendorProfile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVendorApprovals from './pages/admin/AdminVendorApprovals';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBookings from './pages/admin/AdminBookings';
import AdminProfile from './pages/admin/AdminProfile';

function ClientRoutes() {
  return (
    <ProtectedRoute role="client">
      <SidebarLayout>
        <Routes>
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="services" element={<ClientServices />} />
          <Route path="bookings" element={<ClientBookings />} />
          <Route path="planner" element={<BudgetPlanner />} />
          <Route path="profile" element={<ClientProfile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

function VendorRoutes() {
  return (
    <ProtectedRoute role="vendor">
      <SidebarLayout>
        <Routes>
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="bookings" element={<VendorBookings />} />
          <Route path="services" element={<VendorServices />} />
          <Route path="profile" element={<VendorProfile />} />
          <Route path="*" element={<Navigate to="/vendor/dashboard" replace />} />
        </Routes>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

function AdminRoutes() {
  return (
    <ProtectedRoute role="admin">
      <SidebarLayout>
        <Routes>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="approvals" element={<AdminVendorApprovals />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/vendors/:vendorId" element={<VendorPublicProfile />} />
          <Route path="/*" element={<ClientRoutes />} />
          <Route path="/vendor/*" element={<VendorRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
