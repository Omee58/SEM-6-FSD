import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin, Camera, UtensilsCrossed, Building2, Sparkles, Palette, Music, Star, Car, ExternalLink, MessageCircle, Share2 } from 'lucide-react';

const SOCIAL_ICONS = [Share2, MessageCircle, ExternalLink];

export default function Footer() {
  return (
    <footer className="bg-[#1A0409] text-white/70 px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#8B1A3A] to-[#6B1230] flex items-center justify-center">
                <Heart size={16} className="fill-white text-white" />
              </div>
              <span className="text-white font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>ShadiSeva</span>
            </div>
            <p className="text-sm leading-relaxed mb-5">India's most trusted wedding marketplace connecting couples with verified vendors.</p>
            <div className="flex gap-3">
              {SOCIAL_ICONS.map((Icon, i) => (
                <div key={i} className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#8B1A3A] transition-colors cursor-pointer">
                  <Icon size={16} />
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <div className="text-white font-semibold mb-4">Services</div>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Photography', slug: 'photography' },
                { label: 'Catering',    slug: 'catering'    },
                { label: 'Venue',       slug: 'venue'       },
                { label: 'Decoration',  slug: 'decoration'  },
                { label: 'Mehendi',     slug: 'mehendi'     },
                { label: 'Music & DJ',  slug: 'music'       },
              ].map(({ label, slug }) => (
                <li key={slug}>
                  <Link to={`/services?category=${slug}`} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="text-white font-semibold mb-4">Company</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/register?role=vendor" className="hover:text-white transition-colors">Vendor Registration</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Get Started</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="text-white font-semibold mb-4">Contact</div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Phone size={14} /> +91 78630 25154</li>
              <li className="flex items-center gap-2"><Mail size={14} /> hello@shadiseva.com</li>
              <li className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" /> Gujarat, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-sm">
          <p>© 2026 ShadiSeva. Made with <Heart size={12} className="inline fill-[#C9A84C] text-[#C9A84C]" /> in India</p>
        </div>
      </div>
    </footer>
  );
}
