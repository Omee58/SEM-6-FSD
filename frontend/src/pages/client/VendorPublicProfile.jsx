import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, MapPin, Phone, Mail, ExternalLink, Link2,
  Camera, UtensilsCrossed, Building2, Sparkles, Palette, Music, Car, Gem,
  CheckCircle, Clock, Globe, Award, Users, MessageCircle, Tag
} from 'lucide-react';
import { toast } from 'react-toastify';
import { clientAPI } from '../../services/api';
import { PageSpinner } from '../../components/ui/Spinner';
import Footer from '../../components/layout/Footer';
import { imgUrl } from '../../utils/imageUrl';

const CATEGORY_META = {
  photography: { icon: Camera,         color: '#8B1A3A', bg: 'rgba(139,26,58,0.12)'   },
  catering:    { icon: UtensilsCrossed, color: '#059669', bg: 'rgba(5,150,105,0.12)'   },
  venue:       { icon: Building2,       color: '#2563EB', bg: 'rgba(37,99,235,0.12)'   },
  decoration:  { icon: Sparkles,        color: '#C9A84C', bg: 'rgba(201,168,76,0.12)'  },
  mehendi:     { icon: Palette,         color: '#7C3AED', bg: 'rgba(124,58,237,0.12)'  },
  music:       { icon: Music,           color: '#0891B2', bg: 'rgba(8,145,178,0.12)'   },
  makeup:      { icon: Sparkles,        color: '#DB2777', bg: 'rgba(219,39,119,0.12)'  },
  transport:   { icon: Car,             color: '#D97706', bg: 'rgba(217,119,6,0.12)'   },
  other:       { icon: Gem,             color: '#6D28D9', bg: 'rgba(109,40,217,0.12)'  },
};

function StarRow({ rating, count }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13} style={{ color: i <= Math.round(rating) ? '#C9A84C' : '#E0DDD6' }}
          className={i <= Math.round(rating) ? 'fill-current' : ''} />
      ))}
      {count > 0 && <span className="text-[12px] ml-1" style={{ color: '#78716C' }}>({count})</span>}
    </div>
  );
}

