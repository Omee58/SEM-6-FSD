import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Building2, Save, CalendarCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { authAPI, vendorAPI } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Calendar from '../../components/ui/Calendar';
import { PageSpinner } from '../../components/ui/Spinner';

export default function VendorProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    business_name: user?.business_name || '',
    business_description: user?.business_description || '',
    years_experience: user?.years_experience || '',
  });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [calLoading, setCalLoading] = useState(true);

  const today = new Date();

  useEffect(() => {
    // For vendor profile: show their own blocked dates using a known service
    // We first get vendor's services, then use first serviceId for availability
    vendorAPI.getMyServices()
      .then(async r => {
        const services = r.data.services || [];
        if (services.length > 0) {
          const res = await vendorAPI.getAvailability({
            serviceId: services[0]._id,
            month: today.getMonth() + 1,
            year: today.getFullYear()
          });
          setBookedDates((res.data.booked_dates || []).map(d => new Date(d)));
          setBlockedDates((res.data.blocked_dates || []).map(d => new Date(d)));
        }
      }).catch(() => {}).finally(() => setCalLoading(false));
  }, []);

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

  const handleToggleBlock = async (date) => {
    try {
      const res = await vendorAPI.toggleBlockDate({ date: date.toISOString() });
      setBlockedDates((res.data.blocked_dates || []).map(d => new Date(d)));
      toast.success('Availability updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your vendor profile and availability" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card>
          <h2 className="font-semibold text-[#1A1A18] mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>Personal Information</h2>
          <div className="flex items-center gap-4 mb-6 p-4 bg-[#FAFAF8] rounded-xl">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#BE185D] to-[#9D174D] flex items-center justify-center text-white text-2xl font-bold">
              {user?.full_name?.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-[#1A1A18]">{user?.full_name}</div>
              <div className="text-sm text-[#6B6B65]">{user?.email}</div>
              <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${user?.verified ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEF3C7] text-[#92400E]'}`}>
                {user?.verified ? '✓ Verified' : 'Pending Verification'}
              </div>
            </div>
          </div>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Input label="Full Name" name="full_name" value={profile.full_name}
              onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} icon={User} required />
            <Input label="Email" name="email" value={user?.email || ''} icon={Mail} disabled hint="Email cannot be changed" />
            <Input label="Phone" name="phone" value={profile.phone}
              onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} icon={Phone} />
            <Input label="Business Name" name="business_name" value={profile.business_name}
              onChange={e => setProfile(p => ({ ...p, business_name: e.target.value }))} icon={Building2} />
            <Textarea label="Business Description" name="business_description" value={profile.business_description}
              onChange={e => setProfile(p => ({ ...p, business_description: e.target.value }))} rows={3} />
            <Input label="Years of Experience" name="years_experience" type="number" value={profile.years_experience}
              onChange={e => setProfile(p => ({ ...p, years_experience: e.target.value }))} />
            <Button type="submit" loading={profileLoading}>
              <Save size={16} /> Save Changes
            </Button>
          </form>
        </Card>

        {/* Password */}
        <Card>
          <h2 className="font-semibold text-[#1A1A18] mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>Change Password</h2>
          <form onSubmit={handlePassSubmit} className="space-y-4 mb-6">
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

        {/* Availability Calendar */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <CalendarCheck size={20} className="text-[#BE185D]" />
            <div>
              <h2 className="font-semibold text-[#1A1A18]" style={{ fontFamily: 'Playfair Display, serif' }}>Manage Availability</h2>
              <p className="text-xs text-[#6B6B65]">Click any date to block/unblock it. Clients won't see blocked dates as available.</p>
            </div>
          </div>
          {calLoading ? <div className="h-80 flex items-center justify-center"><div className="spinner" style={{ width: 32, height: 32 }} /></div> : (
            <div className="max-w-sm">
              <Calendar
                bookedDates={bookedDates}
                blockedDates={blockedDates}
                vendorMode
                onToggleBlock={handleToggleBlock}
                interactive
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
