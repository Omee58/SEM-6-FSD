import { useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import { adminAPI } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import Select from '../../components/ui/Select';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const r = await adminAPI.getAllUsers({ search, role, page, limit: 10 });
      setUsers(r.data.users || []);
      setTotal(r.data.pagination?.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [search, role, page]);

  const columns = [
    {
      header: 'Name',
      key: 'name',
      render: u => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#BE185D] to-[#9D174D] flex items-center justify-center text-white text-sm font-bold shrink-0">
            {u.full_name?.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-[#1A1A18]">{u.full_name}</div>
            <div className="text-xs text-[#6B6B65]">{u.email}</div>
          </div>
        </div>
      ),
    },
    { header: 'Phone', key: 'phone', render: u => u.phone || '—' },
    {
      header: 'Role',
      key: 'role',
      render: u => <Badge status={u.role}>{u.role}</Badge>,
    },
    {
      header: 'Status',
      key: 'status',
      render: u => u.role === 'vendor'
        ? <Badge status={u.verified ? 'verified' : 'unverified'}>{u.verified ? 'Verified' : 'Unverified'}</Badge>
        : <Badge status="active">Active</Badge>,
    },
    {
      header: 'Joined',
      key: 'createdAt',
      render: u => new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    },
  ];

  return (
    <div>
      <PageHeader title="All Users" subtitle={`${total} total users`} />

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E8E8E4] p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B65]" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..." className="input-base pl-9" />
        </div>
        <Select name="role" value={role} onChange={e => { setRole(e.target.value); setPage(1); }}
          placeholder="All Roles"
          options={[{ value: 'client', label: 'Clients' }, { value: 'vendor', label: 'Vendors' }, { value: 'admin', label: 'Admins' }]}
          className="w-36" />
      </div>

      <DataTable columns={columns} data={users} loading={loading}
        emptyTitle="No users found" emptyDesc="Try different search filters." />

      {/* Pagination */}
      {total > 10 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(Math.ceil(total / 10))].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-[#BE185D] text-white' : 'bg-white border border-[#E8E8E4] text-[#6B6B65] hover:border-[#BE185D]'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
