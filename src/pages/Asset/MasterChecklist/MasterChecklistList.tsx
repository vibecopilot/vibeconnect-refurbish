import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DataCard from '../../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import {
  Loader2,
  ClipboardList,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Upload,
  Download,
  Edit,
  Copy,
  Filter,
  ClipboardCheck
} from 'lucide-react';
import { getChecklistPaged, ChecklistImport, exportChecklist, downloadSampleChecklist } from '../../../api';
import toast from 'react-hot-toast';
import { Checklist, ChecklistListProps, ChecklistType } from './types';

const MasterChecklistList: React.FC<ChecklistListProps> = ({
  viewMode,
  searchValue,
  perPage = 10,
  isFilterOpen,
  setIsFilterOpen,
  isColumnMenuOpen,
  setIsColumnMenuOpen,
  isImportOpen,
  setIsImportOpen,
  onExportSet,
  typeFilter: externalTypeFilter,
  onTypeFilterChange,
  showInlineFilter = true
}) => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, perPage, total: 0, totalPages: 0 });
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Type filter - this is the key difference from separate lists
  const [typeFilterInternal, setTypeFilterInternal] = useState<ChecklistType | 'all'>('all');
  const typeFilter = externalTypeFilter ?? typeFilterInternal;
  const setTypeFilter = onTypeFilterChange ?? setTypeFilterInternal;

  useEffect(() => {
    setPagination(prev => ({ ...prev, perPage, page: 1 }));
  }, [perPage]);

  // Reset to first page when type filter changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [typeFilter]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const fetchChecklists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pass ctype filter to API
      const ctype = typeFilter === 'all' ? undefined : typeFilter;
      const response = await getChecklistPaged(pagination.page, pagination.perPage, debouncedSearch, ctype);
      const data = response.data;
      const list = Array.isArray(data) ? data : data?.checklists || data?.data || [];
      const total = data.total_entries ?? data.total ?? data.total_count ?? data.count ?? list.length;

      setChecklists(list);
      setPagination(prev => ({
        ...prev,
        total,
        totalPages: data.total_pages ?? Math.ceil(total / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch checklists');
      setChecklists([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, debouncedSearch, typeFilter]);

  useEffect(() => { fetchChecklists(); }, [fetchChecklists]);

  // Import Functionality
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (importFiles.length === 0) {
      toast.error('No files selected.');
      return;
    }

    const formData = new FormData();
    importFiles.forEach((file) => {
      formData.append("file", file);
    });

    try {
      toast.loading('Uploading checklist...');
      const response = await ChecklistImport(formData);

      toast.dismiss();
      if (response.status === 200) {
        toast.success('Checklist successfully imported!');
        setIsImportOpen?.(false);
        setImportFiles([]);
        fetchChecklists();
      } else {
        toast.error('Failed to import checklist.');
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error importing checklist:", error);
      toast.error('An error occurred during import.');
    }
  };

  // Export Functionality
  const handleExportToExcel = async () => {
    try {
      toast.loading('Exporting checklists...');
      const response = await exportChecklist();

      const blob = new Blob([response.data], { type: response.headers["content-type"] });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "export_checklist.xlsx";
      link.click();
      window.URL.revokeObjectURL(downloadUrl);

      toast.dismiss();
      toast.success('Checklist exported successfully');
    } catch (error) {
      toast.dismiss();
      console.error("Failed to export checklist:", error);
      toast.error('Error exporting checklist. Please try again.');
    }
  };

  // Download Sample Format
  const handleDownloadSample = async () => {
    try {
      const response = await downloadSampleChecklist();
      const blob = new Blob([response.data], { type: response.headers["content-type"] });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "sample_format_checklist.xlsx";
      link.click();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Sample format downloaded');
    } catch (error) {
      console.error("Failed to download sample:", error);
      toast.error('Error downloading sample format.');
    }
  };

  // Expose export function to parent
  useEffect(() => {
    if (onExportSet) {
      onExportSet(() => handleExportToExcel);
    }
  }, [onExportSet, checklists]);

  const startIndex = (pagination.page - 1) * pagination.perPage;

  // Get badge color based on type
  const getTypeBadge = (ctype: string) => {
    if (ctype === 'ppm') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
          PPM
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        Routine
      </span>
    );
  };

  const allColumns: Array<TableColumn<Checklist> & { id: string; label: string }> = [
    // Action column
    {
      id: 'action',
      label: 'Action',
      key: 'action',
      header: 'Action',
      width: '120px',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Link to={`/asset/master-checklist/${row.id}`} className="text-primary hover:text-primary/80" title="View">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/asset/master-checklist/${row.id}/edit`} className="text-primary hover:text-primary/80" title="Edit">
            <Edit className="w-4 h-4" />
          </Link>
          <Link to={`/asset/master-checklist/${row.id}/copy`} className="text-primary hover:text-primary/80" title="Copy">
            <Copy className="w-4 h-4" />
          </Link>
        </div>
      )
    },
    { id: 'id', label: 'S.No', key: 'id', header: 'S.No', width: '80px', render: (_val, _row, idx) => startIndex + idx + 1 },
    { id: 'name', label: 'Name', key: 'name', header: 'Name', sortable: true, render: (v) => v || '-' },
    {
      id: 'ctype',
      label: 'Type',
      key: 'ctype',
      header: 'Type',
      width: '100px',
      render: (v) => getTypeBadge(v || 'routine')
    },
    { id: 'frequency', label: 'Frequency', key: 'frequency', header: 'Frequency', render: (v) => v || '-' },
    { id: 'start_date', label: 'Start Date', key: 'start_date', header: 'Start Date', render: (v) => v || '-' },
    { id: 'end_date', label: 'End Date', key: 'end_date', header: 'End Date', render: (v) => v || '-' },
    {
      id: 'groups',
      label: 'No. of Groups',
      key: 'groups',
      header: 'No. of Groups',
      render: (_v, row) => row.groups?.length || 0
    },
    {
      id: 'associations',
      label: 'Associations',
      key: 'associations',
      header: 'Associations',
      render: (_v, row) => (
        <Link
          to={`/asset/master-checklist/${row.id}/associate`}
          className="px-4 py-1 bg-green-500 text-white rounded-full text-xs hover:bg-green-600 transition-colors"
        >
          Associate
        </Link>
      )
    },
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

  if (loading && checklists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading checklists...</p>
      </div>
    );
  }

  if (error && checklists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Checklists</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button onClick={fetchChecklists} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (checklists.length === 0) {
    return (
      <>
        {/* Type Filter Chips */}
        {showInlineFilter && (
          <div className="flex items-center gap-2 mb-4">
            <TypeFilterChips typeFilter={typeFilter} setTypeFilter={setTypeFilter} />
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <ClipboardList className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Checklists Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchValue ? `No checklists match "${searchValue}"` :
             typeFilter !== 'all' ? `No ${typeFilter.toUpperCase()} checklists created yet` :
             'No checklists created yet'}
          </p>
          <Link to="/asset/master-checklist/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
            + Add Checklist
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Type Filter Chips */}
      {showInlineFilter && (
        <div className="flex items-center gap-2 mb-4">
          <TypeFilterChips typeFilter={typeFilter} setTypeFilter={setTypeFilter} />
        </div>
      )}

      {/* Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-xl bg-card shadow-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Bulk Upload Checklist
              </h2>
              <button className="text-xl leading-none" onClick={() => setIsImportOpen?.(false)}>×</button>
            </div>

            <form onSubmit={handleImportSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Select Checklist File(s)
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  multiple
                  required
                  onChange={(e) => setImportFiles(Array.from(e.target.files || []))}
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent"
                >
                  Download Sample Format
                </button>
                <button
                  type="button"
                  onClick={() => setIsImportOpen?.(false)}
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
                >
                  Import
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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
          {checklists.map((checklist) => (
            <DataCard
              key={checklist.id}
              title={checklist.name}
              subtitle={`Type: ${checklist.ctype === 'ppm' ? 'PPM' : 'Routine'}`}
              status={checklist.ctype === 'ppm' ? 'in_progress' : 'available'}
              fields={[
                { label: 'Frequency', value: checklist.frequency || '-' },
                { label: 'Start Date', value: checklist.start_date || '-' },
                { label: 'End Date', value: checklist.end_date || '-' },
                { label: 'Groups', value: checklist.groups?.length?.toString() || '0' },
              ]}
              viewPath={`/asset/master-checklist/${checklist.id}`}
              editPath={`/asset/master-checklist/${checklist.id}/edit`}
              copyPath={`/asset/master-checklist/${checklist.id}/copy`}
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={visibleColumns}
          data={checklists}
          viewPath={(row) => `/asset/master-checklist/${row.id}`}
        />
      )}

      {checklists.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + checklists.length, pagination.total || startIndex + checklists.length)} of {pagination.total || checklists.length} records
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">{'<<'}</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Prev</button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Next</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: pagination.totalPages || prev.page }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">{'>>'}</button>
          </div>
          <select value={pagination.perPage} onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))} className="px-2 py-1.5 text-sm border border-border rounded-md bg-background">
            <option value={10}>10 / page</option><option value={12}>12 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option>
          </select>
        </div>
      )}
    </>
  );
};

// Type Filter Chips Component
export const TypeFilterChips: React.FC<{
  typeFilter: ChecklistType | 'all';
  setTypeFilter: (type: ChecklistType | 'all') => void;
}> = ({ typeFilter, setTypeFilter }) => {
  const filters: Array<{ value: ChecklistType | 'all'; label: string; icon: React.ReactNode }> = [
    { value: 'all', label: 'All', icon: <ClipboardList className="w-4 h-4" /> },
    { value: 'routine', label: 'Routine', icon: <ClipboardList className="w-4 h-4" /> },
    { value: 'ppm', label: 'PPM', icon: <ClipboardCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground mr-2">Type:</span>
      {filters.map((filter) => {
        const isActive = typeFilter === filter.value;
        const activeStyles =
          filter.value === 'ppm'
            ? 'bg-purple-100 text-purple-700 border border-purple-200'
            : filter.value === 'routine'
            ? 'bg-blue-100 text-blue-700 border border-blue-200'
            : 'bg-primary/10 text-primary border border-primary/20';

        return (
          <motion.button
            key={filter.value}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setTypeFilter(filter.value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              isActive ? activeStyles : 'bg-white text-foreground border border-border hover:bg-accent'
            }`}
          >
            {filter.icon}
            {filter.label}
          </motion.button>
        );
      })}
    </div>
  );
};

export default MasterChecklistList;
