import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Camera, UtensilsCrossed, Building2, Sparkles, Palette,
  Music, Star, Car, ChevronDown, ArrowRight, Phone, Mail,
  MapPin, CheckCircle
} from 'lucide-react';
import { clientAPI } from '../services/api';
import Footer from '../components/layout/Footer';

const CATEGORIES = [
  { icon: Camera, label: 'Photography', color: '#8B1A3A', bg: '#FDF0F4' },
  { icon: UtensilsCrossed, label: 'Catering', color: '#D97706', bg: '#FEF3C7' },
  { icon: Building2, label: 'Venue', color: '#7C3AED', bg: '#EDE9FE' },
  { icon: Sparkles, label: 'Decoration', color: '#059669', bg: '#D1FAE5' },
  { icon: Palette, label: 'Mehendi', color: '#DC2626', bg: '#FEE2E2' },
  { icon: Music, label: 'Music & DJ', color: '#2563EB', bg: '#DBEAFE' },
  { icon: Star, label: 'Makeup', color: '#0891B2', bg: '#CFFAFE' },
  { icon: Car, label: 'Transport', color: '#0891B2', bg: '#CFFAFE' },
];

const TESTIMONIALS = [
  {
    name: 'Priya & Arjun Mehta',
    location: 'Mumbai',
    text: 'ShadiSeva made our dream wedding a reality! We found the most amazing photographer and decorator through this platform. The booking process was seamless.',
    rating: 5,
  },
  {
    name: 'Kavya & Rohan Sharma',
    location: 'Bangalore',
    text: 'Absolutely loved the experience! Found a stunning venue in just 2 days. The vendor was professional and delivered beyond our expectations.',
    rating: 5,
  },
  {
    name: 'Sneha & Vikram Patel',
    location: 'Delhi',
    text: 'The budget planner feature is genius! Helped us stay within budget while still having a grand celebration. Highly recommend ShadiSeva!',
    rating: 5,
  },
];

const STEPS = [
  { num: '01', title: 'Browse Services', desc: 'Explore hundreds of verified vendors across photography, catering, venue, decoration and more.' },
  { num: '02', title: 'Book Instantly', desc: 'Check real-time availability and book your preferred vendor with just a few clicks.' },
  { num: '03', title: 'Celebrate', desc: 'Relax and enjoy your perfect wedding day. We handle everything so you don\'t have to worry.' },
];

