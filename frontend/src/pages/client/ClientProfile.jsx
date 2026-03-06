import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Lock, Save, AlertCircle, Eye, EyeOff,
  Shield, CheckCircle2, Crown, KeyRound, Calendar, Star, Heart,
  Camera, Utensils, Music, Sparkles, Car, ChevronRight,
  ShieldCheck, BarChart3, IndianRupee, Flower2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { authAPI, clientAPI, reviewAPI } from '../../services/api';

/* ─── Avatar colour presets ─────────────────────────── */
const AVATAR_COLORS = [
  { id: 'gold',   grad: 'linear-gradient(135deg,#B8912A,#9A7520)', color: '#B8912A', glow: 'rgba(184,145,42,0.4)' },
  { id: 'rose',   grad: 'linear-gradient(135deg,#BE185D,#9D174D)', color: '#BE185D', glow: 'rgba(190,24,93,0.4)'  },
  { id: 'purple', grad: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#7C3AED', glow: 'rgba(124,58,237,0.4)' },
  { id: 'blue',   grad: 'linear-gradient(135deg,#2563EB,#1D4ED8)', color: '#2563EB', glow: 'rgba(37,99,235,0.4)'  },
  { id: 'green',  grad: 'linear-gradient(135deg,#059669,#047857)', color: '#059669', glow: 'rgba(5,150,105,0.4)'  },
  { id: 'teal',   grad: 'linear-gradient(135deg,#0891B2,#0E7490)', color: '#0891B2', glow: 'rgba(8,145,178,0.4)'  },
];

/* ─── Category icons ─────────────────────────────────── */
const CATEGORY_ICON = {
  photography: { icon: Camera,   color: '#BE185D', bg: 'rgba(190,24,93,0.12)'   },
  catering:    { icon: Utensils, color: '#059669', bg: 'rgba(5,150,105,0.12)'   },
  music:       { icon: Music,    color: '#7C3AED', bg: 'rgba(124,58,237,0.12)'  },
  decoration:  { icon: Flower2,  color: '#B8912A', bg: 'rgba(184,145,42,0.12)'  },
  mehendi:     { icon: Sparkles, color: '#DB2777', bg: 'rgba(219,39,119,0.12)'  },
  transport:   { icon: Car,      color: '#2563EB', bg: 'rgba(37,99,235,0.12)'   },
  other:       { icon: Star,     color: '#78716C', bg: 'rgba(120,113,108,0.1)'  },
};

/* ─── Status meta ────────────────────────────────────── */
const STATUS_META = {
  pending:   { color: '#D97706', bg: '#FEF3C7', label: 'Pending'   },
  confirmed: { color: '#2563EB', bg: '#EFF6FF', label: 'Confirmed' },
  completed: { color: '#059669', bg: '#D1FAE5', label: 'Completed' },
  cancelled: { color: '#DC2626', bg: '#FEE2E2', label: 'Cancelled' },
};

/* ─── Password strength ─────────────────────────────── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6)           score++;
  if (pw.length >= 10)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: '',           color: ''        },
    { label: 'Weak',       color: '#DC2626' },
    { label: 'Fair',       color: '#D97706' },
    { label: 'Good',       color: '#B8912A' },
    { label: 'Strong',     color: '#059669' },
    { label: 'Very Strong',color: '#047857' },
  ];
  return { score, ...levels[score] };
}

/* ─── AnimatedNumber ─────────────────────────────────── */
function AnimatedNumber({ target, duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return <>{val}</>;
}

/* ─── AnimatedCurrency ───────────────────────────────── */
function AnimatedCurrency({ target, duration = 1400 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return <>₹{val.toLocaleString('en-IN')}</>;
}

/* ─── CategoryIcon ───────────────────────────────────── */
function CategoryIcon({ category, size = 18 }) {
  const meta = CATEGORY_ICON[category?.toLowerCase()] || CATEGORY_ICON.other;
  const Icon = meta.icon;
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: meta.bg }}>
      <Icon size={size} style={{ color: meta.color }} />
    </div>
  );
}

/* ─── FieldError ─────────────────────────────────────── */
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="text-[12px] mt-1.5 flex items-center gap-1 font-medium" style={{ color: '#DC2626' }}>
      <AlertCircle size={11} /> {msg}
    </p>
  );
}

