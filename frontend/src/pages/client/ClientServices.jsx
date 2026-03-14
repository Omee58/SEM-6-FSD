import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Search, Star, MapPin, Heart, X, ChevronLeft, ChevronRight, Sparkles, Camera, Utensils, Music, Flower2, Paintbrush, Car, Building2, Gem } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clientAPI } from '../../services/api';
import { imgUrl } from '../../utils/imageUrl';
import { SERVICE_CATEGORIES } from '../../constants/categories';
import EmptyState from '../../components/ui/EmptyState';
import { ServiceCardSkeleton } from '../../components/ui/Skeleton';

const LIMIT = 12;

const SORT_OPTIONS = [
  { value: '',            label: 'Recommended' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
];

const CATEGORY_META = {
  photography: { icon: Camera,     color: '#8B1A3A', bg: 'rgba(139,26,58,0.12)'   },
  catering:    { icon: Utensils,   color: '#059669', bg: 'rgba(5,150,105,0.12)'   },
  venue:       { icon: Building2,  color: '#2563EB', bg: 'rgba(37,99,235,0.12)'   },
  decoration:  { icon: Flower2,    color: '#C9A84C', bg: 'rgba(201,168,76,0.12)'  },
  mehendi:     { icon: Paintbrush, color: '#7C3AED', bg: 'rgba(124,58,237,0.12)'  },
  music:       { icon: Music,      color: '#0891B2', bg: 'rgba(8,145,178,0.12)'   },
  makeup:      { icon: Sparkles,   color: '#DB2777', bg: 'rgba(219,39,119,0.12)'  },
  transport:   { icon: Car,        color: '#D97706', bg: 'rgba(217,119,6,0.12)'   },
  other:       { icon: Gem,        color: '#6D28D9', bg: 'rgba(109,40,217,0.12)'  },
};

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={11}
          style={{ color: i <= Math.round(rating) ? '#C9A84C' : '#E0DDD6' }}
          className={i <= Math.round(rating) ? 'fill-current' : ''}
        />
      ))}
    </div>
  );
}

