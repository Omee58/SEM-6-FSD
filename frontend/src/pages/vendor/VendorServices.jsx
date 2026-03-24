import { useState, useEffect, useRef } from 'react';
import {
  Plus, Edit2, Trash2, Image, Package, X, Star, MapPin,
  Sparkles, Camera, Utensils, Building2, Flower2, Music2,
  Palette, Car, Wand2, IndianRupee, Tag, Upload, Clock,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { vendorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { imgUrl } from '../../utils/imageUrl';
import { SERVICE_CATEGORIES } from '../../constants/categories';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Input, { Textarea } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { PageSpinner } from '../../components/ui/Spinner';

const CATEGORY_META = {
  photography: { icon: Camera,   color: '#8B1A3A', bg: 'rgba(139,26,58,0.12)'  },
  catering:    { icon: Utensils, color: '#C9A84C', bg: 'rgba(201,168,76,0.12)' },
  venue:       { icon: Building2,color: '#2563EB', bg: 'rgba(37,99,235,0.12)'  },
  decoration:  { icon: Flower2,  color: '#059669', bg: 'rgba(5,150,105,0.12)'  },
  music:       { icon: Music2,   color: '#0891B2', bg: 'rgba(8,145,178,0.12)'  },
  makeup:      { icon: Palette,  color: '#DB2777', bg: 'rgba(219,39,119,0.12)' },
  transport:   { icon: Car,      color: '#D97706', bg: 'rgba(217,119,6,0.12)'  },
  other:       { icon: Wand2,    color: '#6D28D9', bg: 'rgba(109,40,217,0.12)' },
  mehendi:     { icon: Flower2,  color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
};

const EMPTY = { title: '', description: '', price: '', category: '', location: '', status: 'active' };

function FloatOrb({ size, color, style: s }) {
  return (
    <div className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, background: color, filter: 'blur(50px)', animation: 'floatSlow 7s ease-in-out infinite', ...s }} />
  );
}

export default function VendorServices() {
  const { user } = useAuth();
  const isVerified = user?.verified;
  const [services,   setServices]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [images,     setImages]     = useState([]);
  const [previews,   setPreviews]   = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);
  const [mounted,    setMounted]    = useState(false);
  const [dragOver,   setDragOver]   = useState(false);
  const fileRef = useRef();

  const fetchServices = () => {
    vendorAPI.getMyServices()
      .then(r => setServices(r.data.services || []))
      .catch(() => {})
      .finally(() => { setLoading(false); setTimeout(() => setMounted(true), 60); });
  };
  useEffect(() => { fetchServices(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setImages([]); setPreviews([]); setModalOpen(true); };
  const openEdit = svc => {
    setEditing(svc);
    setForm({ title: svc.title, description: svc.description, price: svc.price, category: svc.category, location: svc.location, status: svc.status });
    setPreviews(svc.images?.map(img => imgUrl(img)).filter(Boolean) || []);
    setImages([]);
    setModalOpen(true);
  };

  const handleFiles = files => {
    const arr = Array.from(files);
    setImages(arr);
    setPreviews(arr.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.category) { toast.error('Title, price, and category are required'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));
      if (editing) {
        await vendorAPI.updateService(editing._id, fd);
        toast.success('Service updated!');
      } else {
        await vendorAPI.addService(fd);
        toast.success('Service added!');
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    try {
      await vendorAPI.deleteService(deleteId);
      toast.success('Service deleted');
      setDeleteId(null);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      <div className="space-y-6">

        {/* ══ HERO ══ */}
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: 'linear-gradient(135deg,#0D0906 0%,#1C1917 35%,#1A2A10 65%,#0F3020 100%)',
            backgroundSize: '300% 300%',
            animation: 'gradientShift 10s ease infinite',
            minHeight: 180,
            padding: '32px 40px',
          }}
        >
          <FloatOrb size={200} color="rgba(5,150,105,0.12)" style={{ top: -50, right: 40 }} />
          <FloatOrb size={140} color="rgba(201,168,76,0.1)" style={{ bottom: -30, right: 200, animationDelay: '3s' }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }} />

          <div className="relative flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[11px] font-bold uppercase tracking-widest"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
                <Package size={11} style={{ color: '#C9A84C' }} /> Service Listings
              </div>
              <h1 className="text-white font-bold mb-1"
                style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.4rem,3vw,2rem)', letterSpacing: '-0.01em' }}>
                My Services
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                {services.length > 0
                  ? `${services.length} service${services.length === 1 ? '' : 's'} listed · attract more clients with great photos`
                  : 'Add your first service to start receiving bookings'}
              </p>
            </div>
            <button
              onClick={isVerified ? openAdd : undefined}
              disabled={!isVerified}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[13px] font-bold text-white shrink-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#C9A84C,#A88B38)', boxShadow: '0 6px 20px rgba(201,168,76,0.35)' }}
              onMouseEnter={e => { if (isVerified) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(201,168,76,0.45)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px rgba(201,168,76,0.35)'; }}
            >
              <Plus size={16} /> Add Service
            </button>
          </div>
        </div>

        {/* ══ PENDING APPROVAL BANNER ══ */}
        {!isVerified && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-2"
            style={{ background: '#FEF3C7', border: '1px solid #FCD34D' }}>
            <Clock size={18} style={{ color: '#D97706', flexShrink: 0 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#92400E' }}>Account Pending Approval</p>
              <p className="text-xs mt-0.5" style={{ color: '#B45309' }}>
                Your vendor account is awaiting admin verification. You can add and manage services once approved.
              </p>
            </div>
          </div>
        )}

        {/* ══ SERVICE GRID ══ */}
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl"
            style={{ background: 'linear-gradient(135deg,#FDFAF7,#fff)', border: '2px dashed #E8E1D9' }}>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{ background: 'linear-gradient(135deg,#FBF5E0,#F5EDE4)', boxShadow: '0 8px 24px rgba(201,168,76,0.15)' }}>
              <Package size={36} style={{ color: '#C9A84C', opacity: 0.7 }} />
            </div>
            <h3 className="font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#1C1917' }}>
              No Services Yet
            </h3>
            <p className="text-[14px] mb-6 text-center max-w-sm" style={{ color: '#78716C' }}>
              Add your first service with photos, pricing, and description to start attracting clients.
            </p>
            <button onClick={isVerified ? openAdd : undefined}
              disabled={!isVerified}
              className="flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#C9A84C,#A88B38)', boxShadow: '0 6px 20px rgba(201,168,76,0.35)', fontSize: 13 }}>
              <Plus size={16} /> Add First Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, idx) => {
              const meta = CATEGORY_META[svc.category] || CATEGORY_META.other;
              const CatIcon = meta.icon;
              return (
                <div key={svc._id}
                  className="group rounded-2xl overflow-hidden cursor-pointer relative"
                  style={{
                    background: '#fff',
                    boxShadow: '0 2px 16px rgba(28,9,16,0.07)',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                    transition: `all 0.5s cubic-bezier(0.4,0,0.2,1) ${idx * 0.07}s, box-shadow 0.25s ease`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 56px rgba(28,9,16,0.15)'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(28,9,16,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ height: 220, background: `linear-gradient(135deg,${meta.bg},rgba(253,246,238,0.5))` }}>
                    {svc.images?.[0] ? (
                      <img src={imgUrl(svc.images[0])}
                        alt={svc.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: meta.bg }}>
                          <CatIcon size={32} style={{ color: meta.color }} />
                        </div>
                        <span className="text-[12px] font-semibold capitalize" style={{ color: meta.color }}>{svc.category}</span>
                      </div>
                    )}

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                      style={{ background: 'linear-gradient(to top,rgba(13,5,9,0.85) 0%,rgba(13,5,9,0.2) 55%,transparent 100%)' }} />

                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <Badge status={svc.status}>{svc.status}</Badge>
                    </div>

                    {/* Category pill */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize"
                      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', color: meta.color }}>
                      <CatIcon size={10} />
                      {svc.category}
                    </div>

                    {/* Rating */}
                    {svc.avg_rating > 0 && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', color: '#C9A84C' }}>
                        <Star size={10} className="fill-current" />
                        {svc.avg_rating.toFixed(1)}
                      </div>
                    )}

                    {/* Hover action buttons */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                      <button
                        onClick={e => { e.stopPropagation(); openEdit(svc); }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.transform = ''; }}
                      >
                        <Edit2 size={13} style={{ color: '#1C1917' }} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteId(svc._id); }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: 'rgba(220,38,38,0.85)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.85)'; e.currentTarget.style.transform = ''; }}
                      >
                        <Trash2 size={13} style={{ color: '#fff' }} />
                      </button>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <h3 className="font-bold mb-1 line-clamp-1"
                      style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#1C1917' }}>
                      {svc.title}
                    </h3>
                    <p className="text-[12px] mb-3 line-clamp-2 leading-relaxed" style={{ color: '#78716C' }}>
                      {svc.description}
                    </p>

                    <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #F5EDE4' }}>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#A8A29E' }}>Starting from</div>
                        <div className="font-bold" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#C9A84C' }}>
                          ₹{svc.price?.toLocaleString('en-IN')}
                        </div>
                      </div>
                      {svc.location && (
                        <div className="flex items-center gap-1 text-[11px]" style={{ color: '#A8A29E' }}>
                          <MapPin size={10} /> {svc.location}
                        </div>
                      )}
                    </div>

                    {/* Bottom edit/delete bar */}
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => openEdit(svc)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold transition-all"
                        style={{ background: '#F0EBE5', color: '#78716C' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#E8E1D9'; e.currentTarget.style.color = '#1C1917'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#F0EBE5'; e.currentTarget.style.color = '#78716C'; }}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => setDeleteId(svc._id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all"
                        style={{ background: '#FEF2F2', color: '#DC2626' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ ADD/EDIT MODAL ══ */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        size="lg"
        title={editing ? 'Edit Service' : 'Add New Service'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={submitting} onClick={handleSubmit}>
              {editing ? 'Save Changes' : 'Add Service'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Image upload area */}
          <div>
            <label className="block text-[13px] font-semibold mb-2" style={{ color: '#3D2B1F' }}>Photos</label>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              className="rounded-2xl p-6 text-center cursor-pointer transition-all duration-200"
              style={{
                border: `2px dashed ${dragOver ? '#C9A84C' : '#E8E1D9'}`,
                background: dragOver ? 'rgba(201,168,76,0.06)' : '#FAFAF8',
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'linear-gradient(135deg,#FBF5E0,#F5EDE4)' }}>
                <Upload size={20} style={{ color: '#C9A84C' }} />
              </div>
              <p className="text-[13px] font-semibold" style={{ color: '#1C1917' }}>Drop photos here or click to upload</p>
              <p className="text-[11px] mt-1" style={{ color: '#A8A29E' }}>JPEG, PNG, WebP — max 5MB each</p>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
                onChange={e => handleFiles(e.target.files)} />
            </div>
            {previews.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {previews.map((p, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group"
                    style={{ border: '1px solid #E8E1D9' }}>
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { const n = [...previews]; n.splice(i, 1); setPreviews(n); const ni = [...images]; ni.splice(i, 1); setImages(ni); }}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.5)' }}>
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Service Title" name="title" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="col-span-2" />
            <Select label="Category" name="category" value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              options={SERVICE_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
              placeholder="Select category" required />
            <Select label="Status" name="status" value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (₹)" name="price" type="number" value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required icon={IndianRupee} />
            <Input label="Location" name="location" value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))} icon={MapPin} />
          </div>
          <Textarea label="Description" name="description" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
        </div>
      </Modal>

      {/* ══ DELETE CONFIRM ══ */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Service"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Yes, Delete</Button>
          </>
        }>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: '#FEF2F2' }}>
            <Trash2 size={22} style={{ color: '#DC2626' }} />
          </div>
          <div>
            <p className="font-semibold mb-1" style={{ color: '#1C1917' }}>Are you sure?</p>
            <p className="text-[13px]" style={{ color: '#78716C' }}>
              This will permanently delete the service and all related data. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
