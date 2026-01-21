import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../components/list/ListToolbar';
import DataTable from '../../components/table/DataTable';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { getGDN } from '../../api';
import { useViewMode } from '../../hooks/useViewMode';

interface GDN {
  id: number;
  gdn_date: string;
  inventory_count: number;
  status: string;
  description: string;
  created_at: string;
  created_by: string;
  handed_over_to: string;
}

const GDNList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { viewMode, setViewMode, recordsPerPage } = useViewMode();
  const [gdns, setGdns] = useState<GDN[]>([]);
  const [filteredData, setFilteredData] = useState<GDN[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gdn' | 'pending'>('gdn');

  const fetchGDNs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getGDN();
      const rawData = Array.isArray(response?.data)
        ? response.data
        : response?.data?.items || response?.data?.data || response?.data?.gdn_details || [];

      const normalizedData = rawData.map((item: any) => {
        const statusValue = typeof item.status === 'string'
          ? item.status
          : item.status === true
            ? 'Completed'
            : 'Pending';

        return {
          id: item.id,
          gdn_date: item.gdn_date || '',
          inventory_count: item.inventory_count ?? item.gdn_inventory_details?.length ?? 0,
          status: statusValue,
          description: item.description || '-',
          created_at: item.created_at || '',
          created_by: item.created_by || item.created_by_id?.toString() || '-',
          handed_over_to: item.handed_over_to || '-',
        } as GDN;
      });

      setGdns(normalizedData);
      filterByTab(normalizedData, activeTab);
    } catch (error) {
      console.error('Error fetching GDNs:', error);
      toast.error('Failed to fetch GDNs');
      setGdns([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchGDNs();
  }, [fetchGDNs]);

  const filterByTab = (data: GDN[], tab: 'gdn' | 'pending') => {
    const safeData = Array.isArray(data) ? data : [];
    if (tab === 'pending') {
      setFilteredData(safeData.filter(g => g.status?.toLowerCase() === 'pending'));
    } else {
      setFilteredData(safeData);
    }
  };

  const handleTabChange = (tab: 'gdn' | 'pending') => {
    setActiveTab(tab);
    filterByTab(gdns, tab);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    const base = Array.isArray(gdns) ? gdns : [];
    let dataToFilter = activeTab === 'pending' 
      ? base.filter(g => g.status?.toLowerCase() === 'pending')
      : base;
    const filtered = dataToFilter.filter((item) =>
      item.description?.toLowerCase().includes(value.toLowerCase()) ||
      item.id?.toString().includes(value)
    );
    setFilteredData(filtered);
  };

  const columns = [
    {
      name: 'VIEW',
      width: '80px',
      cell: (row: GDN) => (
        <button
          onClick={() => navigate(`/inventory/gdn/${row.id}`)}
          className="text-primary hover:text-primary/80 transition-colors"
        >
          <Eye size={16} className="w-4 h-4" />
        </button>
      ),
    },
    { name: 'ID', selector: (row: GDN) => row.id, sortable: true, width: '80px' },
    { name: 'GDN DATE', selector: (row: GDN) => row.gdn_date ? new Date(row.gdn_date).toLocaleDateString() : '-', sortable: true },
    { name: 'INVENTORY COUNT', selector: (row: GDN) => row.inventory_count || 0, sortable: true },
    { 
      name: 'STATUS', 
      cell: (row: GDN) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          row.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        }`}>
          {row.status || 'Pending'}
        </span>
      ),
    },
    { name: 'DESCRIPTION', selector: (row: GDN) => row.description || '-', sortable: true },
    { name: 'CREATED ON', selector: (row: GDN) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-', sortable: true },
    { name: 'CREATED BY', selector: (row: GDN) => row.created_by || '-', sortable: true },
    { name: 'HANDED OVER TO', selector: (row: GDN) => row.handed_over_to || '-', sortable: true },
  ];

  const GDNCard = ({ gdn }: { gdn: GDN }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">GDN #{gdn.id}</h3>
            <p className="text-sm text-muted-foreground">{gdn.gdn_date ? new Date(gdn.gdn_date).toLocaleDateString() : '-'}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          gdn.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {gdn.status || 'Pending'}
        </span>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground mb-4">
        <p>Inventory Count: {gdn.inventory_count || 0}</p>
        <p>Handed To: {gdn.handed_over_to || '-'}</p>
        <p className="line-clamp-2">{gdn.description || '-'}</p>
      </div>
      <div className="flex justify-end pt-3 border-t border-border">
        <button onClick={() => navigate(`/inventory/gdn/${gdn.id}`)} className="text-primary hover:text-primary/80 transition-colors">
          <Eye size={16} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Inventory', path: '/inventory/gdn' }, { label: 'GDN' }]} />

      
      {/* Sub-tabs */}
      <div className="flex gap-4 mb-4 border-b border-border">
        <button onClick={() => handleTabChange('gdn')} className={`pb-2 px-4 ${activeTab === 'gdn' ? 'border-b-2 border-primary text-primary font-medium' : 'text-muted-foreground'}`}>GDN</button>
        <button onClick={() => handleTabChange('pending')} className={`pb-2 px-4 ${activeTab === 'pending' ? 'border-b-2 border-primary text-primary font-medium' : 'text-muted-foreground'}`}>GDN Pending</button>
      </div>

      <ListToolbar searchPlaceholder="Search by ID, Status, Description" searchValue={searchText} onSearchChange={handleSearch} viewMode={viewMode} onViewModeChange={setViewMode} showViewToggle showAddButton addButtonLabel="Add" onAddClick={() => navigate('/inventory/gdn/create')} showFilter={false} />

      {viewMode === 'grid' ? (
        <div className="mt-4">
          {loading ? <div className="text-center py-10 text-muted-foreground">Loading...</div> : filteredData.length === 0 ? <div className="text-center py-10 text-muted-foreground">No GDNs found</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredData.slice(0, recordsPerPage).map((gdn) => <GDNCard key={gdn.id} gdn={gdn} />)}
            </div>
          )}
        </div>
      ) : (
        <DataTable columns={columns} data={filteredData} loading={loading} pagination paginationPerPage={recordsPerPage} />
      )}
    </div>
  );
};

export default GDNList;
