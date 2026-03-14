import { useState, useEffect, useMemo } from 'react';
import {
  Calendar, X, Star, Search, CheckCircle2, Clock, XCircle,
  Sparkles, CircleCheck, Camera, Utensils, Building2, Flower2,
  Paintbrush, Music, Car, Gem, User, IndianRupee, Layers,
  AlertTriangle, MessageSquare, ArrowRight, ChevronRight, Printer,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { clientAPI, reviewAPI } from '../../services/api';
import { imgUrl } from '../../utils/imageUrl';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { PageSpinner } from '../../components/ui/Spinner';
import { Textarea } from '../../components/ui/Input';

/* ─── Status meta ────────────────────────────────────── */
const STATUS_META = {
  pending:   { color: '#C9A84C', bg: 'rgba(201,168,76,0.12)',  label: 'Pending',   icon: Clock,        shadow: 'rgba(201,168,76,0.18)',  glow: 'rgba(201,168,76,0.35)' },
  confirmed: { color: '#059669', bg: 'rgba(5,150,105,0.12)',   label: 'Confirmed', icon: CheckCircle2, shadow: 'rgba(5,150,105,0.18)',   glow: 'rgba(5,150,105,0.35)'  },
  completed: { color: '#7C3AED', bg: 'rgba(124,58,237,0.12)',  label: 'Completed', icon: CircleCheck,  shadow: 'rgba(124,58,237,0.18)',  glow: 'rgba(124,58,237,0.35)' },
  cancelled: { color: '#DC2626', bg: 'rgba(220,38,38,0.12)',   label: 'Cancelled', icon: XCircle,      shadow: 'rgba(220,38,38,0.15)',   glow: 'rgba(220,38,38,0.30)'  },
};

/* ─── Category meta ──────────────────────────────────── */
const CATEGORY_ICON = {
  photography: { icon: Camera,     color: '#8B1A3A', bg: 'linear-gradient(145deg,rgba(139,26,58,0.18),rgba(139,26,58,0.04))',   name: 'Photography' },
  catering:    { icon: Utensils,   color: '#059669', bg: 'linear-gradient(145deg,rgba(5,150,105,0.18),rgba(5,150,105,0.04))',   name: 'Catering'    },
  venue:       { icon: Building2,  color: '#2563EB', bg: 'linear-gradient(145deg,rgba(37,99,235,0.18),rgba(37,99,235,0.04))',   name: 'Venue'       },
  decoration:  { icon: Flower2,    color: '#C9A84C', bg: 'linear-gradient(145deg,rgba(201,168,76,0.18),rgba(201,168,76,0.04))', name: 'Decoration'  },
  mehendi:     { icon: Paintbrush, color: '#7C3AED', bg: 'linear-gradient(145deg,rgba(124,58,237,0.18),rgba(124,58,237,0.04))', name: 'Mehendi'     },
  music:       { icon: Music,      color: '#0891B2', bg: 'linear-gradient(145deg,rgba(8,145,178,0.18),rgba(8,145,178,0.04))',   name: 'Music'       },
  makeup:      { icon: Sparkles,   color: '#DB2777', bg: 'linear-gradient(145deg,rgba(219,39,119,0.18),rgba(219,39,119,0.04))', name: 'Makeup'      },
  transport:   { icon: Car,        color: '#D97706', bg: 'linear-gradient(145deg,rgba(217,119,6,0.18),rgba(217,119,6,0.04))',   name: 'Transport'   },
  other:       { icon: Gem,        color: '#6D28D9', bg: 'linear-gradient(145deg,rgba(109,40,217,0.18),rgba(109,40,217,0.04))', name: 'Other'       },
};

/* ─── Timeline steps ─────────────────────────────────── */
const TIMELINE = [
  { key: 'pending',   label: 'Requested', icon: Clock        },
  { key: 'confirmed', label: 'Confirmed',  icon: CheckCircle2 },
  { key: 'completed', label: 'Completed',  icon: Star         },
];

/* ─── AnimatedNumber ─────────────────────────────────── */
function AnimatedNumber({ target }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1000, 1);
      setVal(Math.round(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <>{val}</>;
}

/* ─── Floating Orb ───────────────────────────────────── */
function Orb({ size, color, style }) {
  return (
    <div className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, background: color, filter: 'blur(60px)', animation: 'floatSlow 8s ease-in-out infinite', ...style }} />
  );
}

