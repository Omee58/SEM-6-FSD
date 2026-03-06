import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Star, MapPin, Heart } from 'lucide-react';
import { clientAPI } from '../../services/api';
import { SERVICE_CATEGORIES } from '../../constants/categories';
import PageHeader from '../../components/ui/PageHeader';
import { PageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Select from '../../components/ui/Select';

export default function ClientServices() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (sort) params.sort = sort;
      const res = await clientAPI.getServices(params);
      setServices(res.data.services || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, [category, sort]);

  const handleSearch = e => { e.preventDefault(); fetchServices(); };

  return (
    <div>
      <PageHeader title="Browse Services" subtitle="Discover the finest wedding vendors across India" />

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E8E8E4] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B65]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search services, vendors..."
                className="input-base pl-9"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-[#BE185D] text-white rounded-[10px] text-sm font-medium hover:bg-[#9D174D] transition-colors">
              Search
            </button>
          </form>
          <div className="flex gap-3">
            <Select
              name="category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="All Categories"
              options={SERVICE_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
              className="w-44"
            />
            <Select
              name="sort"
              value={sort}
              onChange={e => setSort(e.target.value)}
              placeholder="Sort by"
              options={[
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
                { value: 'rating', label: 'Top Rated' },
              ]}
              className="w-44"
            />
          </div>
        </div>
      </div>

      {loading ? <PageSpinner /> : services.length === 0 ? (
        <EmptyState icon={Search} title="No services found" description="Try different search terms or clear filters." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(svc => (
            <div
              key={svc._id}
              onClick={() => navigate(`/services/${svc._id}`)}
              className="group bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden hover:shadow-[0_10px_40px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div className="h-48 bg-linear-to-br from-[#FCE7F3] to-[#FEE2E2] relative overflow-hidden">
                {svc.images?.[0] ? (
                  <img
                    src={`${import.meta.env.VITE_UPLOAD_URL}/${svc.images[0]}`}
                    alt={svc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Heart size={48} className="text-[#BE185D]/20" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-[#BE185D] capitalize">
                  {svc.category}
                </div>
                {svc.avg_rating > 0 && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 text-xs font-semibold text-[#D97706]">
                    <Star size={11} className="fill-current" />
                    {svc.avg_rating.toFixed(1)}
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-[#1A1A18] mb-1 group-hover:text-[#BE185D] transition-colors line-clamp-1">{svc.title}</h3>
                <p className="text-xs text-[#6B6B65] mb-3 line-clamp-2">{svc.description}</p>
                <div className="flex items-center gap-1 text-xs text-[#6B6B65] mb-3">
                  <MapPin size={11} />
                  {svc.location}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#6B6B65]">Starting from</div>
                    <div className="text-xl font-bold text-[#BE185D]">₹{svc.price?.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="text-xs text-[#6B6B65]">{svc.vendor?.full_name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
