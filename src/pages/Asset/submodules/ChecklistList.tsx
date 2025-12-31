import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DataCard from '../../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../../components/ui/StatusBadge';
import { Loader2, ClipboardList, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { getChecklist } from '../../../api';

interface Checklist {
  id: number;
  site_id: number;
  name: string;
  frequency: string;
  start_date: string;
  end_date: string;
  user_id: number;
  grace_period_unit: string;
  grace_period_value: string | null;
  created_at: string;
  updated_at: string;
  occurs: string;
  ctype: string;
  priority_level: string | null;
  grace_period: number;
  supplier_id: number | null;
  lock_overdue: boolean | null;
  supervisors: string[];
  checklist_cron: any;
  groups: any[];
  url: string;
}

interface ChecklistListProps {
  viewMode: 'grid' | 'table';
  searchValue: string;
  perPage?: number;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  isColumnMenuOpen: boolean;
  setIsColumnMenuOpen: (value: boolean) => void;
}

const ChecklistList: React.FC<ChecklistListProps> = ({ 
  viewMode, 
  searchValue, 
  perPage = 10,
  isFilterOpen,
  setIsFilterOpen,
  isColumnMenuOpen,
  setIsColumnMenuOpen
}) => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage, total: 0, totalPages: 0 });
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  useEffect(() => {
    setPagination(prev => ({ ...prev, perPage, page: 1 }));
  }, [perPage]);

  const fetchChecklists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getChecklist();
      const sortedChecklists = response.data.checklists.sort((a: Checklist, b: Checklist) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setChecklists(sortedChecklists);
      setPagination(prev => ({
        ...prev,
        total: sortedChecklists.length,
        totalPages: Math.ceil(sortedChecklists.length / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch checklists');
      setChecklists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChecklists(); }, [fetchChecklists]);

  // Client-side search filtering
  const filteredChecklists = checklists.filter(checklist => 
    !searchValue || checklist.name?.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Client-side pagination
  const startIndex = (pagination.page - 1) * pagination.perPage;
  const endIndex = startIndex + pagination.perPage;
  const paginatedChecklists = filteredChecklists.slice(startIndex, endIndex);

  const allColumns: Array<TableColumn<Checklist> & { id: string; label: string }> = [
    { id: 'id', label: 'S.No', key: 'id', header: 'S.No', width: '80px', render: (_val, _row, idx) => startIndex + idx + 1 },
    { id: 'name', label: 'Name', key: 'name', header: 'Name', sortable: true, render: (v) => v || '-' },
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
        <Link to={`/assets/associate-checklist/${row.id}`} className="px-4 py-1 bg-green-500 text-white rounded-full text-xs">
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

  if (paginatedChecklists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
        <ClipboardList className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Checklists Found</h3>
        <p className="text-muted-foreground mb-4">{searchValue ? `No checklists match "${searchValue}"` : 'No checklists created yet'}</p>
        <Link to="/asset/checklist/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Add Checklist</Link>
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
          {paginatedChecklists.map((checklist) => (
            <DataCard
              key={checklist.id}
              title={checklist.name}
              subtitle={`Type: ${checklist.ctype || 'Routine'}`}
              status="available"
              fields={[
                { label: 'Frequency', value: checklist.frequency || '-' },
                { label: 'Start Date', value: checklist.start_date || '-' },
                { label: 'End Date', value: checklist.end_date || '-' },
                { label: 'Groups', value: checklist.groups?.length?.toString() || '0' },
              ]}
              viewPath={`/asset/checklist/${checklist.id}`}
              editPath={`/asset/checklist/${checklist.id}/edit`}
            />
          ))}
        </div>
      ) : (
        <DataTable 
          columns={visibleColumns} 
          data={paginatedChecklists} 
          selectable 
          selectedRows={selectedRows} 
          onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])} 
          onSelectAll={() => setSelectedRows(selectedRows.length === paginatedChecklists.length ? [] : paginatedChecklists.map(c => String(c.id)))} 
          viewPath={(row) => `/asset/checklist/${row.id}`} 
        />
      )}

      {paginatedChecklists.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredChecklists.length)} of {filteredChecklists.length} records
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">«</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">‹ Prev</button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={endIndex >= filteredChecklists.length} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Next ›</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: Math.ceil(filteredChecklists.length / prev.perPage) }))} disabled={endIndex >= filteredChecklists.length} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">»</button>
          </div>
          <select value={pagination.perPage} onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))} className="px-2 py-1.5 text-sm border border-border rounded-md bg-background">
            <option value={10}>10 / page</option><option value={12}>12 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option>
          </select>
        </div>
      )}
    </>
  );
};

export default ChecklistList;