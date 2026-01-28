import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../../components/list/ListToolbar';
import DataTable from '../../../components/table/DataTable';
import { getAuditScheduled, getChecklist } from '../../../api';
import { useViewMode } from '../../../hooks/useViewMode';


interface ScheduledAudit {
  id: number;
  audit_for: string;
  activity_name: string;
  description: string;
  checklist_type: string;
  priority: string;
  frequency: string;
  assign_to: number | null;
  scan_type: string;
  plan_duration: number;
  email_trigger_rule: string;
  look_overdue_task: string;
  start_from: string;
  end_at: string;
  select_supplier: number | null;
  created_at: string;
  status?: string;
  audit_tasks: {
    id: number;
    task: string;
  }[];
}

const priorityFilters = ['All', 'Low', 'Medium', 'High'];


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

    if (searchText) {
      params.search = searchText;
    }

    // send priority to API (if backend supports it)
    if (activeFilter !== 'All') {
      params.priority = activeFilter.toLowerCase();
    }

    const response = await getAuditScheduled(
      pagination.page,
      pagination.perPage,
      params
    );

    const raw = response?.data;
    const rawItems = Array.isArray(raw)
      ? raw
      : raw.data || raw.audits || raw.items || [];

    // map API data
    let items: ScheduledAudit[] = rawItems.map((it: any) => ({
      id: it.id,
      audit_for: it.audit_for,
      activity_name: it.activity_name,
      description: it.description,
      checklist_type: it.checklist_type,
      priority: it.priority,
      frequency: it.frequency,
      assign_to: it.assign_to,
      scan_type: it.scan_type,
      plan_duration: it.plan_duration,
      email_trigger_rule: it.email_trigger_rule,
      look_overdue_task: it.look_overdue_task,
      start_from: it.start_from,
      end_at: it.end_at,
      select_supplier: it.select_supplier,
      created_at: it.created_at,
      status: it.status,
      audit_tasks: it.audit_tasks || [],
    }));

    // ✅ CLIENT-SIDE PRIORITY FILTER (FINAL FIX)
    if (activeFilter !== 'All') {
      items = items.filter(
        item => item.priority?.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    const total = raw?.total || raw?.count || items.length;
    const totalPages = Math.max(1, Math.ceil(total / pagination.perPage));

    setData(items);
    setPagination(prev => ({
      ...prev,
      total,
      totalPages,
    }));
  } catch (error) {
    console.error(error);
    toast.error('Failed to fetch scheduled audits');
    setData([]);
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
        task: (it.tasks && it.tasks.length > 0 && it.tasks[0].name) || it.task_name || it.task || '',
        assigned_to: it.assign_to || (it.assigned && it.assigned.id) || '',
        created_at: it.created_at || it.created_on || '',
        status: it.status || it.audit_status || '',
        audit_for: it.audit_for || '',
        checklist_type: it.checklist_type || '',
        priority: it.priority || '',
        category_id: it.category_id || '',
        start_from: it.start_from ? new Date(it.start_from).toLocaleDateString() : '',
        end_at: it.end_at ? new Date(it.end_at).toLocaleDateString() : '',
        supplier_id: it.supplier_id || ''
      }));

      const csvContent = [
        ['ID', 'Activity', 'Task', 'Assigned To', 'Created On', 'Status'].join(','),
        ...dataToExport.map(item => [
          item.id,
          item.activity_name || '',
          item.task || '',
          item.assign_to || '',
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

  const getPriorityClasses = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'low':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

  const columns = [
    {
      name: 'Action',
      width: '100px',
      cell: (row: ScheduledAudit) => (
        <div className="flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/audit/operational/scheduled/view/${row.id}`);
            }}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-primary"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/audit/operational/scheduled/edit/${row.id}`);
            }}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-primary"
          >
            <Edit2 size={16} />
          </button>
        </div>
      ),
    },
    { name: 'ID', selector: row => row.id, sortable: true, width: '80px' },
    { name: 'Activity', selector: row => row.activity_name || '-', sortable: true },

    {
      name: 'Task',
      selector: row =>
        row.audit_tasks?.length
          ? row.audit_tasks.map(t => t.task).join(', ')
          : '-',
      sortable: false,
    },

    {
      name: 'Assigned To',
      selector: row => row.assign_to ?? '-',
      sortable: true,
    },

    {
      name: 'Created On',
      selector: row =>
        row.created_at
          ? new Date(row.created_at).toLocaleDateString()
          : '-',
      sortable: true,
    },

    { name: 'Audit For', selector: row => row.audit_for || '-', sortable: true },
    { name: 'Checklist Type', selector: row => row.checklist_type || '-', sortable: true },
    {
      name: 'Priority',
      sortable: true,
      cell: (row: ScheduledAudit) => (
        <span
          className={`px-2 py-0.5 text-xs rounded-full font-medium ${getPriorityClasses(
            row.priority
          )}`}
        >
          {row.priority || '-'}
        </span>
      ),
    },


    {
      name: 'Start From',
      selector: row =>
        row.start_from
          ? new Date(row.start_from).toLocaleDateString()
          : '-',
      sortable: true,
    },
    {
      name: 'End At',
      selector: row =>
        row.end_at
          ? new Date(row.end_at).toLocaleDateString()
          : '-',
      sortable: true,
    },
  ];


  const AuditCard = ({ item }: { item: ScheduledAudit }) => (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        {/* <div className="p-2 bg-primary/10 rounded-lg"> <ClipboardList className="w-4 h-4 text-primary" /> </div> */}
        <div>
          <h3 className="font-semibold text-foreground text-sm">
            {item.activity_name || 'N/A'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {item.id}
          </p>
        </div>
        <span
          className={`px-2 py-0.5 text-xs rounded-full font-medium ${getPriorityClasses(
            item.priority
          )}`}
        >
          {item.priority || '-'}
        </span>


      </div>

      {/* Body (2-column like image) */}
      <div className="flex justify-between">
        <span className="text-muted-foreground text-sm mt-2">Task</span>
        <span className="font-medium text-sm text-foreground text-right truncate max-w-[140px]">
          {item.audit_tasks?.length
            ? item.audit_tasks.map(t => t.task).join(', ')
            : '-'}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-muted-foreground text-sm mt-1">Assigned</span>
        <span className="font-medium text-foreground text-sm ">
          {item.assign_to ?? '-'}
        </span>
      </div>


      <div className="flex justify-between">
        <span className="text-muted-foreground text-sm mt-1">Created</span>
        <span className="font-medium text-foreground text-sm ">
          {item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : '-'}
        </span>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-4 pt-3 mt-3 border-t border-border text-sm">
        <button
          onClick={() =>
            navigate(`/audit/operational/scheduled/view/${item.id}`)
          }
          className="flex items-center gap-1 text-purple-700 hover:text-primary"
        >
          <Eye className="w-4 h-4" />
          View
        </button>

        <button
          onClick={() =>
            navigate(`/audit/operational/scheduled/edit/${item.id}`)
          }
          className="flex items-center gap-1 text-purple-700 hover:text-primary"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
      </div>
    </div>
  );


  return (
    <div className='flex flex-col w-full '>
      <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
        {/* Left side - Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {priorityFilters.map((filter) => (
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
                name="priorityFilter"
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
          className="mb-0"
        />
      </div>

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