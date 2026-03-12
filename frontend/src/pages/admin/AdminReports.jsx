import { useState, useEffect, useMemo } from 'react';
import {
  FileDown, BarChart2, Users, DollarSign, Star,
  Calendar, ChevronDown, Download, Filter, TrendingUp,
  FileText, Package, CheckCircle,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { PageSpinner } from '../../components/ui/Spinner';

function Orb({ size, color, style: s }) {
  return <div className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, background: color, filter: 'blur(70px)', ...s }} />;
}

const REPORT_TYPES = [
  {
    key: 'bookings',
    label: 'Bookings Report',
    desc: 'All booking records with client, vendor, service & status',
    icon: BarChart2,
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.1)',
    border: 'rgba(99,102,241,0.25)',
  },
  {
    key: 'revenue',
    label: 'Revenue Report',
    desc: 'Completed booking revenue broken down by date & category',
    icon: DollarSign,
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
  },
  {
    key: 'users',
    label: 'Users Report',
    desc: 'Registered users with role, join date & vendor status',
    icon: Users,
    color: '#EC4899',
    bg: 'rgba(236,72,153,0.1)',
    border: 'rgba(236,72,153,0.25)',
  },
  {
    key: 'vendors',
    label: 'Vendor Performance',
    desc: 'Vendor earnings, bookings completed & average rating',
    icon: TrendingUp,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
  },
];

const STATUS_COLOR = {
  pending:   { bg: '#FFFBEB', text: '#92400E' },
  confirmed: { bg: '#EFF6FF', text: '#1D4ED8' },
  completed: { bg: '#F0FDF4', text: '#065F46' },
  cancelled: { bg: '#FEF2F2', text: '#991B1B' },
};

