import { useState } from 'react';
import { User, Mail, Phone, Lock, Save, Shield, Clock, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function AdminProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

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
    setPassLoading(true);
    try {
      await authAPI.updatePassword({ current_password: passwords.current_password, new_password: passwords.new_password });
      toast.success('Password changed!');
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setPassLoading(false);
  };

  return (
    <div>
      <PageHeader title="Admin Profile" subtitle="Manage your administrator account" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-[#1A1A18] mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>Account Information</h2>
          <div className="flex items-center gap-4 mb-6 p-4 bg-[#FAFAF8] rounded-xl">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center text-white text-2xl font-bold">
              {user?.full_name?.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-[#1A1A18]">{user?.full_name}</div>
              <div className="text-sm text-[#6B6B65]">{user?.email}</div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Shield size={11} className="text-[#7C3AED]" />
                <span className="text-xs bg-[#EDE9FE] text-[#5B21B6] px-2 py-0.5 rounded-full">Administrator</span>
                {user?.admin_level && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: user.admin_level === 'super_admin' ? '#FEF3C7' : '#F0EBE5', color: user.admin_level === 'super_admin' ? '#92400E' : '#78716C' }}>
                    {user.admin_level === 'super_admin' ? 'Super Admin' : 'Moderator'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Admin info row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#EDE9FE' }}>
                <ShieldCheck size={15} className="text-[#7C3AED]" />
              </div>
              <div>
                <div className="text-[11px] font-medium" style={{ color: '#78716C' }}>Access Level</div>
                <div className="text-[13px] font-bold" style={{ color: '#5B21B6' }}>
                  {user?.admin_level === 'super_admin' ? 'Super Admin' : 'Moderator'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#FAFAF8', border: '1px solid #E8E1D9' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F0EBE5' }}>
                <Clock size={15} style={{ color: '#C9A84C' }} />
              </div>
              <div>
                <div className="text-[11px] font-medium" style={{ color: '#78716C' }}>Last Login</div>
                <div className="text-[13px] font-bold" style={{ color: '#1A1A18' }}>
                  {user?.last_login
                    ? new Date(user.last_login).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </div>
              </div>
            </div>
          </div>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Input label="Full Name" name="full_name" value={profile.full_name}
              onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} icon={User} required />
            <Input label="Email" name="email" value={user?.email || ''} icon={Mail} disabled hint="Email cannot be changed" />
            <Input label="Phone" name="phone" value={profile.phone}
              onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} icon={Phone} />
            <Button type="submit" loading={profileLoading}>
              <Save size={16} /> Save Changes
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="font-semibold text-[#1A1A18] mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>Change Password</h2>
          <form onSubmit={handlePassSubmit} className="space-y-4">
            <Input label="Current Password" name="current_password" type="password"
              value={passwords.current_password} onChange={e => setPasswords(p => ({ ...p, current_password: e.target.value }))} icon={Lock} required />
            <Input label="New Password" name="new_password" type="password"
              value={passwords.new_password} onChange={e => setPasswords(p => ({ ...p, new_password: e.target.value }))} icon={Lock} required />
            <Input label="Confirm Password" name="confirm_password" type="password"
              value={passwords.confirm_password} onChange={e => setPasswords(p => ({ ...p, confirm_password: e.target.value }))} icon={Lock} required />
            <Button type="submit" loading={passLoading} variant="secondary">
              <Lock size={16} /> Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
