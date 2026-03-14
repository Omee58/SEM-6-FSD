import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Camera, Utensils, Building2, Flower2,
  Paintbrush, Music, Car, Gem, Sparkles, Star,
  IndianRupee, MapPin, Search,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { clientAPI } from '../../services/api';
import { PageSpinner } from '../../components/ui/Spinner';
import { imgUrl } from '../../utils/imageUrl';

const CATEGORY_ICON = {
  photography: { icon: Camera,     color: '#8B1A3A', bg: 'rgba(139,26,58,0.10)',   name: 'Photography' },
  catering:    { icon: Utensils,   color: '#059669', bg: 'rgba(5,150,105,0.10)',   name: 'Catering'    },
  venue:       { icon: Building2,  color: '#2563EB', bg: 'rgba(37,99,235,0.10)',   name: 'Venue'       },
  decoration:  { icon: Flower2,    color: '#C9A84C', bg: 'rgba(201,168,76,0.10)',  name: 'Decoration'  },
  mehendi:     { icon: Paintbrush, color: '#7C3AED', bg: 'rgba(124,58,237,0.10)', name: 'Mehendi'     },
  music:       { icon: Music,      color: '#0891B2', bg: 'rgba(8,145,178,0.10)',   name: 'Music'       },
  makeup:      { icon: Sparkles,   color: '#DB2777', bg: 'rgba(219,39,119,0.10)', name: 'Makeup'      },
  transport:   { icon: Car,        color: '#D97706', bg: 'rgba(217,119,6,0.10)',   name: 'Transport'   },
  other:       { icon: Gem,        color: '#6D28D9', bg: 'rgba(109,40,217,0.10)', name: 'Other'       },
};

function ServiceCard({ service, onRemove, removing }) {
  const cat = CATEGORY_ICON[service.category?.toLowerCase()] || CATEGORY_ICON.other;
  const Icon = cat.icon;
  const imageUrl = imgUrl(service.images?.[0]);

  return (
    <div className="relative bg-white rounded-2xl overflow-hidden border border-[#EDE8E3] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group">
      {/* Image / Category Panel */}
      <div className="relative h-48 overflow-hidden" style={{ background: cat.bg }}>
        {imageUrl ? (
          <img src={imageUrl} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon size={48} style={{ color: cat.color, opacity: 0.25 }} />
          </div>
        )}

        {/* Category pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md"
          style={{ background: 'rgba(255,255,255,0.85)', border: `1px solid ${cat.color}22` }}>
          <Icon size={11} style={{ color: cat.color }} />
          <span className="text-[10px] font-700" style={{ color: cat.color, fontWeight: 700 }}>{cat.name}</span>
        </div>

        {/* Remove (un-save) button */}
        <button
          onClick={() => onRemove(service._id)}
          disabled={removing}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
          style={{ background: removing ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.9)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
          title="Remove from saved"
        >
          <Heart
            size={15}
            className="fill-[#8B1A3A] text-[#8B1A3A] transition-transform duration-200"
            style={{ transform: removing ? 'scale(0.8)' : 'scale(1)' }}
          />
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-[#1A1A18] text-[14px] leading-snug mb-1 line-clamp-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          {service.title}
        </h3>

        {service.location && (
          <div className="flex items-center gap-1 text-[11px] text-[#A8A29E] mb-3">
            <MapPin size={11} />
            <span>{service.location}</span>
          </div>
        )}

        {/* Rating */}
        {service.avg_rating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={11}
                className={s <= Math.round(service.avg_rating) ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-[#E8E8E4]'} />
            ))}
            <span className="text-[10px] text-[#A8A29E] ml-1">({service.review_count || 0})</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 text-[#8B1A3A]">
            <IndianRupee size={13} className="font-bold" />
            <span className="text-[15px] font-bold">{(service.price || 0).toLocaleString('en-IN')}</span>
          </div>
          <Link
            to={`/services/${service._id}`}
            className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all duration-200"
            style={{ background: 'rgba(139,26,58,0.08)', color: '#8B1A3A', border: '1px solid rgba(139,26,58,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,26,58,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,26,58,0.08)'}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ClientWishlist() {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [removing, setRemoving] = useState(new Set());
  const [search, setSearch]     = useState('');

  const fetchWishlist = async () => {
    try {
      const res = await clientAPI.getWishlist();
      setServices(res.data?.services || []);
    } catch {
      toast.error('Failed to load saved services.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (serviceId) => {
    setRemoving(prev => new Set(prev).add(serviceId));
    try {
      await clientAPI.toggleWishlist(serviceId);
      setServices(prev => prev.filter(s => s._id !== serviceId));
      toast.success('Removed from saved services.');
    } catch {
      toast.error('Failed to remove. Try again.');
    }
    setRemoving(prev => { const n = new Set(prev); n.delete(serviceId); return n; });
  };

  const filtered = services.filter(s =>
    !search || s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6">

      {/* ── Hero Banner ── */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,#1A0409 0%,#3D0A1A 40%,#5A0E24 70%,#8B1A3A 100%)',
          backgroundSize: '300% 300%',
          animation: 'gradientShift 9s ease infinite',
          minHeight: 160,
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.06) 1px,transparent 1px)',
          backgroundSize: '26px 26px',
        }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 180, height: 180, background: 'rgba(139,26,58,0.25)', filter: 'blur(55px)', top: -50, right: 60 }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 120, height: 120, background: 'rgba(201,168,76,0.2)', filter: 'blur(45px)', bottom: -30, right: 240 }} />

        <div className="relative p-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[11px] font-bold uppercase tracking-widest"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }}>
            <Heart size={11} className="fill-current" style={{ color: '#FDA4AF' }} /> Saved Services
          </div>
          <h1 className="text-white font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.4rem,3vw,2rem)', letterSpacing: '-0.01em' }}>
            Your Wishlist
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            {services.length} {services.length === 1 ? 'service' : 'services'} saved · tap the heart to remove
          </p>
        </div>
      </div>

      {/* ── Search (only shown if there are services) ── */}
      {services.length > 0 && (
        <div className="px-6 mb-6">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter saved services…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-[#E8E8E4] bg-white focus:outline-none focus:border-[#8B1A3A] focus:ring-2 focus:ring-[#8B1A3A]/10 transition-all"
            />
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="px-6 pb-10">
        {services.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{ background: 'linear-gradient(135deg,rgba(139,26,58,0.10),rgba(139,26,58,0.04))', border: '1px solid rgba(139,26,58,0.12)' }}>
              <Heart size={36} className="text-[#8B1A3A]" style={{ opacity: 0.4 }} />
            </div>
            <h2 className="text-xl font-semibold text-[#1A1A18] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              No saved services yet
            </h2>
            <p className="text-sm text-[#A8A29E] max-w-xs mb-6">
              Tap the heart icon on any service card while browsing to save it here for later.
            </p>
            <Link
              to="/services"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
              style={{ background: 'linear-gradient(135deg,#8B1A3A,#4A0A22)' }}
            >
              Browse Services
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          /* Search no results */
          <div className="flex flex-col items-center py-16 text-center">
            <Search size={32} className="text-[#C8C0B8] mb-3" />
            <p className="text-[#A8A29E] text-sm">No saved services match "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(service => (
              <ServiceCard
                key={service._id}
                service={service}
                onRemove={handleRemove}
                removing={removing.has(service._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
