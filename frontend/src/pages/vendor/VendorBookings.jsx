import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { vendorAPI } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';

const TABS = ['requests', 'all'];

export default function VendorBookings() {
  const [tab, setTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const [rr, ar] = await Promise.allSettled([
      vendorAPI.getBookingRequests(),
      vendorAPI.getAllBookings(),
    ]);
    if (rr.status === 'fulfilled') setRequests(rr.value.data.bookings || []);
    if (ar.status === 'fulfilled') setAllBookings(ar.value.data.bookings || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const changeStatus = async (id, status) => {
    setActionId(id);
    try {
      await vendorAPI.changeBookingStatus(id, status);
      toast.success(`Booking ${status}!`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
    setActionId(null);
  };

  if (loading) return <PageSpinner />;

  const display = tab === 'requests' ? requests : allBookings;

  return (
    <div>
      <PageHeader title="Booking Requests" subtitle={`${requests.length} pending requests`} />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-primary text-white' : 'bg-white border border-border text-muted hover:border-primary hover:text-primary'
            }`}>
            {t === 'requests' ? `Pending Requests (${requests.length})` : `All Bookings (${allBookings.length})`}
          </button>
        ))}
      </div>

      {display.length === 0 ? (
        <EmptyState icon={Calendar} title="No bookings found" description="Booking requests will appear here." />
      ) : (
        <div className="space-y-4">
          {display.map(b => (
            <Card key={b._id} padding={false}>
              <div className="p-5 flex flex-col sm:flex-row gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                  <Calendar size={22} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-[#1A1A18]">{b.service?.title}</h3>
                    <Badge status={b.status}>{b.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-[#6B6B65]">Client</div>
                      <div className="font-medium text-[#1A1A18]">{b.client?.full_name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#6B6B65]">Date</div>
                      <div className="font-medium text-[#1A1A18]">
                        {new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#6B6B65]">Amount</div>
                      <div className="font-bold text-[#D97706]">₹{b.total_amount?.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#6B6B65]">Phone</div>
                      <div className="font-medium text-[#1A1A18]">{b.client?.phone || '—'}</div>
                    </div>
                  </div>
                  {b.notes && <p className="text-xs text-[#6B6B65] mt-2 italic">"{b.notes}"</p>}
                </div>

                {/* Actions */}
                <div className="flex flex-row sm:flex-col gap-2 justify-end">
                  {b.status === 'pending' && (
                    <>
                      <Button size="sm" variant="success" loading={actionId === b._id}
                        onClick={() => changeStatus(b._id, 'confirmed')}>
                        <CheckCircle size={14} /> Accept
                      </Button>
                      <Button size="sm" variant="danger" loading={actionId === b._id}
                        onClick={() => changeStatus(b._id, 'cancelled')}>
                        <XCircle size={14} /> Reject
                      </Button>
                    </>
                  )}
                  {b.status === 'confirmed' && (
                    <Button size="sm" variant="secondary" loading={actionId === b._id}
                      onClick={() => changeStatus(b._id, 'completed')}>
                      <Clock size={14} /> Mark Done
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
