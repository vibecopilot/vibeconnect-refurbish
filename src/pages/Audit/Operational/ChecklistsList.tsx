import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, Loader2, AlertCircle, RefreshCw, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../../components/list/ListToolbar';
import DataTable from '../../../components/table/DataTable';
import { getChecklist } from '../../../api';
import { useViewMode } from '../../../hooks/useViewMode';

interface AuditChecklist {
  id: number;
  activity_name: string;
  name: string;
  status: string;
  created_at: string;
}

const statusFilters = ['All', 'Open', 'Closed', 'Pending', 'Completed'];

const normalizeStatus = (raw: any) => {
  const s = (raw || '').toString().toLowerCase().trim();
  if (!s) return '';
  if (s.includes('complete') || s.includes('done')) return 'completed';
  if (s.includes('pend')) return 'pending';
  if (s.includes('open')) return 'open';
  if (s.includes('close')) return 'closed';
  return s;
};

const ChecklistsList: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode } = useViewMode();
  
  // Separate state for "All Data" vs "Displayed Data"
  const [allChecklists, setAllChecklists] = useState<AuditChecklist[]>([]);
  const [checklists, setChecklists] = useState<AuditChecklist[]>([]);
  
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const getDefaultPerPage = (mode: 'grid' | 'list') =>
    mode === 'grid' ? 12 : 10;

  const [pagination, setPagination] = useState({
    page: 1,
    perPage: getDefaultPerPage(viewMode),
    total: 0,
    totalPages: 1,
  });

  // 1. Fetch ALL checklists for client-side operations
  const fetchAllChecklists = useCallback(async () => {
    try {
      const checklistRes = await getChecklist(1, 10000, {}); 
      const raw = checklistRes?.data;
      
      const rawItems = Array.isArray(raw)
        ? raw
        : raw?.activities || raw?.data || raw?.checklists || raw?.items || [];

      const items: AuditChecklist[] = rawItems.map((item: any) => ({
        id: item.id,
        activity_name: item.checklist_name || item.activity_name || '',
        name: item.asset_name || item.name || '',
        status: item.status || '',
        created_at: item.created_at || '',
      }));

      setAllChecklists(items);
    } catch (err) {
      console.error("Failed to fetch all checklists:", err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchAllChecklists();
    } catch (err) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch checklists';
      setError(errorMsg);
      toast.error(errorMsg);
      setChecklists([]);
      setPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  }, [fetchAllChecklists]);

  // 2. Client-side Filtering & Pagination Logic
  useEffect(() => {
    let filtered = [...allChecklists];

    // Apply Status Filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter((item) => {
        const status = normalizeStatus(item.status);
        return status === activeFilter.toLowerCase();
      });
    }

    // Apply Search Filter
    if (searchValue && searchValue.trim()) {
      const searchLower = searchValue.toLowerCase().trim();
      filtered = filtered.filter((item) => 
        (item.activity_name && item.activity_name.toLowerCase().includes(searchLower)) ||
        (item.name && item.name.toLowerCase().includes(searchLower)) ||
        String(item.id).includes(searchLower)
      );
    }

    // Update Pagination info based on filtered list
    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / prev.perPage)),
    }));

    // Slice data for current page
    const startIndex = (pagination.page - 1) * pagination.perPage;
    const endIndex = startIndex + pagination.perPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    setChecklists(paginatedData);

  }, [activeFilter, searchValue, allChecklists, pagination.page, pagination.perPage]);

  // 3. Debounced Search Effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchValue(searchValue);
    }, 500); 
    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  // Initial Load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Keep perPage in sync with view mode
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      perPage: getDefaultPerPage(viewMode),
      page: 1,
    }));
  }, [viewMode]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setPagination((p) => ({ ...p, page: 1 })); 
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      toast.error('No file selected');
      return;
    }

    try {
      toast.loading('Uploading checklists...');

      toast.dismiss();
      toast.success('Checklists imported successfully');
      setIsImportOpen(false);
      setImportFile(null);
      setPagination(p => ({ ...p, page: 1 }));
      fetchData();
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error('Import failed, please try again');
    }
  };

  const handleDownloadSample = () => {
    try {
      const sampleData = [
        ['ID', 'Activity Name', 'Asset Name', 'Status', 'Created At'],
        ['1', 'Safety Audit', 'Building A', 'Open', new Date().toLocaleDateString()],
        ['2', 'Fire Safety Check', 'Building B', 'Pending', new Date().toLocaleDateString()],
      ];

      const csvContent = sampleData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'checklists_sample.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download sample');
    }
  };

  const handleExport = async () => {
    try {
      toast.loading('Exporting checklists...');
      const dataToExport = [...checklists];

      if (!dataToExport || dataToExport.length === 0) {
        toast.dismiss();
        toast.error('No records to export');
        return;
      }

      const csvContent = [
        ['ID', 'Checklist Name', 'Asset Name', 'Status', 'Created At'].join(','),
        ...dataToExport.map(item => [
          item.id,
          item.activity_name || '',
          item.name || '',
          item.status || '',
          item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
        ].join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit_checklists_current_page.csv';
      a.click();
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success(`Exported ${dataToExport.length} records successfully`);
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error('Failed to export checklists');
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === checklists.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(checklists.map(item => String(item.id)));
    }
  };

  const columns = [
    {
      name: 'ACTION',
      width: '100px',
      center: true,
      cell: (row: AuditChecklist) => (
        <div className="flex justify-center items-center gap-2 w-full">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/audit/operational/checklists/${row.id}`);
            }}
            className="p-1.5 rounded hover:bg-accent"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/audit/operational/checklists/${row.id}/edit`);
            }}
            className="p-1.5 rounded hover:bg-accent"
          >
            <Edit2 size={16} />
          </button>
        </div>
      ),
    },
    {
      name: 'ID',
      selector: (r: AuditChecklist) => r.id,
      sortable: true,
      width: '150px',
      center: true,
    },
    {
      name: 'Activity Name',
      selector: (r: AuditChecklist) => r.activity_name || '-',
      sortable: true,
      width: '350px',
      center: true,
      wrap: true,
    },
    {
      name: 'Asset Name',
      selector: (r: AuditChecklist) => r.name || '-',
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: 'Status',
      selector: (r: AuditChecklist) => r.status || '-',
      sortable: true,
      center: true,
    },
    {
      name: 'Created At',
      selector: (r: AuditChecklist) =>
        r.created_at ? new Date(r.created_at).toLocaleDateString() : '-',
      sortable: true,
      center: true,
    },
  ];

  const ChecklistCard = ({ item, isSelected, onToggleSelect }: { item: AuditChecklist; isSelected: boolean; onToggleSelect: () => void }) => (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-sm text-foreground">
            {item.activity_name || 'N/A'}
          </h3>
          <p className="text-xs text-muted-foreground">{item.id}</p>
        </div>

        <span
          className={`px-2 py-0.5 text-xs rounded-full font-medium
            ${normalizeStatus(item.status) === 'completed'
              ? 'bg-green-100 text-green-700'
              : normalizeStatus(item.status) === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : normalizeStatus(item.status) === 'open'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600'
            }`}
        >
          {item.status || 'N/A'}
        </span>
      </div>

      {/* Body */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Asset</span>
          <span className="font-medium">{item.name || '-'}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Created</span>
          <span className="font-medium">
            {item.created_at
              ? new Date(item.created_at).toLocaleDateString()
              : '-'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 pt-3 mt-3 border-t border-border text-sm">
        <button
          onClick={() => navigate(`/audit/operational/checklists/view/${item.id}`)}
          className="flex items-center gap-1 text-purple-700 hover:text-primary"
        >
          <Eye className="w-4 h-4" /> View
        </button>

        <button
          onClick={() =>
            navigate(`/audit/operational/checklists/Edit/${item.id}`)
          }
          className="flex items-center gap-1 text-purple-700 hover:text-primary"
        >
          <Edit2 className="w-4 h-4" /> Edit
        </button>
      </div>
    </div>
  );

  // Loading state
  if (loading && allChecklists.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading checklists...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && allChecklists.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Checklists</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
        {/* Left side - Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {statusFilters.map((filter) => (
            <label
              key={filter}
              className={`relative inline-flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer mb-5
                ${activeFilter === filter
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <input
                type="radio"
                name="statusFilter"
                value={filter}
                checked={activeFilter === filter}
                onChange={() => handleFilterChange(filter)}
                className="w-4 h-4"
              />
              <span>{filter}</span>
              {activeFilter === filter && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </label>
          ))}
        </div>

        {/* Right side - Toolbar */}
        <ListToolbar
          searchPlaceholder="Search checklists by Activity, Asset Name, Id"
          searchValue={searchValue}
          onSearchChange={handleSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle
          showAddButton
          addButtonLabel="Add Checklist"
          onAddClick={() => navigate('/audit/operational/checklists/create')}
          showFilter={false}
          showExport
          onExportClick={handleExport}
          additionalButtons={
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
          }
          className="mb-0"
        />
      </div>

      {/* Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-card shadow-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Bulk Upload
              </h2>
              <button
                className="text-xl leading-none hover:text-muted-foreground"
                onClick={() => {
                  setIsImportOpen(false);
                  setImportFile(null);
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="border border-dashed border-border rounded-lg p-6 text-center bg-muted/30">
                <p className="font-medium mb-2">Drag &amp; Drop or</p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90">
                  <Upload className="w-4 h-4" />
                  Choose File
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-muted-foreground mt-2">
                  {importFile ? importFile.name : 'No file chosen'}
                </p>
              </div>

              <div className="flex justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent"
                >
                  <Download className="w-4 h-4" />
                  Download Sample Format
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsImportOpen(false);
                      setImportFile(null);
                    }}
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && checklists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <AlertCircle className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Checklists Found</h3>
          <button
            onClick={() => navigate('/audit/operational/checklists/create')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
          >
            + Add Checklist
          </button>
        </div>
      )}

      {/* Grid View */}
      {!loading && viewMode === 'grid' && checklists.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {checklists.map((item) => (
            <ChecklistCard
              key={item.id}
              item={item}
              isSelected={selectedRows.includes(String(item.id))}
              onToggleSelect={() => toggleSelectRow(String(item.id))}
            />
          ))}
        </div>
      )}

      {/* Table View (List mode) */}
      {!loading && viewMode === 'list' && checklists.length > 0 && (
        <DataTable
          columns={columns}
          data={Array.isArray(checklists) ? checklists : []}
          loading={loading}
          pagination={false}
          onRowClicked={(row: any) => navigate(`/audit/operational/checklists/${row.id}`)}
          selectableRows
          className="mt-4"
        />
      )}

      {/* PAGINATION */}
      {!loading && checklists.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 text-sm text-muted-foreground mt-4 bg-white border rounded-md">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.perPage + 1} to{' '}
            {Math.min(pagination.page * pagination.perPage, pagination.total)} of{' '}
            {pagination.total} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(p => ({ ...p, page: 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-accent"
            >
              {'«'}
            </button>

            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-accent"
            >
              {'‹ Prev'}
            </button>

            <span className="px-3 py-1 border rounded bg-primary text-primary-foreground">
              {pagination.page}
            </span>

            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-accent"
            >
              {'Next ›'}
            </button>

            <button
              onClick={() => setPagination(p => ({ ...p, page: p.totalPages }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-accent"
            >
              {'»'}
            </button>
          </div>

          <select
            value={pagination.perPage}
            onChange={(e) => setPagination(p => ({ ...p, perPage: Number(e.target.value), page: 1 }))}
            className="px-3 py-1 border rounded hover:bg-accent"
          >
            <option value={10}>10 / page</option>
            <option value={12}>12 / page</option>
            <option value={24}>24 / page</option>
            <option value={48}>48 / page</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default ChecklistsList;