import { useState, useEffect } from 'react';
import { Users, Package, Calendar, IndianRupee, UserCheck, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import StatsCard from '../../components/ui/StatsCard';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import { PageSpinner } from '../../components/ui/Spinner';

const STATUS_COLORS = { pending: '#D97706', confirmed: '#059669', cancelled: '#DC2626', completed: '#7C3AED' };

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8E8E4] rounded-xl p-3 shadow-lg text-sm">
      <div className="font-semibold text-[#1A1A18] mb-1">{label}</div>
      <div className="text-primary">₹{payload[0]?.value?.toLocaleString('en-IN')}</div>
      {payload[1] && <div className="text-[#6B6B65] text-xs">{payload[1]?.value} bookings</div>}
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  const ov = stats?.overview || {};
  const monthly = stats?.monthly || [];
  // Convert status_breakdown object to array for PieChart
  const statusBreakdown = stats?.status_breakdown
    ? Object.entries(stats.status_breakdown).map(([k, v]) => ({ _id: k, count: v }))
    : [];
  const topCategories = (stats?.top_categories || []).map(c => ({ _id: c.category || c._id, count: c.count }));
  const pendingVendors = (ov.users_by_role?.vendor || 0) - (ov.verified_vendors || 0);

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview & analytics" />

      {/* Pending vendors alert */}
      {pendingVendors > 0 && (
        <Link to="/admin/approvals" className="block mb-6 p-4 bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-xl hover:bg-[#FEF9EE] transition-colors">
          <div className="flex items-center gap-3">
            <UserCheck size={18} className="text-[#D97706]" />
            <div>
              <div className="font-semibold text-[#92400E] text-sm">{pendingVendors} vendor{pendingVendors > 1 ? 's' : ''} awaiting approval</div>
              <div className="text-xs text-[#92400E]/80">Click to review and approve vendor registrations →</div>
            </div>
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatsCard icon={Users} label="Total Users" value={ov.total_users || 0} accent="blue" />
        <StatsCard icon={UserCheck} label="Vendors" value={ov.users_by_role?.vendor || 0} accent="purple" />
        <StatsCard icon={Users} label="Clients" value={ov.users_by_role?.client || 0} accent="rose" />
        <StatsCard icon={Package} label="Services" value={ov.active_services || 0} accent="green" />
        <StatsCard icon={Calendar} label="Bookings" value={ov.total_bookings || 0} accent="gold" />
        <StatsCard icon={IndianRupee} label="Revenue" value={`₹${((ov.total_revenue || 0) / 1000).toFixed(0)}k`} accent="gold" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Revenue Chart */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="px-6 pt-5 pb-4 border-b border-[#E8E8E4]">
            <h2 className="font-semibold text-[#1A1A18]" style={{ fontFamily: 'Playfair Display, serif' }}>Monthly Revenue</h2>
            <p className="text-xs text-[#6B6B65] mt-0.5">Last 6 months</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B6B65' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#6B6B65' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="revenue" fill="#C9A84C" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Booking Status Pie */}
        <Card padding={false}>
          <div className="px-5 pt-5 pb-4 border-b border-[#E8E8E4]">
            <h2 className="font-semibold text-[#1A1A18]" style={{ fontFamily: 'Playfair Display, serif' }}>Booking Status</h2>
          </div>
          <div className="p-4">
            {statusBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="count" paddingAngle={2}>
                      {statusBreakdown.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry._id] || '#6B7280'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {statusBreakdown.map(s => (
                    <div key={s._id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="legend-dot" style={{ background: STATUS_COLORS[s._id] || '#6B7280' }} />
                        <span className="capitalize text-[#6B6B65]">{s._id}</span>
                      </div>
                      <span className="font-semibold text-[#1A1A18]">{s.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center text-sm text-[#6B6B65]">No booking data</div>
            )}
          </div>
        </Card>
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <Card>
          <h2 className="font-semibold text-[#1A1A18] mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>Top Service Categories</h2>
          <div className="space-y-3">
            {topCategories.map((cat, i) => (
              <div key={cat._id} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium capitalize text-[#1A1A18]">{cat._id}</span>
                    <span className="text-[#6B6B65]">{cat.count} services</span>
                  </div>
                  <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-primary to-primary-dark rounded-full"
                      style={{ width: `${Math.min(100, (cat.count / (topCategories[0]?.count || 1)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
