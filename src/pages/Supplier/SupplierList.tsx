import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, Download, Building2, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import Breadcrumb from '../../components/ui/Breadcrumb';

import { getVendors, removeVendor } from '../../api';
import { useViewMode } from '../../hooks/useViewMode';

interface Supplier {
  id: number;
  vendor_name: string;
  company_name: string;
  mobile: string;
  email: string;
  gst_number: string;
  pan: string;
  status: string;
  website: string;
  address_line_1: string;
  city: string;
  state: string;
  created_at: string;
}

const SupplierList: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode, recordsPerPage } = useViewMode();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredData, setFilteredData] = useState<Supplier[]>([]);
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

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getVendors();
      const data = Array.isArray(response?.data) ? response.data : [];
      setSuppliers(data);
      setFilteredData(data);
      // Set up pagination
      setPagination(prev => ({
        ...prev,
        total: data.length,
        totalPages: Math.ceil(data.length / prev.perPage),
        page: 1
      }));
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Failed to fetch suppliers');
      setSuppliers([]);
      setFilteredData([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0, page: 1 }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    const dataToFilter = Array.isArray(suppliers) ? suppliers : [];
    const filtered = dataToFilter.filter((item) =>
      item.company_name?.toLowerCase().includes(value.toLowerCase()) ||
      item.vendor_name?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
    // Reset to first page when search changes
    setPagination(prev => ({ ...prev, page: 1, total: filtered.length, totalPages: Math.ceil(filtered.length / prev.perPage) }));
  };

  const handleExport = () => {
    const dataToExport = Array.isArray(filteredData) ? filteredData : [];
    const csvContent = [
      ['Vendor Name', 'Company Name', 'Mobile', 'Email', 'GSTIN', 'PAN', 'Status'].join(','),
      ...dataToExport.map(s => [
        s.vendor_name || '',
        s.company_name || '',
        s.mobile || '',
        s.email || '',
        s.gst_number || '',
        s.pan || '',
        s.status || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'suppliers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Exported successfully');
  };

  const columns: Array<TableColumn<Supplier> & { width?: string }> = [
    {
      key: 'actions',
      header: 'ACTION',
      width: '100px',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/supplier/${row.id}`)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate(`/supplier/${row.id}/edit`)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
        </div>
      ),
    },
    { key: 'vendor_name', header: 'VENDOR NAME', sortable: true, render: (v) => v || '-' },
    { key: 'company_name', header: 'COMPANY NAME', sortable: true, render: (v) => v || '-' },
    { key: 'mobile', header: 'MOBILE NUMBER', sortable: true, render: (v) => v || '-' },
    { key: 'email', header: 'EMAIL', sortable: true, render: (v) => v || '-' },
    { key: 'gst_number', header: 'GSTIN NUMBER', sortable: true, render: (v) => v || '-' },
    { key: 'pan', header: 'PAN NUMBER', sortable: true, render: (v) => v || '-' },
    {
      key: 'status',
      header: 'STATUS',
      sortable: true,
      render: (v, row) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          row.status === 'Active'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {row.status || 'N/A'}
        </span>
      ),
    },
  ];

  // Get visible columns
  const visibleColumns = columns.filter(col => !hiddenColumns.has(col.key));

  // Grid view card component
  const SupplierCard = ({ supplier }: { supplier: Supplier }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{supplier.vendor_name || 'N/A'}</h3>
            <p className="text-sm text-muted-foreground">{supplier.company_name || '-'}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          supplier.status === 'Active' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {supplier.status || 'N/A'}
        </span>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground mb-4">
        <p>Phone: {supplier.mobile || '-'}</p>
        <p>Email: {supplier.email || '-'}</p>
        <p>GSTIN: {supplier.gst_number || '-'}</p>
        <p>PAN: {supplier.pan || '-'}</p>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button
          onClick={() => navigate(`/supplier/${supplier.id}`)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
          title="View"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => navigate(`/supplier/${supplier.id}/edit`)}
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
      <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Supplier/Vendor', path: '/supplier' }]} />


      <ListToolbar
        searchPlaceholder="Search By Company name"
        searchValue={searchText}
        onSearchChange={handleSearch}
        viewMode={viewMode === 'list' ? 'table' : viewMode}
        onViewModeChange={(mode) => setViewMode(mode === 'table' ? 'list' : mode)}
        showViewToggle
        onAdd={() => navigate('/supplier/create')}
        addLabel="Add"
        onFilter={undefined}
        onExport={handleExport}
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
        const paginatedData = safeFilteredData.slice(startIndex, endIndex);
        
        return (
          <>
            {viewMode === 'grid' ? (
              <div className="mt-4">
                {loading ? (
                  <div className="text-center py-10 text-muted-foreground">Loading...</div>
                ) : safeFilteredData.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">No suppliers found</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedData.map((supplier) => (
                      <SupplierCard key={supplier.id} supplier={supplier} />
                    ))}
                  </div>
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
            {safeFilteredData.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, safeFilteredData.length)} of {safeFilteredData.length} records
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">«</button>
                  <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">‹ Prev</button>
                  <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
                  <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={endIndex >= safeFilteredData.length} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Next ›</button>
                  <button onClick={() => setPagination(prev => ({ ...prev, page: Math.ceil(safeFilteredData.length / prev.perPage) }))} disabled={endIndex >= safeFilteredData.length} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">»</button>
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

export default SupplierList;
