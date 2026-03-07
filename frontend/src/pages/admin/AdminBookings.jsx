import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { adminAPI } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import Select from '../../components/ui/Select';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const r = await adminAPI.getAllBookings({ status, page, limit: 10 });
      setBookings(r.data.bookings || []);
      setTotal(r.data.pagination?.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [status, page]);

  const columns = [
    {
      header: 'Service',
      render: b => (
        <div>
          <div className="font-medium text-[#1A1A18] text-sm">{b.service?.title}</div>
          <div className="text-xs text-[#6B6B65] capitalize">{b.service?.category}</div>
        </div>
      ),
    },
    { header: 'Client', render: b => <div className="text-sm">{b.client?.full_name}<br /><span className="text-xs text-[#6B6B65]">{b.client?.email}</span></div> },
    { header: 'Vendor', render: b => <div className="text-sm">{b.vendor?.full_name}</div> },
    { header: 'Date', render: b => new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
    { header: 'Amount', render: b => <span className="font-bold text-[#D97706]">₹{b.total_amount?.toLocaleString('en-IN')}</span> },
    { header: 'Status', render: b => <Badge status={b.status}>{b.status}</Badge> },
  ];

  const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.total_amount || 0), 0);

  return (
    <div>
      <PageHeader title="All Bookings" subtitle={`${total} total bookings`} />

      {/* Revenue summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {STATUS_TABS.slice(1).map(s => {
          const count = bookings.filter(b => b.status === s).length;
          return (
            <div key={s} className="bg-white rounded-xl border border-[#E8E8E4] p-4 text-center">
              <div className="text-xl font-bold text-[#1A1A18]" style={{ fontFamily: 'Inter, sans-serif' }}>{count}</div>
              <div className="text-xs text-[#6B6B65] capitalize">{s}</div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-[#E8E8E4] p-4 mb-6 flex justify-between items-center">
        <div className="flex gap-2 overflow-x-auto">
          {STATUS_TABS.map(s => (
            <button key={s} onClick={() => { setStatus(s === 'all' ? '' : s); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                (status === '' && s === 'all') || status === s
                  ? 'bg-primary text-white'
                  : 'border border-border text-muted hover:border-primary hover:text-primary'
              }`}>
              {s}
            </button>
          ))}
        </div>
        {totalRevenue > 0 && (
          <div className="text-sm font-semibold text-[#D97706] shrink-0 ml-4">
            Revenue: ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
        )}
      </div>

      <DataTable columns={columns} data={bookings} loading={loading}
        emptyTitle="No bookings found" emptyDesc="No bookings match the selected filter." />

      {total > 10 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(Math.ceil(total / 10))].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary text-white' : 'bg-white border border-border text-muted'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