/* ─── Left image panel ───────────────────────────────── */
function ImagePanel({ category, imageUrl, status }) {
  const cat = CATEGORY_ICON[category?.toLowerCase()] || CATEGORY_ICON.other;
  const Icon = cat.icon;
  const isCancelled = status === 'cancelled';

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: cat.bg }}>
      {/* Watermark category name */}
      <div className="absolute bottom-2 right-2 pointer-events-none select-none"
        style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '3.5rem', fontWeight: 700, lineHeight: 1,
          color: cat.color, opacity: 0.07, whiteSpace: 'nowrap',
          letterSpacing: '-0.03em',
        }}>
        {cat.name}
      </div>

      {/* Glow orb */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: cat.color, filter: 'blur(40px)', opacity: 0.25 }} />
      </div>

      {/* Actual image (if available) */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          style={{
            filter: isCancelled ? 'grayscale(100%) brightness(0.7)' : 'none',
            transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      )}

      {/* Category icon (shown when no image, or as overlay) */}
      {!imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center rounded-2xl"
            style={{
              width: 64, height: 64,
              background: `${cat.color}20`,
              border: `1.5px solid ${cat.color}30`,
              backdropFilter: 'blur(8px)',
              boxShadow: `0 8px 32px ${cat.color}30`,
            }}
          >
            <Icon size={30} style={{ color: cat.color }} />
          </div>
        </div>
      )}

      {/* Right-fade overlay (for images) */}
      {imageUrl && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0) 40%, rgba(0,0,0,0.08) 100%)' }} />
      )}

      {/* Cancelled tint */}
      {isCancelled && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(220,38,38,0.12)' }} />
      )}
    </div>
  );
}

