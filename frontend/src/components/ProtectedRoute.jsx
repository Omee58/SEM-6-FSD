import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    const redirectMap = { admin: '/admin/dashboard', vendor: '/vendor/dashboard', client: '/dashboard' };
    return <Navigate to={redirectMap[user.role] || '/dashboard'} replace />;
  }

  return children;
}
