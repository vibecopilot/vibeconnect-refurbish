import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import DataCard from '../../components/ui/DataCard';
import { getServicesRoutineList, getSoftServiceDownload } from '../../api';
import { Loader2, ListTodo, AlertCircle, RefreshCw, Eye, Download, Search, LayoutList, LayoutGrid, EyeOff, Eye as EyeIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface Task {
  id: number | string;
  soft_service_name?: string;
  checklist_name?: string;
  start_time?: string;
  status?: string;
  assigned_to_name?: string;
  service_name?: string;
  name?: string;
}

type FilterType = 'all' | 'pending' | 'completed' | 'overdue';

const TaskList: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = activeFilter === 'all' ? null : activeFilter;
      const response = await getServicesRoutineList(
        pagination.page, 
        pagination.perPage, 
        startDate, 
        endDate,
        statusParam,
        debouncedSearch
      );
      const data = response.data;
      const taskList = Array.isArray(data) ? data : data?.activities || data?.data || [];
      
      setTasks(taskList);
      setPagination(prev => ({
        ...prev,
        total: data.total || data.total_count || taskList.length,
        totalPages: data.total_pages || Math.ceil((data.total || taskList.length) / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, startDate, endDate, activeFilter, debouncedSearch]);

  useEffect(() => { 
    fetchTasks(); 
  }, [fetchTasks]);

  const handleApply = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClear = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    setActiveFilter('all');
    setSearchValue('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExport = async () => {
    try {
      const response = await getSoftServiceDownload();
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tasks.xlsx';
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

  const getStatusType = (status?: string): StatusType => {
    const s = status?.toLowerCase();
    if (s === 'completed' || s === 'closed') return 'in-use';
    if (s === 'overdue') return 'breakdown';
    if (s === 'pending' || s === 'open') return 'maintenance';
    return 'in-store';
  };

  const columns: TableColumn<Task>[] = [
    { 
      key: 'actions', 
      header: 'ACTION', 
      width: '80px',
      render: (_, row) => (
        <Link to={`/soft-services/task/${row.id}`} className="p-1.5 rounded-md hover:bg-accent text-primary inline-flex">
          <Eye className="w-4 h-4" />
        </Link>
      )
    },
    { key: 'soft_service_name', header: 'SERVICE NAME', sortable: true, render: (v, row) => v || row.service_name || row.name || '-' },
    { key: 'checklist_name', header: 'CHECKLIST NAME', render: (v) => v || '-' },
    { key: 'start_time', header: 'START DATE', render: (v) => formatDate(v) },
    { key: 'status', header: 'STATUS', render: (v) => v ? <StatusBadge status={getStatusType(v)} label={v} /> : '-' },
    { key: 'assigned_to_name', header: 'ASSIGNED TO', render: (v) => v || '-' },
  ];

  const visibleColumns = columns.filter(col => !hiddenColumns.has(col.key as string));

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
    { key: 'overdue', label: 'Overdue' },
  ];

  if (loading && tasks.length === 0) {
    return (
      <div className="p-6">
        <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Task' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div className="p-6">
        <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Task' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Tasks</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button onClick={fetchTasks} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Task' }]} />

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
            />
          </div>

          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Apply
          </button>

          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Clear
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <Download className="w-4 h-4" />
            Export ({pagination.total})
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 mt-4">
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => {
                setActiveFilter(btn.key);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                activeFilter === btn.key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-accent'
              }`}
            >
              {btn.label}
              </button>
            ))}

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <div className="flex rounded-md overflow-hidden border border-border">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm flex items-center gap-1 ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                title="List view"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm flex items-center gap-1 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tasks"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                className="px-3 py-2 text-sm border border-border rounded-md hover:bg-accent"
              >
                Hide Columns
              </button>
              {isColumnMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-card border border-border rounded-lg shadow-lg z-40 max-h-80 overflow-y-auto">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
                    Toggle Column Visibility
                  </div>
                  {columns.map((col) => (
                    <label key={col.key as string} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.has(col.key as string)}
                        onChange={() => {
                          setHiddenColumns(prev => {
                            const next = new Set(prev);
                            if (next.has(col.key as string)) next.delete(col.key as string); else next.add(col.key as string);
                            return next;
                          });
                        }}
                        className="w-4 h-4"
                      />
                      <span className="flex items-center gap-2 text-sm">
                        {hiddenColumns.has(col.key as string) ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <EyeIcon className="w-4 h-4 text-primary" />}
                        {col.header}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}

      {!loading && tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <ListTodo className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      )}

      {tasks.length > 0 && (
        viewMode === 'table' ? (
          <DataTable columns={visibleColumns} data={tasks} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tasks.map((task) => (
              <DataCard
                key={task.id}
                title={task.soft_service_name || task.service_name || task.name || 'Task'}
                subtitle={task.checklist_name ? `Checklist: ${task.checklist_name}` : undefined}
                status={task.status ? getStatusType(task.status) : undefined}
                fields={[
                  { label: 'Start Date', value: formatDate(task.start_time) },
                  { label: 'Assigned To', value: task.assigned_to_name || '-' },
                  { label: 'Status', value: task.status || '-' },
                ]}
                viewPath={`/soft-services/task/${task.id}`}
              />
            ))}
          </div>
        )
      )}

      {/* Pagination */}
      {tasks.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} records
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              {"<<"}
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">
              {pagination.page}
            </span>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.totalPages }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              {">>"}
            </button>
          </div>
          <select 
            value={pagination.perPage} 
            onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))} 
            className="px-2 py-1.5 text-sm border border-border rounded-md bg-background"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default TaskList;
