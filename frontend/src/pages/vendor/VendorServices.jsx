import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Image, Package, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { vendorAPI } from '../../services/api';
import { SERVICE_CATEGORIES } from '../../constants/categories';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Input, { Textarea } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';

const EMPTY = { title: '', description: '', price: '', category: '', location: '', status: 'active' };

export default function VendorServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const fileRef = useRef();

  const fetchServices = () => {
    vendorAPI.getMyServices().then(r => setServices(r.data.services || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setImages([]); setPreviews([]); setModalOpen(true); };
  const openEdit = svc => {
    setEditing(svc);
    setForm({ title: svc.title, description: svc.description, price: svc.price, category: svc.category, location: svc.location, status: svc.status });
    setPreviews(svc.images?.map(img => `${import.meta.env.VITE_UPLOAD_URL}/${img}`) || []);
    setImages([]);
    setModalOpen(true);
  };

  const handleFiles = e => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
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
    <div>
      <PageHeader
        title="My Services"
        subtitle={`${services.length} services listed`}
        action={<Button onClick={openAdd}><Plus size={16} /> Add Service</Button>}
      />

      {services.length === 0 ? (
        <EmptyState icon={Package} title="No services yet"
          description="Add your first service to start receiving bookings."
          actionLabel="Add Service" onAction={openAdd} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(svc => (
            <Card key={svc._id} padding={false} className="overflow-hidden">
              <div className="h-44 bg-linear-to-br from-primary-light to-[#CCDCEE] relative">
                {svc.images?.[0] ? (
                  <img src={`${import.meta.env.VITE_UPLOAD_URL}/${svc.images[0]}`}
                    alt={svc.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image size={32} className="text-primary/30" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge status={svc.status}>{svc.status}</Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[#1A1A18] mb-1 line-clamp-1">{svc.title}</h3>
                <p className="text-xs text-[#6B6B65] mb-3 line-clamp-2">{svc.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-bold text-primary">₹{svc.price?.toLocaleString('en-IN')}</div>
                  <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full capitalize">{svc.category}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(svc)}>
                    <Edit2 size={13} /> Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteId(svc._id)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="lg"
        title={editing ? 'Edit Service' : 'Add New Service'}
        footer={<>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button loading={submitting} onClick={handleSubmit}>{editing ? 'Save Changes' : 'Add Service'}</Button>
        </>}
      >
        <div className="space-y-4">
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
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
            <Input label="Location" name="location" value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
          <Textarea label="Description" name="description" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />

          {/* Image Upload */}
          <div>
            <label className="text-sm font-medium text-[#1A1A18] block mb-2">Images</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-5 text-center cursor-pointer hover:border-primary hover:bg-primary-light transition-colors"
            >
              <Image size={24} className="text-[#6B6B65] mx-auto mb-2" />
              <p className="text-sm text-[#6B6B65]">Click to upload images (JPEG, PNG, WebP — max 5MB each)</p>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
                onChange={handleFiles} />
            </div>
            {previews.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {previews.map((p, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#E8E8E4]">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => { const n = [...previews]; n.splice(i, 1); setPreviews(n); const ni = [...images]; ni.splice(i, 1); setImages(ni); }}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#DC2626] rounded-full flex items-center justify-center">
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Service"
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </>}>
        <p className="text-sm text-[#6B6B65]">Are you sure you want to delete this service? All related data will be removed.</p>
      </Modal>
    </div>
  );
}
