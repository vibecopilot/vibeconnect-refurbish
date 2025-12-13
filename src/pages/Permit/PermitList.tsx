import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Edit } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ListToolbar from '../../components/ui/ListToolbar';
import { getPermits } from '../../api';
import { dateFormatSTD } from '../../utils/dateUtils';

interface Permit {
  id: number;
  permit_type?: string;
  permit_type_name?: string;
  permit_for?: string;
  created_by_name?: string;
  status?: string;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  created_at?: string;
  permit_expiry_date?: string;
  permit_expiry_time?: string;
}

interface PermitStats {
  total: number;
  draft: number;
  open: number;
  approved: number;
  rejected: number;
  extended: number;
  closed: number;
}

const STATUS_FILTERS = [
  { key: 'total', label: 'Total Permits', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'draft', label: 'Draft Permits', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { key: 'open', label: 'Open Permits', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { key: 'approved', label: 'Approved Permits', color: 'bg-green-100 text-green-700 border-green-200' },
  { key: 'rejected', label: 'Rejected Permits', color: 'bg-red-100 text-red-700 border-red-200' },
  { key: 'extended', label: 'Extended Permits', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { key: 'closed', label: 'Closed Permits', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

const PermitList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [permits, setPermits] = useState<Permit[]>([]);
  const [filteredPermits, setFilteredPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string>('total');
  const [stats, setStats] = useState<PermitStats>({
    total: 0,
    draft: 0,
    open: 0,
    approved: 0,
    rejected: 0,
    extended: 0,
    closed: 0,
  });

  const recordsPerPage = viewMode === 'grid' ? 12 : 10;

  useEffect(() => {
    fetchPermits();
  }, []);

  useEffect(() => {
    filterPermits();
  }, [searchValue, permits, activeFilter]);

  const fetchPermits = async () => {
    try {
      setLoading(true);
      const res = await getPermits();
      const data = res.data;
      const permitArray = Array.isArray(data) ? data : (data?.permits || data?.data || []);
      setPermits(permitArray);
      
      // Calculate stats
      const newStats: PermitStats = {
        total: permitArray.length,
        draft: 0,
        open: 0,
        approved: 0,
        rejected: 0,
        extended: 0,
        closed: 0,
      };
      
      permitArray.forEach((permit: Permit) => {
        const status = String(permit.status || '').toLowerCase();
        if (status.includes('draft')) newStats.draft++;
        else if (status.includes('open')) newStats.open++;
        else if (status.includes('approved')) newStats.approved++;
        else if (status.includes('rejected')) newStats.rejected++;
        else if (status.includes('extended')) newStats.extended++;
        else if (status.includes('closed')) newStats.closed++;
      });
      
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching permits:', error);
      setPermits([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPermits = () => {
    let filtered = [...permits];
    
    // Apply status filter
    if (activeFilter !== 'total') {
      filtered = filtered.filter((permit) => {
        const status = String(permit.status || '').toLowerCase();
        return status.includes(activeFilter);
      });
    }
    
    // Apply search filter
    if (searchValue) {
      filtered = filtered.filter(
        (permit) =>
          permit.permit_for?.toLowerCase().includes(searchValue.toLowerCase()) ||
          String(permit.id).includes(searchValue)
      );
    }
    
    setFilteredPermits(filtered);
    setCurrentPage(1);
  };

  const paginatedData = filteredPermits.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const totalPages = Math.ceil(filteredPermits.length / recordsPerPage);

  const getStatusColor = (status?: string) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('draft')) return 'bg-gray-100 text-gray-700 border-gray-200';
    if (s.includes('open')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (s.includes('approved')) return 'bg-green-100 text-green-700 border-green-200';
    if (s.includes('rejected')) return 'bg-red-100 text-red-700 border-red-200';
    if (s.includes('extended')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (s.includes('closed')) return 'bg-slate-100 text-slate-700 border-slate-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'Safety', path: '/safety/incident' },
        { label: 'Permit' }
      ]} />

      {/* Status Pills */}
      <div className="flex flex-wrap gap-3 mb-6 mt-4">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              activeFilter === filter.key
                ? `${filter.color} ring-2 ring-offset-2 ring-primary`
                : `${filter.color} hover:opacity-80`
            }`}
          >
            {filter.label}: {stats[filter.key as keyof PermitStats]}
          </button>
        ))}
      </div>

      <ListToolbar
        searchPlaceholder="Search by Permit for..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={() => {}}
        onExport={() => {}}
        onAdd={() => navigate('/safety/permit/create')}
        addLabel="Add"
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedData.map((permit) => (
            <div
              key={permit.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">#{permit.id}</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(permit.status)}`}>
                  {permit.status || 'Draft'}
                </span>
              </div>
              
              <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">
                {permit.permit_type_name || permit.permit_type || 'No Type'}
              </h3>
              
              <div className="space-y-1 text-xs text-muted-foreground mb-4">
                <p><span className="font-medium">Permit For:</span> {permit.permit_for || '-'}</p>
                <p><span className="font-medium">Building:</span> {permit.building_name || '-'}</p>
                <p><span className="font-medium">Floor:</span> {permit.floor_name || '-'}</p>
                <p><span className="font-medium">Expiry:</span> {permit.permit_expiry_date ? dateFormatSTD(permit.permit_expiry_date) : '-'}</p>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Link
                  to={`/safety/permit/${permit.id}`}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Eye className="w-4 h-4 text-primary" />
                </Link>
                <Link
                  to={`/safety/permit/${permit.id}/edit`}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Permit Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Permit For</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Created By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Building</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Floor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Created Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Expiry Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Expiry Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedData.map((permit) => (
                  <tr key={permit.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link to={`/safety/permit/${permit.id}`}>
                          <Eye className="w-4 h-4 text-primary hover:text-primary/80" />
                        </Link>
                        <Link to={`/safety/permit/${permit.id}/edit`}>
                          <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{permit.id}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{permit.permit_type_name || permit.permit_type || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{permit.permit_for || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{permit.created_by_name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(permit.status)}`}>
                        {permit.status || 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{permit.building_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{permit.floor_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{permit.unit_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{permit.created_at ? dateFormatSTD(permit.created_at) : '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{permit.permit_expiry_date ? dateFormatSTD(permit.permit_expiry_date) : '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{permit.permit_expiry_time || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, filteredPermits.length)} of {filteredPermits.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border hover:bg-muted'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {!loading && paginatedData.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No permits found</p>
        </div>
      )}
    </div>
  );
};

export default PermitList;
