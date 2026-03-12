import { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, UserCheck, Phone, Mail,
  Building2, MapPin, Award, Clock, Package,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { adminAPI } from '../../services/api';
import { PageSpinner } from '../../components/ui/Spinner';

const CAT_COLORS = {
  photography: '#8B1A3A', catering: '#C9A84C', venue: '#2563EB',
  decoration: '#059669',  mehendi: '#7C3AED',  music: '#0891B2',
  makeup: '#DB2777', transport: '#D97706', other: '#6D28D9',
};

function Orb({ size, color, style: s }) {
  return <div className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, background: color, filter: 'blur(70px)', ...s }} />;
}

export default function AdminVendorApprovals() {
  const [vendors,      setVendors]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [actionId,     setActionId]     = useState(null);
  const [rejectId,     setRejectId]     = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [mounted,      setMounted]      = useState(false);

  const fetchVendors = () => {
    adminAPI.getVendorRequests()
      .then(r => setVendors(r.data.vendors || []))
      .catch(() => {})
      .finally(() => { setLoading(false); setTimeout(() => setMounted(true), 60); });
  };
  useEffect(() => { fetchVendors(); }, []);

  const handleAccept = async (id) => {
    setActionId(id);
    try {
      await adminAPI.acceptVendor(id);
      toast.success('Vendor approved! Email sent.');
      fetchVendors();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setActionId(null);
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await adminAPI.rejectVendor(rejectId, rejectReason);
      toast.success('Vendor rejected.');
      setRejectId(null);
      setRejectReason('');
      fetchVendors();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSubmitting(false);
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.35s ease' }}>

      {/* ══ HERO ══ */}
      <div className="relative overflow-hidden rounded-3xl"
        style={{ background: 'linear-gradient(135deg,#060B14 0%,#0D1627 50%,#0F172A 100%)', minHeight: 170, padding: '32px 40px' }}>
        <Orb size={280} color="rgba(245,158,11,0.12)"  style={{ top: -60, right: -40 }} />
        <Orb size={180} color="rgba(99,102,241,0.09)"  style={{ bottom: -50, right: 240, animationDelay: '3s' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[11px] font-bold uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
              <UserCheck size={11} style={{ color: '#F59E0B' }} /> Vendor Approvals
            </div>
            <h1 className="text-white font-bold mb-1"
              style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.4rem,3vw,2rem)' }}>
              Vendor Applications
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13 }}>
              {vendors.length > 0
                ? `${vendors.length} vendor${vendors.length > 1 ? 's' : ''} waiting for your decision`
                : 'No pending applications — platform is clean'}
            </p>
          </div>
          {vendors.length > 0 && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.35)' }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#F59E0B', animation: 'glowPulse 2s ease infinite' }} />
              <span className="font-bold text-[14px]" style={{ color: '#FCD34D' }}>
                {vendors.length} pending
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ══ VENDOR CARDS ══ */}
      {vendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl"
          style={{ background: 'linear-gradient(135deg,#F8FAFF,#fff)', border: '1px solid #E2E8F0' }}>
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', boxShadow: '0 8px 24px rgba(16,185,129,0.15)' }}>
            <CheckCircle size={36} style={{ color: '#10B981', opacity: 0.8 }} />
          </div>
          <h3 className="font-bold mb-2" style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.25rem', color: '#0F172A' }}>
            All caught up!
          </h3>
          <p style={{ fontSize: 13, color: '#94A3B8', maxWidth: 280, textAlign: 'center' }}>
            No pending vendor registrations. New applications will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {vendors.map((v, idx) => {
            const catColor = CAT_COLORS[v.category_specialization] || '#6366F1';
            const isActing = actionId === v._id;
            return (
              <div key={v._id}
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: '#fff',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 16px rgba(15,23,42,0.07)',
                  animation: `fadeUp 0.5s ease ${idx * 0.07}s both`,
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(15,23,42,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,23,42,0.07)'; e.currentTarget.style.transform = ''; }}
              >
                {/* gradient header */}
                <div className="relative h-20 overflow-hidden"
                  style={{ background: `linear-gradient(135deg,#060B14,#0D1627,${catColor}33)` }}>
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
                  <div className="absolute bottom-0 right-0 left-0 h-8"
                    style={{ background: 'linear-gradient(to top,#fff,transparent)' }} />
                  {v.category_specialization && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize"
                      style={{ background: `${catColor}25`, border: `1px solid ${catColor}40`, color: catColor }}>
                      {v.category_specialization}
                    </div>
                  )}
                  {/* avatar */}
                  <div className="absolute -bottom-5 left-5 w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                    style={{ background: `linear-gradient(135deg,${catColor},${catColor}99)`, border: '3px solid #fff', boxShadow: `0 4px 12px ${catColor}40` }}>
                    {v.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                </div>

                <div className="pt-7 px-5 pb-5">
                  {/* name + business */}
                  <div className="mb-4">
                    <h3 className="font-bold text-[1.05rem]" style={{ fontFamily: 'Playfair Display,serif', color: '#0F172A' }}>
                      {v.full_name}
                    </h3>
                    {v.business_name && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Building2 size={12} style={{ color: '#94A3B8' }} />
                        <span className="text-[13px] font-semibold" style={{ color: '#475569' }}>{v.business_name}</span>
                      </div>
                    )}
                  </div>

                  {/* info grid */}
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    {[
                      { icon: Mail,    value: v.email,                label: 'Email' },
                      { icon: Phone,   value: v.phone || '—',         label: 'Phone' },
                      { icon: Award,   value: v.years_experience ? `${v.years_experience} yrs exp` : '—', label: 'Experience' },
                      { icon: Clock,   value: new Date(v.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), label: 'Registered' },
                    ].map(({ icon: Icon, value, label }) => (
                      <div key={label} className="rounded-xl px-3 py-2" style={{ background: '#F8FAFF' }}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Icon size={10} style={{ color: '#94A3B8' }} />
                          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>{label}</span>
                        </div>
                        <p className="text-[12px] font-semibold truncate" style={{ color: '#0F172A' }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* cities */}
                  {v.service_cities?.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                      <MapPin size={12} style={{ color: '#94A3B8' }} />
                      {v.service_cities.slice(0, 4).map(c => (
                        <span key={c} className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{ background: '#F1F5F9', color: '#475569' }}>{c}</span>
                      ))}
                    </div>
                  )}

                  {/* description */}
                  {v.business_description && (
                    <p className="text-[12px] leading-relaxed italic mb-4"
                      style={{ color: '#64748B', background: '#F8FAFF', borderRadius: 10, padding: '8px 12px', borderLeft: `3px solid ${catColor}40` }}>
                      "{v.business_description}"
                    </p>
                  )}

                  {/* action buttons */}
                  <div className="flex gap-3">
                    <button
                      disabled={isActing}
                      onClick={() => handleAccept(v._id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all duration-200"
                      style={{ background: 'linear-gradient(135deg,#047857,#059669)', boxShadow: '0 4px 14px rgba(5,150,105,0.3)' }}
                      onMouseEnter={e => { if (!isActing) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(5,150,105,0.4)'; } }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(5,150,105,0.3)'; }}
                    >
                      {isActing
                        ? <span className="spinner" style={{ width: 14, height: 14 }} />
                        : <CheckCircle size={15} />}
                      Approve
                    </button>
                    <button
                      disabled={isActing}
                      onClick={() => { setRejectId(v._id); setRejectReason(''); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all duration-200"
                      style={{ background: 'linear-gradient(135deg,#B91C1C,#DC2626)', boxShadow: '0 4px 14px rgba(220,38,38,0.3)' }}
                      onMouseEnter={e => { if (!isActing) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(220,38,38,0.4)'; } }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(220,38,38,0.3)'; }}
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ REJECT MODAL ══ */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(6,11,20,0.75)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease' }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: '#fff', boxShadow: '0 24px 80px rgba(0,0,0,0.35)', animation: 'scaleIn 0.25s ease' }}>
            <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
              <h3 className="font-bold text-[1.1rem]" style={{ fontFamily: 'Playfair Display,serif', color: '#0F172A' }}>
                Reject Vendor
              </h3>
              <p className="text-[13px] mt-1" style={{ color: '#64748B' }}>
                The vendor will receive an email explaining the rejection.
              </p>
            </div>
            <div className="p-6">
              <label className="block text-[13px] font-semibold mb-2" style={{ color: '#0F172A' }}>
                Reason for rejection <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                placeholder="e.g. Incomplete business information, unclear portfolio…"
                className="w-full px-4 py-3 rounded-xl text-[13px] focus:outline-none resize-none transition-all"
                style={{ border: '1.5px solid #E2E8F0', color: '#0F172A' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#EF4444'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
              />
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setRejectId(null)}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                style={{ border: '1.5px solid #E2E8F0', color: '#475569' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#94A3B8'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; }}>
                Cancel
              </button>
              <button onClick={handleReject} disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#B91C1C,#DC2626)', boxShadow: '0 4px 14px rgba(220,38,38,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 20px rgba(220,38,38,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(220,38,38,0.3)'; }}>
                {submitting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <XCircle size={14} />}
                Reject Vendor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
