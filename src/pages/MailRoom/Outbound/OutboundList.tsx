import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import { getoutbound, deleteOutbound } from '../../../api';
import { useViewMode } from '../../../hooks/useViewMode';

interface OutboundPackage {
  id: number;
  vendor_id: number;
  recipient_name: string;
  unit: string;
  entity: string;
  awb_number: string;
  mail_outbound_type: string;
  sending_date: string;
}

const OutboundList: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode, recordsPerPage } = useViewMode();
  
  // Convert 'list' to 'table' for compatibility with new ListToolbar
  const toolbarViewMode = viewMode === 'list' ? 'table' : viewMode;
  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode === 'table' ? 'list' : mode);
  };
  
  const [packages, setPackages] = useState<OutboundPackage[]>([]);
  const [filteredData, setFilteredData] = useState<OutboundPackage[]>([]);
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

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getoutbound();
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
      console.error('Error fetching outbound packages:', error);
      setPackages([]);
      setFilteredData([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0, page: 1 }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    const dataToFilter = Array.isArray(packages) ? packages : [];
    const filtered = dataToFilter.filter((item) =>
      item.recipient_name?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
    // Reset to first page when search changes
    setPagination(prev => ({ ...prev, page: 1, total: filtered.length, totalPages: Math.ceil(filtered.length / prev.perPage) }));
  };

  const handleRemove = async (id: number) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteOutbound(id);
      toast.success('Package deleted');
      fetchPackages();
    } catch { toast.error('Failed to delete'); }
  };

  const columns: Array<TableColumn<OutboundPackage> & { width?: string }> = [
    {
      key: 'view',
      header: 'VIEW',
      width: '80px',
      render: (value, row) => (
        <button
          onClick={() => navigate(`/mail-room/outbound/${row.id}`)}
          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
        >
          <Eye size={16} />
        </button>
      ),
    },
    { key: 'id', header: 'ID', sortable: true, width: '80px', render: (value, row) => row.id },
    { key: 'recipient_name', header: 'RECIPIENT', sortable: true, render: (value, row) => row.recipient_name || '-' },
    { key: 'unit', header: 'UNIT', sortable: true, render: (value, row) => row.unit || '-' },
    { key: 'entity', header: 'ENTITY', sortable: true, render: (value, row) => row.entity || '-' },
    { key: 'vendor_id', header: 'VENDOR ID', sortable: true, render: (value, row) => row.vendor_id || '-' },
    { key: 'awb_number', header: 'AWB NUMBER', sortable: true, render: (value, row) => row.awb_number || '-' },
    { key: 'mail_outbound_type', header: 'PACKAGE TYPE', sortable: true, render: (value, row) => row.mail_outbound_type || '-' },
    { key: 'sending_date', header: 'SENDING DATE', sortable: true, render: (value, row) => row.sending_date || '-' },
    {
      key: 'remove',
      header: 'REMOVE',
      width: '100px',
      render: (value, row) => (
        <button
          onClick={() => handleRemove(row.id)}
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
  const PackageCard = ({ pkg }: { pkg: OutboundPackage }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{pkg.recipient_name || 'Unknown Recipient'}</h3>
          <p className="text-sm text-muted-foreground">ID: {pkg.id}</p>
        </div>
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          {pkg.mail_outbound_type || 'Package'}
        </span>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground mb-4">
        <p>Vendor: {pkg.vendor_id || '-'}</p>
        <p>AWB: {pkg.awb_number || '-'}</p>
        <p>Unit: {pkg.unit || '-'}</p>
        <p>Sending: {pkg.sending_date ? new Date(pkg.sending_date).toLocaleDateString() : '-'}</p>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button
          onClick={() => navigate(`/mail-room/outbound/${pkg.id}`)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => handleRemove(pkg.id)}
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
        searchPlaceholder="Search By Sender name"
        searchValue={searchText}
        onSearchChange={handleSearch}
        viewMode={toolbarViewMode}
        onViewModeChange={handleViewModeChange}
        showViewToggle={true}
        onAdd={() => navigate('/mail-room/outbound/create')}
        addLabel="Add"
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
                  <div className="col-span-full text-center py-10 text-muted-foreground">No packages found</div>
                ) : (
                  paginatedData.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))
                )}
              </div>
            ) : (
              <DataTable
                columns={visibleColumns}
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

export default OutboundList;
