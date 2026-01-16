import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DataCard from '../../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';
import { routineTaskService, RoutineTask } from '../../../services/assetSubModules.service';
import { Loader2, ListTodo, AlertCircle, RefreshCw, Eye } from 'lucide-react';

interface RoutineTaskListProps {
  viewMode: 'grid' | 'table';
  searchValue: string;
  perPage?: number;
}

const RoutineTaskList: React.FC<RoutineTaskListProps> = ({ viewMode, searchValue, perPage = 10 }) => {
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, perPage, total: 0, totalPages: 0 });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Update perPage when prop changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, perPage, page: 1 }));
  }, [perPage]);

  // Debounce search to reduce API calls and reset to first page on change
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await routineTaskService.getRoutineTasks(pagination.page, pagination.perPage, {
        search: debouncedSearch || undefined,
      });
      const data = response.data;
      const taskList = Array.isArray(data) ? data : data?.activities || data?.data || [];
      const total = data.total || data.total_count || data.count || taskList.length;
      setTasks(taskList);
      setPagination(prev => ({
        ...prev,
        total,
        totalPages: data.total_pages || Math.ceil(total / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, debouncedSearch]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const formatDateTime = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleString();
  };

  const startIndex = (pagination.page - 1) * pagination.perPage;

  const columns: TableColumn<RoutineTask>[] = [
    {
      key: 'action',
      header: 'Action',
      width: '80px',
      render: (_, row) => (
        <Link to={`/asset/routine-task/${row.asset_id || 0}/${row.id}`} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors inline-flex">
          <Eye className="w-4 h-4" />
        </Link>
      ),
    },
    { key: 'id', header: 'S.No', width: '80px', render: (_val, _row, idx) => startIndex + idx + 1 },
    { key: 'checklist_name', header: 'Checklist', sortable: true, render: (v) => v || '-' },
    { key: 'asset_name', header: 'Asset', render: (v) => v || '-' },
    {
      key: 'assigned_to_name',
      header: 'Assigned To',
      render: (_v, row) => row.assigned_to_name || row.assigned_to || '-',
    },
    {
      key: 'checklist_frequency',
      header: 'Frequency',
      render: (_v, row) => row.checklist_frequency || row.frequency || '-',
    },
    {
      key: 'created_at',
      header: 'Created At',
      render: (v) => formatDateTime(v as string),
    },
    {
      key: 'updated_at',
      header: 'Updated At',
      render: (v) => formatDateTime(v as string),
    },
    {
      key: 'location',
      header: 'Location',
      render: (v) => v || '-',
    },
    { key: 'start_time', header: 'Start', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'status', header: 'Status', render: (v) => v || '-' },
  ];

  if (loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading routine tasks...</p>
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Tasks</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button onClick={fetchTasks} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
        <ListTodo className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Routine Tasks Found</h3>
        <p className="text-muted-foreground mb-4">{searchValue ? `No tasks match "${searchValue}"` : 'No routine tasks scheduled yet'}</p>
        <Link to="/asset/routine-task/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Add Task</Link>
      </div>
    );
  }

  return (
    <>
      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tasks.map((task) => (
            <DataCard
              key={task.id}
              title={task.checklist_name || `Task #${task.id}`}
              subtitle={task.asset_name || '-'}
              // show raw status text instead of mapped badge
              fields={[
                { label: 'Assigned To', value: task.assigned_to_name || task.assigned_to || '-' },
                { label: 'Frequency', value: task.checklist_frequency || task.frequency || '-' },
                { label: 'Start', value: task.start_time ? new Date(task.start_time).toLocaleDateString() : '-' },
                { label: 'Updated', value: formatDateTime(task.updated_at as any) },
                { label: 'Status', value: task.status || '-' },
                { label: 'Location', value: task.location || '-' },
              ]}
              viewPath={`/asset/routine-task/${task.asset_id || 0}/${task.id}`}
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tasks}
          viewPath={(row) => `/asset/routine-task/${row.asset_id || 0}/${row.id}`}
        />
      )}

      {tasks.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">Showing {((pagination.page - 1) * pagination.perPage) + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} records</div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">{'<<'}</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Prev</button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Next</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.totalPages || prev.page }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">{'>>'}</button>
          </div>
          <select value={pagination.perPage} onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))} className="px-2 py-1.5 text-sm border border-border rounded-md bg-background">
            <option value={10}>10 / page</option><option value={12}>12 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option>
          </select>
        </div>
      )}
    </>
  );
};

export default RoutineTaskList;
