import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../../components/list/ListToolbar';
import DataTable from '../../../components/table/DataTable';
import { getAuditScheduled } from '../../../api';
import { useViewMode } from '../../../hooks/useViewMode';

interface ScheduledAudit {
  id: number;
  activity_name: string;
  task_name: string;
  assigned_to: string;
  assigned_to_name: string;
  created_at: string;
  status: string;
}

const statusFilters = ['All', 'Open', 'Closed', 'Pending', 'Completed'];

const ScheduledList: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode, recordsPerPage } = useViewMode();
  const [data, setData] = useState<ScheduledAudit[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  // Server-side pagination (ContactBook-style)
  const getDefaultPerPage = (mode: 'grid' | 'list') => (mode === 'grid' ? 12 : 10);

  const [pagination, setPagination] = useState({
    page: 1,
    perPage: getDefaultPerPage(viewMode),
    total: 0,
    totalPages: 1,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchText) params.search = searchText;
      if (activeFilter && activeFilter !== 'All') params.status = activeFilter;

      const response = await getAuditScheduled(pagination.page, pagination.perPage, params);
      const raw = response?.data;
      const rawItems = Array.isArray(raw) ? raw : raw.data || raw.audits || raw.items || [];

      const items: ScheduledAudit[] = rawItems.map((it: any) => ({
        id: it.id,
        activity_name: it.activity_name || it.activity || it.name || '',
        task_name: (it.tasks && it.tasks.length > 0 && it.tasks[0].name) || it.task_name || it.task || '',
        assigned_to: it.assigned_to || it.assign_to || (it.assigned && it.assigned.id) || '',
        assigned_to_name: it.assigned_to_name || (it.assigned && (it.assigned.firstname || it.assigned.name)) || it.assigned_name || '',
        created_at: it.created_at || it.created_on || '',
        status: it.status || it.audit_status || '',
      }));

      // Determine if API provided pagination metadata
      const hasServerPagination = raw?.total_pages !== undefined || raw?.current_page !== undefined || raw?.total !== undefined || raw?.total_count !== undefined || raw?.count !== undefined;

      let total = raw?.count || raw?.total || raw?.total_count || items.length;
      let tPages = raw?.total_pages || Math.max(1, Math.ceil(total / pagination.perPage));
      const currentPage = raw?.current_page || pagination.page;

      // Client-side fallback: if API returned all items (no pagination metadata), slice items locally
      if (!hasServerPagination) {
        total = items.length;
        tPages = Math.max(1, Math.ceil(total / pagination.perPage));
        const start = (pagination.page - 1) * pagination.perPage;
        const end = start + pagination.perPage;
        const pageItems = items.slice(start, end);
        setData(pageItems);
      } else {
        setData(items);
      }

      setPagination((prev) => ({ ...prev, total, totalPages: tPages, page: currentPage }));
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch scheduled audits');
      setData([]);
      setPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const timer = setTimeout(() => {
    fetchData();
  }, 300);

  return () => clearTimeout(timer);
}, [pagination.page, pagination.perPage, searchText, activeFilter]);

// Keep perPage in sync with view mode
useEffect(() => {
  setPagination(prev => ({ ...prev, perPage: getDefaultPerPage(viewMode), page: 1 }));
}, [viewMode]);

 const handleSearch = (value: string) => {
  setSearchText(value);
  setPagination((p) => ({ ...p, page: 1 }));
};

