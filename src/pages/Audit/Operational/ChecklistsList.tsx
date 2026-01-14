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
      const [checklistRes, scheduledRes] = await Promise.all([
        getChecklist(),
        getAuditScheduled(),
      ]);

      // 🔹 Extract checklist data
      const checklistItems: AuditChecklist[] =
        Array.isArray(checklistRes.data)
          ? checklistRes.data
          : Array.isArray(checklistRes.data?.activities)
            ? checklistRes.data.activities
            : [];

      // 🔹 Extract scheduled audit data
      const scheduledItems: AuditChecklist[] =
        Array.isArray(scheduledRes.data)
          ? scheduledRes.data
          : Array.isArray(scheduledRes.data?.audits)
            ? scheduledRes.data.audits
            : [];

      const mergedData = [...checklistItems, ...scheduledItems];

      const total = mergedData.length;
      const totalPages = Math.max(1, Math.ceil(total / pagination.perPage));

      const start = (pagination.page - 1) * pagination.perPage;
      const end = start + pagination.perPage;

      setData(mergedData);
      setFilteredData(mergedData.slice(start, end));

      setPagination((p) => ({
        ...p,
        total,
        totalPages,
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch data");
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, []);


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
      width: '200px',
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
      width: '500px',
      center: true,
    },
    {
      name: 'Activity Name',
      selector: (r: AuditChecklist) => r.activity_name || r.name || '-',
      sortable: true,
      center: true,
      wrap: true,
    },
  ];


  /* ---------------- CARD ---------------- */
  const ChecklistCard = ({ item }: { item: AuditChecklist }) => (
    <div className=" relative bg-card border rounded-lg p-4">
      <div className="flex justify-between mb-3">
        <div className="flex gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ClipboardList className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">
              {item.activity_name || item.name || 'N/A'}
            </h3>
            <p className="text-sm text-muted-foreground">{item.id}</p>
          </div>

        </div>
<span
  className={`absolute top-3 right-3
    inline-flex items-center justify-center
    text-[10px] font-semibold px-2.5 py-0.5
    rounded-full ${
    normalizeStatus(item.status) === "completed"
      ? "bg-green-100 text-green-700"
      : normalizeStatus(item.status) === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : normalizeStatus(item.status) === "open"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-600"
  }`}
>
  {item.status || "N/A"}
</span>


      </div>
      <div>
        <p className='text-sm text-muted-foreground flex'> name : {item.name || 'N/A'}</p>
        <p className="text-sm text-muted-foreground flex">Created at : {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Status Filters */}
      <div className="flex gap-3 mb-3 flex-wrap">
        {statusFilters.map((f) => (
          <label key={f} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={activeFilter === f}
              onChange={() => handleFilterChange(f)}
            />
            <span>{f}</span>
          </label>
        ))}
      </div>

      <ListToolbar
        searchPlaceholder="Search checklists..."
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
      />


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
          pagination
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