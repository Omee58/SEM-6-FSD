import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Heart, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { authAPI } from '../../services/api';
import Button from '../../components/ui/Button';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!password) { setError('Password is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await authAPI.resetPassword(token, { new_password: password });
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset link. Please request a new one.');
    }
    setLoading(false);
  };

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
            ShadiSeva
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Choose a strong new password to secure your account.
          </p>
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
            {done ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-[#1A1A18] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Password reset!</h2>
                <p className="text-sm text-[#6B6B65]">Redirecting you to sign in…</p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-[#1A1A18] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Set new password</h2>
                  <p className="text-sm text-[#6B6B65]">Enter a new password for your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div>
                    <label htmlFor="password" className="text-sm font-medium text-[#1A1A18] block mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B65]" />
                      <input
                        id="password"
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(''); }}
                        placeholder="Min. 6 characters"
                        className={`input-base pl-9 pr-10 ${error ? 'border-[#DC2626]' : ''}`}
                      />
                      <button type="button" onClick={() => setShowPass(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B65] hover:text-[#1A1A18]">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {error && (
                      <p className="text-xs text-[#DC2626] mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {error}
                      </p>
                    )}
                  </div>

                  <Button type="submit" loading={loading} fullWidth size="lg">
                    Reset Password
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm text-[#6B6B65]">
                  <Link to="/login" className="text-primary font-semibold hover:text-primary-dark">
                    Back to Sign in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
