import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Heart, Building2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ROLES = [
  { value: 'client', icon: Heart, label: 'Client', desc: 'Find & book wedding services' },
  { value: 'vendor', icon: Building2, label: 'Vendor', desc: 'List your business & get bookings' },
];

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const map = [
    { label: '', color: '' },
    { label: 'Weak', color: '#DC2626' },
    { label: 'Fair', color: '#D97706' },
    { label: 'Good', color: '#2563EB' },
    { label: 'Strong', color: '#059669' },
  ];
  return { score, ...map[score] };
}

function validate(form) {
  const errors = {};
  if (!form.full_name.trim()) errors.full_name = 'Full name is required';
  else if (form.full_name.trim().length < 2) errors.full_name = 'Name must be at least 2 characters';

  if (!form.email) errors.email = 'Email is required';
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email address';

  if (!form.phone) errors.phone = 'Phone number is required';
  else if (!/^\d{10,15}$/.test(form.phone.replace(/[\s\-+]/g, ''))) errors.phone = 'Enter a valid 10–15 digit phone number';

  if (!form.password) errors.password = 'Password is required';
  else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters';

  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'client' });
  const [touched, setTouched] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => validate(form), [form]);
  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);
  const isFormValid = Object.keys(errors).length === 0;

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setTouched(t => ({ ...t, [e.target.name]: true }));
  };

  const handleBlur = e => setTouched(t => ({ ...t, [e.target.name]: true }));

  const handleSubmit = async e => {
    e.preventDefault();
    setTouched({ full_name: true, email: true, phone: true, password: true });
    if (!isFormValid) return;
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result.success) navigate(result.redirectTo);
  };

  const fieldError = (name) => touched[name] && errors[name];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#1A0409] via-[#5A0E24] to-primary items-center justify-center p-12 relative overflow-hidden">
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
          <h1 className="text-5xl font-semibold mb-4 italic" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
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
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary-dark flex items-center justify-center">
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
                      ? 'border-primary bg-primary-light'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <Icon size={20} className={form.role === value ? 'text-primary' : 'text-muted'} />
                  <div className={`text-sm font-semibold mt-2 ${form.role === value ? 'text-primary' : 'text-text'}`}>{label}</div>
                  <div className="text-xs text-[#6B6B65] mt-0.5">{desc}</div>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Full Name */}
              <div>
                <Input label="Full name" name="full_name" value={form.full_name}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="Priya Sharma" icon={User} />
                {fieldError('full_name') && (
                  <p className="text-xs text-[#DC2626] mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.full_name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <Input label="Email address" name="email" type="email" value={form.email}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="you@example.com" icon={Mail} />
                {fieldError('email') ? (
                  <p className="text-xs text-[#DC2626] mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.email}
                  </p>
                ) : touched.email && form.email && (
                  <p className="text-xs text-[#059669] mt-1 flex items-center gap-1">
                    <CheckCircle size={11} /> Valid email
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <Input label="Phone number" name="phone" type="tel" value={form.phone}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="9800123456" icon={Phone} />
                {fieldError('phone') && (
                  <p className="text-xs text-[#DC2626] mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Password with strength meter */}
              <div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#1A1A18]">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B65]" />
                    <input
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Min. 6 characters"
                      className={`input-base pl-9 pr-10 ${fieldError('password') ? 'border-[#DC2626]' : ''}`}
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B65] hover:text-[#1A1A18]">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ background: i <= passwordStrength.score ? passwordStrength.color : '#E8E8E4' }} />
                      ))}
                    </div>
                    <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
                {fieldError('password') && (
                  <p className="text-xs text-[#DC2626] mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.password}
                  </p>
                )}
              </div>

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
              <Link to="/login" className="text-primary font-semibold hover:text-primary-dark">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
