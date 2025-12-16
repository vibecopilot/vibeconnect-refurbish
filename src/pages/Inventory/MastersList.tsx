import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../components/list/ListToolbar';
import DataTable from '../../components/table/DataTable';
import PageHeader from '../../components/layout/PageHeader';
import { getInventory } from '../../api';
import { useViewMode } from '../../hooks/useViewMode';

interface Master {
  id: number;
  name: string;
  code: string;
  serial_number: string;
  item_type: string;
  group_name: string;
  sub_group_name: string;
  category: string;
  criticality: string;
  unit: string;
  cost: number;
  sac_hsn_code: string;
  min_stock_level: number;
  min_order_level: number;
  quantity: number;
  status: string;
  expiry_date: string;
  created_at: string;
}

const MastersList: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode, recordsPerPage } = useViewMode();
  const [masters, setMasters] = useState<Master[]>([]);
  const [filteredData, setFilteredData] = useState<Master[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMasters = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getInventory();
      const data = Array.isArray(response?.data) ? response.data : [];
      setMasters(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching masters:', error);
      toast.error('Failed to fetch masters');
      setMasters([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMasters();
  }, [fetchMasters]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    const dataToFilter = Array.isArray(masters) ? masters : [];
    const filtered = dataToFilter.filter((item) =>
      item.name?.toLowerCase().includes(value.toLowerCase()) ||
      item.code?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const columns = [
    {
      name: 'ACTION',
      width: '100px',
      cell: (row: Master) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/inventory/masters/${row.id}`)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate(`/inventory/masters/${row.id}/edit`)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
        </div>
      ),
    },
    { name: 'NAME', selector: (row: Master) => row.name || '-', sortable: true },
    { name: 'CODE', selector: (row: Master) => row.code || '-', sortable: true },
    { name: 'SERIAL NUMBER', selector: (row: Master) => row.serial_number || '-', sortable: true },
    { name: 'TYPE', selector: (row: Master) => row.item_type || '-', sortable: true },
    { name: 'GROUP', selector: (row: Master) => row.group_name || '-', sortable: true },
    { name: 'SUB GROUP', selector: (row: Master) => row.sub_group_name || '-', sortable: true },
    { name: 'CATEGORY', selector: (row: Master) => row.category || '-', sortable: true },
    { name: 'CRITICALITY', selector: (row: Master) => row.criticality || '-', sortable: true },
    { name: 'UNIT', selector: (row: Master) => row.unit || '-', sortable: true },
    { name: 'COST', selector: (row: Master) => row.cost || 0, sortable: true },
    { name: 'SAC/HSN CODE', selector: (row: Master) => row.sac_hsn_code || '-', sortable: true },
    { name: 'MIN STOCK LEVEL', selector: (row: Master) => row.min_stock_level || 0, sortable: true },
    { name: 'MIN ORDER LEVEL', selector: (row: Master) => row.min_order_level || 0, sortable: true },
    { name: 'QUANTITY', selector: (row: Master) => row.quantity || 0, sortable: true },
    { 
      name: 'STATUS', 
      cell: (row: Master) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          row.status === 'Active' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {row.status || 'N/A'}
        </span>
      ),
      sortable: true 
    },
    { 
      name: 'EXPIRY DATE', 
      selector: (row: Master) => row.expiry_date ? new Date(row.expiry_date).toLocaleDateString() : '-', 
      sortable: true 
    },
  ];

  const MasterCard = ({ master }: { master: Master }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{master.name || 'N/A'}</h3>
            <p className="text-sm text-muted-foreground">Code: {master.code || '-'}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          master.status === 'Active' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {master.status || 'N/A'}
        </span>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground mb-4">
        <p>Type: {master.item_type || '-'}</p>
        <p>Group: {master.group_name || '-'}</p>
        <p>Quantity: {master.quantity || 0}</p>
        <p>Cost: {master.cost || 0}</p>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button
          onClick={() => navigate(`/inventory/masters/${master.id}`)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
          title="View"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => navigate(`/inventory/masters/${master.id}/edit`)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
          title="Edit"
        >
          <Edit2 size={16} />
        </button>
      </div>
    </div>
  );

  const safeFilteredData = Array.isArray(filteredData) ? filteredData : [];

  return (
    <div className="p-6">
      <PageHeader
        title=""
        breadcrumbs={[
          { label: 'FM Module', path: '/inventory/masters' },
          { label: 'Inventory', path: '/inventory/masters' },
          { label: 'Masters' },
        ]}
      />

      <ListToolbar
        searchPlaceholder="Search by Name, Code..."
        searchValue={searchText}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle
        showAddButton
        addButtonLabel="Add"
        onAddClick={() => navigate('/inventory/masters/create')}
        showFilter={false}
        showExport={false}
      />

      {viewMode === 'grid' ? (
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading...</div>
          ) : safeFilteredData.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No masters found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {safeFilteredData.slice(0, recordsPerPage).map((master) => (
                <MasterCard key={master.id} master={master} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={safeFilteredData}
          loading={loading}
          pagination
          paginationPerPage={recordsPerPage}
        />
      )}
    </div>
  );
};

export default MastersList;