/* ─── Floating orb ───────────────────────────────────── */
function Orb({ size, color, style }) {
  return (
    <div className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, background: color, filter: 'blur(55px)', animation: 'floatSlow 8s ease-in-out infinite', ...style }} />
  );
}

/* ─── ProfileField ───────────────────────────────────── */
function ProfileField({ label, icon: Icon, iconColor, iconBg, children, hint }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: '#FDFAF6', border: '1px solid #F0EBE5' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          <Icon size={15} style={{ color: iconColor }} />
        </div>
        <label className="label-caps">{label}</label>
        {hint && (
          <span className="ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: '#F0EBE5', color: '#A8A29E' }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export default function ClientProfile() {
  const { user, updateUser } = useAuth();
  const [mounted, setMounted]     = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  /* ── Avatar colour (localStorage) ── */
  const [avatarColor, setAvatarColor] = useState(() => {
    const saved = localStorage.getItem('shadiseva_avatar_gradient');
    return AVATAR_COLORS.find(c => c.id === saved) || AVATAR_COLORS[0];
  });
  const pickColor = c => {
    setAvatarColor(c);
    localStorage.setItem('shadiseva_avatar_gradient', c.id);
  };

  /* ── Profile form state ── */
  const [profile, setProfile]               = useState({ full_name: user?.full_name || '', phone: user?.phone || '' });
  const [profileErrors, setProfileErrors]   = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved]     = useState(false);

  /* ── Password form state ── */
  const [passwords, setPasswords]   = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passErrors, setPassErrors] = useState({});
  const [showPass, setShowPass]     = useState({ current: false, new: false, confirm: false });
  const [passLoading, setPassLoading] = useState(false);

  /* ── Booking data ── */
  const [bookings, setBookings]               = useState([]);
  const [reviewableCount, setReviewableCount] = useState(0);
  const [dataLoading, setDataLoading]         = useState(true);
  const [ringAnimated, setRingAnimated]       = useState(false);
  const [barMounted, setBarMounted]           = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    Promise.allSettled([
      clientAPI.getBookings(),
      reviewAPI.getReviewableBookings(),
    ]).then(([bRes, rRes]) => {
      if (bRes.status === 'fulfilled') {
        const d = bRes.value.data;
        setBookings(Array.isArray(d) ? d : (d?.bookings || []));
      }
      if (rRes.status === 'fulfilled') {
        const d = rRes.value.data;
        setReviewableCount((Array.isArray(d) ? d : (d?.bookings || [])).length);
      }
      setDataLoading(false);
      setTimeout(() => setRingAnimated(true), 200);
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'activity') setTimeout(() => setBarMounted(true), 120);
    else setBarMounted(false);
  }, [activeTab]);

  /* ── Derived stats ── */
  const totalBookings  = bookings.length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const totalSpent     = bookings.reduce((s, b) => s + (b.total_amount || 0), 0);
  const reviewsGiven   = Math.max(completedCount - reviewableCount, 0);
  const biggestBooking = bookings.reduce((mx, b) => (b.total_amount || 0) > (mx?.total_amount || 0) ? b : mx, null);
  const avgPerBooking  = totalBookings > 0 ? Math.round(totalSpent / totalBookings) : 0;

  /* ── Completion ring ── */
  const RING_R = 38;
  const RING_C = 2 * Math.PI * RING_R; // ≈ 239
  const hasPhone   = !!(profile.phone || user?.phone);
  const hasBooking = totalBookings >= 1;
  const completionPct = (user?.full_name ? 33 : 0) + (hasPhone ? 33 : 0) + (hasBooking ? 34 : 0);
  const ringOffset = ringAnimated ? RING_C * (1 - completionPct / 100) : RING_C;

  /* ── Achievements ── */
  const ACHIEVEMENTS = [
    { id: 'first',    label: 'First Step',      icon: Calendar, grad: 'linear-gradient(135deg,#BE185D,#9D174D)', glow: 'rgba(190,24,93,0.35)',  unlocked: totalBookings >= 1  },
    { id: 'happy',    label: 'Happy Client',     icon: Star,     grad: 'linear-gradient(135deg,#B8912A,#9A7520)', glow: 'rgba(184,145,42,0.35)', unlocked: completedCount >= 1 },
    { id: 'planner',  label: 'Wedding Planner',  icon: Crown,    grad: 'linear-gradient(135deg,#7C3AED,#6D28D9)', glow: 'rgba(124,58,237,0.35)', unlocked: completedCount >= 3 },
    { id: 'reviewer', label: 'Trusted Reviewer', icon: Heart,    grad: 'linear-gradient(135deg,#059669,#047857)', glow: 'rgba(5,150,105,0.35)',  unlocked: reviewsGiven >= 1   },
  ];

  /* ── Activity: status breakdown ── */
  const statusCounts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  bookings.forEach(b => { if (statusCounts[b.status] !== undefined) statusCounts[b.status]++; });
  const maxStatus = Math.max(...Object.values(statusCounts), 1);

  /* ── Activity: top categories ── */
  const catCount = {};
  bookings.forEach(b => {
    const cat = b.service?.category?.toLowerCase() || 'other';
    catCount[cat] = (catCount[cat] || 0) + 1;
  });
  const topCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxCat  = topCats[0]?.[1] || 1;

  /* ── Activity: recent 5 bookings ── */
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date))
    .slice(0, 5);

  /* ── Validation ── */
  const validateProfile = () => {
    const errs = {};
    if (!profile.full_name.trim()) errs.full_name = 'Name is required';
    else if (profile.full_name.trim().length < 2) errs.full_name = 'Min 2 characters';
    if (profile.phone && !/^\d{10,15}$/.test(profile.phone.replace(/[\s\-+]/g, '')))
      errs.phone = 'Enter a valid 10–15 digit number';
    return errs;
  };
  const validatePasswords = () => {
    const errs = {};
    if (!passwords.current_password) errs.current_password = 'Required';
    if (!passwords.new_password) errs.new_password = 'Required';
    else if (passwords.new_password.length < 6) errs.new_password = 'Min 6 characters';
    if (!passwords.confirm_password) errs.confirm_password = 'Required';
    else if (passwords.new_password !== passwords.confirm_password) errs.confirm_password = 'Passwords do not match';
    if (passwords.current_password && passwords.new_password && passwords.current_password === passwords.new_password)
      errs.new_password = 'Must differ from current password';
    return errs;
  };

  const handleProfileSubmit = async e => {
    e.preventDefault();
    const errs = validateProfile();
    setProfileErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setProfileLoading(true);
    try {
      const res = await authAPI.updateProfile(profile);
      updateUser(res.data.user);
      setProfileSaved(true);
      toast.success('Profile updated!');
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    setProfileLoading(false);
  };

  const handlePassSubmit = async e => {
    e.preventDefault();
    const errs = validatePasswords();
    setPassErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setPassLoading(true);
    try {
      await authAPI.updatePassword({ current_password: passwords.current_password, new_password: passwords.new_password });
      toast.success('Password changed!');
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      setPassErrors({});
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    setPassLoading(false);
  };

  const strength  = getStrength(passwords.new_password);
  const passMatch = passwords.new_password && passwords.confirm_password && passwords.new_password === passwords.confirm_password;
  const initial   = user?.full_name?.charAt(0)?.toUpperCase() || '?';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—';

  const TABS = [
    { key: 'info',     label: 'Personal Info', icon: User,      iconColor: '#BE185D', iconBg: '#FCEEF7'                 },
    { key: 'security', label: 'Security',       icon: Shield,    iconColor: '#B8912A', iconBg: '#FBF0D9'                 },
    { key: 'activity', label: 'Activity',       icon: BarChart3, iconColor: '#7C3AED', iconBg: 'rgba(124,58,237,0.1)'   },
  ];

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <div className="space-y-6">

      {/* ══ HERO BANNER ════════════════════════════════════════ */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,#0D0509 0%,#1E0A14 35%,#3D1020 65%,#BE185D 100%)',
          backgroundSize: '300% 300%',
          animation: 'gradientShift 9s ease infinite',
          minHeight: 160,
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.06) 1px,transparent 1px)',
          backgroundSize: '26px 26px',
        }} />
        <Orb size={180} color="rgba(190,24,93,0.3)"   style={{ top: -50, right: 60,   animationDelay: '0s'   }} />
        <Orb size={120} color="rgba(184,145,42,0.22)" style={{ bottom: -30, right: 220, animationDelay: '3s' }} />
        <Orb size={90}  color="rgba(190,24,93,0.15)"  style={{ top: 20, left: '45%',  animationDelay: '1.5s' }} />

        <div className="relative flex flex-col justify-center px-8 py-10" style={{ minHeight: 160 }}>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[11px] font-bold uppercase tracking-widest w-fit"
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)',
              opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.1s',
            }}
          >
            <Crown size={11} style={{ color: '#B8912A' }} /> My Profile
          </div>
          <h1 className="text-white font-bold mb-1" style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(1.5rem,3vw,2.1rem)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.55s cubic-bezier(0.4,0,0.2,1) 0.2s',
          }}>
            {user?.full_name || 'My Profile'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.35s' }}>
            {user?.email}
          </p>
        </div>
      </div>

      {/* ══ TWO-COLUMN LAYOUT ══════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ╔═══ LEFT: IDENTITY CARD ═══════════════════════════╗ */}
        <div
          className="w-full lg:w-80 shrink-0 space-y-4"
          style={{
            position: 'sticky', top: 24,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1) 0.1s',
          }}
        >

          {/* ── Avatar + stats card ── */}
          <div className="rounded-3xl p-6 text-center" style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 4px 24px rgba(28,9,16,0.08)' }}>

            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 rounded-full" style={{
                margin: -12, border: `2px solid ${avatarColor.glow}`,
                animation: 'glowPulse 2.5s ease-in-out infinite',
              }} />
              <div className="absolute inset-0 rounded-full" style={{
                margin: -6, border: `2px dashed ${avatarColor.color}99`,
                animation: 'spin 8s linear infinite',
              }} />
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold relative z-10"
                style={{
                  background: avatarColor.grad,
                  boxShadow: `0 0 0 4px ${avatarColor.glow}, 0 8px 32px ${avatarColor.glow}`,
                  fontFamily: 'Playfair Display, serif', fontSize: '2.2rem',
                  transition: 'background 0.4s, box-shadow 0.4s',
                }}
              >{initial}</div>
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center z-20"
                style={{ background: 'linear-gradient(135deg,#B8912A,#9A7520)', boxShadow: '0 2px 8px rgba(184,145,42,0.5)' }}>
                <Crown size={13} style={{ color: '#fff' }} />
              </div>
            </div>

            {/* Colour picker dots */}
            <div className="flex items-center justify-center gap-2.5 mb-5">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => pickColor(c)}
                  title={c.id}
                  style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: c.grad,
                    border: '2px solid transparent',
                    outline: avatarColor.id === c.id ? `2.5px solid ${c.color}` : 'none',
                    outlineOffset: 2,
                    cursor: 'pointer',
                    transition: 'outline 0.2s, transform 0.15s',
                    transform: avatarColor.id === c.id ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              ))}
            </div>

            {/* SVG Completion Ring */}
            <div className="flex flex-col items-center mb-5">
              <svg width={100} height={100} viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={completionPct >= 100 ? '#059669' : '#B8912A'} />
                    <stop offset="100%" stopColor={completionPct >= 100 ? '#047857' : '#9A7520'} />
                  </linearGradient>
                </defs>
                <circle cx={50} cy={50} r={RING_R} fill="none" stroke="#F0EBE5" strokeWidth={7} />
                <circle
                  cx={50} cy={50} r={RING_R}
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth={7}
                  strokeLinecap="round"
                  strokeDasharray={RING_C}
                  strokeDashoffset={ringOffset}
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                />
                <text x={50} y={46} textAnchor="middle" dominantBaseline="middle"
                  fontFamily="Playfair Display, serif" fontSize={18} fontWeight="700"
                  fill={completionPct >= 100 ? '#059669' : '#B8912A'}>
                  {completionPct}%
                </text>
                <text x={50} y={62} textAnchor="middle" fontSize={10} fill="#78716C" fontFamily="system-ui,sans-serif">
                  Complete
                </text>
              </svg>
              <p className="text-[11px] font-medium" style={{ color: '#A8A29E' }}>Profile Completion</p>
            </div>

            {/* Live stats */}
            <div className="space-y-2.5">
              {[
                { label: 'Total Bookings', val: <AnimatedNumber target={totalBookings} />,              icon: Calendar,      color: '#BE185D', bg: '#FCEEF7'                },
                { label: 'Total Spent',    val: <AnimatedCurrency target={totalSpent} />,               icon: IndianRupee,   color: '#B8912A', bg: '#FBF0D9'                },
                { label: 'Reviews Given',  val: <AnimatedNumber target={reviewsGiven} />,               icon: Star,          color: '#7C3AED', bg: 'rgba(124,58,237,0.1)'   },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl" style={{ background: '#FDFAF6', border: '1px solid #F0EBE5' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: stat.bg }}>
                    <stat.icon size={15} style={{ color: stat.color }} />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-[11px] font-medium" style={{ color: '#78716C' }}>{stat.label}</div>
                    <div className="text-[15px] font-bold" style={{ color: '#1C1917', fontFamily: 'Playfair Display, serif' }}>
                      {dataLoading ? '—' : stat.val}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Account info card ── */}
          <div className="rounded-3xl p-5 space-y-3" style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 4px 24px rgba(28,9,16,0.06)' }}>
            <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#A8A29E' }}>Account</div>
            {[
              {
                show: true,
                icon: User, bg: '#EFF6FF', color: '#2563EB',
                label: 'Account Type',
                value: (
                  <span className="text-[12px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                    {user?.role?.charAt(0).toUpperCase() + (user?.role?.slice(1) || '')}
                  </span>
                ),
              },
              {
                show: true,
                icon: Calendar, bg: '#FBF0D9', color: '#B8912A',
                label: 'Member Since',
                value: <span className="text-[13px] font-bold" style={{ color: '#1C1917' }}>{memberSince}</span>,
              },
              {
                show: !!user?.verified,
                icon: ShieldCheck, bg: '#D1FAE5', color: '#059669',
                label: 'Status',
                value: <span className="text-[13px] font-bold" style={{ color: '#059669' }}>Verified Account</span>,
              },
            ].filter(r => r.show).map((row, i) => {
              const Icon = row.icon;
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: row.bg }}>
                    <Icon size={14} style={{ color: row.color }} />
                  </div>
                  <div>
                    <div className="text-[11px]" style={{ color: '#78716C' }}>{row.label}</div>
                    {row.value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Achievements card ── */}
          <div className="rounded-3xl p-5" style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 4px 24px rgba(28,9,16,0.06)' }}>
            <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#A8A29E' }}>Achievements</div>
            <div className="grid grid-cols-2 gap-2.5">
              {ACHIEVEMENTS.map((ach, idx) => {
                const Icon = ach.icon;
                return (
                  <div
                    key={ach.id}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center"
                    style={{
                      background: ach.unlocked ? '#FDFAF6' : '#F5EDE4',
                      border: `1px solid ${ach.unlocked ? 'rgba(184,145,42,0.2)' : '#E8E1D9'}`,
                      animation: ach.unlocked ? `scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) ${idx * 0.08}s both` : 'none',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{
                        background: ach.unlocked ? ach.grad : '#E8E1D9',
                        boxShadow: ach.unlocked ? `0 4px 12px ${ach.glow}` : 'none',
                      }}
                    >
                      <Icon size={16} style={{ color: ach.unlocked ? '#fff' : '#A8A29E' }} />
                    </div>
                    <div className="text-[11px] font-bold leading-tight" style={{ color: ach.unlocked ? '#1C1917' : '#A8A29E' }}>
                      {ach.label}
                    </div>
                    {!ach.unlocked && <div className="text-[10px]" style={{ color: '#C4B5A5' }}>Locked</div>}
                  </div>
                );
              })}
            </div>
          </div>

        </div>{/* end left card */}

        {/* ╔═══ RIGHT: TABS + CONTENT ══════════════════════════╗ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Tab bar */}
          <div className="flex rounded-2xl overflow-hidden"
            style={{ background: '#fff', boxShadow: '0 4px 20px rgba(28,9,16,0.1)', border: '1px solid #E8E1D9' }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[13px] font-bold transition-all duration-200 relative"
                style={{ color: activeTab === tab.key ? '#1C1917' : '#78716C', background: activeTab === tab.key ? '#FDFAF6' : '#fff' }}
              >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: activeTab === tab.key ? tab.iconBg : 'transparent' }}>
                  <tab.icon size={13} style={{ color: activeTab === tab.key ? tab.iconColor : '#A8A29E' }} />
                </div>
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                    style={{ background: `linear-gradient(90deg,${tab.iconColor},transparent)` }} />
                )}
              </button>
            ))}
          </div>

          {/* ══ PERSONAL INFO TAB ══════════════════════════════ */}
          {activeTab === 'info' && (
            <form onSubmit={handleProfileSubmit} noValidate className="space-y-3">
              <ProfileField label="Full Name" icon={User} iconColor="#BE185D" iconBg="#FCEEF7">
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={e => { setProfile(p => ({ ...p, full_name: e.target.value })); setProfileErrors(x => ({ ...x, full_name: '' })); }}
                  className={`input-base ${profileErrors.full_name ? 'error' : ''}`}
                  placeholder="Your full name"
                />
                <FieldError msg={profileErrors.full_name} />
              </ProfileField>

              <ProfileField label="Email Address" icon={Mail} iconColor="#2563EB" iconBg="#EFF6FF" hint="Cannot be changed">
                <div className="relative">
                  <input type="email" value={user?.email || ''} disabled className="input-base pr-10"
                    style={{ background: '#F5EDE4', cursor: 'not-allowed', color: '#A8A29E' }} />
                  <Lock size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#A8A29E' }} />
                </div>
              </ProfileField>

              <ProfileField label="Phone Number" icon={Phone} iconColor="#059669" iconBg="rgba(5,150,105,0.1)">
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={e => { setProfile(p => ({ ...p, phone: e.target.value })); setProfileErrors(x => ({ ...x, phone: '' })); }}
                  className={`input-base ${profileErrors.phone ? 'error' : ''}`}
                  placeholder="10-digit phone number"
                />
                <FieldError msg={profileErrors.phone} />
              </ProfileField>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full py-3.5 rounded-2xl text-[14px] font-bold text-white flex items-center justify-center gap-2.5 transition-all duration-200"
                style={{
                  background: profileSaved ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg,#BE185D,#9D174D)',
                  boxShadow: profileSaved ? '0 6px 20px rgba(5,150,105,0.35)' : '0 6px 20px rgba(190,24,93,0.35)',
                  opacity: profileLoading ? 0.7 : 1,
                }}
                onMouseEnter={e => { if (!profileLoading && !profileSaved) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {profileLoading ? <span className="spinner" />
                  : profileSaved ? <><CheckCircle2 size={16} /> Saved Successfully</>
                  : <><Save size={15} /> Save Changes</>}
              </button>
            </form>
          )}

          {/* ══ SECURITY TAB ═══════════════════════════════════ */}
          {activeTab === 'security' && (
            <form onSubmit={handlePassSubmit} noValidate className="space-y-3">
              <div className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: 'linear-gradient(135deg,#FBF0D9,#FDF6EE)', border: '1px solid rgba(184,145,42,0.25)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg,#B8912A,#9A7520)', boxShadow: '0 4px 12px rgba(184,145,42,0.3)' }}>
                  <KeyRound size={18} style={{ color: '#fff' }} />
                </div>
                <div>
                  <div className="text-[13px] font-bold" style={{ color: '#1C1917' }}>Change Your Password</div>
                  <div className="text-[11px]" style={{ color: '#78716C' }}>Use letters, numbers & symbols for a strong password</div>
                </div>
              </div>

              <ProfileField label="Current Password" icon={Lock} iconColor="#78716C" iconBg="#F5EDE4">
                <div className="relative">
                  <input
                    type={showPass.current ? 'text' : 'password'}
                    value={passwords.current_password}
                    onChange={e => { setPasswords(p => ({ ...p, current_password: e.target.value })); setPassErrors(x => ({ ...x, current_password: '' })); }}
                    className={`input-base pr-10 ${passErrors.current_password ? 'error' : ''}`}
                    placeholder="Enter current password"
                  />
                  <button type="button" onClick={() => setShowPass(s => ({ ...s, current: !s.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#A8A29E' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#1C1917'}
                    onMouseLeave={e => e.currentTarget.style.color = '#A8A29E'}>
                    {showPass.current ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <FieldError msg={passErrors.current_password} />
              </ProfileField>

              <ProfileField label="New Password" icon={Shield} iconColor="#BE185D" iconBg="#FCEEF7">
                <div className="relative">
                  <input
                    type={showPass.new ? 'text' : 'password'}
                    value={passwords.new_password}
                    onChange={e => { setPasswords(p => ({ ...p, new_password: e.target.value })); setPassErrors(x => ({ ...x, new_password: '' })); }}
                    className={`input-base pr-10 ${passErrors.new_password ? 'error' : ''}`}
                    placeholder="Choose a strong password"
                  />
                  <button type="button" onClick={() => setShowPass(s => ({ ...s, new: !s.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#A8A29E' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#1C1917'}
                    onMouseLeave={e => e.currentTarget.style.color = '#A8A29E'}>
                    {showPass.new ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <FieldError msg={passErrors.new_password} />
                {passwords.new_password && (
                  <div className="mt-2.5">
                    <div className="flex gap-1 mb-1.5">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength.score ? strength.color : '#E8E1D9', transform: i <= strength.score ? 'scaleY(1.3)' : 'scaleY(1)' }} />
                      ))}
                    </div>
                    <div className="text-[11px] font-bold" style={{ color: strength.color }}>{strength.label}</div>
                  </div>
                )}
              </ProfileField>

              <ProfileField label="Confirm Password"
                icon={CheckCircle2}
                iconColor={passMatch ? '#059669' : '#A8A29E'}
                iconBg={passMatch ? 'rgba(5,150,105,0.1)' : '#F5EDE4'}
              >
                <div className="relative">
                  <input
                    type={showPass.confirm ? 'text' : 'password'}
                    value={passwords.confirm_password}
                    onChange={e => { setPasswords(p => ({ ...p, confirm_password: e.target.value })); setPassErrors(x => ({ ...x, confirm_password: '' })); }}
                    className={`input-base pr-10 ${passErrors.confirm_password ? 'error' : ''}`}
                    style={passwords.confirm_password && passMatch ? { borderColor: '#059669', boxShadow: '0 0 0 3px rgba(5,150,105,0.1)' } : {}}
                    placeholder="Re-enter new password"
                  />
                  <button type="button" onClick={() => setShowPass(s => ({ ...s, confirm: !s.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#A8A29E' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#1C1917'}
                    onMouseLeave={e => e.currentTarget.style.color = '#A8A29E'}>
                    {showPass.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <FieldError msg={passErrors.confirm_password} />
                {passwords.confirm_password && passMatch && !passErrors.confirm_password && (
                  <p className="text-[12px] mt-1.5 font-bold flex items-center gap-1" style={{ color: '#059669' }}>
                    <CheckCircle2 size={12} /> Passwords match
                  </p>
                )}
              </ProfileField>

              <button
                type="submit"
                disabled={passLoading}
                className="w-full py-3.5 rounded-2xl text-[14px] font-bold text-white flex items-center justify-center gap-2.5 transition-all duration-200"
                style={{ background: 'linear-gradient(135deg,#B8912A,#9A7520)', boxShadow: '0 6px 20px rgba(184,145,42,0.35)', opacity: passLoading ? 0.7 : 1 }}
                onMouseEnter={e => { if (!passLoading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {passLoading ? <span className="spinner" /> : <><KeyRound size={15} /> Update Password</>}
              </button>
            </form>
          )}

          {/* ══ ACTIVITY TAB ═══════════════════════════════════ */}
          {activeTab === 'activity' && (
            <div className="space-y-4">

              {/* Spending tiles */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: 'Total Spent',
                    val: dataLoading ? '—' : <AnimatedCurrency target={totalSpent} />,
                    sub: `${totalBookings} booking${totalBookings !== 1 ? 's' : ''}`,
                    color: '#BE185D', bg: 'linear-gradient(135deg,#FFF0F6,#FDFAF6)', border: 'rgba(190,24,93,0.15)',
                  },
                  {
                    label: 'Biggest',
                    val: dataLoading ? '—' : biggestBooking ? <AnimatedCurrency target={biggestBooking.total_amount} /> : '—',
                    sub: biggestBooking?.service?.title?.slice(0, 18) || 'No bookings yet',
                    color: '#B8912A', bg: 'linear-gradient(135deg,#FBF0D9,#FDF6EE)', border: 'rgba(184,145,42,0.2)',
                  },
                  {
                    label: 'Avg / Booking',
                    val: dataLoading ? '—' : totalBookings > 0 ? <AnimatedCurrency target={avgPerBooking} /> : '—',
                    sub: 'per booking',
                    color: '#7C3AED', bg: 'linear-gradient(135deg,rgba(124,58,237,0.07),#FDFAF6)', border: 'rgba(124,58,237,0.15)',
                  },
                ].map(tile => (
                  <div key={tile.label} className="rounded-2xl p-4 text-center" style={{ background: tile.bg, border: `1px solid ${tile.border}` }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#78716C' }}>{tile.label}</div>
                    <div className="text-[16px] font-bold" style={{ fontFamily: 'Playfair Display, serif', color: tile.color }}>{tile.val}</div>
                    <div className="text-[10px] mt-1 truncate" style={{ color: '#A8A29E' }}>{tile.sub}</div>
                  </div>
                ))}
              </div>

              {/* Status breakdown */}
              <div className="rounded-3xl p-5" style={{ background: '#fff', border: '1px solid #E8E1D9' }}>
                <div className="text-[13px] font-bold mb-4" style={{ color: '#1C1917' }}>Booking Status Breakdown</div>
                <div className="space-y-3">
                  {Object.entries(STATUS_META).map(([key, meta]) => {
                    const count = statusCounts[key] || 0;
                    const pct   = (count / maxStatus) * 100;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color }} />
                        <div className="text-[12px] font-medium shrink-0" style={{ color: '#78716C', width: 72 }}>{meta.label}</div>
                        <div className="flex-1 rounded-full overflow-hidden" style={{ background: '#F0EBE5', height: 8 }}>
                          <div style={{
                            height: '100%', borderRadius: 99, background: meta.color,
                            width: barMounted ? `${pct}%` : '0%',
                            transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
                          }} />
                        </div>
                        <div className="text-[12px] font-bold shrink-0 w-5 text-right" style={{ color: meta.color }}>{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent bookings */}
              <div className="rounded-3xl p-5" style={{ background: '#fff', border: '1px solid #E8E1D9' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[13px] font-bold" style={{ color: '#1C1917' }}>Recent Bookings</div>
                  <Link to="/bookings" className="flex items-center gap-1 text-[12px] font-bold" style={{ color: '#BE185D' }}>
                    View All <ChevronRight size={13} />
                  </Link>
                </div>
                {recentBookings.length === 0 ? (
                  <div className="text-center py-8" style={{ color: '#A8A29E' }}>
                    <Calendar size={32} className="mx-auto mb-2 opacity-40" />
                    <div className="text-[13px]">No bookings yet</div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {recentBookings.map((b, idx) => {
                      const cat = b.service?.category?.toLowerCase() || 'other';
                      const sm  = STATUS_META[b.status] || STATUS_META.pending;
                      return (
                        <div
                          key={b._id || idx}
                          className="flex items-center gap-3 p-3 rounded-2xl"
                          style={{
                            background: '#FDFAF6', border: '1px solid #F0EBE5',
                            animation: `slideRight 0.45s cubic-bezier(0.4,0,0.2,1) ${idx * 0.07}s both`,
                          }}
                        >
                          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                            <CategoryIcon category={cat} size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-bold truncate" style={{ color: '#1C1917' }}>
                              {b.service?.title || 'Service'}
                            </div>
                            <div className="text-[11px]" style={{ color: '#78716C' }}>
                              {new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[13px] font-bold" style={{ color: '#B8912A', fontFamily: 'Playfair Display, serif' }}>
                              ₹{(b.total_amount || 0).toLocaleString('en-IN')}
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 inline-block" style={{ background: sm.bg, color: sm.color }}>
                              {sm.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Top categories */}
              {topCats.length > 0 && (
                <div className="rounded-3xl p-5" style={{ background: '#fff', border: '1px solid #E8E1D9' }}>
                  <div className="text-[13px] font-bold mb-4" style={{ color: '#1C1917' }}>Top Categories Booked</div>
                  <div className="space-y-3">
                    {topCats.map(([cat, count]) => {
                      const meta = CATEGORY_ICON[cat] || CATEGORY_ICON.other;
                      const Icon = meta.icon;
                      const pct  = (count / maxCat) * 100;
                      return (
                        <div key={cat} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: meta.bg }}>
                            <Icon size={15} style={{ color: meta.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-bold capitalize mb-1" style={{ color: '#1C1917' }}>{cat}</div>
                            <div className="rounded-full overflow-hidden" style={{ background: '#F0EBE5', height: 6 }}>
                              <div style={{
                                height: '100%', borderRadius: 99, background: meta.color,
                                width: barMounted ? `${pct}%` : '0%',
                                transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                              }} />
                            </div>
                          </div>
                          <div className="text-[13px] font-bold shrink-0" style={{ color: meta.color }}>{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>{/* end right col */}
      </div>{/* end flex row */}
    </div>
  );
}
