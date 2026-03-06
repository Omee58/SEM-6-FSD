import { useState, useEffect } from 'react';
import { IndianRupee, Bell, Package, Star, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { vendorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/ui/StatsCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import { PageSpinner } from '../../components/ui/Spinner';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8E8E4] rounded-xl p-3 shadow-lg text-sm">
      <div className="font-semibold text-[#1A1A18] mb-1">{label}</div>
      <div className="text-[#BE185D]">₹{payload[0]?.value?.toLocaleString('en-IN')}</div>
      <div className="text-[#6B6B65] text-xs">{payload[1]?.value} bookings</div>
    </div>
  );
};

export default function VendorDashboard() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      vendorAPI.getEarnings(),
      vendorAPI.getBookingRequests(),
    ]).then(([er, rr]) => {
      if (er.status === 'fulfilled') setEarnings(er.value.data);
      if (rr.status === 'fulfilled') setRequests(rr.value.data.bookings || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <PageSpinner />;

  const isUnverified = !user?.verified;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.full_name?.split(' ')[0]} 👋`}
        subtitle={isUnverified ? 'Your account is pending admin verification.' : 'Here\'s your business overview.'}
      />

      {isUnverified && (
        <div className="mb-6 p-4 bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-xl flex items-start gap-3">
          <Bell size={18} className="text-[#D97706] mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-[#92400E] text-sm">Account Pending Verification</div>
            <div className="text-xs text-[#92400E]/80 mt-0.5">Your vendor account is under review. You'll receive an email once approved by admin.</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={IndianRupee} label="Total Earnings" value={`₹${(earnings?.totals?.total_earned || 0).toLocaleString('en-IN')}`} accent="gold" />
        <StatsCard icon={Bell} label="Pending Requests" value={requests.length} accent="rose" />
        <StatsCard icon={Package} label="Total Bookings" value={earnings?.totals?.total_bookings || 0} accent="blue" />
        <StatsCard icon={Star} label="This Month" value={`₹${(earnings?.totals?.this_month_earnings || 0).toLocaleString('en-IN')}`} accent="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="px-6 pt-5 pb-4 border-b border-[#E8E8E4]">
            <h2 className="font-semibold text-[#1A1A18]" style={{ fontFamily: 'Playfair Display, serif' }}>Monthly Earnings</h2>
            <p className="text-xs text-[#6B6B65] mt-0.5">Last 6 months revenue</p>
          </div>
          <div className="p-6">
            {earnings?.monthly?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={earnings.monthly}>
                  <defs>
                    <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#BE185D" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#BE185D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B6B65' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#6B6B65' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="earnings" stroke="#BE185D" strokeWidth={2.5} fill="url(#earningsGrad)" />
                  <Area type="monotone" dataKey="bookings" stroke="#D97706" strokeWidth={1.5} fill="none" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-[#6B6B65] text-sm">
                No earnings data yet
              </div>
            )}
          </div>
        </Card>

        {/* Pending Requests */}
        <Card padding={false}>
          <div className="px-5 pt-5 pb-4 border-b border-[#E8E8E4]">
            <h2 className="font-semibold text-[#1A1A18]" style={{ fontFamily: 'Playfair Display, serif' }}>Pending Requests</h2>
          </div>
          <div className="p-4">
            {requests.length === 0 ? (
              <div className="text-center py-8 text-sm text-[#6B6B65]">No pending requests</div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 5).map(b => (
                  <div key={b._id} className="p-3 rounded-xl border border-[#E8E8E4] hover:border-[#BE185D]/30 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-[#1A1A18] line-clamp-1">{b.service?.title}</span>
                      <Badge status={b.status}>{b.status}</Badge>
                    </div>
                    <div className="text-xs text-[#6B6B65]">{b.client?.full_name}</div>
                    <div className="text-xs text-[#6B6B65]">{new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    <div className="text-xs font-bold text-[#D97706] mt-1">₹{b.total_amount?.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
