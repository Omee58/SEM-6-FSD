import { useState } from 'react';
import {
  User, Mail, Phone, Lock, Save, Shield, Clock,
  ShieldCheck, Star, Activity, Key, CheckCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

function Orb({ size, color, style: s }) {
  return <div className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, background: color, filter: 'blur(70px)', ...s }} />;
}

const TABS = [
  { key: 'profile',  label: 'Profile',  icon: User },
  { key: 'security', label: 'Security', icon: Lock },
];

export default function AdminProfile() {
  const { user, updateUser } = useAuth();
  const [tab,     setTab]     = useState('profile');
  const [profile, setProfile] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading,    setPassLoading]    = useState(false);
  const [mounted,        setMounted]        = useState(true);

  const handleProfileSubmit = async e => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await authAPI.updateProfile(profile);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    setProfileLoading(false);
  };

  const handlePassSubmit = async e => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) { toast.error('Passwords do not match'); return; }
    if (passwords.new_password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPassLoading(true);
    try {
      await authAPI.updatePassword({ current_password: passwords.current_password, new_password: passwords.new_password });
      toast.success('Password changed!');
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setPassLoading(false);
  };

  const isSuper = user?.admin_level === 'super_admin';
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A';

  return (
    <div className="space-y-6" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.35s ease' }}>

      {/* ══ HERO / ID CARD ══ */}
      <div className="relative overflow-hidden rounded-3xl"
        style={{ background: 'linear-gradient(135deg,#060B14 0%,#0D1627 50%,#0F172A 100%)', padding: '36px 40px' }}>
        <Orb size={300} color="rgba(99,102,241,0.14)" style={{ top: -80, right: -60 }} />
        <Orb size={180} color="rgba(245,158,11,0.08)" style={{ bottom: -50, left: 200 }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar ring */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
              style={{ background: 'linear-gradient(135deg,#4C1D95,#6D28D9)', boxShadow: '0 0 0 3px rgba(99,102,241,0.35), 0 8px 24px rgba(99,102,241,0.4)' }}>
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: '#6366F1', boxShadow: '0 2px 8px rgba(99,102,241,0.5)' }}>
              <ShieldCheck size={12} color="#fff" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h1 className="text-white font-bold"
                style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(1.3rem,3vw,1.8rem)' }}>
                {user?.full_name}
              </h1>
              {/* admin level badge */}
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
                style={isSuper
                  ? { background: 'rgba(245,158,11,0.18)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.3)' }
                  : { background: 'rgba(99,102,241,0.18)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,0.3)' }}>
                {isSuper ? '★ Super Admin' : 'Moderator'}
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>{user?.email}</p>
            {user?.phone && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>{user.phone}</p>}
          </div>

          {/* Stat pills */}
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Clock size={14} style={{ color: '#FCD34D' }} />
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>Last Login</p>
                <p className="text-[12px] font-semibold text-white">
                  {user?.last_login
                    ? new Date(user.last_login).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'First session'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Activity size={14} style={{ color: '#6EE7B7' }} />
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>Member Since</p>
                <p className="text-[12px] font-semibold text-white">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#F1F5F9' }}>
        {TABS.map(t => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200"
              style={active ? {
                background: '#fff',
                color: '#0F172A',
                boxShadow: '0 2px 8px rgba(15,23,42,0.1)',
              } : { color: '#64748B' }}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ══ CONTENT ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {tab === 'profile' && (
          <>
            {/* form */}
            <div className="lg:col-span-2 rounded-2xl p-6"
              style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
              <h3 className="font-bold mb-5" style={{ fontFamily: 'Playfair Display,serif', color: '#0F172A', fontSize: '1rem' }}>
                Personal Information
              </h3>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <Field label="Full Name" icon={User}>
                  <input value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="Your full name" required
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] focus:outline-none"
                    style={{ border: '1.5px solid #E2E8F0', color: '#0F172A' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#6366F1'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; }} />
                </Field>

                <Field label="Email Address" icon={Mail}>
                  <input value={user?.email || ''} disabled
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px]"
                    style={{ border: '1.5px solid #F1F5F9', background: '#F8FAFF', color: '#94A3B8', cursor: 'not-allowed' }} />
                </Field>
                <p className="text-[11px] -mt-2" style={{ color: '#94A3B8', paddingLeft: 4 }}>Email address cannot be changed</p>

                <Field label="Phone Number" icon={Phone}>
                  <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] focus:outline-none"
                    style={{ border: '1.5px solid #E2E8F0', color: '#0F172A' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#6366F1'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; }} />
                </Field>

                <button type="submit" disabled={profileLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold text-white transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg,#3730A3,#4F46E5)',
                    boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                    opacity: profileLoading ? 0.8 : 1,
                  }}
                  onMouseEnter={e => { if (!profileLoading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
                  {profileLoading
                    ? <><span className="spinner" style={{ width: 15, height: 15 }} /> Saving…</>
                    : <><Save size={15} /> Save Changes</>}
                </button>
              </form>
            </div>

            {/* Access card */}
            <div className="space-y-4">
              <div className="rounded-2xl p-5"
                style={{ background: 'linear-gradient(135deg,#0D1627,#0F172A)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <p className="text-white font-bold mb-4" style={{ fontFamily: 'Playfair Display,serif', fontSize: '0.95rem' }}>
                  Access Control
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: isSuper ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)' }}>
                      <Shield size={16} style={{ color: isSuper ? '#FCD34D' : '#A5B4FC' }} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>Admin Level</p>
                      <p className="font-bold text-[13px]" style={{ color: isSuper ? '#FCD34D' : '#A5B4FC' }}>
                        {isSuper ? 'Super Admin' : 'Moderator'}
                      </p>
                    </div>
                  </div>

                  {[
                    { label: 'Manage Users',       granted: true },
                    { label: 'Approve Vendors',    granted: true },
                    { label: 'View Bookings',      granted: true },
                    { label: 'Delete Reviews',     granted: isSuper },
                    { label: 'System Settings',    granted: isSuper },
                  ].map(p => (
                    <div key={p.label} className="flex items-center justify-between">
                      <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{p.label}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={p.granted
                          ? { background: 'rgba(16,185,129,0.15)', color: '#6EE7B7' }
                          : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}>
                        {p.granted ? '✓ Yes' : '— No'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'security' && (
          <>
            {/* change password form */}
            <div className="lg:col-span-2 rounded-2xl p-6"
              style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
              <h3 className="font-bold mb-5" style={{ fontFamily: 'Playfair Display,serif', color: '#0F172A', fontSize: '1rem' }}>
                Change Password
              </h3>
              <form onSubmit={handlePassSubmit} className="space-y-4">
                <Field label="Current Password" icon={Key}>
                  <input type="password" value={passwords.current_password}
                    onChange={e => setPasswords(p => ({ ...p, current_password: e.target.value }))}
                    placeholder="Enter current password" required
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] focus:outline-none"
                    style={{ border: '1.5px solid #E2E8F0', color: '#0F172A' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#6366F1'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; }} />
                </Field>
                <Field label="New Password" icon={Lock}>
                  <input type="password" value={passwords.new_password}
                    onChange={e => setPasswords(p => ({ ...p, new_password: e.target.value }))}
                    placeholder="Min. 6 characters" required
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] focus:outline-none"
                    style={{ border: '1.5px solid #E2E8F0', color: '#0F172A' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#6366F1'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; }} />
                </Field>
                <Field label="Confirm Password" icon={Lock}>
                  <input type="password" value={passwords.confirm_password}
                    onChange={e => setPasswords(p => ({ ...p, confirm_password: e.target.value }))}
                    placeholder="Repeat new password" required
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] focus:outline-none"
                    style={{ border: '1.5px solid #E2E8F0', color: '#0F172A' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#6366F1'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; }} />
                </Field>

                {passwords.new_password && passwords.confirm_password && (
                  <div className="flex items-center gap-2 text-[12px] font-semibold"
                    style={{ color: passwords.new_password === passwords.confirm_password ? '#059669' : '#EF4444' }}>
                    <CheckCircle size={13} />
                    {passwords.new_password === passwords.confirm_password ? 'Passwords match' : 'Passwords do not match'}
                  </div>
                )}

                <button type="submit" disabled={passLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold text-white transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg,#831843,#BE185D)',
                    boxShadow: '0 4px 16px rgba(190,24,93,0.3)',
                    opacity: passLoading ? 0.8 : 1,
                  }}
                  onMouseEnter={e => { if (!passLoading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
                  {passLoading
                    ? <><span className="spinner" style={{ width: 15, height: 15 }} /> Updating…</>
                    : <><Lock size={15} /> Update Password</>}
                </button>
              </form>
            </div>

            {/* security tips */}
            <div className="rounded-2xl p-5"
              style={{ background: 'linear-gradient(135deg,#0D1627,#0F172A)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <p className="text-white font-bold mb-4" style={{ fontFamily: 'Playfair Display,serif', fontSize: '0.95rem' }}>
                Security Tips
              </p>
              {[
                'Use at least 8 characters',
                'Mix uppercase, lowercase & numbers',
                'Avoid reusing old passwords',
                'Never share your password',
                'Log out on shared devices',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5 mb-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(99,102,241,0.2)' }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#A5B4FC' }}>{i + 1}</span>
                  </div>
                  <p className="text-[12px] leading-snug" style={{ color: 'rgba(255,255,255,0.5)' }}>{tip}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Field wrapper ─────────────────────────────────────────── */
function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#0F172A' }}>{label}</label>
      <div className="relative">
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
        {children}
      </div>
    </div>
  );
}