const handleFilterChange = (filter: string) => {
  setActiveFilter(filter);
  setPagination((p) => ({ ...p, page: 1 }));
};


  const handleExport = async () => {
    try {
      const response = await getAuditScheduled(1, 1000); // Fetch up to 1000 records for export
      const raw = response?.data;
      const allItems = Array.isArray(raw) ? raw : raw.data || raw.audits || [];

      const dataToExport = allItems.map((it: any) => ({
        id: it.id,
        activity_name: it.activity_name || it.activity || it.name || '',
        task_name: (it.tasks && it.tasks.length > 0 && it.tasks[0].name) || it.task_name || it.task || '',
        assigned_to_name: it.assigned_to_name || (it.assigned && (it.assigned.firstname || it.assigned.name)) || it.assigned_name || '',
        created_at: it.created_at || it.created_on || '',
        status: it.status || it.audit_status || '',
      }));

      const csvContent = [
        ['ID', 'Activity', 'Task', 'Assigned To', 'Created On', 'Status'].join(','),
        ...dataToExport.map(item=> [
          item.id,
          item.activity_name || '',
          item.task_name || '',
          item.assigned_to_name || '',
          item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
          item.status || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'operational_scheduled_audits.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Exported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export audits');
    }
  };

  const columns = [
    {
      name: 'Action',
      width: '100px',
      cell: (row: ScheduledAudit) => (
        <div className="flex items-center">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/audit/operational/scheduled/view/${row.id}`); }}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/audit/operational/scheduled/edit/${row.id}`); }}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
        </div>
      ),
    },
    { name: 'ID', selector: (row: ScheduledAudit) => row.id, sortable: true, width: '80px' },
    { name: 'Activity', selector: (row: ScheduledAudit) => row.activity_name || '-', sortable: true },
    { name: 'Task', selector: (row: ScheduledAudit) => row.task_name || '-', sortable: true },
    { name: 'Assigned To', selector: (row: ScheduledAudit) => row.assigned_to_name || row.assigned_to || '-', sortable: true },
    { name: 'Created On', selector: (row: ScheduledAudit) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-', sortable: true },
  ];

  const AuditCard = ({ item }: { item: ScheduledAudit }) => (
    <div className="relative bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* <div className="absolute top-3 right-3 text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md shadow-sm">
        ID: {item.id ?? '-'}
      </div> */}

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ClipboardList className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{item.activity_name || 'N/A'}</h3>
            <p className="text-sm text-muted-foreground">{item.id}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${item.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
              item.status === 'Open' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
          }`}>
          {item.status || 'N/A'}
        </span>
      </div>

      <div className="space-y-1 text-sm text-muted-foreground mb-4 mt-4">
        <p>Task: {item.task_name || '-'}</p>
        <p>Assigned To: {item.assigned_to_name || '-'}</p>
        <p>Created: {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</p>
      </div>
    <div className="flex items-center gap-2 pt-2 border-t border-border">
  <button
    onClick={() => navigate(`/audit/operational/scheduled/${item.id}`)}
    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-accent 
               text-purple-700 hover:text-primary transition-colors text-xs font-medium"
    title="View"
  >
    <Eye className="w-4 h-4" />
    <span>View</span>
  </button>

  <button
    onClick={() => navigate(`/audit/operational/scheduled/${item.id}/edit`)}
    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-accent 
               text-purple-700 hover:text-primary transition-colors text-xs font-medium"
    title="Edit"
  >
    <Edit2 className="w-4 h-4" />
    <span>Edit</span>
  </button>
</div>


    </div>
  );

  return (
    <div>
      {/* Status Filters - radio buttons */}
      <div className="flex gap-4 mb-4 items-center flex-wrap">
        {statusFilters.map((filter) => (
          <label key={filter} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="statusFilter"
              value={filter}
              checked={activeFilter === filter}
              onChange={() => handleFilterChange(filter)}
              className="w-4 h-4"
            />
            <span className={`transition-colors ${activeFilter === filter ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {filter}
            </span>
          </label>
        ))}
      </div>

      <ListToolbar
        searchPlaceholder="Search audits..."
        searchValue={searchText}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle
        showAddButton
        addButtonLabel="Add Audit"
        onAddClick={() => navigate('/audit/operational/scheduled/create')}
        showFilter={false}
        showExport
        onExportClick={handleExport}
      />

      {/* Loading State */}
      {loading && (
        <div className="text-center text-muted-foreground py-8">Loading audits...</div>
      )}

      {/* Grid View */}
      {!loading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {data.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-8">No audits found</div>
          ) : (
            data.map((item) => (
              <AuditCard key={item.id} item={item} />
            ))
          )}
        </div>
      )}

      {/* Table View (List mode) */}
      {!loading && viewMode === 'list' && (
        <DataTable
          columns={columns}
          data={Array.isArray(data) ? data : []}
          loading={loading}
          pagination={false}
          onRowClicked={(row: any) => navigate(`/audit/operational/scheduled/view/${row.id}`)}
          selectableRows
          className="mt-4"
        />
      )}

      {/* PAGINATION (Server-side, ContactBook style) */}
      {!loading && data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 text-sm text-muted-foreground mt-4 bg-white border rounded-md">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.perPage + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(p => ({ ...p, page: 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              {'«'}
            </button>

            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              {'‹ Prev'}
            </button>

            <span className="px-3 py-1 border rounded bg-primary text-primary-foreground">
              {pagination.page}
            </span>

            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              {'Next ›'}
            </button>

            <button
              onClick={() => setPagination(p => ({ ...p, page: p.totalPages }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              {'»'}
            </button>
          </div>

          <select
            value={pagination.perPage}
            onChange={(e) => setPagination(p => ({ ...p, perPage: Number(e.target.value), page: 1 }))}
            className="px-3 py-1 border rounded"
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

export default ScheduledList;