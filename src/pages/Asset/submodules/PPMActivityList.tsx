import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DataCard from '../../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../../components/ui/StatusBadge';
import { Loader2, Activity, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { getPPMTask } from '../../../api';

interface PPMActivity {
  id: number;
  asset_id: number;
  checklist_id: number;
  start_time: string;
  end_time: string | null;
  status: string;
  assigned_to: number;
  created_at: string;
  updated_at: string;
  checklist_name: string;
  checklist_frequency: string;
  asset_name: string;
  soft_service_id: number | null;
  soft_service_name: string | null;
  assigned_to_name: string;
  location: string;
  url: string;
}

interface PPMActivityListProps {
  viewMode: 'grid' | 'table';
  searchValue: string;
  perPage?: number;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  isColumnMenuOpen: boolean;
  setIsColumnMenuOpen: (value: boolean) => void;
}

const PPMActivityList: React.FC<PPMActivityListProps> = ({ 
  viewMode, 
  searchValue, 
  perPage = 10,
  isFilterOpen,
  setIsFilterOpen,
  isColumnMenuOpen,
  setIsColumnMenuOpen
}) => {
  const [activities, setActivities] = useState<PPMActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, perPage, total: 0, totalPages: 0 });
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    setPagination(prev => ({ ...prev, perPage, page: 1 }));
  }, [perPage]);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPPMTask();
      const filteredServiceTask = response.data.activities
        .filter((asset: PPMActivity) => asset.asset_name)
        .sort((a: PPMActivity, b: PPMActivity) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      setActivities(filteredServiceTask);
      setPagination(prev => ({
        ...prev,
        total: filteredServiceTask.length,
        totalPages: Math.ceil(filteredServiceTask.length / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch PPM activities');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const dateFormat = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getActivityStatus = (activity: PPMActivity): StatusType => {
    const status = activity.status?.toLowerCase();
    if (status === 'complete' || status === 'completed') return 'checked-out';
    if (status === 'overdue') return 'breakdown';
    if (status === 'pending') return 'pending';
    return 'available';
  };

  // Client-side search filtering
  let filteredActivities = activities.filter(activity => 
    !searchValue || 
    activity.asset_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    activity.checklist_name?.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Client-side status filtering
  if (selectedStatus !== 'all') {
    filteredActivities = filteredActivities.filter(
      (item) => item.status.toLowerCase() === selectedStatus
    );
  }

  // Client-side pagination
  const startIndex = (pagination.page - 1) * pagination.perPage;
  const endIndex = startIndex + pagination.perPage;
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

  const allColumns: Array<TableColumn<PPMActivity> & { id: string; label: string }> = [
    { id: 'id', label: 'S.No', key: 'id', header: 'S.No', width: '80px', render: (_val, _row, idx) => startIndex + idx + 1 },
    { id: 'view', label: 'View', key: 'view', header: 'View', width: '80px', render: (_v, row) => (
      <Link to={`/assets/routine-task-details/${row.asset_id}/${row.id}`} className="inline-flex items-center justify-center text-primary hover:text-primary/80" aria-label="View details">
        <Eye className="w-4 h-4" />
      </Link>
    ) },
    { id: 'asset_name', label: 'Asset Name', key: 'asset_name', header: 'Asset Name', sortable: true, render: (v) => v || '-' },
    { id: 'checklist_name', label: 'Checklist', key: 'checklist_name', header: 'Checklist', sortable: true, render: (v) => v || '-' },
    { id: 'start_time', label: 'Start Date', key: 'start_time', header: 'Start Date', sortable: true, render: (v) => dateFormat(v) },
    { id: 'status', label: 'Status', key: 'status', header: 'Status', sortable: true, render: (v) => v || '-' },
    { id: 'assigned_to_name', label: 'Assigned To', key: 'assigned_to_name', header: 'Assigned To', sortable: true, render: (v) => v || '-' },
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

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 when status changes
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading PPM activities...</p>
      </div>
    );
  }

  if (error && activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load PPM Activities</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button onClick={fetchActivities} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (paginatedActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
        <Activity className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No PPM Activities Found</h3>
        <p className="text-muted-foreground mb-4">{searchValue ? `No activities match "${searchValue}"` : 'No PPM activities scheduled yet'}</p>
      </div>
    );
  }

  return (
    <>
      {/* Status Filter Radio Buttons */}
      <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
        <div className="flex justify-between items-center gap-2 border border-border rounded-md px-3 py-2">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="all"
              name="status"
              checked={selectedStatus === "all"}
              onChange={() => handleStatusChange("all")}
              className="w-4 h-4"
            />
            <label htmlFor="all" className="text-sm cursor-pointer">All</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="pending"
              name="status"
              checked={selectedStatus === "pending"}
              onChange={() => handleStatusChange("pending")}
              className="w-4 h-4"
            />
            <label htmlFor="pending" className="text-sm cursor-pointer">Pending</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="completed"
              name="status"
              checked={selectedStatus === "complete"}
              onChange={() => handleStatusChange("complete")}
              className="w-4 h-4"
            />
            <label htmlFor="completed" className="text-sm cursor-pointer">Completed</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="overdue"
              name="status"
              checked={selectedStatus === "overdue"}
              onChange={() => handleStatusChange("overdue")}
              className="w-4 h-4"
            />
            <label htmlFor="overdue" className="text-sm cursor-pointer">Overdue</label>
          </div>
        </div>
      </div>

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
          {paginatedActivities.map((activity) => (
            <DataCard
              key={activity.id}
              title={activity.asset_name || `Activity #${activity.id}`}
              subtitle={activity.checklist_name || '-'}
              status={getActivityStatus(activity)}
              fields={[
                { label: 'Start Date', value: dateFormat(activity.start_time) },
                { label: 'Status', value: activity.status || '-' },
                { label: 'Assigned To', value: activity.assigned_to_name || '-' },
              ]}
              viewPath={`/assets/routine-task-details/${activity.asset_id}/${activity.id}`}
            />
          ))}
        </div>
      ) : (
        <DataTable 
          columns={visibleColumns} 
          data={paginatedActivities} 
          viewPath={(row) => `/assets/routine-task-details/${row.asset_id}/${row.id}`} 
        />
      )}

      {paginatedActivities.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredActivities.length)} of {filteredActivities.length} records
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">«</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">‹ Prev</button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={endIndex >= filteredActivities.length} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Next ›</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: Math.ceil(filteredActivities.length / prev.perPage) }))} disabled={endIndex >= filteredActivities.length} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">»</button>
          </div>
          <select value={pagination.perPage} onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))} className="px-2 py-1.5 text-sm border border-border rounded-md bg-background">
            <option value={10}>10 / page</option><option value={12}>12 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option>
          </select>
        </div>
      )}
    </>
  );
};

export default PPMActivityList;
