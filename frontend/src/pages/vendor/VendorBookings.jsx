import { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Clock, Calendar, User, IndianRupee,
  Sparkles, Phone, MessageSquare, ArrowRight, Package,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { vendorAPI } from '../../services/api';
import Badge from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';

const CATEGORY_COLORS = {
  photography: '#8B1A3A', catering: '#C9A84C', venue: '#2563EB',
  decoration: '#059669', mehendi: '#7C3AED', music: '#0891B2',
  makeup: '#DB2777', transport: '#D97706', other: '#6D28D9',
};

function FloatOrb({ size, color, style: s }) {
  return (
    <div className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, background: color, filter: 'blur(50px)', animation: 'floatSlow 7s ease-in-out infinite', ...s }} />
  );
}

function StatusDot({ status }) {
  const colors = { pending: '#F59E0B', confirmed: '#059669', completed: '#7C3AED', cancelled: '#DC2626' };
  return <div className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[status] || '#A8A29E', boxShadow: `0 0 6px ${colors[status] || '#A8A29E'}` }} />;
}

export default function VendorBookings() {
  const [tab,         setTab]         = useState('requests');
  const [requests,    setRequests]    = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [actionId,    setActionId]    = useState(null);
  const [mounted,     setMounted]     = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [rr, ar] = await Promise.allSettled([
      vendorAPI.getBookingRequests(),
      vendorAPI.getAllBookings(),
    ]);
    if (rr.status === 'fulfilled') setRequests(rr.value.data.bookings || []);
    if (ar.status === 'fulfilled') setAllBookings(ar.value.data.bookings || []);
    setLoading(false);
    setTimeout(() => setMounted(true), 60);
  };

  useEffect(() => { fetchData(); }, []);

  const changeStatus = async (id, status) => {
    setActionId(id);
    try {
      await vendorAPI.changeBookingStatus(id, status);
      toast.success(`Booking ${status}!`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
    setActionId(null);
  };

  if (loading) return <PageSpinner />;

  const display = tab === 'requests' ? requests : allBookings;

  const TABS = [
    { id: 'requests', label: 'Pending Requests', count: requests.length,    dot: '#F59E0B' },
    { id: 'all',      label: 'All Bookings',      count: allBookings.length, dot: '#059669' },
  ];

  return (
    <div style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      <div className="space-y-6">

        {/* ══ HERO ══ */}
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: 'linear-gradient(135deg,#0D0906 0%,#1C1917 40%,#2A1505 70%,#3D1A08 100%)',
            backgroundSize: '300% 300%',
            animation: 'gradientShift 10s ease infinite',
            minHeight: 180,
            padding: '32px 40px',
          }}
        >
          <FloatOrb size={200} color="rgba(201,168,76,0.1)" style={{ top: -50, right: 40 }} />
          <FloatOrb size={140} color="rgba(139,26,58,0.12)" style={{ bottom: -30, right: 200, animationDelay: '3s' }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }} />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[11px] font-bold uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
              <Calendar size={11} style={{ color: '#C9A84C' }} /> Booking Management
            </div>
            <h1 className="text-white font-bold mb-1"
              style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.4rem,3vw,2rem)', letterSpacing: '-0.01em' }}>
              Booking Requests
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              {requests.length > 0
                ? `${requests.length} request${requests.length === 1 ? '' : 's'} waiting for your response`
                : 'All caught up — no pending requests'}
            </p>
          </div>
        </div>

        {/* ══ TABS ══ */}
        <div className="flex gap-3">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[13px] font-semibold transition-all duration-200"
              style={tab === t.id ? {
                background: 'linear-gradient(135deg,#1C1917,#3D2208)',
                color: '#fff',
                boxShadow: '0 6px 20px rgba(28,9,16,0.25)',
              } : {
                background: '#fff',
                color: '#78716C',
                border: '1.5px solid #E8E1D9',
              }}
              onMouseEnter={e => { if (tab !== t.id) { e.currentTarget.style.borderColor = '#1C1917'; e.currentTarget.style.color = '#1C1917'; } }}
              onMouseLeave={e => { if (tab !== t.id) { e.currentTarget.style.borderColor = '#E8E1D9'; e.currentTarget.style.color = '#78716C'; } }}
            >
              <StatusDot status={t.id === 'requests' ? 'pending' : 'confirmed'} />
              {t.label}
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                style={tab === t.id
                  ? { background: 'rgba(255,255,255,0.15)', color: '#fff' }
                  : { background: '#F0EBE5', color: '#78716C' }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* ══ BOOKING LIST ══ */}
        {display.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl"
            style={{ background: 'linear-gradient(135deg,#FDFAF7,#fff)', border: '1px solid #E8E1D9' }}>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{ background: 'linear-gradient(135deg,#FBF5E0,#F5EDE4)', boxShadow: '0 8px 24px rgba(201,168,76,0.15)' }}>
              <Package size={36} style={{ color: '#C9A84C', opacity: 0.7 }} />
            </div>
            <h3 className="font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#1C1917' }}>
              {tab === 'requests' ? 'No Pending Requests' : 'No Bookings Yet'}
            </h3>
            <p style={{ fontSize: 13, color: '#78716C', maxWidth: 280, textAlign: 'center' }}>
              {tab === 'requests'
                ? 'New booking requests from clients will appear here.'
                : 'Once clients book your services, they\'ll show up here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {display.map((b, idx) => {
              const catColor = CATEGORY_COLORS[b.service?.category] || '#6D28D9';
              const isLoading = actionId === b._id;
              return (
                <div key={b._id}
                  className="rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    background: '#fff',
                    border: '1px solid #E8E1D9',
                    boxShadow: '0 2px 12px rgba(28,9,16,0.05)',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                    transition: `all 0.45s cubic-bezier(0.4,0,0.2,1) ${idx * 0.06}s`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(28,9,16,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(28,9,16,0.05)'; e.currentTarget.style.transform = ''; }}
                >
                  {/* Color accent top bar */}
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg,${catColor},${catColor}66)` }} />

                  <div className="p-5 flex flex-col sm:flex-row gap-4">
                    {/* Service image / category icon */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center"
                      style={{ background: `${catColor}15` }}>
                      {b.service?.images?.[0] ? (
                        <img src={`${import.meta.env.VITE_UPLOAD_URL}/${b.service.images[0]}`}
                          alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Calendar size={26} style={{ color: catColor }} />
                      )}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-bold text-[15px] mb-0.5" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917' }}>
                            {b.service?.title}
                          </h3>
                          <div className="flex items-center gap-1.5">
                            <StatusDot status={b.status} />
                            <Badge status={b.status}>{b.status}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[1.15rem]" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#C9A84C' }}>
                            ₹{b.total_amount?.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] uppercase tracking-widest" style={{ color: '#A8A29E' }}>Amount</div>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        {[
                          { icon: User,         label: 'Client', value: b.client?.full_name },
                          { icon: Calendar,     label: 'Date',   value: new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                          { icon: Phone,        label: 'Phone',  value: b.client?.phone || '—' },
                          { icon: IndianRupee,  label: 'Category', value: b.service?.category ? b.service.category.charAt(0).toUpperCase() + b.service.category.slice(1) : '—' },
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="rounded-xl px-3 py-2" style={{ background: '#FDFAF7' }}>
                            <div className="flex items-center gap-1 mb-0.5">
                              <Icon size={10} style={{ color: '#A8A29E' }} />
                              <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#A8A29E' }}>{label}</span>
                            </div>
                            <div className="text-[13px] font-semibold truncate" style={{ color: '#1C1917' }}>{value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Notes */}
                      {b.notes && (
                        <div className="flex items-start gap-2 rounded-xl px-3 py-2 mb-3" style={{ background: '#FDF9F4', border: '1px solid #F0EBE5' }}>
                          <MessageSquare size={13} style={{ color: '#A8A29E', marginTop: 2, shrink: 0 }} />
                          <p className="text-[12px] leading-relaxed italic" style={{ color: '#78716C' }}>"{b.notes}"</p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2">
                        {b.status === 'pending' && (
                          <>
                            <button
                              disabled={isLoading}
                              onClick={() => changeStatus(b._id, 'confirmed')}
                              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-bold text-white transition-all"
                              style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 14px rgba(5,150,105,0.3)' }}
                              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(5,150,105,0.4)'; }}
                              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(5,150,105,0.3)'; }}
                            >
                              {isLoading ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <CheckCircle size={14} />}
                              Accept Booking
                            </button>
                            <button
                              disabled={isLoading}
                              onClick={() => changeStatus(b._id, 'cancelled')}
                              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-bold text-white transition-all"
                              style={{ background: 'linear-gradient(135deg,#DC2626,#B91C1C)', boxShadow: '0 4px 14px rgba(220,38,38,0.3)' }}
                              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                            >
                              {isLoading ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <XCircle size={14} />}
                              Decline
                            </button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <button
                            disabled={isLoading}
                            onClick={() => changeStatus(b._id, 'completed')}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-bold text-white transition-all"
                            style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                          >
                            {isLoading ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <Clock size={14} />}
                            Mark as Completed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