export default function LandingPage() {
  const [services, setServices] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    clientAPI.getServices({ limit: 3 }).then(r => setServices(r.data.services || [])).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-border' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary-dark flex items-center justify-center">
              <Heart size={16} className="fill-white text-white" />
            </div>
            <span className={`text-lg font-bold ${scrolled ? 'text-[#1A1A18]' : 'text-white'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
              ShadiSeva
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${scrolled ? 'text-muted hover:text-primary' : 'text-white/90 hover:text-white'}`}>
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#1A0409] via-[#5A0E24] to-primary" />
        <div className="absolute inset-0 opacity-20">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white/50"
              style={{ width: 300 + i * 200, height: 300 + i * 200, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          ))}
        </div>
        {/* Floating badges */}
        <div className="absolute top-1/4 left-[8%] hidden xl:block">
          <div className="bg-white/20 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/30 text-white">
            <div className="text-lg font-bold">4.9★</div>
            <div className="text-xs text-white/80">Average Rating</div>
          </div>
        </div>
        <div className="absolute bottom-1/4 right-[8%] hidden xl:block">
          <div className="bg-white/20 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/30 text-white">
            <div className="text-lg font-bold">500+</div>
            <div className="text-xs text-white/80">Verified Vendors</div>
          </div>
        </div>

        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 text-sm mb-8">
            <Heart size={14} className="fill-white" />
            India's #1 Wedding Marketplace
          </div>
          <h1 className="text-6xl md:text-8xl font-semibold leading-tight mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Your Perfect<br />
            <em className="text-accent-medium">Wedding</em> Awaits
          </h1>
          <p className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with India's finest wedding vendors — photographers, caterers, venues, decorators and more.
            Book with confidence, celebrate with joy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-8 py-4 rounded-xl hover:bg-primary-light transition-colors shadow-lg text-base">
              Start Planning Free
              <ArrowRight size={18} />
            </Link>
            <Link to="/register?role=vendor" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-xl border border-white/40 hover:bg-white/30 transition-colors text-base">
              List Your Business
            </Link>
          </div>
        </div>

        <a href="#categories" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/60 hover:text-white transition-colors">
          <span className="text-xs mb-2">Scroll to explore</span>
          <ChevronDown size={20} className="animate-bounce" />
        </a>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────────── */}
      <section id="categories" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary-light text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Sparkles size={14} />
              Services
            </div>
            <h2 className="text-4xl font-bold text-[#1A1A18] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Everything for Your Big Day
            </h2>
            <p className="text-[#6B6B65] text-lg">From photography to transportation — we have it all.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map(({ icon: Icon, label, color, bg }) => (
              <Link to="/register" key={label}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-white hover:border-primary hover:shadow-[0_8px_30px_rgba(13,107,82,0.12)] hover:-translate-y-1 transition-all duration-200">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all" style={{ background: bg }}>
                  <Icon size={24} style={{ color }} />
                </div>
                <span className="text-sm font-semibold text-[#1A1A18] group-hover:text-primary transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary-light text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <CheckCircle size={14} />
              Process
            </div>
            <h2 className="text-4xl font-bold text-[#1A1A18]" style={{ fontFamily: 'Playfair Display, serif' }}>
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[33%] right-[33%] h-0.5 bg-linear-to-r from-primary-light via-primary to-primary-light" />
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="text-center relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-6 shadow-[0_8px_20px_rgba(13,107,82,0.3)]">
                  <span className="text-3xl font-bold text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{num}</span>
                </div>
                <h3 className="text-xl font-bold text-[#1A1A18] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>{title}</h3>
                <p className="text-[#6B6B65] leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-linear-to-r from-[#1A0409] to-primary">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
            {[
              ['500+', 'Verified Vendors'],
              ['2,000+', 'Happy Couples'],
              ['50+', 'Cities'],
              ['4.9★', 'Average Rating'],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="text-5xl font-bold mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{v}</div>
                <div className="text-white/80 text-sm">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED SERVICES ───────────────────────────────── */}
      {services.length > 0 && (
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-primary-light text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <Star size={14} />
                Top Picks
              </div>
              <h2 className="text-4xl font-bold text-[#1A1A18]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Featured Services
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map(svc => (
                <Link to={`/services/${svc._id}`} key={svc._id}
                  className="group bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden hover:shadow-[0_10px_40px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-200">
                  <div className="h-48 bg-linear-to-br from-primary-light to-[#F5C8D4] relative overflow-hidden">
                    {svc.images?.[0] ? (
                      <img src={`${import.meta.env.VITE_UPLOAD_URL}/${svc.images[0]}`}
                        alt={svc.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart size={40} className="text-primary/30" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-primary capitalize">
                      {svc.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-[#1A1A18] mb-1 group-hover:text-primary transition-colors">{svc.title}</h3>
                    <p className="text-xs text-muted mb-3 line-clamp-2">{svc.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-primary">₹{svc.price?.toLocaleString('en-IN')}</div>
                      {svc.avg_rating > 0 && (
                        <div className="flex items-center gap-1 text-xs text-accent">
                          <Star size={12} className="fill-current" />
                          {svc.avg_rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/register" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3 rounded-xl hover:bg-primary-dark transition-colors shadow-sm">
                View All Services <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section className="py-24 px-6 bg-surface-2">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary-light text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Heart size={14} />
              Reviews
            </div>
            <h2 className="text-5xl font-semibold italic text-[#1A1A18]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Love Stories from Our Couples
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, location, text, rating }) => (
              <div key={name} className="bg-white rounded-2xl p-6 border border-border hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow relative overflow-hidden">
                <div className="absolute top-2 left-4 text-8xl font-bold text-primary/10 leading-none select-none" style={{ fontFamily: 'Cormorant Garamond, serif' }}>"</div>
                <div className="flex gap-0.5 mb-4 relative z-10">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-accent fill-current" />
                  ))}
                </div>
                <p className="text-[#1A1A18] text-sm leading-relaxed mb-5 italic relative z-10">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1A1A18]">{name}</div>
                    <div className="text-xs text-[#6B6B65] flex items-center gap-1">
                      <MapPin size={10} /> {location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────── */}
      <section className="py-20 px-6 bg-linear-to-br from-[#1A0409] to-[#5A1428]">
        <div className="max-w-3xl mx-auto text-center">
          <Heart size={40} className="text-accent fill-current mx-auto mb-6" />
          <h2 className="text-5xl font-semibold text-white mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Ready to Plan Your Dream Wedding?
          </h2>
          <p className="text-white/70 mb-8 text-lg">Join thousands of couples who trusted ShadiSeva for their perfect day.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-10 py-4 rounded-xl hover:bg-primary-dark transition-colors shadow-lg text-base">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
