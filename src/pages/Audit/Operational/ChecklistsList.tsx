import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../../components/list/ListToolbar';
import DataTable from '../../../components/table/DataTable';
import { getChecklist, getAuditScheduled } from '../../../api';
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
  const [pagedData, setPagedData] = useState<AuditChecklist[]>([]);
  const [data, setData] = useState<AuditChecklist[]>([]);
  const [filteredData, setFilteredData] = useState<AuditChecklist[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  //fetching the backend data
  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        search: searchText || undefined,
        status: activeFilter !== 'All' ? activeFilter : undefined,
        page: pagination.page,
        per_page: pagination.perPage,
      };

      const [checklistRes, scheduledRes] = await Promise.all([
        getChecklist(params),
        getAuditScheduled(params),
      ]);

      const checklistItems =
        checklistRes.data?.activities?.map((item: any) => ({
          id: item.id,
          activity_name: item.checklist_name,
          name: item.asset_name,
          status: item.status,
          created_at: item.created_at,
        })) || [];

      const scheduledItems =
        scheduledRes.data?.audits || [];

      const mergedData = [...checklistItems, ...scheduledItems];

      setPagedData(mergedData);
      setData(mergedData);

      setPagination(p => ({
        ...p,
        total: checklistRes.data?.total || mergedData.length,
        totalPages: checklistRes.data?.total_pages || 1,
      }));
    } catch (err) {
      toast.error('Failed to fetch data');
      setPagedData([]);
    } finally {
      setLoading(false);
    }
  }, [
    searchText,
    activeFilter,
    // pagination.page,
    // pagination.perPage,
  ]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Same logic as ScheduledList
  const getDefaultPerPage = (mode: 'grid' | 'list') =>
    mode === 'grid' ? 12 : 10;

  const [pagination, setPagination] = useState({
    page: 1,
    perPage: getDefaultPerPage(viewMode),
    total: 0,
    totalPages: 1,
  });


  /* ---------------- FILTERING ---------------- */
  const applyFilters = useCallback(
    (search: string, filter: string, pageNum: number = 1) => {
      let filtered = [...data];
      const lower = (search || '').toLowerCase().trim();

      if (lower) {
        filtered = filtered.filter((item) => {
          return (
            String(item.id).includes(lower) ||
            (item.activity_name || '').toLowerCase().includes(lower) ||
            (item.name || '').toLowerCase().includes(lower) ||
            (item.status || '').toLowerCase().includes(lower) ||
            (item.created_at || '').toLowerCase().includes(lower)
          );
        });
      }

      if (filter !== 'All') {
        const tf = filter.toLowerCase();
        filtered = filtered.filter((item) => {
          const ns = normalizeStatus(item.status);
          return ns === tf || ns.includes(tf);
        });
      }

      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / pagination.perPage));
      const start = (pageNum - 1) * pagination.perPage;
      const end = start + pagination.perPage;

      setFilteredData(filtered);
      setPagedData(filtered.slice(start, end));
      setPagination((p) => ({
        ...p,
        page: pageNum,
        total,
        totalPages,
      }));
    },
    [data, pagination.perPage]
  );

  // Apply filters when data or filters change
  useEffect(() => {
    applyFilters(searchText, activeFilter, 1);
  }, [data, searchText, activeFilter, applyFilters]);

  // Update per page when view mode changes
  useEffect(() => {
    const newPerPage = getDefaultPerPage(viewMode);
    setPagination((p) => ({
      ...p,
      perPage: newPerPage,
    }));
    applyFilters(searchText, activeFilter, 1);
  }, [viewMode, applyFilters, searchText, activeFilter]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };
  const handlePageChange = (newPage: number) => {
    const start = (newPage - 1) * pagination.perPage;
    const end = start + pagination.perPage;
    setPagedData(filteredData.slice(start, end));
    setPagination((p) => ({
      ...p,
      page: newPage,
    }));
  };
  useEffect(() => {
    setPagination((p) => ({
      ...p,
      perPage: getDefaultPerPage(viewMode),
      page: 1,
    }));
  }, [viewMode]);


  /* ---------------- EXPORT ---------------- */
  const handleExport = () => {
    const csv = [
      ['ID', 'Checklist Name', 'Status', 'Created At'].join(','),
      ...filteredData.map((i) =>
        [
          i.id,
          i.activity_name || i.name || '',
          i.status || '',
          i.created_at ? new Date(i.created_at).toLocaleString() : '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_checklists.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Exported successfully');
  };

  const columns = [
    {
      name: 'ACTION',
      width: '100px',
      center: true,
      cell: (row: AuditChecklist) => (
        <div className="flex justify-center items-center gap-2 w-full">
          <button
            onClick={() => navigate(`/audit/operational/checklists/${row.id}`)}
            className="p-1.5 rounded hover:bg-accent"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate(`/audit/operational/checklists/${row.id}/edit`)}
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
      width: '10x0px',
      center: true,
    },
    {
      name: 'Activity Name',
      selector: (r: AuditChecklist) => r.activity_name || '-',
      sortable: true,
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
    }
  ];


  /* ---------------- CARD ---------------- */
  const ChecklistCard = ({ item }: { item: AuditChecklist }) => (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
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
          onClick={() => navigate(`/audit/operational/checklists/${item.id}`)}
          className="flex items-center gap-1 text-purple-700 hover:text-primary"
        >
          <Eye className="w-4 h-4" /> View
        </button>

        <button
          onClick={() =>
            navigate(`/audit/operational/checklists/${item.id}/edit`)
          }
          className="flex items-center gap-1 text-purple-700 hover:text-primary"
        >
          <Edit2 className="w-4 h-4" /> Edit
        </button>
      </div>
    </div>
  );

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
          searchPlaceholder="Search checklists by Activity, Asset Name,Id"
          searchValue={searchText}
          onSearchChange={handleSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle
          showAddButton
          addButtonLabel="Add"
          onAddClick={() => navigate('/audit/operational/checklists/create')}
          showFilter
          onExportClick={handleExport}
          className="mb-0"
        />
      </div>


      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8">Loading...</div>
          ) : pagedData.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No checklists found
            </div>
          ) : (
            pagedData.map((item) => <ChecklistCard key={item.id} item={item} />)
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          loading={loading}
          pagination={false}
          paginationPerPage={10}
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

export default ChecklistsList;