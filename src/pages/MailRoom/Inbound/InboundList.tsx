import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import { getinbound, deleteInbound } from '../../../api';
import { useViewMode } from '../../../hooks/useViewMode';

interface InboundPackage {
  id: number;
  vendor_id: number;
  vendor_name: string;
  receipant_name: string;
  mobile_number: string;
  mail_inbound_type: string;
  unit: string;
  department_id: string;
  entity: string;
  sender: string;
  company: string;
  receiving_date: string;
  collect_on: string;
}

const InboundList: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode, recordsPerPage } = useViewMode();
  
  // Convert 'list' to 'table' for compatibility with new ListToolbar
  const toolbarViewMode = viewMode === 'list' ? 'table' : viewMode;
  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode === 'table' ? 'list' : mode);
  };
  
  const [packages, setPackages] = useState<InboundPackage[]>([]);
  const [filteredData, setFilteredData] = useState<InboundPackage[]>([]);
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

  const fetchInboundPackages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getinbound();
      const data = Array.isArray(response?.data) ? response.data : [];
      setPackages(data);
      setFilteredData(data);
      // Set up pagination
      setPagination(prev => ({
        ...prev,
        total: data.length,
        totalPages: Math.ceil(data.length / prev.perPage),
        page: 1
      }));
    } catch (error) {
      console.error('Error fetching inbound packages:', error);
      toast.error('Failed to fetch inbound packages');
      setPackages([]);
      setFilteredData([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0, page: 1 }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInboundPackages();
  }, [fetchInboundPackages]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    const dataToFilter = Array.isArray(packages) ? packages : [];
    const filtered = dataToFilter.filter((item) =>
      item.vendor_name?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
    // Reset to first page when search changes
    setPagination(prev => ({ ...prev, page: 1, total: filtered.length, totalPages: Math.ceil(filtered.length / prev.perPage) }));
  };

  const handleRemovePackage = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this package?')) return;
    try {
      await deleteInbound(id);
      toast.success('Package deleted successfully');
      fetchInboundPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Failed to delete the package');
    }
  };

  const columns: Array<TableColumn<InboundPackage> & { width?: string; hidden?: boolean }> = [
    {
      key: 'view',
      header: 'VIEW',
      width: '80px',
      hidden: hiddenColumns.has('view'),
      render: (value, row) => (
        <button
          onClick={() => navigate(`/mail-room/inbound/${row.id}`)}
          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
        >
          <Eye size={16} />
        </button>
      ),
    },
    { key: 'id', header: 'ID', sortable: true, width: '80px', hidden: hiddenColumns.has('id'), render: (value, row) => row.id },
    { key: 'vendor_id', header: 'VENDOR ID', sortable: true, width: '100px', hidden: hiddenColumns.has('vendor_id'), render: (value, row) => row.vendor_id || '-' },
    { key: 'receipant_name', header: 'RECIPIENT', sortable: true, hidden: hiddenColumns.has('receipant_name'), render: (value, row) => row.receipant_name || '-' },
    { key: 'mobile_number', header: 'PHONE NO', sortable: true, hidden: hiddenColumns.has('mobile_number'), render: (value, row) => row.mobile_number || '-' },
    { key: 'mail_inbound_type', header: 'PACKAGE TYPE', sortable: true, hidden: hiddenColumns.has('mail_inbound_type'), render: (value, row) => row.mail_inbound_type || '-' },
    { key: 'unit', header: 'UNIT', sortable: true, hidden: hiddenColumns.has('unit'), render: (value, row) => row.unit || '-' },
    { key: 'department_id', header: 'DEPARTMENT', sortable: true, hidden: hiddenColumns.has('department_id'), render: (value, row) => row.department_id || '-' },
    { key: 'entity', header: 'ENTITY', sortable: true, hidden: hiddenColumns.has('entity'), render: (value, row) => row.entity || '-' },
    { key: 'sender', header: 'SENDER', sortable: true, hidden: hiddenColumns.has('sender'), render: (value, row) => row.sender || '-' },
    { key: 'company', header: 'COMPANY', sortable: true, hidden: hiddenColumns.has('company'), render: (value, row) => row.company || '-' },
    {
      key: 'receiving_date',
      header: 'RECEIVED ON',
      sortable: true,
      hidden: hiddenColumns.has('receiving_date'),
      render: (value, row) => row.receiving_date ? new Date(row.receiving_date).toLocaleDateString() : '-'
    },
    {
      key: 'collect_on',
      header: 'COLLECTED ON',
      sortable: true,
      hidden: hiddenColumns.has('collect_on'),
      render: (value, row) => row.collect_on ? new Date(row.collect_on).toLocaleDateString() : '-'
    },
    {
      key: 'inbound_package',
      header: 'INBOUND PACKAGE',
      width: '140px',
      hidden: hiddenColumns.has('inbound_package'),
      render: (value, row) => (
        <button
          onClick={() => handleRemovePackage(row.id)}
          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  // Grid view card component
  const PackageCard = ({ pkg }: { pkg: InboundPackage }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{pkg.receipant_name || 'Unknown Recipient'}</h3>
          <p className="text-sm text-muted-foreground">ID: {pkg.id}</p>
        </div>
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          {pkg.mail_inbound_type || 'Package'}
        </span>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground mb-4">
        <p>Vendor: {pkg.vendor_name || '-'}</p>
        <p>Sender: {pkg.sender || '-'}</p>
        <p>Company: {pkg.company || '-'}</p>
        <p>Received: {pkg.receiving_date ? new Date(pkg.receiving_date).toLocaleDateString() : '-'}</p>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button
          onClick={() => navigate(`/mail-room/inbound/${pkg.id}`)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => handleRemovePackage(pkg.id)}
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
        searchPlaceholder="Search By Vendor name"
        searchValue={searchText}
        onSearchChange={handleSearch}
        viewMode={toolbarViewMode}
        onViewModeChange={handleViewModeChange}
        showViewToggle={true}
        onAdd={() => navigate('/mail-room/inbound/create')}
        addLabel="Add Record"
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
                  <div className="col-span-full text-center py-10 text-muted-foreground">No packages found</div>
                ) : (
                  paginatedData.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))
                )}
              </div>
            ) : (
              <DataTable
                columns={columns.filter(col => !col.hidden)}
                data={paginatedData}
                showActions={false}
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

export default InboundList;
