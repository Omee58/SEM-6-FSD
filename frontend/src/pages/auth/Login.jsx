import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Heart, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

function validate(form) {
  const errors = {};
  if (!form.email) errors.email = 'Email is required';
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email address';
  if (!form.password) errors.password = 'Password is required';
  return errors;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => validate(form), [form]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setTouched(t => ({ ...t, [e.target.name]: true }));
  };

  const handleBlur = e => setTouched(t => ({ ...t, [e.target.name]: true }));

  const handleSubmit = async e => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    const result = await login(form.email, form.password);
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
            Welcome to ShadiSeva
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            India's most trusted wedding marketplace. Connect with the finest vendors to make your dream wedding a reality.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[['500+', 'Vendors'], ['2,000+', 'Weddings'], ['50+', 'Cities']].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-bold">{v}</div>
                <div className="text-white/70 text-sm">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#FAFAF8]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary-dark flex items-center justify-center">
              <Heart size={20} className="fill-white text-white" />
            </div>
            <span className="text-xl font-bold text-[#1A1A18]" style={{ fontFamily: 'Playfair Display, serif' }}>ShadiSeva</span>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-[0_4px_30px_rgba(0,0,0,0.08)] border border-[#E8E8E4]">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#1A1A18] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Sign in</h2>
              <p className="text-sm text-[#6B6B65]">Welcome back! Please enter your details.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <Input
                  label="Email address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="you@example.com"
                  icon={Mail}
                />
                {fieldError('email') && (
                  <p className="text-xs text-[#DC2626] mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-[#1A1A18]">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B65]" />
                    <input
                      id="password"
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="••••••••"
                      className={`input-base pl-9 pr-10 ${fieldError('password') ? 'border-[#DC2626]' : ''}`}
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B65] hover:text-[#1A1A18]">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {fieldError('password') && (
                  <p className="text-xs text-[#DC2626] mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.password}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-dark font-medium">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
                Sign in
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-[#6B6B65]">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:text-primary-dark">
                Create one free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