function FloatOrb({ size, color, style }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        background: color,
        filter: 'blur(60px)',
        animation: 'floatSlow 7s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export default function ClientServices() {
  const { user }  = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchRef = useRef(null);

  const [services, setServices]     = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading]       = useState(true);
  const [mounted, setMounted]       = useState(false);
  const [wishlist, setWishlist]     = useState(new Set());
  const [wishlistLoading, setWishlistLoading] = useState(new Set());

  const [search,   setSearch]   = useState(searchParams.get('search')   || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort,     setSort]     = useState(searchParams.get('sort')     || '');
  const [page,     setPage]     = useState(Number(searchParams.get('page')) || 1);

  const hasActiveFilters = search || category || sort;

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  useEffect(() => {
    if (user?.role === 'client') {
      clientAPI.getWishlist().then(res => {
        const ids = (res.data.services || []).map(s => s._id);
        setWishlist(new Set(ids));
      }).catch(() => {});
    }
  }, [user]);

  const handleToggleWishlist = async (e, serviceId) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (wishlistLoading.has(serviceId)) return;
    setWishlistLoading(s => new Set(s).add(serviceId));
    try {
      const res = await clientAPI.toggleWishlist(serviceId);
      setWishlist(new Set(res.data.wishlist));
    } catch {}
    setWishlistLoading(s => { const n = new Set(s); n.delete(serviceId); return n; });
  };

  const fetchServices = useCallback(async (params) => {
    setLoading(true);
    try {
      const query = { page: params.page || 1, limit: LIMIT };
      if (params.search)   query.search   = params.search;
      if (params.category) query.category = params.category;
      if (params.sort)     query.sort     = params.sort;
      const res = await clientAPI.getServices(query);
      setServices(res.data.services || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch {
      setServices([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServices({ search, category, sort, page });
    const params = {};
    if (search)   params.search   = search;
    if (category) params.category = category;
    if (sort)     params.sort     = sort;
    if (page > 1) params.page     = page;
    setSearchParams(params, { replace: true });
  }, [category, sort, page]);

  const handleSearch = e => {
    e.preventDefault();
    setPage(1);
    fetchServices({ search, category, sort, page: 1 });
    const params = {};
    if (search)   params.search   = search;
    if (category) params.category = category;
    if (sort)     params.sort     = sort;
    setSearchParams(params, { replace: true });
  };

  const handleClearFilters = () => {
    setSearch(''); setCategory(''); setSort(''); setPage(1);
    setSearchParams({}, { replace: true });
    fetchServices({ search: '', category: '', sort: '', page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">

      {/* ── Hero Banner ── */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,#1A0409 0%,#3D0A1A 40%,#8B1A3A 100%)',
          backgroundSize: '300% 300%',
          animation: 'gradientShift 8s ease infinite',
          minHeight: 220,
        }}
      >
        {/* Dot mesh */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        {/* Floating orbs */}
        <FloatOrb size={180} color="rgba(139,26,58,0.25)" style={{ top: -40, right: 60, animationDelay: '0s' }} />
        <FloatOrb size={120} color="rgba(201,168,76,0.2)" style={{ bottom: -20, right: 200, animationDelay: '2.5s' }} />
        <FloatOrb size={100} color="rgba(139,26,58,0.15)" style={{ top: 20, left: '40%', animationDelay: '1.2s' }} />

        <div className="relative p-8 pb-10">
          {/* Label */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[11px] font-bold uppercase tracking-widest"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.8)',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
              transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <Sparkles size={11} style={{ color: '#C9A84C' }} />
            India's Finest Wedding Vendors
          </div>

          <h1
            className="text-white font-bold mb-2"
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              letterSpacing: '-0.01em',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(16px)',
              transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1) 0.1s',
            }}
          >
            Discover Perfect Wedding Services
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '14px',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(14px)',
              transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1) 0.2s',
            }}
          >
            Curated professionals for every moment of your celebration
          </p>

          {/* Inline search bar */}
          <form
            onSubmit={handleSearch}
            className="flex gap-2 mt-6"
            style={{
              maxWidth: 600,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(14px)',
              transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1) 0.3s',
            }}
          >
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#A8A29E' }} />
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search photographers, venues, caterers…"
                className="w-full pl-11 pr-4 py-3 rounded-xl text-[14px] outline-none"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  border: '1.5px solid transparent',
                  color: '#1C1917',
                  backdropFilter: 'blur(8px)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#8B1A3A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,26,58,0.15)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 text-white text-[14px] font-bold rounded-xl transition-all duration-200"
              style={{ background: 'linear-gradient(135deg,#C9A84C,#A88B38)', boxShadow: '0 4px 16px rgba(201,168,76,0.4)', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,168,76,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(201,168,76,0.4)'; }}
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* ── Your Picks (preferred categories from profile) ── */}
      {(user?.preferred_categories?.length > 0) && (
        <div
          className="flex flex-wrap items-center gap-2 mb-4 px-4 py-3 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg,#FDF0F4,#FDF6EE)',
            border: '1px solid rgba(139,26,58,0.15)',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.5s 0.3s',
          }}
        >
          <span className="text-[11px] font-bold uppercase tracking-widest shrink-0" style={{ color: '#8B1A3A' }}>
            Your Picks
          </span>
          {user.preferred_categories.map(cat => {
            const meta = CATEGORY_META[cat] || CATEGORY_META.other;
            const CatIcon = meta.icon;
            return (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200"
                style={{ background: meta.bg, color: meta.color, border: `1.5px solid ${meta.color}40` }}
                onMouseEnter={e => { e.currentTarget.style.background = meta.color; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = meta.bg; e.currentTarget.style.color = meta.color; }}
              >
                <CatIcon size={12} /> {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Category Pills ── */}
      <div
        className="flex flex-wrap items-center gap-2 mb-6"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1) 0.35s',
        }}
      >
        {/* All pill */}
        <button
          onClick={() => { setCategory(''); setPage(1); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200"
          style={!category ? {
            background: 'linear-gradient(135deg,#8B1A3A,#6B1230)',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(139,26,58,0.3)',
          } : {
            background: '#fff',
            color: '#78716C',
            border: '1.5px solid #E8E1D9',
          }}
          onMouseEnter={e => { if (category) { e.currentTarget.style.borderColor = '#8B1A3A'; e.currentTarget.style.color = '#8B1A3A'; } }}
          onMouseLeave={e => { if (category) { e.currentTarget.style.borderColor = '#E8E1D9'; e.currentTarget.style.color = '#78716C'; } }}
        >
          <Sparkles size={13} /> All Services
        </button>

        {SERVICE_CATEGORIES.map((c, idx) => {
          const meta = CATEGORY_META[c.value] || CATEGORY_META.other;
          const CatIcon = meta.icon;
          const isActive = category === c.value;
          return (
            <button
              key={c.value}
              onClick={() => { setCategory(isActive ? '' : c.value); setPage(1); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200"
              style={{
                animationDelay: `${0.38 + idx * 0.04}s`,
                ...(isActive ? {
                  background: `linear-gradient(135deg,${meta.color},${meta.color}CC)`,
                  color: '#fff',
                  boxShadow: `0 4px 12px ${meta.color}44`,
                } : {
                  background: '#fff',
                  color: '#78716C',
                  border: '1.5px solid #E8E1D9',
                }),
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = meta.color; e.currentTarget.style.color = meta.color; e.currentTarget.style.background = meta.bg; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = '#E8E1D9'; e.currentTarget.style.color = '#78716C'; e.currentTarget.style.background = '#fff'; } }}
            >
              <CatIcon size={13} /> {c.label}
            </button>
          );
        })}

        {/* Sort + Clear */}
        <div className="ml-auto flex items-center gap-2">
          <select
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1); }}
            className="py-2 px-3 pr-8 rounded-xl text-[13px] font-semibold cursor-pointer outline-none"
            style={{ background: '#fff', border: '1.5px solid #E8E1D9', color: '#78716C', appearance: 'auto' }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold rounded-xl transition-all"
              style={{ color: '#8B1A3A', background: '#FDF0F4', border: '1px solid rgba(139,26,58,0.25)' }}
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {!loading && pagination.total > 0 && (
        <div className="text-[13px] mb-5 flex items-center gap-2" style={{ color: '#78716C' }}>
          <span>Showing</span>
          <span className="font-bold" style={{ color: '#1C1917' }}>
            {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, pagination.total)}
          </span>
          <span>of</span>
          <span className="font-bold" style={{ color: '#1C1917' }}>{pagination.total}</span>
          <span>services</span>
          {category && (
            <span>
              in <span className="font-semibold capitalize" style={{ color: '#8B1A3A' }}>{category}</span>
            </span>
          )}
        </div>
      )}

      {/* ── Service Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: LIMIT }).map((_, i) => <ServiceCardSkeleton key={i} />)}
        </div>
      ) : services.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-3xl"
          style={{ background: 'linear-gradient(135deg,#FDF6EE,#fff)', border: '1px solid #E8E1D9' }}
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg,#FDF0F4,#F5C8D4)', boxShadow: '0 8px 24px rgba(139,26,58,0.12)' }}
          >
            <Heart size={36} style={{ color: '#8B1A3A', opacity: 0.7 }} />
          </div>
          <h3 className="font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#1C1917' }}>
            No Services Found
          </h3>
          <p className="text-[14px] mb-6 text-center max-w-sm" style={{ color: '#78716C' }}>
            {hasActiveFilters
              ? 'Try different keywords or clear your filters to explore all vendors.'
              : 'No services available right now. Check back soon!'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#8B1A3A,#6B1230)', boxShadow: '0 4px 16px rgba(139,26,58,0.3)' }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, idx) => {
              const meta = CATEGORY_META[svc.category] || CATEGORY_META.other;
              return (
                <div
                  key={svc._id}
                  onClick={() => navigate(`/services/${svc._id}`)}
                  className="group rounded-2xl overflow-hidden cursor-pointer"
                  style={{
                    background: '#fff',
                    border: '1px solid #EDE8E3',
                    boxShadow: '0 2px 16px rgba(28,9,16,0.07)',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
                    transition: `opacity 0.5s cubic-bezier(0.4,0,0.2,1) ${idx * 0.06}s, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${idx * 0.06}s, box-shadow 0.25s ease`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 56px rgba(28,9,16,0.15)'; e.currentTarget.style.borderColor = 'rgba(139,26,58,0.12)'; e.currentTarget.style.transform = 'translateY(-5px) scale(1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(28,9,16,0.07)'; e.currentTarget.style.borderColor = '#EDE8E3'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ height: 220, background: `linear-gradient(135deg,${meta.bg},rgba(253,246,238,0.5))` }}>
                    {svc.images?.[0] ? (
                      <img
                        src={imgUrl(svc.images[0])}
                        alt={svc.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ background: meta.bg }}
                        >
                          <meta.icon size={32} style={{ color: meta.color }} />
                        </div>
                        <span className="text-[12px] font-semibold capitalize" style={{ color: meta.color }}>{svc.category}</span>
                      </div>
                    )}

                    {/* Dark overlay on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                      style={{ background: 'linear-gradient(to top,rgba(13,5,9,0.8) 0%,rgba(13,5,9,0.2) 55%,transparent 100%)' }}
                    />

                    {/* Category pill */}
                    <div
                      className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold capitalize"
                      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', color: meta.color }}
                    >
                      <meta.icon size={10} />
                      {svc.category}
                    </div>

                    {/* Rating pill */}
                    {svc.avg_rating > 0 && (
                      <div
                        className="absolute top-3 right-12 flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold"
                        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', color: '#C9A84C' }}
                      >
                        <Star size={11} className="fill-current" />
                        {svc.avg_rating.toFixed(1)}
                      </div>
                    )}

                    {/* Wishlist heart button */}
                    <button
                      onClick={e => handleToggleWishlist(e, svc._id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                      style={{
                        background: wishlist.has(svc._id) ? 'rgba(139,26,58,0.9)' : 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}
                      title={wishlist.has(svc._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart
                        size={14}
                        style={{ color: wishlist.has(svc._id) ? '#fff' : '#8B1A3A' }}
                        className={wishlist.has(svc._id) ? 'fill-current' : ''}
                      />
                    </button>

                    {/* CTA on hover */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <div
                        className="text-center py-2.5 rounded-xl text-[13px] font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#8B1A3A,#6B1230)', boxShadow: '0 4px 16px rgba(139,26,58,0.45)' }}
                      >
                        View Details →
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <h3
                      className="font-bold mb-1.5 line-clamp-1 transition-colors duration-200"
                      style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#1C1917' }}
                      onMouseEnter={e => { e.currentTarget.closest('.group').style.color = '#8B1A3A'; }}
                    >
                      {svc.title}
                    </h3>

                    <p className="text-[12px] mb-3 line-clamp-2 leading-relaxed" style={{ color: '#78716C' }}>
                      {svc.description}
                    </p>

                    {/* Stars + location */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {svc.avg_rating > 0 ? (
                          <>
                            <StarRating rating={svc.avg_rating} />
                            <span className="text-[11px] font-semibold" style={{ color: '#C9A84C' }}>
                              {svc.avg_rating.toFixed(1)}
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px]" style={{ color: '#A8A29E' }}>No reviews yet</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px]" style={{ color: '#A8A29E' }}>
                        <MapPin size={10} />
                        {svc.location}
                      </div>
                    </div>

                    {/* Price + vendor */}
                    <div className="flex items-end justify-between pt-4" style={{ borderTop: '1px solid #F5EDE4' }}>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#A8A29E' }}>Starting from</div>
                        <div
                          className="font-bold"
                          style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: '#C9A84C' }}
                        >
                          ₹{svc.price?.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: '#A8A29E' }}>By</div>
                        <Link
                          to={`/vendors/${svc.vendor?._id}`}
                          onClick={e => e.stopPropagation()}
                          className="text-[12px] font-semibold px-2.5 py-1 rounded-full inline-block transition-all"
                          style={{ background: '#FDF6EE', color: '#78716C' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#FDF0F4'; e.currentTarget.style.color = '#8B1A3A'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#FDF6EE'; e.currentTarget.style.color = '#78716C'; }}
                        >
                          {svc.vendor?.full_name}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Pagination ── */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ border: '1.5px solid #E8E1D9', color: '#78716C', background: '#fff' }}
                onMouseEnter={e => { if (page > 1) { e.currentTarget.style.borderColor = '#8B1A3A'; e.currentTarget.style.color = '#8B1A3A'; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E1D9'; e.currentTarget.style.color = '#78716C'; }}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-sm" style={{ color: '#A8A29E' }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className="w-10 h-10 rounded-xl text-[13px] font-bold transition-all"
                      style={p === page ? {
                        background: 'linear-gradient(135deg,#8B1A3A,#6B1230)',
                        color: '#fff',
                        boxShadow: '0 4px 14px rgba(139,26,58,0.35)',
                      } : {
                        border: '1.5px solid #E8E1D9',
                        color: '#78716C',
                        background: '#fff',
                      }}
                      onMouseEnter={e => { if (p !== page) { e.currentTarget.style.borderColor = '#8B1A3A'; e.currentTarget.style.color = '#8B1A3A'; } }}
                      onMouseLeave={e => { if (p !== page) { e.currentTarget.style.borderColor = '#E8E1D9'; e.currentTarget.style.color = '#78716C'; } }}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.pages}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ border: '1.5px solid #E8E1D9', color: '#78716C', background: '#fff' }}
                onMouseEnter={e => { if (page < pagination.pages) { e.currentTarget.style.borderColor = '#8B1A3A'; e.currentTarget.style.color = '#8B1A3A'; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E1D9'; e.currentTarget.style.color = '#78716C'; }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
