import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, UserCheck, Phone, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminAPI } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import { Textarea } from '../../components/ui/Input';

export default function AdminVendorApprovals() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchVendors = () => {
    adminAPI.getVendorRequests().then(r => setVendors(r.data.vendors || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchVendors(); }, []);

  const handleAccept = async (id) => {
    setActionId(id);
    try {
      await adminAPI.acceptVendor(id);
      toast.success('Vendor approved! Email sent.');
      fetchVendors();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setActionId(null);
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await adminAPI.rejectVendor(rejectModal, rejectReason);
      toast.success('Vendor rejected.');
      setRejectModal(null);
      setRejectReason('');
      fetchVendors();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSubmitting(false);
  };

  if (loading) return <PageSpinner />;

  return (
    <div>
      <PageHeader title="Vendor Approvals" subtitle={`${vendors.length} pending vendor registrations`} />

      {vendors.length === 0 ? (
        <EmptyState icon={UserCheck} title="All caught up!" description="No pending vendor registrations." />
      ) : (
        <div className="space-y-4">
          {vendors.map(v => (
            <Card key={v._id} padding={false}>
              <div className="p-5 flex flex-col sm:flex-row gap-4">
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#BE185D] to-[#9D174D] flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {v.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1A1A18] text-lg">{v.full_name}</h3>
                  {v.business_name && <div className="text-sm text-[#6B6B65] mb-2">{v.business_name}</div>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-[#6B6B65]">
                      <Mail size={13} />
                      {v.email}
                    </div>
                    {v.phone && (
                      <div className="flex items-center gap-2 text-[#6B6B65]">
                        <Phone size={13} />
                        {v.phone}
                      </div>
                    )}
                  </div>
                  {v.business_description && (
                    <p className="text-xs text-[#6B6B65] mt-2 italic line-clamp-2">"{v.business_description}"</p>
                  )}
                  {v.years_experience > 0 && (
                    <div className="text-xs text-[#6B6B65] mt-1">{v.years_experience} years of experience</div>
                  )}
                  <div className="text-xs text-[#6B6B65] mt-1">
                    Registered: {new Date(v.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col gap-2">
                  <Button size="sm" variant="success" loading={actionId === v._id}
                    onClick={() => handleAccept(v._id)}>
                    <CheckCircle size={14} /> Approve
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setRejectModal(v._id)}>
                    <XCircle size={14} /> Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Vendor"
        footer={<>
          <Button variant="secondary" onClick={() => setRejectModal(null)}>Cancel</Button>
          <Button variant="danger" loading={submitting} onClick={handleReject}>Reject Vendor</Button>
        </>}>
        <div className="space-y-3">
          <p className="text-sm text-[#6B6B65]">The vendor will receive an email with your rejection reason.</p>
          <Textarea label="Reason for rejection (optional)" name="reason" value={rejectReason}
            onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Incomplete business information" rows={3} />
        </div>
      </Modal>
    </div>
  );
}
