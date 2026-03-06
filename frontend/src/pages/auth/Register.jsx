import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Heart, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ROLES = [
  { value: 'client', icon: Heart, label: 'Client', desc: 'Find & book wedding services' },
  { value: 'vendor', icon: Building2, label: 'Vendor', desc: 'List your business & get bookings' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'client' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result.success) navigate(result.redirectTo);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#BE185D] via-[#9D174D] to-[#7C1037] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: 200 + i * 100, height: 200 + i * 100, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          ))}
        </div>
        <div className="relative z-10 text-white text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 border border-white/30">
            <Heart size={40} className="fill-white text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Join ShadiSeva
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Start your wedding journey with India's most trusted marketplace. Thousands of couples trust us every year.
          </p>
          <div className="mt-10 space-y-4">
            {['No booking fees for clients', 'Verified & trusted vendors', 'Pan-India presence, 50+ cities'].map(f => (
              <div key={f} className="flex items-center gap-3 text-left">
                <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-white/90 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#FAFAF8] overflow-y-auto">
        <div className="w-full max-w-md py-6">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#BE185D] to-[#9D174D] flex items-center justify-center">
              <Heart size={20} className="fill-white text-white" />
            </div>
            <span className="text-xl font-bold text-[#1A1A18]" style={{ fontFamily: 'Playfair Display, serif' }}>ShadiSeva</span>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-[0_4px_30px_rgba(0,0,0,0.08)] border border-[#E8E8E4]">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#1A1A18] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Create account</h2>
              <p className="text-sm text-[#6B6B65]">Join thousands of happy couples and vendors.</p>
            </div>

            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {ROLES.map(({ value, icon: Icon, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: value }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.role === value
                      ? 'border-[#BE185D] bg-[#FCE7F3]'
                      : 'border-[#E8E8E4] hover:border-[#BE185D]/40'
                  }`}
                >
                  <Icon size={20} className={form.role === value ? 'text-[#BE185D]' : 'text-[#6B6B65]'} />
                  <div className={`text-sm font-semibold mt-2 ${form.role === value ? 'text-[#BE185D]' : 'text-[#1A1A18]'}`}>{label}</div>
                  <div className="text-xs text-[#6B6B65] mt-0.5">{desc}</div>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full name" name="full_name" value={form.full_name} onChange={handleChange}
                placeholder="Priya Sharma" icon={User} required />
              <Input label="Email address" name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" icon={Mail} required />
              <Input label="Phone number" name="phone" type="tel" value={form.phone} onChange={handleChange}
                placeholder="+91 98001 23456" icon={Phone} required />
              <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="Min. 6 characters" icon={Lock} required />

              {form.role === 'vendor' && (
                <div className="p-3 bg-[#FEF3C7] rounded-xl text-xs text-[#92400E]">
                  Vendor accounts require admin approval before going live. You'll receive an email once approved.
                </div>
              )}

              <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
                Create Account
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-[#6B6B65]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#BE185D] font-semibold hover:text-[#9D174D]">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
