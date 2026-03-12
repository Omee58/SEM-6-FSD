import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Lock, Building2, Save, CalendarCheck, Camera, Globe, Link2, MapPin, Tag, Image, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { authAPI, vendorAPI } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Calendar from '../../components/ui/Calendar';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
const SERVICE_CATEGORIES = ['photography', 'catering', 'venue', 'decoration', 'mehendi', 'music', 'makeup', 'transport', 'other'];
const LANGUAGES_LIST = ['Hindi', 'English', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada', 'Punjabi'];
const RESPONSE_TIMES = ['Within 1 hour', '2–4 hours', 'Same day', '1–2 days'];

export default function VendorProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    business_name: user?.business_name || '',
    business_description: user?.business_description || '',
    years_experience: user?.years_experience || '',
    category_specialization: user?.category_specialization || '',
    service_cities: user?.service_cities || [],
    min_price: user?.min_price || '',
    max_price: user?.max_price || '',
    languages: user?.languages || [],
    gst_number: user?.gst_number || '',
    avg_response_time: user?.avg_response_time || '',
    instagram_url: user?.instagram_url || '',
    portfolio_url: user?.portfolio_url || '',
    certifications: user?.certifications || [],
  });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [calLoading, setCalLoading] = useState(true);

  /* ── Photo upload state ── */
  const photoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(user?.profile_photo ? `${API_BASE}${user.profile_photo}` : '');
  const [coverPreview, setCoverPreview] = useState(user?.cover_image ? `${API_BASE}${user.cover_image}` : '');

  /* ── City tag input ── */
  const [cityInput, setCityInput] = useState('');
  /* ── Certification tag input ── */
  const [certInput, setCertInput] = useState('');

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

  const handlePhotoChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append('profile_photo', file);
    setPhotoLoading(true);
    try {
      const res = await authAPI.uploadProfilePhoto(fd);
      updateUser(res.data.user);
      toast.success('Profile photo updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Photo upload failed'); }
    setPhotoLoading(false);
  };

  const handleCoverChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append('cover_image', file);
    setCoverLoading(true);
    try {
      const res = await authAPI.uploadCoverImage(fd);
      updateUser(res.data.user);
      toast.success('Cover image updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Cover upload failed'); }
    setCoverLoading(false);
  };

  const addCity = () => {
    const val = cityInput.trim();
    if (val && !profile.service_cities.includes(val)) {
      setProfile(p => ({ ...p, service_cities: [...p.service_cities, val] }));
    }
    setCityInput('');
  };
  const removeCity = city => setProfile(p => ({ ...p, service_cities: p.service_cities.filter(c => c !== city) }));

  const addCert = () => {
    const val = certInput.trim();
    if (val && !profile.certifications.includes(val)) {
      setProfile(p => ({ ...p, certifications: [...p.certifications, val] }));
    }
    setCertInput('');
  };
  const removeCert = cert => setProfile(p => ({ ...p, certifications: p.certifications.filter(c => c !== cert) }));

  const toggleLanguage = lang => {
    setProfile(p => ({
      ...p,
      languages: p.languages.includes(lang)
        ? p.languages.filter(l => l !== lang)
        : [...p.languages, lang],
    }));
  };

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your vendor profile and availability" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Cover Image */}
        <Card className="lg:col-span-2">
          <h2 className="font-semibold text-[#1A1A18] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Cover Image</h2>
          <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-3"
            style={{ background: coverPreview ? 'transparent' : 'linear-gradient(135deg,#F0EBE5,#E8E1D9)', border: '2px dashed #D5C9BE' }}>
            {coverPreview
              ? <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
              : <div className="flex flex-col items-center justify-center h-full gap-2 text-[#A8A29E]">
                  <Image size={28} />
                  <span className="text-[13px]">Upload a cover banner for your profile</span>
                </div>
            }
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={coverLoading}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white"
              style={{ background: 'rgba(28,9,16,0.7)', backdropFilter: 'blur(6px)' }}
            >
              {coverLoading ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <Camera size={13} />}
              {coverPreview ? 'Change' : 'Upload'} Cover
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
          </div>
        </Card>

        {/* Profile */}
        <Card>
          <h2 className="font-semibold text-[#1A1A18] mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>Personal Information</h2>
          <div className="flex items-center gap-4 mb-6 p-4 bg-[#FAFAF8] rounded-xl">
            <div className="relative shrink-0">
              {photoPreview
                ? <img src={photoPreview} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                : <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-bold">
                    {user?.full_name?.charAt(0)}
                  </div>
              }
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={photoLoading}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-primary)', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
                title="Upload photo"
              >
                {photoLoading ? <span className="spinner" style={{ width: 10, height: 10 }} /> : <Camera size={11} style={{ color: '#fff' }} />}
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
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

            <div>
              <label className="block text-sm font-medium text-[#3D2B1F] mb-1.5">Category Specialization</label>
              <select value={profile.category_specialization}
                onChange={e => setProfile(p => ({ ...p, category_specialization: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D9] text-[#1A1A18] bg-white text-sm focus:outline-none focus:border-primary">
                <option value="">Select category</option>
                {SERVICE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Min Price (₹)" name="min_price" type="number" value={profile.min_price}
                onChange={e => setProfile(p => ({ ...p, min_price: e.target.value }))} />
              <Input label="Max Price (₹)" name="max_price" type="number" value={profile.max_price}
                onChange={e => setProfile(p => ({ ...p, max_price: e.target.value }))} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3D2B1F] mb-1.5">Avg Response Time</label>
              <select value={profile.avg_response_time}
                onChange={e => setProfile(p => ({ ...p, avg_response_time: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D9] text-[#1A1A18] bg-white text-sm focus:outline-none focus:border-primary">
                <option value="">Select response time</option>
                {RESPONSE_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <Input label="GST Number" name="gst_number" value={profile.gst_number}
              onChange={e => setProfile(p => ({ ...p, gst_number: e.target.value }))}
              placeholder="e.g. 22ABCDE1234F1Z5" />

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

          {/* Online Presence */}
          <h2 className="font-semibold text-[#1A1A18] mb-4 mt-2" style={{ fontFamily: 'Playfair Display, serif' }}>Online Presence</h2>
          <div className="space-y-4">
            <Input label="Instagram URL" name="instagram_url" value={profile.instagram_url}
              onChange={e => setProfile(p => ({ ...p, instagram_url: e.target.value }))}
              icon={Link2} placeholder="https://instagram.com/yourbusiness" />
            <Input label="Portfolio / Website URL" name="portfolio_url" value={profile.portfolio_url}
              onChange={e => setProfile(p => ({ ...p, portfolio_url: e.target.value }))}
              icon={Globe} placeholder="https://yourwebsite.com" />
          </div>

          {/* Languages */}
          <h2 className="font-semibold text-[#1A1A18] mb-3 mt-6" style={{ fontFamily: 'Playfair Display, serif' }}>Languages Spoken</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {LANGUAGES_LIST.map(lang => {
              const active = profile.languages.includes(lang);
              return (
                <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150"
                  style={{
                    background: active ? 'var(--color-primary)' : '#F0EBE5',
                    color: active ? '#fff' : '#78716C',
                    border: active ? 'none' : '1px solid #E8E1D9',
                  }}>
                  {lang}
                </button>
              );
            })}
          </div>

          {/* Service Cities */}
          <h2 className="font-semibold text-[#1A1A18] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Service Cities</h2>
          <div className="flex gap-2 mb-2">
            <input value={cityInput} onChange={e => setCityInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCity(); } }}
              className="flex-1 px-3 py-2 rounded-xl border border-[#E8E1D9] text-sm text-[#1A1A18] focus:outline-none focus:border-primary"
              placeholder="Type city and press Enter" />
            <button type="button" onClick={addCity}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--color-primary)' }}>Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {profile.service_cities.map(city => (
              <span key={city} className="flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-medium"
                style={{ background: '#FDF0F4', color: '#8B1A3A', border: '1px solid rgba(139,26,58,0.2)' }}>
                <MapPin size={10} /> {city}
                <button type="button" onClick={() => removeCity(city)} className="ml-1 hover:text-red-600"><X size={10} /></button>
              </span>
            ))}
          </div>

          {/* Certifications */}
          <h2 className="font-semibold text-[#1A1A18] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Certifications & Awards</h2>
          <div className="flex gap-2 mb-2">
            <input value={certInput} onChange={e => setCertInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCert(); } }}
              className="flex-1 px-3 py-2 rounded-xl border border-[#E8E1D9] text-sm text-[#1A1A18] focus:outline-none focus:border-primary"
              placeholder="e.g. Best Photographer 2024" />
            <button type="button" onClick={addCert}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--color-primary)' }}>Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.certifications.map(cert => (
              <span key={cert} className="flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-medium"
                style={{ background: '#FBF5E0', color: '#92400E', border: '1px solid rgba(201,168,76,0.3)' }}>
                <Tag size={10} /> {cert}
                <button type="button" onClick={() => removeCert(cert)} className="ml-1 hover:text-red-600"><X size={10} /></button>
              </span>
            ))}
          </div>
        </Card>

        {/* Availability Calendar */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <CalendarCheck size={20} className="text-primary" />
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