function downloadCSV(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReports() {
  const [reportType, setReportType] = useState('bookings');
  const [bookings,   setBookings]   = useState([]);
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [mounted,    setMounted]    = useState(false);

  // Date range — default: last 30 days
  const today      = new Date().toISOString().split('T')[0];
  const thirtyAgo  = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const [from, setFrom] = useState(thirtyAgo);
  const [to,   setTo]   = useState(today);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [bRes, uRes] = await Promise.all([
          adminAPI.getAllBookings({ limit: 9999 }),
          adminAPI.getAllUsers({ limit: 9999 }),
        ]);
        setBookings(bRes.data.bookings || []);
        setUsers(uRes.data.users || []);
      } catch {}
      setLoading(false);
      setTimeout(() => setMounted(true), 60);
    };
    load();
  }, []);

  // Filter by date range
  const inRange = (dateStr) => {
    if (!dateStr) return false;
    const d = dateStr.split('T')[0];
    return d >= from && d <= to;
  };

  const filteredBookings = useMemo(() =>
    bookings.filter(b => inRange(b.createdAt)), [bookings, from, to]);

  const filteredUsers = useMemo(() =>
    users.filter(u => inRange(u.createdAt)), [users, from, to]);

  // Derived: revenue rows (completed only)
  const revenueRows = useMemo(() =>
    filteredBookings
      .filter(b => b.status === 'completed')
      .map(b => ({
        Date: b.createdAt?.split('T')[0] || '',
        Service: b.service?.title || '—',
        Category: b.service?.category || '—',
        Client: b.client?.full_name || '—',
        Vendor: b.vendor?.full_name || b.vendor?.business_name || '—',
        'Amount (₹)': b.total_amount ?? 0,
      })),
  [filteredBookings]);

  const totalRevenue = revenueRows.reduce((s, r) => s + Number(r['Amount (₹)']), 0);

  // Derived: vendor performance rows
  const vendorRows = useMemo(() => {
    const map = {};
    filteredBookings.forEach(b => {
      const vid = b.vendor?._id;
      if (!vid) return;
      if (!map[vid]) map[vid] = {
        Vendor: b.vendor?.full_name || b.vendor?.business_name || '—',
        Category: b.vendor?.category_specialization || '—',
        'Total Bookings': 0,
        Completed: 0,
        Cancelled: 0,
        'Revenue (₹)': 0,
      };
      map[vid]['Total Bookings']++;
      if (b.status === 'completed') { map[vid].Completed++; map[vid]['Revenue (₹)'] += b.total_amount ?? 0; }
      if (b.status === 'cancelled') map[vid].Cancelled++;
    });
    return Object.values(map).sort((a, b) => b['Revenue (₹)'] - a['Revenue (₹)']);
  }, [filteredBookings]);

  // Summary tiles
  const summary = useMemo(() => ({
    bookings: {
      total:     filteredBookings.length,
      completed: filteredBookings.filter(b => b.status === 'completed').length,
      pending:   filteredBookings.filter(b => b.status === 'pending').length,
      revenue:   filteredBookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.total_amount ?? 0), 0),
    },
    users: {
      total:   filteredUsers.length,
      clients: filteredUsers.filter(u => u.role === 'client').length,
      vendors: filteredUsers.filter(u => u.role === 'vendor').length,
    },
  }), [filteredBookings, filteredUsers]);

  const handleExport = () => {
    const ts = new Date().toISOString().split('T')[0];
    if (reportType === 'bookings') {
      downloadCSV(`bookings_${ts}.csv`, filteredBookings.map(b => ({
        'Booking ID': b._id,
        Date: b.createdAt?.split('T')[0] || '',
        Service: b.service?.title || '—',
        Category: b.service?.category || '—',
        Client: b.client?.full_name || '—',
        Vendor: b.vendor?.full_name || '—',
        'Amount (₹)': b.total_amount ?? 0,
        Status: b.status,
      })));
    } else if (reportType === 'revenue') {
      downloadCSV(`revenue_${ts}.csv`, revenueRows);
    } else if (reportType === 'users') {
      downloadCSV(`users_${ts}.csv`, filteredUsers.map(u => ({
        Name: u.full_name,
        Email: u.email,
        Role: u.role,
        Phone: u.phone || '—',
        'Joined Date': u.createdAt?.split('T')[0] || '',
        Verified: u.role === 'vendor' ? (u.verified ? 'Yes' : 'No') : '—',
      })));
    } else {
      downloadCSV(`vendor_performance_${ts}.csv`, vendorRows);
    }
  };

  const activeType = REPORT_TYPES.find(r => r.key === reportType);

  return (
    <div className="space-y-6" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.35s ease' }}>

      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl"
        style={{ background: 'linear-gradient(135deg,#060B14 0%,#0D1627 50%,#0F172A 100%)', minHeight: 170, padding: '32px 40px' }}>
        <Orb size={280} color="rgba(99,102,241,0.12)" style={{ top: -60, right: -40 }} />
        <Orb size={180} color="rgba(16,185,129,0.08)" style={{ bottom: -50, left: 300 }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[11px] font-bold uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
              <FileDown size={11} style={{ color: '#6366F1' }} /> Reports & Export
            </div>
            <h1 className="text-white font-bold mb-1"
              style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.4rem,3vw,2rem)' }}>
              Data Reports
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13 }}>
              Filter, preview, and export platform data as CSV
            </p>
          </div>
          {/* quick stats */}
          <div className="flex items-center gap-3">
            {[
              { label: 'Bookings', val: bookings.length, color: '#A5B4FC' },
              { label: 'Users',    val: users.length,    color: '#6EE7B7' },
              { label: 'Revenue',  val: `₹${(bookings.filter(b=>b.status==='completed').reduce((s,b)=>s+(b.total_amount??0),0)/1000).toFixed(0)}K`, color: '#FCD34D' },
            ].map(s => (
              <div key={s.label} className="px-4 py-3 rounded-2xl text-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', minWidth: 72 }}>
                <p className="font-bold text-[1.2rem]" style={{ fontFamily: 'Cormorant Garamond,serif', color: s.color }}>{s.val}</p>
                <p className="text-[10px] uppercase tracking-widest font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REPORT TYPE CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORT_TYPES.map(rt => {
          const active = reportType === rt.key;
          const Icon = rt.icon;
          return (
            <button key={rt.key} onClick={() => setReportType(rt.key)}
              className="rounded-2xl p-5 text-left transition-all duration-200"
              style={active ? {
                background: rt.bg,
                border: `2px solid ${rt.border}`,
                boxShadow: `0 6px 20px ${rt.color}20`,
                transform: 'translateY(-2px)',
              } : {
                background: '#fff',
                border: '2px solid transparent',
                boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.boxShadow = '0 6px 20px rgba(15,23,42,0.1)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.05)'; }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: active ? rt.bg : '#F1F5F9' }}>
                <Icon size={18} style={{ color: active ? rt.color : '#94A3B8' }} />
              </div>
              <p className="font-bold text-[13px] mb-1" style={{ color: active ? '#0F172A' : '#475569' }}>{rt.label}</p>
              <p className="text-[11px] leading-snug" style={{ color: '#94A3B8' }}>{rt.desc}</p>
            </button>
          );
        })}
      </div>

      {/* FILTERS + EXPORT BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
            <Calendar size={14} style={{ color: '#94A3B8' }} />
            <span className="text-[12px] font-semibold" style={{ color: '#64748B' }}>From</span>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="text-[13px] font-semibold focus:outline-none" style={{ color: '#0F172A', cursor: 'pointer' }} />
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
            <Calendar size={14} style={{ color: '#94A3B8' }} />
            <span className="text-[12px] font-semibold" style={{ color: '#64748B' }}>To</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="text-[13px] font-semibold focus:outline-none" style={{ color: '#0F172A', cursor: 'pointer' }} />
          </div>
          <div className="px-3 py-2.5 rounded-xl text-[12px] font-semibold"
            style={{ background: '#F1F5F9', color: '#475569' }}>
            {reportType === 'users' ? `${filteredUsers.length} records` : `${filteredBookings.length} records`}
          </div>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all duration-200"
          style={{
            background: `linear-gradient(135deg, ${activeType?.color || '#6366F1'}, ${activeType?.color || '#6366F1'}cc)`,
            boxShadow: `0 4px 16px ${activeType?.color || '#6366F1'}30`,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* SUMMARY CHIPS */}
      {!loading && reportType === 'bookings' && (
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total',     val: summary.bookings.total,     color: '#6366F1', bg: '#EEF2FF' },
            { label: 'Completed', val: summary.bookings.completed, color: '#059669', bg: '#F0FDF4' },
            { label: 'Pending',   val: summary.bookings.pending,   color: '#D97706', bg: '#FFFBEB' },
            { label: 'Revenue',   val: `₹${summary.bookings.revenue.toLocaleString()}`, color: '#7C3AED', bg: '#F5F3FF' },
          ].map(c => (
            <div key={c.label} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold"
              style={{ background: c.bg, color: c.color }}>
              <span style={{ opacity: 0.6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.label}</span>
              <span>{c.val}</span>
            </div>
          ))}
        </div>
      )}
      {!loading && reportType === 'users' && (
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'New Users',   val: summary.users.total,   color: '#EC4899', bg: '#FDF2F8' },
            { label: 'New Clients', val: summary.users.clients, color: '#BE185D', bg: '#FCE7F3' },
            { label: 'New Vendors', val: summary.users.vendors, color: '#059669', bg: '#F0FDF4' },
          ].map(c => (
            <div key={c.label} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold"
              style={{ background: c.bg, color: c.color }}>
              <span style={{ opacity: 0.6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.label}</span>
              <span>{c.val}</span>
            </div>
          ))}
        </div>
      )}
      {!loading && reportType === 'revenue' && (
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total Revenue', val: `₹${totalRevenue.toLocaleString()}`, color: '#059669', bg: '#F0FDF4' },
            { label: 'Transactions',  val: revenueRows.length,                  color: '#0891B2', bg: '#ECFEFF' },
            { label: 'Avg per Booking', val: `₹${revenueRows.length ? Math.round(totalRevenue/revenueRows.length).toLocaleString() : 0}`, color: '#7C3AED', bg: '#F5F3FF' },
          ].map(c => (
            <div key={c.label} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold"
              style={{ background: c.bg, color: c.color }}>
              <span style={{ opacity: 0.6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.label}</span>
              <span>{c.val}</span>
            </div>
          ))}
        </div>
      )}

      {/* DATA PREVIEW TABLE */}
      {loading ? <PageSpinner /> : (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
          {/* table header bar */}
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid #F1F5F9' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: activeType?.bg || '#EEF2FF' }}>
                {activeType && <activeType.icon size={15} style={{ color: activeType.color }} />}
              </div>
              <div>
                <p className="font-bold text-[14px]" style={{ fontFamily: 'Playfair Display,serif', color: '#0F172A' }}>
                  {activeType?.label}
                </p>
                <p className="text-[11px]" style={{ color: '#94A3B8' }}>
                  {from} — {to} · Showing first 50 rows
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
              style={{ background: '#F8FAFF', color: '#64748B', border: '1px solid #E2E8F0' }}>
              <Filter size={11} /> Preview
            </div>
          </div>

          {/* scrollable table */}
          <div style={{ overflowX: 'auto', maxHeight: 480, overflowY: 'auto' }}>
            {reportType === 'bookings' && <BookingsTable rows={filteredBookings.slice(0, 50)} />}
            {reportType === 'revenue'  && <RevenueTable  rows={revenueRows.slice(0, 50)} />}
            {reportType === 'users'    && <UsersTable    rows={filteredUsers.slice(0, 50)} />}
            {reportType === 'vendors'  && <VendorTable   rows={vendorRows.slice(0, 50)} />}
          </div>

          {/* footer */}
          <div className="px-6 py-3 flex items-center justify-between"
            style={{ borderTop: '1px solid #F1F5F9', background: '#FAFBFF' }}>
            <p className="text-[12px]" style={{ color: '#94A3B8' }}>
              {reportType === 'users' ? filteredUsers.length : reportType === 'vendors' ? vendorRows.length : filteredBookings.length} total records in range
            </p>
            <button onClick={handleExport}
              className="flex items-center gap-1.5 text-[12px] font-semibold transition-colors"
              style={{ color: activeType?.color || '#6366F1' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
              <FileDown size={13} /> Download full CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-tables ─────────────────────────────────────────── */

const TH = ({ children }) => (
  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
    style={{ color: '#94A3B8', background: '#F8FAFF', position: 'sticky', top: 0, zIndex: 1 }}>
    {children}
  </th>
);

const TD = ({ children, className = '' }) => (
  <td className={`px-5 py-3.5 text-[13px] whitespace-nowrap ${className}`} style={{ color: '#475569', borderBottom: '1px solid #F1F5F9' }}>
    {children}
  </td>
);

function BookingsTable({ rows }) {
  if (!rows.length) return <EmptyMsg />;
  return (
    <table className="w-full">
      <thead><tr><TH>Date</TH><TH>Service</TH><TH>Client</TH><TH>Vendor</TH><TH>Amount</TH><TH>Status</TH></tr></thead>
      <tbody>
        {rows.map((b, i) => {
          const sc = STATUS_COLOR[b.status] || STATUS_COLOR.pending;
          return (
            <tr key={b._id || i}
              onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFF'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; }}>
              <TD>{b.createdAt?.split('T')[0] || '—'}</TD>
              <TD><span className="font-semibold" style={{ color: '#0F172A' }}>{b.service?.title || '—'}</span></TD>
              <TD>{b.client?.full_name || '—'}</TD>
              <TD>{b.vendor?.full_name || b.vendor?.business_name || '—'}</TD>
              <TD><span className="font-semibold" style={{ color: '#059669' }}>₹{(b.total_amount ?? 0).toLocaleString()}</span></TD>
              <TD>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: sc.bg, color: sc.text, textTransform: 'capitalize' }}>
                  {b.status}
                </span>
              </TD>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function RevenueTable({ rows }) {
  if (!rows.length) return <EmptyMsg />;
  return (
    <table className="w-full">
      <thead><tr><TH>Date</TH><TH>Service</TH><TH>Category</TH><TH>Client</TH><TH>Vendor</TH><TH>Amount (₹)</TH></tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}
            onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = ''; }}>
            <TD>{r.Date}</TD>
            <TD><span className="font-semibold" style={{ color: '#0F172A' }}>{r.Service}</span></TD>
            <TD>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ background: '#EEF2FF', color: '#4338CA', textTransform: 'capitalize' }}>
                {r.Category}
              </span>
            </TD>
            <TD>{r.Client}</TD>
            <TD>{r.Vendor}</TD>
            <TD><span className="font-bold" style={{ color: '#059669' }}>₹{Number(r['Amount (₹)']).toLocaleString()}</span></TD>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function UsersTable({ rows }) {
  if (!rows.length) return <EmptyMsg />;
  const ROLE = {
    client: { bg: '#FDF2F8', text: '#BE185D' },
    vendor: { bg: '#F0FDF4', text: '#065F46' },
    admin:  { bg: '#FFFBEB', text: '#92400E' },
  };
  return (
    <table className="w-full">
      <thead><tr><TH>Name</TH><TH>Email</TH><TH>Role</TH><TH>Phone</TH><TH>Joined</TH><TH>Verified</TH></tr></thead>
      <tbody>
        {rows.map((u, i) => {
          const rc = ROLE[u.role] || ROLE.client;
          return (
            <tr key={u._id || i}
              onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFF'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; }}>
              <TD><span className="font-semibold" style={{ color: '#0F172A' }}>{u.full_name}</span></TD>
              <TD><span style={{ color: '#64748B' }}>{u.email}</span></TD>
              <TD>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: rc.bg, color: rc.text, textTransform: 'capitalize' }}>
                  {u.role}
                </span>
              </TD>
              <TD>{u.phone || '—'}</TD>
              <TD>{u.createdAt?.split('T')[0] || '—'}</TD>
              <TD>
                {u.role === 'vendor'
                  ? <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                      style={{ background: u.verified ? '#F0FDF4' : '#FFFBEB', color: u.verified ? '#065F46' : '#92400E' }}>
                      {u.verified ? 'Verified' : 'Pending'}
                    </span>
                  : <span style={{ color: '#CBD5E1' }}>—</span>}
              </TD>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function VendorTable({ rows }) {
  if (!rows.length) return <EmptyMsg />;
  return (
    <table className="w-full">
      <thead><tr><TH>Vendor</TH><TH>Category</TH><TH>Total Bookings</TH><TH>Completed</TH><TH>Cancelled</TH><TH>Revenue (₹)</TH></tr></thead>
      <tbody>
        {rows.map((v, i) => (
          <tr key={i}
            onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = ''; }}>
            <TD><span className="font-semibold" style={{ color: '#0F172A' }}>{v.Vendor}</span></TD>
            <TD>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ background: '#EEF2FF', color: '#4338CA', textTransform: 'capitalize' }}>
                {v.Category || '—'}
              </span>
            </TD>
            <TD><span className="font-bold" style={{ color: '#475569' }}>{v['Total Bookings']}</span></TD>
            <TD><span className="font-semibold" style={{ color: '#059669' }}>{v.Completed}</span></TD>
            <TD><span className="font-semibold" style={{ color: '#EF4444' }}>{v.Cancelled}</span></TD>
            <TD><span className="font-bold" style={{ color: '#059669' }}>₹{v['Revenue (₹)'].toLocaleString()}</span></TD>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EmptyMsg() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <FileText size={36} style={{ color: '#CBD5E1', marginBottom: 12 }} />
      <p className="font-bold text-[1rem]" style={{ fontFamily: 'Playfair Display,serif', color: '#0F172A' }}>No data in this range</p>
      <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Try expanding the date range</p>
    </div>
  );
}
