import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ListToolbar from '../../components/ui/ListToolbar';
import DataCard from '../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import { getServicesChecklist, exportChecklist } from '../../api';
import { Loader2, ClipboardList, AlertCircle, RefreshCw, Eye, Copy, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

interface Checklist {
  id: number | string;
  name: string;
  start_date?: string;
  end_date?: string;

  // API may return either
  priority?: string;
  priority_level?: string | number;

  frequency?: string;

  // API may return either
  group_count?: number;
  groups?: any[];

  association_count?: number;
  associations?: any[];

  created_at?: string;
}


const ChecklistList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const getPerPage = (mode: 'grid' | 'table') => mode === 'grid' ? 12 : 10;
  const [pagination, setPagination] = useState({ page: 1, perPage: getPerPage('grid'), total: 0, totalPages: 0 });

  useEffect(() => {
    setPagination(prev => ({ ...prev, perPage: getPerPage(viewMode), page: 1 }));
  }, [viewMode]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchValue]);

  const fetchChecklists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getServicesChecklist(
        pagination.page,
        pagination.perPage,
        searchValue.trim()
      );
      const data = response.data;
      const checklistList = Array.isArray(data) ? data : data?.checklists || data?.data || [];
      const normalized: Checklist[] = (checklistList || [])
  .map((c: any) => ({
    id: c.id,
    name: c.name,
    start_date: c.start_date,
    end_date: c.end_date,
    frequency: c.frequency,

    // ✅ priority fix
    priority: c.priority ?? c.priority_level,

    // ✅ groups count fix
    group_count: c.group_count ?? (Array.isArray(c.groups) ? c.groups.length : 0),
    groups: c.groups,

    associations: c.associations ?? [],
    association_count: c.association_count ?? (Array.isArray(c.associations) ? c.associations.length : 0),

    created_at: c.created_at,
  }))
  // ✅ newest first (same as old project)
  .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

      setChecklists(normalized);
      setPagination(prev => ({
        ...prev,
        total: data.total || data.total_count || data.count || normalized.length,
        totalPages: data.total_pages || Math.ceil((data.total || data.total_count || data.count || normalized.length) / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch checklists');
      setChecklists([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, searchValue]);

  useEffect(() => { fetchChecklists(); }, [fetchChecklists]);

  const handleExport = async () => {
    try {
      const response = await exportChecklist();
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'checklists.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export successful');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getPriorityStatus = (priority?: string): StatusType => {
    const p = priority?.toLowerCase();
    if (p === 'high') return 'breakdown';
    if (p === 'medium') return 'maintenance';
    return 'in-use';
  };

  const columns: TableColumn<Checklist>[] = [
    {
      key: 'actions',
      header: 'ACTION',
      width: '100px',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Link to={`/soft-services/checklist/${row.id}`} className="p-1.5 rounded-md hover:bg-accent text-primary">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/soft-services/checklist/${row.id}/edit`} className="p-1.5 rounded-md hover:bg-accent text-primary">
            <Edit className="w-4 h-4" />
          </Link>
          <Link to={`/admin/copy-checklist/service/${row.id}`} className="p-1.5 rounded-md hover:bg-accent text-primary">
            <Copy className="w-4 h-4" />
          </Link>
        </div>
      )
    },
    { key: 'name', header: 'NAME', sortable: true },
    { key: 'start_date', header: 'START DATE', render: (v) => formatDate(v) },
    { key: 'end_date', header: 'END DATE', render: (v) => formatDate(v) },
    {
      key: 'priority',
      header: 'PRIORITY LEVEL',
      render: (v) =>
        v ? (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-accent text-foreground border border-border">
            {String(v)}
          </span>
        ) : (
          '-'
        ),
    },
    { key: 'frequency', header: 'FREQUENCY', render: (v) => v || '-' },
    {
  key: 'group_count',
  header: 'NO. OF GROUPS',
  render: (_, row) => String(row.group_count ?? (row.groups?.length ?? 0)),
},

    { 
      key: 'associations', 
      header: 'ASSOCIATIONS', 
      render: (_, row) => (
        <Link
          to={`/soft-services/associate-checklist/${row.id}`}
          className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
        >
          Associate
        </Link>
      )
    },
  ];

  if (loading && checklists.length === 0) {
    return (
      <div className="p-6">
        <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Checklist' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading checklists...</p>
        </div>
      </div>
    );
  }

  if (error && checklists.length === 0) {
    return (
      <div className="p-6">
        <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Checklist' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Checklists</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button onClick={fetchChecklists} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Checklist' }]} />

      <ListToolbar
        searchPlaceholder="Search By name"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExport}
        onAdd={() => navigate('/soft-services/checklist/create')}
        addLabel="Add"
      />

      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}

      {!loading && checklists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <ClipboardList className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Checklists Found</h3>
          <Link to="/soft-services/checklist/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Add Checklist</Link>
        </div>
      )}

      {viewMode === 'grid' && checklists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {checklists.map((checklist) => (
            <DataCard 
              key={checklist.id} 
              title={checklist.name} 
              subtitle={`Frequency: ${checklist.frequency || '-'}`}
              status={getPriorityStatus(checklist.priority)}
              fields={[
                { label: 'Start Date', value: formatDate(checklist.start_date) },
                { label: 'End Date', value: formatDate(checklist.end_date) },
                { label: 'Priority', value: checklist.priority || '-' },
                { label: 'Groups', value: String(checklist.group_count || 0) },
              ]} 
              viewPath={`/soft-services/checklist/${checklist.id}`}
              editPath={`/soft-services/checklist/${checklist.id}/edit`}
              copyPath={`/admin/copy-checklist/service/${checklist.id}`}
            />
          ))}
        </div>
      ) : checklists.length > 0 && (
        <DataTable 
          columns={columns} 
          data={checklists} 
        />
      )}

      {checklists.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} records
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">«</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">‹ Prev</button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Next ›</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.totalPages }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">»</button>
          </div>
          <select 
            value={pagination.perPage} 
            onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))} 
            className="px-2 py-1.5 text-sm border border-border rounded-md bg-background"
          >
            <option value={10}>10</option>
            <option value={12}>12</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default ChecklistList;
