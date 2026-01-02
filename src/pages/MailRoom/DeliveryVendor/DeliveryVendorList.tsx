import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import { getVendors, removeVendor } from '../../../api';
import { useViewMode } from '../../../hooks/useViewMode';

interface Vendor {
  id: number;
  vendor_supplier_id: string;
  vendor_name: string;
  website_url: string;
  email: string;
  mobile: string;
  spoc_person: string;
  aggrement_start_date: string;
  aggremenet_end_date: string;
  status: string;
  created_at: string;
}

const DeliveryVendorList: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode, recordsPerPage } = useViewMode();
  
  // Convert 'list' to 'table' for compatibility with new ListToolbar
  const toolbarViewMode = viewMode === 'list' ? 'table' : viewMode;
  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode === 'table' ? 'list' : mode);
  };
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredData, setFilteredData] = useState<Vendor[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Hide column functionality
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  
  const toggleColumnVisibility = (columnKey: string) => {
    setHiddenColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  };

  // Pagination state
  const [pagination, setPagination] = useState({ page: 1, perPage: recordsPerPage, total: 0, totalPages: 0 });
  
  // Update pagination when recordsPerPage changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, perPage: recordsPerPage, page: 1 }));
  }, [recordsPerPage]);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getVendors();
      const data = Array.isArray(response?.data) ? response.data : [];
      setVendors(data);
      setFilteredData(data);
      // Set up pagination
      setPagination(prev => ({
        ...prev,
        total: data.length,
        totalPages: Math.ceil(data.length / prev.perPage),
        page: 1
      }));
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to fetch vendors');
      setVendors([]);
      setFilteredData([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0, page: 1 }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    const dataToFilter = Array.isArray(vendors) ? vendors : [];
    const filtered = dataToFilter.filter((item) =>
      item.vendor_name?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
    // Reset to first page when search changes
    setPagination(prev => ({ ...prev, page: 1, total: filtered.length, totalPages: Math.ceil(filtered.length / prev.perPage) }));
  };

  const handleRemoveVendor = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this vendor?')) return;
    try {
      await removeVendor(id);
      toast.success('Vendor deleted successfully');
      fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to delete the vendor');
    }
  };

  const columns: Array<TableColumn<Vendor> & { width?: string }> = [
    { key: 'id', header: 'ID', sortable: true, width: '80px', render: (value, row) => row.id },
    { key: 'vendor_name', header: 'NAME', sortable: true, render: (value, row) => row.vendor_name || '-' },
    { key: 'website_url', header: 'WEBSITE URL', sortable: true, render: (value, row) => row.website_url || '-' },
    { key: 'email', header: 'EMAIL', sortable: true, render: (value, row) => row.email || '-' },
    { key: 'mobile', header: 'PHONE', sortable: true, render: (value, row) => row.mobile || '-' },
    { key: 'spoc_person', header: 'SPOC PERSON', sortable: true, render: (value, row) => row.spoc_person || '-' },
    { key: 'aggrement_start_date', header: 'AGREEMENT START', sortable: true, render: (value, row) => row.aggrement_start_date || '-' },
    { key: 'aggremenet_end_date', header: 'AGREEMENT END DATE', sortable: true, render: (value, row) => row.aggremenet_end_date || '-' },
    { key: 'status', header: 'STATUS', sortable: true, render: (value, row) => row.status || '-' },
    {
      key: 'created_at',
      header: 'CREATED ON',
      sortable: true,
      render: (value, row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'
    },
    {
      key: 'remove_vendor',
      header: 'REMOVE VENDOR',
      width: '120px',
      render: (value, row) => (
        <button
          onClick={() => handleRemoveVendor(row.id)}
          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  // Get visible columns
  const visibleColumns = columns.filter(col => !hiddenColumns.has(col.key));

  // Grid view card component
  const VendorCard = ({ vendor }: { vendor: Vendor }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{vendor.vendor_name}</h3>
          <p className="text-sm text-muted-foreground">ID: {vendor.id}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          vendor.status === 'Active' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {vendor.status || 'N/A'}
        </span>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground mb-4">
        <p>Email: {vendor.email || '-'}</p>
        <p>Phone: {vendor.mobile || '-'}</p>
        <p>SPOC: {vendor.spoc_person || '-'}</p>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button
          onClick={() => navigate(`/mail-room/delivery-vendor/${vendor.id}`)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => navigate(`/mail-room/delivery-vendor/${vendor.id}/edit`)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => handleRemoveVendor(vendor.id)}
          className="p-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <ListToolbar
        searchPlaceholder="Search by Vendor name..."
        searchValue={searchText}
        onSearchChange={handleSearch}
        viewMode={toolbarViewMode}
        onViewModeChange={handleViewModeChange}
        showViewToggle={true}
        onAdd={() => navigate('/mail-room/delivery-vendor/create')}
        addLabel="Add Vendor"
        onFilter={undefined}
        onExport={undefined}
        additionalButtons={
          <button
            onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent"
          >
            Hide Columns
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        }
      />

      {/* Hide Columns Dropdown */}
      {isColumnMenuOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsColumnMenuOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-40 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
                Toggle Column Visibility
              </div>
              {columns.map((col) => (
                <label key={col.key} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!hiddenColumns.has(col.key)}
                    onChange={() => toggleColumnVisibility(col.key)}
                    className="w-4 h-4"
                  />
                  <span className="flex items-center gap-2 text-sm">
                    {hiddenColumns.has(col.key) ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-primary" />}
                    {col.header}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Pagination Logic */}
      {(() => {
        const startIndex = (pagination.page - 1) * pagination.perPage;
        const endIndex = startIndex + pagination.perPage;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        return (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                  <div className="col-span-full text-center py-10 text-muted-foreground">Loading...</div>
                ) : !Array.isArray(filteredData) || filteredData.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-muted-foreground">No vendors found</div>
                ) : (
                  paginatedData.map((vendor) => (
                    <VendorCard key={vendor.id} vendor={vendor} />
                  ))
                )}
              </div>
            ) : (
              <DataTable
                columns={visibleColumns}
                data={paginatedData}
                viewPath={(row) => `/mail-room/delivery-vendor/${row.id}`}
                onView={(row) => navigate(`/mail-room/delivery-vendor/${row.id}/edit`)}
              />
            )}
            
            {/* Pagination Controls */}
            {filteredData.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} records
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">«</button>
                  <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">‹ Prev</button>
                  <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
                  <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={endIndex >= filteredData.length} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Next ›</button>
                  <button onClick={() => setPagination(prev => ({ ...prev, page: Math.ceil(filteredData.length / prev.perPage) }))} disabled={endIndex >= filteredData.length} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">»</button>
                </div>
                <select value={pagination.perPage} onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))} className="px-2 py-1.5 text-sm border border-border rounded-md bg-background">
                  <option value={10}>10 / page</option>
                  <option value={12}>12 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
};

export default DeliveryVendorList;