/* ─── Booking timeline (track style) ────────────────── */
function BookingTimeline({ status }) {
  const [filled, setFilled] = useState(false);
  useEffect(() => { setTimeout(() => setFilled(true), 300); }, []);

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold"
        style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.15)' }}>
        <XCircle size={13} /> This booking was cancelled
      </div>
    );
  }

  const activeIdx = TIMELINE.findIndex(s => s.key === status);

  return (
    <div className="flex items-start gap-0">
      {TIMELINE.map((step, i) => {
        const Icon     = step.icon;
        const isDone   = i <= activeIdx;
        const isActive = i === activeIdx;
        const fillPct  = i < activeIdx ? 100 : 0;

        return (
          <div key={step.key} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              {/* Node */}
              <div className="relative">
                {isActive && (
                  <div className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ margin: -5, border: '2px solid rgba(139,26,58,0.25)', animation: 'glowPulse 2s ease-in-out infinite' }} />
                )}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center relative z-10"
                  style={isActive ? {
                    background: 'linear-gradient(135deg,#8B1A3A,#6B1230)',
                    boxShadow: '0 3px 12px rgba(139,26,58,0.4)',
                    color: '#fff',
                  } : isDone ? {
                    background: 'linear-gradient(135deg,#059669,#047857)',
                    boxShadow: '0 2px 6px rgba(5,150,105,0.3)',
                    color: '#fff',
                  } : {
                    background: '#F0EBE5',
                    color: '#C4B5A5',
                  }}
                >
                  <Icon size={12} />
                </div>
              </div>
              {/* Label */}
              <span className="text-[9px] font-bold uppercase tracking-wide whitespace-nowrap"
                style={{ color: isActive ? '#8B1A3A' : isDone ? '#059669' : '#A8A29E' }}>
                {step.label}
              </span>
            </div>

            {/* Track segment */}
            {i < TIMELINE.length - 1 && (
              <div className="flex-1 relative mx-1.5" style={{ height: 3, marginTop: 12, borderRadius: 99, background: '#F0EBE5', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  borderRadius: 99,
                  background: 'linear-gradient(90deg,#059669,#34D399)',
                  width: filled ? `${fillPct}%` : '0%',
                  transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export default function ClientBookings() {
  const [bookings, setBookings]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [mounted, setMounted]             = useState(false);
  const [activeStatus, setActiveStatus]   = useState('all');
  const [searchQuery, setSearchQuery]     = useState('');
  const [cancelId, setCancelId]           = useState(null);
  const [cancelBooking, setCancelBooking] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [review, setReview]               = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting]       = useState(false);
  const [reviewableIds, setReviewableIds] = useState(new Set());
  const [hoveredCard, setHoveredCard]     = useState(null);

  const fetchBookings = async () => {
    try {
      const [bookRes, revRes] = await Promise.allSettled([
        clientAPI.getBookings(),
        reviewAPI.getReviewableBookings(),
      ]);
      if (bookRes.status === 'fulfilled') setBookings(bookRes.value.data.bookings || []);
      if (revRes.status === 'fulfilled') {
        const ids = (revRes.value.data.bookings || []).map(b => b._id);
        setReviewableIds(new Set(ids));
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    fetchBookings();
    setTimeout(() => setMounted(true), 80);
  }, []);

  /* ── Derived ── */
  const counts = {
    all: bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };
  const totalSpent = bookings.reduce((s, b) => s + (b.total_amount || 0), 0);

  const filtered = useMemo(() => {
    let list = activeStatus === 'all' ? bookings : bookings.filter(b => b.status === activeStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b =>
        b.service?.title?.toLowerCase().includes(q) ||
        b.vendor?.full_name?.toLowerCase().includes(q) ||
        b.service?.category?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, activeStatus, searchQuery]);

  /* ── Print Receipt ── */
  const printReceipt = (b) => {
    const win = window.open('', '_blank', 'width=660,height=980');
    const formattedDate = new Date(b.booking_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const formattedAmount = `₹${(b.total_amount || 0).toLocaleString('en-IN')}`;
    const receiptId = `SS-${b._id.slice(-8).toUpperCase()}`;
    const printedOn = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const bookedOn = b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : printedOn;
    const bars = b._id.split('').map(c => {
      const h = 10 + (c.charCodeAt(0) % 20);
      const w = c.charCodeAt(0) % 2 === 0 ? 2 : 3;
      return `<div style="width:${w}px;height:${h}px;background:#1A0409;border-radius:1px;flex-shrink:0"></div>`;
    }).join('');
    const catLabel = (b.service?.category || 'other');
    const catDisplay = catLabel.charAt(0).toUpperCase() + catLabel.slice(1);

    win.document.write(`<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="UTF-8"/>
  <title>ShadiSeva Receipt · ${receiptId}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',Arial,sans-serif;background:#EDE8E0;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:36px 20px}
    .page{width:580px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 12px 48px rgba(0,0,0,0.14)}

    /* ── Header ── */
    .hdr{background:linear-gradient(135deg,#1A0409 0%,#5A0E24 55%,#8B1A3A 100%);padding:32px 40px 26px;position:relative;overflow:hidden}
    .hdr::before,.hdr::after{content:'';position:absolute;border-radius:50%;border:1.5px solid rgba(255,255,255,0.07)}
    .hdr::before{width:220px;height:220px;top:-80px;right:-60px}
    .hdr::after{width:160px;height:160px;top:-50px;right:-30px}
    .brand{display:flex;align-items:center;gap:14px;margin-bottom:18px}
    .brand-icon{width:46px;height:46px;border-radius:12px;background:rgba(255,255,255,0.13);border:1px solid rgba(255,255,255,0.22);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
    .brand-name{font-family:'Cormorant Garamond',serif;font-size:28px;color:#fff;font-weight:600;letter-spacing:-0.5px;line-height:1}
    .brand-sub{font-size:10px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.14em;margin-top:3px}
    .hdr-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:6px;background:rgba(255,255,255,0.11);border:1px solid rgba(255,255,255,0.18);font-size:10px;font-weight:600;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:0.1em}

    /* ── Amount notch ── */
    .notch-wrap{position:relative;background:linear-gradient(180deg,#FDF8F5 0%,#fff 60%)}
    .notch-wrap::before{content:'';position:absolute;left:-1px;top:50%;transform:translateY(-50%);width:22px;height:44px;background:#EDE8E0;border-radius:0 22px 22px 0}
    .notch-wrap::after{content:'';position:absolute;right:-1px;top:50%;transform:translateY(-50%);width:22px;height:44px;background:#EDE8E0;border-radius:22px 0 0 22px}
    .amt-inner{padding:30px 40px 22px;text-align:center;border-bottom:2px dashed #E5DDD5}
    .amt-lbl{font-size:10px;text-transform:uppercase;letter-spacing:0.16em;font-weight:600;color:#B0A098;margin-bottom:10px}
    .amt-val{font-family:'Cormorant Garamond',serif;font-size:3.4rem;font-weight:600;color:#1A0409;letter-spacing:-1px;line-height:1}
    .amt-note{font-size:11px;color:#C0B8B0;margin-top:8px}
    .status-chip{display:inline-flex;align-items:center;gap:7px;margin-top:14px;padding:5px 18px;border-radius:99px;background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(124,58,237,0.04));border:1px solid rgba(124,58,237,0.2);font-size:11px;font-weight:700;color:#6D28D9;text-transform:uppercase;letter-spacing:0.08em}

    /* ── Receipt ID ── */
    .rid-row{margin:22px 36px;padding:14px 20px;border-radius:12px;background:linear-gradient(135deg,#FDF8F5,#F5EFE8);border:1px solid #EAE0D6;display:flex;align-items:center;justify-content:space-between;gap:12px}
    .rid-left{}
    .rid-label{font-size:9px;text-transform:uppercase;letter-spacing:0.14em;font-weight:700;color:#B0A098;margin-bottom:4px}
    .rid-val{font-size:16px;font-weight:700;color:#8B1A3A;letter-spacing:0.08em;font-family:'Inter',monospace}
    .barcode{display:flex;align-items:flex-end;gap:2px;height:32px;opacity:0.85}

    /* ── Details ── */
    .details{padding:4px 36px 24px}
    .sec-hd{font-size:9px;text-transform:uppercase;letter-spacing:0.18em;font-weight:700;color:#C9A84C;margin:22px 0 14px;display:flex;align-items:center;gap:10px}
    .sec-hd::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,#E8DDD6,transparent)}
    .row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:9px 0;border-bottom:1px solid #F5EFE8}
    .row:last-child{border-bottom:none}
    .rk{font-size:11px;font-weight:600;color:#B0A098;text-transform:uppercase;letter-spacing:0.07em;width:110px;flex-shrink:0;padding-top:1px}
    .rv{font-size:13px;color:#1A1A18;font-weight:500;text-align:right;flex:1}

    /* ── Footer ── */
    .ftr{padding:18px 36px;background:#FAFAF8;border-top:1px solid #EDE8E3;display:flex;align-items:center;justify-content:space-between;gap:12px}
    .ftr-txt{font-size:10px;color:#C0B8B0;line-height:1.7}
    .seal{width:54px;height:54px;border-radius:50%;border:2px solid #E8DDD6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;flex-shrink:0}
    .seal-t{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#C9A84C}
    .seal-s{font-size:16px;color:#C9A84C;line-height:1}

    @media print{
      body{background:#fff;padding:0;display:block}
      .page{box-shadow:none;border-radius:0;width:100%}
      .notch-wrap::before,.notch-wrap::after{background:#fff}
    }
  </style>
</head>
<body>
  <div class="page">

    <div class="hdr">
      <div class="brand">
        <div class="brand-icon">💍</div>
        <div>
          <div class="brand-name">ShadiSeva</div>
          <div class="brand-sub">India's Wedding Marketplace</div>
        </div>
      </div>
      <div class="hdr-pill">&#x1F4C4; Official Booking Receipt</div>
    </div>

    <div class="notch-wrap">
      <div class="amt-inner">
        <div class="amt-lbl">Total Amount Paid</div>
        <div class="amt-val">${formattedAmount}</div>
        <div class="amt-note">Inclusive of all applicable charges</div>
        <div class="status-chip">&#10003; Service Completed</div>
      </div>
    </div>

    <div class="rid-row">
      <div class="rid-left">
        <div class="rid-label">Receipt Number</div>
        <div class="rid-val">${receiptId}</div>
      </div>
      <div class="barcode">${bars}</div>
    </div>

    <div class="details">
      <div class="sec-hd">Booking Information</div>
      <div class="row"><span class="rk">Service</span><span class="rv">${b.service?.title || '—'}</span></div>
      <div class="row"><span class="rk">Category</span><span class="rv">${catDisplay}</span></div>
      <div class="row"><span class="rk">Vendor</span><span class="rv">${b.vendor?.full_name || b.vendor?.business_name || '—'}</span></div>
      <div class="row"><span class="rk">Event Date</span><span class="rv">${formattedDate}</span></div>
      <div class="row"><span class="rk">Booked On</span><span class="rv">${bookedOn}</span></div>

      <div class="sec-hd">Document Info</div>
      <div class="row"><span class="rk">Status</span><span class="rv" style="color:#6D28D9;font-weight:700">Completed</span></div>
      <div class="row"><span class="rk">Printed On</span><span class="rv">${printedOn}</span></div>
      <div class="row"><span class="rk">Issued By</span><span class="rv">ShadiSeva Platform</span></div>
    </div>

    <div class="ftr">
      <div class="ftr-txt">
        © 2026 ShadiSeva Pvt. Ltd. All rights reserved.<br/>
        System-generated receipt · No signature required.<br/>
        Made with love in India &#x1F1EE;&#x1F1F3;
      </div>
      <div class="seal">
        <div class="seal-t">Verified</div>
        <div class="seal-s">&#9733;</div>
        <div class="seal-t">ShadiSeva</div>
      </div>
    </div>

  </div>
  <script>window.onload = () => { window.print(); }<\/script>
</body></html>`);
    win.document.close();
  };

  /* ── Actions ── */
  const handleCancelClick = b => { setCancelId(b._id); setCancelBooking(b); };
  const handleCancel = async () => {
    setSubmitting(true);
    try {
      await clientAPI.cancelBooking(cancelId);
      toast.success('Booking cancelled.');
      setCancelId(null); setCancelBooking(null);
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
    setSubmitting(false);
  };
  const handleReview = async () => {
    setSubmitting(true);
    try {
      await reviewAPI.addReview(reviewBooking.service._id, { ...review, bookingId: reviewBooking._id });
      toast.success('Review submitted! Thank you.');
      setReviewBooking(null); setReview({ rating: 5, comment: '' });
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review'); }
    setSubmitting(false);
  };

  if (loading) return <PageSpinner />;

  /* ── Hero pill definitions ── */
  const PILLS = [
    { key: 'all',       label: 'All Bookings', icon: Layers,       color: '#8B1A3A', grad: 'linear-gradient(135deg,#8B1A3A,#6B1230)' },
    { key: 'pending',   label: 'Pending',      icon: Clock,        color: '#C9A84C', grad: 'linear-gradient(135deg,#C9A84C,#A88B38)' },
    { key: 'confirmed', label: 'Confirmed',    icon: CheckCircle2, color: '#059669', grad: 'linear-gradient(135deg,#059669,#047857)' },
    { key: 'completed', label: 'Completed',    icon: CircleCheck,  color: '#7C3AED', grad: 'linear-gradient(135deg,#7C3AED,#6D28D9)' },
    { key: 'cancelled', label: 'Cancelled',    icon: XCircle,      color: '#DC2626', grad: 'linear-gradient(135deg,#DC2626,#B91C1C)' },
  ];

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <div className="space-y-6">

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,#1A0409 0%,#3D0A1A 30%,#5A0E24 60%,#8B1A3A 100%)',
          backgroundSize: '300% 300%',
          animation: 'gradientShift 9s ease infinite',
        }}
      >
        {/* Dot mesh */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.06) 1px,transparent 1px)', backgroundSize: '26px 26px' }} />

        {/* Orbs */}
        <Orb size={260} color="rgba(139,26,58,0.25)"  style={{ top: -80,  right: -20,  animationDelay: '0s'   }} />
        <Orb size={180} color="rgba(201,168,76,0.18)" style={{ bottom: -60, right: 200, animationDelay: '3s'  }} />
        <Orb size={120} color="rgba(124,58,237,0.14)" style={{ top: 40, left: '45%',   animationDelay: '1.5s' }} />

        {/* Decorative rings (desktop) */}
        <div className="absolute hidden lg:block pointer-events-none"
          style={{ width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', top: -80, right: -40 }} />
        <div className="absolute hidden lg:block pointer-events-none"
          style={{ width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', top: -30, right: 10 }} />
        <div className="absolute hidden lg:block pointer-events-none"
          style={{ width: 130, height: 130, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)', top: 20, right: 60 }} />

        <div className="relative p-8 pb-10">
          {/* Label */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-[11px] font-bold uppercase tracking-widest"
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)',
              opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.1s',
            }}
          >
            <Layers size={11} style={{ color: '#E8C86E' }} /> Your Bookings
          </div>

          {/* Title + search: two columns */}
          <div className="flex flex-col lg:flex-row lg:items-end gap-6 mb-8">
            <div className="flex-1">
              <h1
                className="text-white font-bold mb-2 leading-tight"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 'clamp(1.7rem,4vw,2.4rem)',
                  letterSpacing: '-0.02em',
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                  transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1) 0.15s',
                }}
              >
                Manage Your<br />
                <span style={{ background: 'linear-gradient(90deg,#E8C86E,#F9D4A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Celebrations
                </span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.3s' }}>
                Track, review and manage all your wedding service bookings
              </p>
            </div>

            {/* Glass search */}
            <div
              className="relative lg:w-80"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.5s ease 0.35s' }}
            >
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.4)' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search bookings…"
                style={{
                  width: '100%', paddingLeft: 40, paddingRight: searchQuery ? 36 : 16,
                  paddingTop: 11, paddingBottom: 11,
                  background: 'rgba(255,255,255,0.1)',
                  border: '1.5px solid rgba(255,255,255,0.18)',
                  borderRadius: 14, color: '#fff', fontSize: 13, outline: 'none',
                  backdropFilter: 'blur(12px)',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.4)'; e.target.style.background = 'rgba(255,255,255,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.18)'; e.target.style.background = 'rgba(255,255,255,0.1)'; }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <X size={10} style={{ color: '#fff' }} />
                </button>
              )}
            </div>
          </div>

          {/* Stat pills row */}
          <div className="flex flex-wrap gap-3 items-center">
            {PILLS.map((pill, i) => {
              const Icon    = pill.icon;
              const isActive = activeStatus === pill.key;
              const count   = counts[pill.key] || 0;
              return (
                <button
                  key={pill.key}
                  onClick={() => setActiveStatus(pill.key)}
                  className="relative flex flex-col items-center px-5 py-3 rounded-2xl transition-all duration-250"
                  style={{
                    background: isActive ? pill.grad : 'rgba(255,255,255,0.08)',
                    border: `1.5px solid ${isActive ? 'transparent' : 'rgba(255,255,255,0.13)'}`,
                    boxShadow: isActive ? `0 8px 24px ${pill.color}50` : 'none',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? (isActive ? 'translateY(-2px)' : 'translateY(0)') : 'translateY(10px)',
                    transition: `background 0.2s, box-shadow 0.2s, opacity 0.45s cubic-bezier(0.4,0,0.2,1) ${0.35 + i * 0.06}s, transform 0.45s cubic-bezier(0.4,0,0.2,1) ${0.35 + i * 0.06}s`,
                    minWidth: 80,
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon size={12} style={{ color: isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)' }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)' }}>
                      {pill.label}
                    </span>
                  </div>
                  <span className="font-bold leading-none" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: '#fff' }}>
                    {mounted ? <AnimatedNumber target={count} /> : count}
                  </span>
                </button>
              );
            })}

            {/* Total Spent */}
            <div
              className="flex items-center gap-3 px-5 py-3 rounded-2xl ml-auto"
              style={{
                background: 'rgba(201,168,76,0.18)', border: '1.5px solid rgba(201,168,76,0.3)',
                opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.7s',
              }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(201,168,76,0.25)' }}>
                <IndianRupee size={16} style={{ color: '#E8C86E' }} />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Total Spent</div>
                <div className="font-bold leading-none" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: '#E8C86E' }}>
                  ₹{totalSpent.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ BOOKING CARDS ══════════════════════════════════════ */}
      {filtered.length === 0 ? (
        /* ── Empty state ── */
        <div
          className="flex flex-col items-center justify-center py-24 rounded-3xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#FDF6EE 0%,#fff 50%,#FDF6EE 100%)', border: '1px solid #E8E1D9' }}
        >
          {/* Decorative rings */}
          <div className="absolute pointer-events-none" style={{ width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(139,26,58,0.07)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          <div className="absolute pointer-events-none" style={{ width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.09)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 relative"
            style={{ background: 'linear-gradient(135deg,#8B1A3A,#6B1230)', boxShadow: '0 12px 40px rgba(139,26,58,0.35)' }}
          >
            <Calendar size={34} style={{ color: '#fff' }} />
          </div>
          <h3 className="font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#1C1917' }}>
            {searchQuery ? 'No matching bookings' : activeStatus === 'all' ? 'No bookings yet' : `No ${activeStatus} bookings`}
          </h3>
          <p className="text-[13px] mb-7" style={{ color: '#78716C' }}>
            {searchQuery ? 'Try different keywords or clear the filter.' : 'Start planning your perfect celebration today.'}
          </p>
          {!searchQuery && (
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-bold text-[14px]"
              style={{ background: 'linear-gradient(135deg,#8B1A3A,#6B1230)', boxShadow: '0 8px 28px rgba(139,26,58,0.4)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(139,26,58,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 28px rgba(139,26,58,0.4)'; }}
            >
              Browse Wedding Services <ArrowRight size={16} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b, idx) => {
            const sm       = STATUS_META[b.status] || STATUS_META.pending;
            const catMeta  = CATEGORY_ICON[b.service?.category?.toLowerCase()] || CATEGORY_ICON.other;
            const CatIcon  = catMeta.icon;
            const StatusIcon = sm.icon;
            const imageUrl = imgUrl(b.service?.images?.[0]);
            const isHovered  = hoveredCard === b._id;
            const isCancelled = b.status === 'cancelled';

            return (
              <div
                key={b._id}
                className="rounded-3xl overflow-hidden flex"
                style={{
                  background: '#fff',
                  border: '1px solid #E8E1D9',
                  boxShadow: isHovered
                    ? `0 20px 60px ${sm.shadow}, 0 4px 16px rgba(28,9,16,0.06)`
                    : `0 4px 24px ${sm.shadow}, 0 1px 4px rgba(28,9,16,0.04)`,
                  minHeight: 180,
                  animation: `fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) ${idx * 0.08}s both`,
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1)',
                  cursor: 'default',
                }}
                onMouseEnter={() => setHoveredCard(b._id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* ─ Left image panel ─ */}
                <div className="relative shrink-0 overflow-hidden" style={{ width: 200 }}>
                  {/* Image with zoom on hover */}
                  <div className="absolute inset-0" style={{
                    transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                    transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
                  }}>
                    <ImagePanel
                      category={b.service?.category}
                      imageUrl={imageUrl}
                      status={b.status}
                    />
                  </div>

                  {/* Status badge — bottom left overlay */}
                  <div
                    className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold"
                    style={{
                      background: isCancelled ? sm.color : 'rgba(0,0,0,0.55)',
                      color: '#fff',
                      backdropFilter: 'blur(8px)',
                      border: `1px solid ${isCancelled ? 'transparent' : 'rgba(255,255,255,0.15)'}`,
                      boxShadow: isCancelled ? `0 4px 12px ${sm.glow}` : 'none',
                    }}
                  >
                    <StatusIcon size={11} />
                    {sm.label}
                  </div>

                  {/* Gradient right edge fade */}
                  <div className="absolute inset-y-0 right-0 w-8 pointer-events-none"
                    style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15))' }} />
                </div>

                {/* ─ Right content ─ */}
                <div className="flex-1 min-w-0 flex flex-col p-6">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3
                      className="font-bold leading-tight"
                      style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '1.2rem',
                        color: isCancelled ? '#A8A29E' : '#1C1917',
                        textDecoration: isCancelled ? 'line-through' : 'none',
                        flex: 1,
                      }}
                    >
                      {b.service?.title || 'Service'}
                    </h3>
                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <div className="font-bold leading-none" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: '#C9A84C' }}>
                        ₹{(b.total_amount || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] font-medium mt-0.5" style={{ color: '#A8A29E' }}>total amount</div>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4">
                    <div className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: '#78716C' }}>
                      <Calendar size={12} style={{ color: sm.color }} />
                      {new Date(b.booking_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: isCancelled ? '#A8A29E' : '#78716C' }}>
                      <User size={12} style={{ color: isCancelled ? '#A8A29E' : '#8B1A3A' }} />
                      {b.vendor?.full_name || '—'}
                    </div>
                  </div>

                  {/* Notes */}
                  {b.notes && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-xl mb-4 text-[12px] italic"
                      style={{ background: '#FDF9F4', border: '1px solid #F0EBE5', color: '#78716C' }}>
                      <MessageSquare size={11} className="shrink-0 mt-0.5" style={{ color: '#C4B5A5' }} />
                      "{b.notes}"
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="mb-5">
                    <BookingTimeline status={b.status} />
                  </div>

                  {/* Bottom strip */}
                  <div className="flex items-center justify-between gap-3 pt-4 mt-auto" style={{ borderTop: '1px solid #F5EDE4' }}>
                    {/* Category pill */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold capitalize"
                      style={{ background: `${catMeta.color}12`, color: catMeta.color, border: `1px solid ${catMeta.color}20` }}>
                      <CatIcon size={12} />
                      {b.service?.category || 'Other'}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {b.status === 'pending' && (
                        <button
                          onClick={() => handleCancelClick(b)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all duration-200"
                          style={{ background: 'rgba(220,38,38,0.07)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.18)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.14)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.07)'}
                        >
                          <X size={12} /> Cancel
                        </button>
                      )}
                      {b.status === 'completed' && reviewableIds.has(b._id) && (
                        <button
                          onClick={() => setReviewBooking(b)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all duration-200"
                          style={{ background: 'linear-gradient(135deg,#C9A84C,#A88B38)', boxShadow: '0 4px 14px rgba(201,168,76,0.35)' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 7px 20px rgba(201,168,76,0.45)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(201,168,76,0.35)'; }}
                        >
                          <Star size={12} /> Write Review
                        </button>
                      )}
                      {b.status === 'completed' && !reviewableIds.has(b._id) && (
                        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold"
                          style={{ background: 'rgba(5,150,105,0.09)', color: '#059669', border: '1px solid rgba(5,150,105,0.18)' }}>
                          <CircleCheck size={12} /> Reviewed
                        </div>
                      )}
                      {b.status === 'completed' && (
                        <button
                          onClick={() => printReceipt(b)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all duration-200"
                          style={{ background: 'rgba(109,40,217,0.08)', color: '#7C3AED', border: '1px solid rgba(109,40,217,0.18)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(109,40,217,0.15)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(109,40,217,0.08)'}
                          title="Download / Print Receipt"
                        >
                          <Printer size={12} /> Receipt
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

      {/* ══ CANCEL MODAL ═══════════════════════════════════════ */}
      <Modal
        isOpen={!!cancelId}
        onClose={() => { setCancelId(null); setCancelBooking(null); }}
        title="Cancel Booking"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setCancelId(null); setCancelBooking(null); }}>Keep It</Button>
            <Button variant="danger" loading={submitting} onClick={handleCancel}>Yes, Cancel</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.16)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(220,38,38,0.12)' }}>
              <AlertTriangle size={16} style={{ color: '#DC2626' }} />
            </div>
            <p className="text-[12px] font-medium" style={{ color: '#DC2626' }}>
              This action cannot be undone. The booking will be permanently cancelled.
            </p>
          </div>
          {cancelBooking && (
            <div className="rounded-2xl p-5 space-y-3" style={{ background: '#FDF6EE', border: '1px solid #E8E1D9' }}>
              {[
                { label: 'Service', value: cancelBooking.service?.title },
                { label: 'Vendor',  value: cancelBooking.vendor?.full_name },
                { label: 'Date',    value: new Date(cancelBooking.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#A8A29E' }}>{label}</span>
                  <span className="text-[13px] font-semibold" style={{ color: '#1C1917' }}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid #E8E1D9' }}>
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#A8A29E' }}>Amount</span>
                <span className="font-bold" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', color: '#C9A84C' }}>
                  ₹{cancelBooking.total_amount?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ══ REVIEW MODAL ════════════════════════════════════════ */}
      <Modal
        isOpen={!!reviewBooking}
        onClose={() => { setReviewBooking(null); setReview({ rating: 5, comment: '' }); }}
        title="Write a Review"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setReviewBooking(null); setReview({ rating: 5, comment: '' }); }}>Cancel</Button>
            <Button loading={submitting} onClick={handleReview}>Submit Review</Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Service card */}
          {reviewBooking && (() => {
            const cat = CATEGORY_ICON[reviewBooking.service?.category?.toLowerCase()] || CATEGORY_ICON.other;
            const CIcon = cat.icon;
            return (
              <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: '#FDF6EE', border: '1px solid #E8E1D9' }}>
                <div className="w-16 h-16 rounded-2xl shrink-0 overflow-hidden relative" style={{ background: cat.bg }}>
                  {reviewBooking.service?.images?.[0] ? (
                    <img src={imgUrl(reviewBooking.service.images[0])}
                      alt="" className="w-full h-full object-cover absolute inset-0" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CIcon size={24} style={{ color: cat.color }} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold truncate" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', fontSize: '1.05rem' }}>
                    {reviewBooking.service?.title}
                  </div>
                  <div className="text-[12px] mt-0.5" style={{ color: '#78716C' }}>by {reviewBooking.vendor?.full_name}</div>
                  <div className="flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-lg w-fit text-[11px] font-bold capitalize"
                    style={{ background: `${cat.color}12`, color: cat.color }}>
                    <CIcon size={10} />
                    {reviewBooking.service?.category}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Stars */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#78716C' }}>Your Rating</div>
            <div className="flex gap-1.5 mb-3">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setReview(r => ({ ...r, rating: s }))}
                  style={{ transition: 'transform 0.15s', display: 'flex' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.25) rotate(-5deg)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}>
                  <Star size={40} style={{
                    color: s <= review.rating ? '#C9A84C' : '#E8E1D9',
                    fill: s <= review.rating ? '#C9A84C' : 'transparent',
                    filter: s <= review.rating ? 'drop-shadow(0 3px 10px rgba(201,168,76,0.5))' : 'none',
                    transition: 'all 0.15s',
                  }} />
                </button>
              ))}
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-bold"
              style={{ background: 'linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.07))', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.22)' }}>
              <Star size={12} style={{ fill: '#C9A84C', color: '#C9A84C' }} />
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][review.rating]}
            </div>
          </div>

          {/* Comment */}
          <div>
            <Textarea
              label="Your Review (optional)"
              name="comment"
              value={review.comment}
              onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
              placeholder="Share your experience with this vendor…"
              rows={4}
            />
            <div className="text-right text-[11px] mt-1" style={{ color: '#A8A29E' }}>
              {review.comment.length} / 500
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
}
