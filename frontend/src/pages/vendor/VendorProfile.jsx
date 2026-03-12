import { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, Lock, Building2, Save, CalendarCheck,
  Camera, Globe, Link2, MapPin, Tag, X, ShieldCheck, Clock,
  Star, Languages, IndianRupee, Award, Settings, Check, Plus,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { authAPI, vendorAPI } from '../../services/api';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Calendar from '../../components/ui/Calendar';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
const SERVICE_CATEGORIES = ['photography', 'catering', 'venue', 'decoration', 'mehendi', 'music', 'makeup', 'transport', 'other'];
const LANGUAGES_LIST = ['Hindi', 'English', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada', 'Punjabi'];
const RESPONSE_TIMES = ['Within 1 hour', '2–4 hours', 'Same day', '1–2 days'];

const TABS = [
  { id: 'personal',     label: 'Personal',    icon: User },
  { id: 'business',     label: 'Business',    icon: Building2 },
  { id: 'availability', label: 'Availability', icon: CalendarCheck },
];

export default function VendorProfile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [mounted,   setMounted]   = useState(false);

  const [profile, setProfile] = useState({
    full_name:               user?.full_name               || '',
    phone:                   user?.phone                   || '',
    business_name:           user?.business_name           || '',
    business_description:    user?.business_description    || '',
    years_experience:        user?.years_experience        || '',
    category_specialization: user?.category_specialization || '',
    service_cities:          user?.service_cities          || [],
    min_price:               user?.min_price               || '',
    max_price:               user?.max_price               || '',
    languages:               user?.languages               || [],
    gst_number:              user?.gst_number              || '',
    avg_response_time:       user?.avg_response_time       || '',
    instagram_url:           user?.instagram_url           || '',
    portfolio_url:           user?.portfolio_url           || '',
    certifications:          user?.certifications          || [],
  });

  const [passwords,    setPasswords]    = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [profileLoad,  setProfileLoad]  = useState(false);
  const [passLoad,     setPassLoad]     = useState(false);
  const [bookedDates,  setBookedDates]  = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [calLoading,   setCalLoading]   = useState(true);

  const photoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(user?.profile_photo ? `${API_BASE}${user.profile_photo}` : '');
  const [coverPreview, setCoverPreview] = useState(user?.cover_image   ? `${API_BASE}${user.cover_image}`   : '');

  const [cityInput,      setCityInput]      = useState('');
  const [certInput,      setCertInput]      = useState('');
  const [customLangInput, setCustomLangInput] = useState('');

  const today = new Date();

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    vendorAPI.getMyServices()
      .then(async r => {
        const services = r.data.services || [];
        if (services.length > 0) {
          const res = await vendorAPI.getAvailability({
            serviceId: services[0]._id,
            month: today.getMonth() + 1,
            year: today.getFullYear(),
          });
          setBookedDates((res.data.booked_dates  || []).map(d => new Date(d)));
          setBlockedDates((res.data.blocked_dates || []).map(d => new Date(d)));
        }
      }).catch(() => {}).finally(() => setCalLoading(false));
  }, []);

  const handleProfileSubmit = async e => {
    e.preventDefault();
    setProfileLoad(true);
    try {
      const res = await authAPI.updateProfile(profile);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    setProfileLoad(false);
  };

  const handlePassSubmit = async e => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) { toast.error('Passwords do not match'); return; }
    setPassLoad(true);
    try {
      await authAPI.updatePassword({ current_password: passwords.current_password, new_password: passwords.new_password });
      toast.success('Password changed!');
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setPassLoad(false);
  };

  const handleToggleBlock = async date => {
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
    const fd = new FormData(); fd.append('profile_photo', file);
    setPhotoLoading(true);
    try { const res = await authAPI.uploadProfilePhoto(fd); updateUser(res.data.user); toast.success('Photo updated!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    setPhotoLoading(false);
  };

  const handleCoverChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    const fd = new FormData(); fd.append('cover_image', file);
    setCoverLoading(true);
    try { const res = await authAPI.uploadCoverImage(fd); updateUser(res.data.user); toast.success('Cover updated!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    setCoverLoading(false);
  };

  const addCity = () => {
    const val = cityInput.trim();
    if (val && !profile.service_cities.includes(val)) setProfile(p => ({ ...p, service_cities: [...p.service_cities, val] }));
    setCityInput('');
  };
  const removeCity = city => setProfile(p => ({ ...p, service_cities: p.service_cities.filter(c => c !== city) }));

  const addCert = () => {
    const val = certInput.trim();
    if (val && !profile.certifications.includes(val)) setProfile(p => ({ ...p, certifications: [...p.certifications, val] }));
    setCertInput('');
  };
  const removeCert = cert => setProfile(p => ({ ...p, certifications: p.certifications.filter(c => c !== cert) }));

  const toggleLanguage = lang => setProfile(p => ({
    ...p,
    languages: p.languages.includes(lang) ? p.languages.filter(l => l !== lang) : [...p.languages, lang],
  }));

  return (
    <div style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease' }}>

      {/* ══ COVER + PROFILE PHOTO HEADER ══ */}
      <div className="relative mb-20 rounded-3xl overflow-visible" style={{ animation: 'fadeUp 0.5s ease both' }}>
        {/* Cover */}
        <div className="relative w-full rounded-3xl overflow-hidden" style={{ height: 220 }}>
          {coverPreview ? (
            <img src={coverPreview} alt="cover" className="w-full h-full object-cover"
              onError={() => setCoverPreview('')} />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#0D0906 0%,#1C1917 35%,#2C1810 65%,#3D2208 100%)' }}>
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
                backgroundSize: '26px 26px',
              }} />
              <div className="absolute rounded-full" style={{ width: 200, height: 200, background: 'rgba(201,168,76,0.1)', filter: 'blur(60px)', top: -40, right: 40 }} />
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, position: 'relative' }}>Upload a cover banner</p>
            </div>
          )}
          {/* Cover upload button */}
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={coverLoading}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all"
            style={{ background: 'rgba(28,9,16,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(28,9,16,0.95)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(28,9,16,0.75)'; }}
          >
            {coverLoading ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <Camera size={13} />}
            {coverPreview ? 'Change Cover' : 'Upload Cover'}
          </button>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
        </div>

        {/* Floating profile photo */}
        <div className="absolute -bottom-14 left-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden"
              style={{ border: '4px solid #fff', boxShadow: '0 8px 32px rgba(28,9,16,0.2)' }}>
              {photoPreview ? (
                <img src={photoPreview} alt="avatar" className="w-full h-full object-cover"
                  onError={() => setPhotoPreview('')} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#8B1A3A,#6B1230)' }}>
                  {user?.full_name?.charAt(0)}
                </div>
              )}
            </div>
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={photoLoading}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ background: '#C9A84C', border: '2px solid #fff', boxShadow: '0 3px 10px rgba(201,168,76,0.4)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              {photoLoading ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <Camera size={13} style={{ color: '#fff' }} />}
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
        </div>

        {/* Name + badges — anchored to bottom-right of cover */}
        <div className="absolute -bottom-14 left-44 flex items-end gap-3">
          <div>
            <h2 className="font-bold text-[1.3rem]" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917' }}>
              {user?.business_name || user?.full_name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${user?.verified ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEF3C7] text-[#92400E]'}`}>
                {user?.verified ? <><ShieldCheck size={10} /> Verified</> : 'Pending'}
              </span>
              {user?.category_specialization && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize"
                  style={{ background: '#FDF0F4', color: '#8B1A3A' }}>
                  {user.category_specialization}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="flex gap-2 mb-6 flex-wrap" style={{ animation: 'fadeUp 0.5s ease 0.15s both' }}>
        {TABS.map(t => {
          const TIcon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-semibold transition-all duration-200"
              style={isActive ? {
                background: 'linear-gradient(135deg,#1C1917,#3D2208)',
                color: '#fff',
                boxShadow: '0 6px 20px rgba(28,9,16,0.25)',
              } : {
                background: '#fff',
                color: '#78716C',
                border: '1.5px solid #E8E1D9',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = '#1C1917'; e.currentTarget.style.color = '#1C1917'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = '#E8E1D9'; e.currentTarget.style.color = '#78716C'; } }}
            >
              <TIcon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ══ TAB CONTENT ══ */}
      <div style={{ animation: 'fadeUp 0.4s ease both' }}>

        {/* ─ PERSONAL TAB ─ */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Profile form */}
            <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 2px 16px rgba(28,9,16,0.06)' }}>
              <h3 className="font-bold mb-5 flex items-center gap-2"
                style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', fontSize: '1.1rem' }}>
                <User size={18} style={{ color: '#8B1A3A' }} /> Personal Information
              </h3>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <Input label="Full Name" name="full_name" value={profile.full_name}
                  onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} icon={User} required />
                <Input label="Email" value={user?.email || ''} icon={Mail} disabled hint="Email cannot be changed" />
                <Input label="Phone" name="phone" value={profile.phone}
                  onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} icon={Phone} />
                <Button type="submit" loading={profileLoad} fullWidth>
                  <Save size={15} /> Save Personal Info
                </Button>
              </form>
            </div>

            {/* Password */}
            <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 2px 16px rgba(28,9,16,0.06)' }}>
              <h3 className="font-bold mb-5 flex items-center gap-2"
                style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', fontSize: '1.1rem' }}>
                <Lock size={18} style={{ color: '#8B1A3A' }} /> Change Password
              </h3>
              <form onSubmit={handlePassSubmit} className="space-y-4">
                <Input label="Current Password" type="password" value={passwords.current_password}
                  onChange={e => setPasswords(p => ({ ...p, current_password: e.target.value }))} icon={Lock} required />
                <Input label="New Password" type="password" value={passwords.new_password}
                  onChange={e => setPasswords(p => ({ ...p, new_password: e.target.value }))} icon={Lock} required />
                <Input label="Confirm New Password" type="password" value={passwords.confirm_password}
                  onChange={e => setPasswords(p => ({ ...p, confirm_password: e.target.value }))} icon={Lock} required />
                <Button type="submit" loading={passLoad} variant="secondary" fullWidth>
                  <Lock size={15} /> Update Password
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* ─ BUSINESS TAB ─ */}
        {activeTab === 'business' && (
          <form onSubmit={handleProfileSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Business basics */}
              <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 2px 16px rgba(28,9,16,0.06)' }}>
                <h3 className="font-bold mb-5 flex items-center gap-2"
                  style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', fontSize: '1.1rem' }}>
                  <Building2 size={18} style={{ color: '#8B1A3A' }} /> Business Details
                </h3>
                <div className="space-y-4">
                  <Input label="Business Name" value={profile.business_name}
                    onChange={e => setProfile(p => ({ ...p, business_name: e.target.value }))} icon={Building2} />
                  <Textarea label="Business Description" value={profile.business_description}
                    onChange={e => setProfile(p => ({ ...p, business_description: e.target.value }))} rows={3} />
                  <Input label="Years of Experience" type="number" value={profile.years_experience}
                    onChange={e => setProfile(p => ({ ...p, years_experience: e.target.value }))} />

                  <div>
                    <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#3D2B1F' }}>Category Specialization</label>
                    <select value={profile.category_specialization}
                      onChange={e => setProfile(p => ({ ...p, category_specialization: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border text-[14px] focus:outline-none"
                      style={{ border: '1.5px solid #E8E1D9', color: '#1C1917', background: '#fff' }}>
                      <option value="">Select specialization</option>
                      {SERVICE_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Min Price (₹)" type="number" value={profile.min_price}
                      onChange={e => setProfile(p => ({ ...p, min_price: e.target.value }))} icon={IndianRupee} />
                    <Input label="Max Price (₹)" type="number" value={profile.max_price}
                      onChange={e => setProfile(p => ({ ...p, max_price: e.target.value }))} icon={IndianRupee} />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#3D2B1F' }}>Avg Response Time</label>
                    <select value={profile.avg_response_time}
                      onChange={e => setProfile(p => ({ ...p, avg_response_time: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border text-[14px] focus:outline-none"
                      style={{ border: '1.5px solid #E8E1D9', color: '#1C1917', background: '#fff' }}>
                      <option value="">Select response time</option>
                      {RESPONSE_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <Input label="GST Number" value={profile.gst_number}
                    onChange={e => setProfile(p => ({ ...p, gst_number: e.target.value }))}
                    placeholder="e.g. 22ABCDE1234F1Z5" />
                </div>
              </div>

              {/* Cities + Certifications */}
              <div className="space-y-6">

                {/* Service Cities */}
                <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 2px 16px rgba(28,9,16,0.06)' }}>
                  <h3 className="font-bold mb-4 flex items-center gap-2"
                    style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', fontSize: '1rem' }}>
                    <MapPin size={16} style={{ color: '#8B1A3A' }} /> Service Cities
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <input value={cityInput}
                      onChange={e => setCityInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCity(); } }}
                      className="flex-1 px-4 py-2.5 rounded-xl text-[13px] focus:outline-none transition-all"
                      style={{ border: '1.5px solid #E8E1D9', color: '#1C1917' }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#8B1A3A'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#E8E1D9'; }}
                      placeholder="Type city, press Enter" />
                    <button type="button" onClick={addCity}
                      className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all"
                      style={{ background: 'linear-gradient(135deg,#8B1A3A,#6B1230)' }}>Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.service_cities.map(city => (
                      <span key={city} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                        style={{ background: '#FDF0F4', color: '#8B1A3A', border: '1px solid rgba(139,26,58,0.2)' }}>
                        <MapPin size={10} /> {city}
                        <button type="button" onClick={() => removeCity(city)}
                          className="ml-0.5 rounded-full hover:bg-[#8B1A3A] hover:text-white transition-colors p-0.5">
                          <X size={9} />
                        </button>
                      </span>
                    ))}
                    {profile.service_cities.length === 0 && (
                      <p style={{ fontSize: 12, color: '#A8A29E' }}>No cities added yet</p>
                    )}
                  </div>
                </div>

                {/* Certifications */}
                <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 2px 16px rgba(28,9,16,0.06)' }}>
                  <h3 className="font-bold mb-4 flex items-center gap-2"
                    style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', fontSize: '1rem' }}>
                    <Award size={16} style={{ color: '#C9A84C' }} /> Certifications & Awards
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <input value={certInput}
                      onChange={e => setCertInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCert(); } }}
                      className="flex-1 px-4 py-2.5 rounded-xl text-[13px] focus:outline-none transition-all"
                      style={{ border: '1.5px solid #E8E1D9', color: '#1C1917' }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#C9A84C'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#E8E1D9'; }}
                      placeholder="e.g. Best Photographer 2024" />
                    <button type="button" onClick={addCert}
                      className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all"
                      style={{ background: 'linear-gradient(135deg,#C9A84C,#A88B38)' }}>Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.certifications.map(cert => (
                      <span key={cert} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                        style={{ background: '#FBF5E0', color: '#92400E', border: '1px solid rgba(201,168,76,0.3)' }}>
                        <Tag size={10} /> {cert}
                        <button type="button" onClick={() => removeCert(cert)}
                          className="ml-0.5 p-0.5 rounded-full hover:bg-[#C9A84C] hover:text-white transition-colors">
                          <X size={9} />
                        </button>
                      </span>
                    ))}
                    {profile.certifications.length === 0 && (
                      <p style={{ fontSize: 12, color: '#A8A29E' }}>No certifications added yet</p>
                    )}
                  </div>
                </div>

                {/* Online Presence */}
                <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 2px 16px rgba(28,9,16,0.06)' }}>
                  <h3 className="font-bold mb-5 flex items-center gap-2"
                    style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', fontSize: '1.05rem' }}>
                    <Globe size={16} style={{ color: '#8B1A3A' }} /> Online Presence
                  </h3>
                  <div className="space-y-4">
                    <Input label="Instagram URL" value={profile.instagram_url}
                      onChange={e => setProfile(p => ({ ...p, instagram_url: e.target.value }))}
                      icon={Link2} placeholder="https://instagram.com/yourbusiness" />
                    <Input label="Portfolio / Website URL" value={profile.portfolio_url}
                      onChange={e => setProfile(p => ({ ...p, portfolio_url: e.target.value }))}
                      icon={Globe} placeholder="https://yourwebsite.com" />
                  </div>
                </div>
              </div>

              {/* Languages — full width */}
              <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 2px 16px rgba(28,9,16,0.06)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', fontSize: '1.05rem' }}>
                      <Languages size={16} style={{ color: '#8B1A3A' }} /> Languages Spoken
                    </h3>
                    <p className="text-[11px] mt-0.5" style={{ color: '#A8A29E' }}>Select all languages you communicate in</p>
                  </div>
                  {profile.languages.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
                      style={{ background: 'rgba(139,26,58,0.08)', color: '#8B1A3A' }}>
                      {profile.languages.length} selected
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES_LIST.map(lang => {
                    const active = profile.languages.includes(lang);
                    return (
                      <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150"
                        style={active ? {
                          background: '#8B1A3A', color: '#fff', boxShadow: '0 2px 8px rgba(139,26,58,0.2)',
                        } : {
                          background: '#FDFAF7', color: '#57534E', border: '1.5px solid #E8E1D9',
                        }}
                        onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = '#8B1A3A'; e.currentTarget.style.color = '#8B1A3A'; } }}
                        onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#E8E1D9'; e.currentTarget.style.color = '#57534E'; } }}
                      >
                        {active && <Check size={11} strokeWidth={2.5} />}
                        {lang}
                      </button>
                    );
                  })}
                  {profile.languages.filter(l => !LANGUAGES_LIST.includes(l)).map(lang => (
                    <span key={lang} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                      style={{ background: '#8B1A3A', color: '#fff', boxShadow: '0 2px 8px rgba(139,26,58,0.2)' }}>
                      <Check size={11} strokeWidth={2.5} />
                      {lang}
                      <button type="button" onClick={() => toggleLanguage(lang)}
                        className="ml-0.5 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ border: '1.5px dashed #D6C9C0', background: '#FDFAF7' }}>
                    <Plus size={11} style={{ color: '#A8A29E' }} />
                    <input
                      value={customLangInput}
                      onChange={e => setCustomLangInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = customLangInput.trim();
                          if (val && !profile.languages.includes(val)) toggleLanguage(val);
                          setCustomLangInput('');
                        }
                      }}
                      placeholder="Add language…"
                      className="bg-transparent focus:outline-none text-[12px] w-28"
                      style={{ color: '#78716C' }}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <Button type="submit" loading={profileLoad} fullWidth>
                  <Save size={15} /> Save Business Details
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* ─ AVAILABILITY TAB ─ */}
        {activeTab === 'availability' && (
          <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 2px 16px rgba(28,9,16,0.06)' }}>
            <div className="flex items-start gap-4 mb-6" style={{ paddingBottom: '1.25rem', borderBottom: '1px solid #F0EBE5' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,#FDF0F4,#F5C8D4)' }}>
                <CalendarCheck size={22} style={{ color: '#8B1A3A' }} />
              </div>
              <div>
                <h3 className="font-bold text-[1.05rem]" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917' }}>Manage Availability</h3>
                <p style={{ fontSize: 13, color: '#78716C', marginTop: 2 }}>
                  Click any date to block or unblock it. Blocked dates won't be available to clients for booking.
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6">
              {[
                { color: '#DC2626', label: 'Booked' },
                { color: '#F59E0B', label: 'Blocked by you' },
                { color: '#059669', label: 'Available' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span style={{ fontSize: 12, color: '#78716C', fontWeight: 600 }}>{label}</span>
                </div>
              ))}
            </div>

            {calLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="spinner" style={{ width: 32, height: 32 }} />
              </div>
            ) : (
              <div style={{ maxWidth: 380 }}>
                <Calendar
                  bookedDates={bookedDates}
                  blockedDates={blockedDates}
                  vendorMode
                  onToggleBlock={handleToggleBlock}
                  interactive
                />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
