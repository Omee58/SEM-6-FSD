import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/services': 'Browse Services',
  '/bookings': 'My Bookings',
  '/planner': 'Budget Planner',
  '/profile': 'Profile',
  '/vendor/dashboard': 'Dashboard',
  '/vendor/bookings': 'Booking Requests',
  '/vendor/services': 'My Services',
  '/vendor/profile': 'Profile',
  '/admin/dashboard': 'Dashboard',
  '/admin/approvals': 'Vendor Approvals',
  '/admin/users': 'All Users',
  '/admin/bookings': 'All Bookings',
  '/admin/profile': 'Profile',
};

export default function SidebarLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const title = TITLES[location.pathname] || '';

  return (
    <div className="sidebar-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'sidebar open' : 'sidebar'} md:!transform-none`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="sidebar-content">
        <TopBar title={title} onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