export default function VendorPublicProfile() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await clientAPI.getVendorProfile(vendorId);
        setVendor(res.data.vendor);
        setServices(res.data.services || []);
      } catch {
        toast.error('Vendor not found');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [vendorId]);

  if (loading) return <PageSpinner />;
  if (!vendor) return null;

  const photoUrl = imgUrl(vendor.profile_photo) || '';
  const coverUrl = imgUrl(vendor.cover_image)   || '';
  const meta = CATEGORY_META[vendor.category_specialization] || CATEGORY_META.other;
  const initials = vendor.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">

      {/* ── Cover ── */}
      <div className="relative overflow-hidden" style={{ height: 320 }}>
        {coverUrl ? (
          <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
        ) : (
          <>
            {/* Decorative gradient background */}
            <div className="w-full h-full" style={{ background: 'linear-gradient(135deg,#1A0409 0%,#5A1428 45%,#8B1A3A 80%,#C9A84C 140%)' }} />
            {/* Decorative orbs */}
            <div className="absolute rounded-full pointer-events-none" style={{ width: 320, height: 320, background: 'rgba(201,168,76,0.08)', filter: 'blur(60px)', top: -80, right: 80 }} />
            <div className="absolute rounded-full pointer-events-none" style={{ width: 240, height: 240, background: 'rgba(139,26,58,0.3)', filter: 'blur(50px)', bottom: -60, left: 120 }} />
            {/* Centered vendor info on blank cover */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <meta.icon size={28} style={{ color: 'rgba(255,255,255,0.85)' }} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                {vendor.business_name || vendor.full_name}
              </h2>
              {vendor.category_specialization && (
                <span className="text-[13px] font-semibold capitalize px-4 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}>
                  {vendor.category_specialization}
                </span>
              )}
            </div>
          </>
        )}

        {/* Gradient overlay at bottom (for both states) */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(26,4,9,0.65) 0%, transparent 55%)' }} />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-5 flex items-center gap-2 px-4 py-2 rounded-xl text-white text-[13px] font-semibold transition-all"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,26,58,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.35)'; }}
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* ShadiSeva brand mark top-right */}
        <div className="absolute top-5 right-5 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
          <Star size={12} className="fill-current" style={{ color: '#C9A84C' }} />
          <span className="text-[12px] font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>ShadiSeva</span>
        </div>
      </div>

      {/* ── Profile Header ── */}
      <div className="max-w-5xl mx-auto px-6">
        {/* ── Profile identity card ── */}
        <div
          className="relative -mt-16 mb-6 rounded-3xl p-6"
          style={{ background: '#fff', border: '1px solid #EDE8E3', boxShadow: '0 4px 28px rgba(28,9,16,0.09)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Avatar */}
            <div
              className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
              style={{ background: photoUrl ? 'transparent' : 'linear-gradient(135deg,#8B1A3A,#5A1428)', boxShadow: '0 8px 32px rgba(139,26,58,0.25)' }}
            >
              {photoUrl
                ? <img src={photoUrl} alt={vendor.full_name} className="w-full h-full object-cover" />
                : <span className="text-white text-3xl font-bold">{initials}</span>}
            </div>

            {/* Name + info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917' }}>
                  {vendor.business_name || vendor.full_name}
                </h1>
                <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: '#D1FAE5', color: '#065F46' }}>
                  <CheckCircle size={10} /> Verified
                </span>
              </div>
              {vendor.category_specialization && (
                <div className="flex items-center gap-1.5 mb-3">
                  <meta.icon size={13} style={{ color: meta.color }} />
                  <span className="text-[13px] font-semibold capitalize" style={{ color: meta.color }}>
                    {vendor.category_specialization}
                  </span>
                </div>
              )}

              {/* Stat pills row */}
              <div className="flex flex-wrap gap-2 mb-4">
                {vendor.years_experience > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                    style={{ background: 'rgba(139,26,58,0.08)', color: '#8B1A3A', border: '1px solid rgba(139,26,58,0.15)' }}>
                    <Award size={11} /> {vendor.years_experience} yrs exp
                  </div>
                )}
                {vendor.avg_response_time && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                    style={{ background: 'rgba(5,150,105,0.08)', color: '#059669', border: '1px solid rgba(5,150,105,0.15)' }}>
                    <Clock size={11} /> {vendor.avg_response_time}
                  </div>
                )}
                {(vendor.min_price > 0 || vendor.max_price > 0) && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                    style={{ background: 'rgba(201,168,76,0.1)', color: '#A88B38', border: '1px solid rgba(201,168,76,0.2)' }}>
                    ₹{vendor.min_price?.toLocaleString('en-IN')}
                    {vendor.max_price > 0 ? ` – ₹${vendor.max_price?.toLocaleString('en-IN')}` : '+'}
                  </div>
                )}
                {services.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                    style={{ background: 'rgba(37,99,235,0.08)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.15)' }}>
                    <Tag size={11} /> {services.length} service{services.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Online presence buttons */}
            <div className="flex gap-2 flex-shrink-0">
              {vendor.instagram_url && (
                <a href={vendor.instagram_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
                  style={{ background: '#FDF0F4', color: '#8B1A3A', border: '1.5px solid rgba(139,26,58,0.2)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#8B1A3A'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FDF0F4'; e.currentTarget.style.color = '#8B1A3A'; }}>
                  <Link2 size={13} /> Instagram
                </a>
              )}
              {vendor.portfolio_url && (
                <a href={vendor.portfolio_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
                  style={{ background: '#FDF6EE', color: '#C9A84C', border: '1.5px solid rgba(201,168,76,0.3)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#C9A84C'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FDF6EE'; e.currentTarget.style.color = '#C9A84C'; }}>
                  <Globe size={13} /> Portfolio
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

          {/* Left column — About + details */}
          <div className="lg:col-span-1 space-y-5">

            {/* About */}
            {vendor.business_description && (
              <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #E8E1D9' }}>
                <h3 className="font-semibold pb-3 mb-4 text-[15px]" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', borderBottom: '1px solid #F0EBE5' }}>
                  About
                </h3>
                <p className="text-[13px] leading-relaxed" style={{ color: '#6B6B65' }}>
                  {vendor.business_description}
                </p>
              </div>
            )}

            {/* Contact */}
            <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #E8E1D9' }}>
              <h3 className="font-semibold pb-3 mb-4 text-[15px]" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', borderBottom: '1px solid #F0EBE5' }}>
                Contact
              </h3>
              <div className="space-y-2.5">
                {vendor.phone && (
                  <div className="flex items-center gap-2.5 text-[13px]" style={{ color: '#6B6B65' }}>
                    <Phone size={13} style={{ color: '#8B1A3A' }} /> {vendor.phone}
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-center gap-2.5 text-[13px]" style={{ color: '#6B6B65' }}>
                    <Mail size={13} style={{ color: '#8B1A3A' }} /> {vendor.email}
                  </div>
                )}
              </div>
            </div>

            {/* Service Cities */}
            {vendor.service_cities?.length > 0 && (
              <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #E8E1D9' }}>
                <h3 className="font-semibold pb-3 mb-4 text-[15px]" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', borderBottom: '1px solid #F0EBE5' }}>
                  Service Cities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {vendor.service_cities.map(city => (
                    <span key={city} className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: '#FDF0F4', color: '#8B1A3A' }}>
                      <MapPin size={10} /> {city}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {vendor.languages?.length > 0 && (
              <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #E8E1D9' }}>
                <h3 className="font-semibold pb-3 mb-4 text-[15px]" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', borderBottom: '1px solid #F0EBE5' }}>
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {vendor.languages.map(lang => (
                    <span key={lang} className="text-[12px] font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: '#F5F3FF', color: '#5B21B6' }}>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {vendor.certifications?.length > 0 && (
              <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #E8E1D9' }}>
                <h3 className="font-semibold pb-3 mb-4 text-[15px]" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', borderBottom: '1px solid #F0EBE5' }}>
                  Certifications
                </h3>
                <div className="space-y-2">
                  {vendor.certifications.map((cert, i) => (
                    <div key={i} className="flex items-center gap-2 text-[13px]" style={{ color: '#6B6B65' }}>
                      <Award size={12} style={{ color: '#C9A84C' }} /> {cert}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column — Services */}
          <div className="lg:col-span-2">
            <h2 className="font-bold mb-4 text-[18px]" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917' }}>
              Services ({services.length})
            </h2>

            {services.length === 0 ? (
              <div className="rounded-2xl p-10 text-center" style={{ background: '#fff', border: '1px solid #E8E1D9' }}>
                <p className="text-[14px]" style={{ color: '#78716C' }}>No active services listed yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map(svc => {
                  const sm = CATEGORY_META[svc.category] || CATEGORY_META.other;
                  const SvcIcon = sm.icon;
                  return (
                    <Link
                      key={svc._id}
                      to={`/services/${svc._id}`}
                      className="group block rounded-2xl overflow-hidden transition-all duration-200"
                      style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 2px 10px rgba(28,9,16,0.05)' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 36px rgba(28,9,16,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(28,9,16,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden" style={{ height: 160, background: `linear-gradient(135deg,${sm.bg},rgba(253,246,238,0.5))` }}>
                        {svc.images?.[0] ? (
                          <img
                            src={imgUrl(svc.images[0])}
                            alt={svc.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <SvcIcon size={36} style={{ color: sm.color, opacity: 0.5 }} />
                          </div>
                        )}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize"
                          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', color: sm.color }}>
                          <SvcIcon size={9} /> {svc.category}
                        </div>
                        {svc.avg_rating > 0 && (
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', color: '#C9A84C' }}>
                            <Star size={10} className="fill-current" /> {svc.avg_rating.toFixed(1)}
                          </div>
                        )}
                      </div>

                      {/* Card body */}
                      <div className="p-4">
                        <h4 className="font-bold mb-1 line-clamp-1 text-[14px]"
                          style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917' }}>
                          {svc.title}
                        </h4>
                        <p className="text-[12px] mb-3 line-clamp-2 leading-relaxed" style={{ color: '#78716C' }}>
                          {svc.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            {svc.avg_rating > 0
                              ? <StarRow rating={svc.avg_rating} count={svc.review_count} />
                              : <span className="text-[11px]" style={{ color: '#A8A29E' }}>No reviews</span>}
                          </div>
                          <div className="font-bold text-[15px]"
                            style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C' }}>
                            ₹{svc.price?.toLocaleString('en-IN')}
                          </div>
                        </div>
                        {svc.location && (
                          <div className="flex items-center gap-1 mt-2 text-[11px]" style={{ color: '#A8A29E' }}>
                            <MapPin size={10} /> {svc.location}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
