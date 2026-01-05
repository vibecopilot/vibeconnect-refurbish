import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DataCard from '../../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import { Loader2, Package, AlertCircle, RefreshCw, Eye, EyeOff, Download, Edit } from 'lucide-react';
import { getAMC } from '../../../api';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

interface AMC {
  id: number;
  vendor_id: number;
  asset_id: number;
  asset_name: string;
  vendor_name: string | null;
  start_date: string;
  end_date: string;
  frequency: string;
  first_service?: string;
  status?: string;
  created_at: string;
  updated_at?: string;
  attachments: any[];
  url: string;
}

interface AMCListProps {
  viewMode: 'grid' | 'table';
  searchValue: string;
  perPage?: number;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  isColumnMenuOpen: boolean;
  setIsColumnMenuOpen: (value: boolean) => void;
  onExportSet?: (fn: () => void) => void;
}

const AMCList: React.FC<AMCListProps> = ({ 
  viewMode, 
  searchValue, 
  perPage = 10,
  isFilterOpen,
  setIsFilterOpen,
  isColumnMenuOpen,
  setIsColumnMenuOpen,
  onExportSet
}) => {
  const [amcList, setAmcList] = useState<AMC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage, total: 0, totalPages: 0 });
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  useEffect(() => {
    setPagination(prev => ({ ...prev, perPage, page: 1 }));
  }, [perPage]);

  const fetchAMC = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Server-side pagination and search
      const response = await getAMC(pagination.page, pagination.perPage, searchValue);
      // Handle new API response format: { asset_amcs: [...], total_entries, current_page, total_pages }
      const amcData = Array.isArray(response.data?.asset_amcs) 
        ? response.data.asset_amcs 
        : Array.isArray(response.data) 
        ? response.data 
        : [];
      
      // Server already handles sorting, but we'll sort client-side for consistency
      const sortedAmc = [...amcData].sort((a: AMC, b: AMC) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAmcList(sortedAmc);
      setPagination(prev => ({
        ...prev,
        total: response.data?.total_entries || sortedAmc.length,
        totalPages: response.data?.total_pages || Math.ceil(sortedAmc.length / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AMC data');
      setAmcList([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, searchValue]);

  useEffect(() => { fetchAMC(); }, [fetchAMC]);

  // Debounced search effect - reset to page 1 when search changes
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const dateFormat = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // No need for client-side search filtering - handled by server
  // No need for client-side pagination - handled by server
  // Use amcList directly from API

  // Export to Excel functionality
  const handleExportToExcel = useCallback(() => {
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileName = "AMC_data.xlsx";
    const ws = XLSX.utils.json_to_sheet(amcList);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    
    toast.success('Excel file exported successfully');
  }, [amcList]);

  // Expose export function to parent (only once)
  useEffect(() => {
    if (onExportSet) {
      onExportSet(handleExportToExcel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onExportSet]);

  const allColumns: Array<TableColumn<AMC> & { id: string; label: string }> = [
    // Action column
    {
      id: 'action',
      label: 'Action',
      key: 'action',
      header: 'Action',
      width: '100px',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Link to={`/asset/amc/${row.id}`} className="text-primary hover:text-primary/80">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/asset/amc/${row.id}/edit`} className="text-primary hover:text-primary/80">
            <Edit className="w-4 h-4" />
          </Link>
        </div>
      )
    },
    { id: 'id', label: 'S.No', key: 'id', header: 'S.No', width: '80px', render: (_val, _row, idx) => ((pagination.page - 1) * pagination.perPage) + idx + 1 },
    { id: 'asset_name', label: 'Asset Name', key: 'asset_name', header: 'Asset Name', sortable: true, render: (v) => v || '-' },
    { id: 'vendor_name', label: 'Vendor', key: 'vendor_name', header: 'Vendor', render: (v) => v || '-' },
    { id: 'start_date', label: 'Start Date', key: 'start_date', header: 'Start Date', render: (v) => v || '-' },
    { id: 'end_date', label: 'End Date', key: 'end_date', header: 'End Date', render: (v) => v || '-' },
    { id: 'frequency', label: 'Frequency', key: 'frequency', header: 'Frequency', render: (v) => v || '-' },
    { id: 'first_service', label: 'First Service', key: 'first_service', header: 'First Service', render: (v) => v || '-' },
    { id: 'status', label: 'Status', key: 'status', header: 'Status', render: (v) => v || '-' },
    { id: 'created_at', label: 'Created On', key: 'created_at', header: 'Created On', render: (v) => dateFormat(v) },
  ];

  const visibleColumns = allColumns.filter(col => !hiddenColumns.has(col.id));

  const toggleColumnVisibility = (columnId: string) => {
    setHiddenColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  if (loading && amcList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading AMC...</p>
      </div>
    );
  }

  if (error && amcList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load AMC</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button onClick={fetchAMC} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (amcList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
        <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No AMC Found</h3>
        <p className="text-muted-foreground mb-4">{searchValue ? `No AMC match "${searchValue}"` : 'No AMC added yet'}</p>
      </div>
    );
  }

  return (
    <>
      {/* Hide Columns Dropdown */}
      {isColumnMenuOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsColumnMenuOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-40 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
                Toggle Column Visibility
              </div>
              {allColumns.map((col) => (
                <label key={col.id} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded cursor-pointer">
                  <input type="checkbox" checked={!hiddenColumns.has(col.id)} onChange={() => toggleColumnVisibility(col.id)} className="w-4 h-4" />
                  <span className="flex items-center gap-2 text-sm">
                    {hiddenColumns.has(col.id) ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-primary" />}
                    {col.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {amcList.map((amc) => (
            <DataCard
              key={amc.id}
              title={amc.asset_name || `AMC #${amc.id}`}
              subtitle={`Vendor: ${amc.vendor_name || 'N/A'}`}
              status="in-store"
              fields={[
                { label: 'Start Date', value: amc.start_date || '-' },
                { label: 'End Date', value: amc.end_date || '-' },
                { label: 'Frequency', value: amc.frequency || '-' },
                { label: 'Status', value: amc.status || '-' },
              ]}
              viewPath={`/asset/amc/${amc.id}`}
              editPath={`/asset/amc/${amc.id}/edit`}
            />
          ))}
        </div>
      ) : (
        <DataTable 
          columns={visibleColumns} 
          data={amcList} 
          selectable 
          selectedRows={selectedRows} 
          onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])} 
          onSelectAll={() => setSelectedRows(selectedRows.length === amcList.length ? [] : amcList.map(a => String(a.id)))} 
          viewPath={(row) => `/asset/amc/${row.id}`} 
        />
      )}

      {amcList.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} records
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">«</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">‹ Prev</button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Next ›</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: pagination.totalPages }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">»</button>
          </div>
          <select value={pagination.perPage} onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))} className="px-2 py-1.5 text-sm border border-border rounded-md bg-background">
            <option value={10}>10 / page</option><option value={12}>12 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option>
          </select>
        </div>
      )}
    </>
  );
};

export default AMCList;