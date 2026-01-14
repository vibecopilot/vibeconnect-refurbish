import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Trash2, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../../components/list/ListToolbar';
import DataTable from '../../../components/table/DataTable';
import { getRoutineTask, getAuditScheduled } from '../../../api';
import { useViewMode } from '../../../hooks/useViewMode';

interface ConductedAudit {
  id: number;
  audit_name: string;
  activity_name: string;
  start_from: string;
  conducted_by: string;
  conducted_by_name: string;
  status: string;
  site_name: string;
  duration: string;
  percentage: number;
}

const statusFilters = ['All', 'Open', 'Closed', 'Pending', 'Completed'];

// Normalize various backend status values to canonical values for filtering
const normalizeStatus = (raw: any) => {
  const s = (raw || '').toString().toLowerCase().trim();
  if (!s) return '';
  if (s.includes('complete') || s.includes('done') || s.includes('success')) return 'completed';
  if (s.includes('pend') || s.includes('waiting')) return 'pending';
  if (s.includes('open')) return 'open';
  if (s.includes('close')) return 'closed';
  return s; // fallback to raw lowercase string
};

const ConductedList: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode, recordsPerPage } = useViewMode();
  const [data, setData] = useState<ConductedAudit[]>([]);
  const [filteredData, setFilteredData] = useState<ConductedAudit[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [routineRes, scheduledRes] = await Promise.all([
        getRoutineTask(),
        getAuditScheduled()
      ]);

      const routineItems = Array.isArray(routineRes?.data?.activities)
        ? routineRes.data.activities
        : [];

      const scheduledItems = Array.isArray(scheduledRes?.data?.activities)
        ? scheduledRes.data.activities
        : [];

      const combined = [...routineItems, ...scheduledItems];

      const mapped: ConductedAudit[] = combined.map((item: any) => ({
        id: item.id,
        audit_name: item.audit_name || '',
        activity_name: item.activity_name || '',
        start_from: item.start_from || item.created_at || '',
        conducted_by: item.conducted_by || '',
        conducted_by_name: item.conducted_by_name || item.conducted_by || '',
        status: item.status || item.audit_status || item.audit_status_name || item.audit_status_type || 'Pending',
        site_name: item.site_name || '',
        duration: item.duration || '',
        percentage: Number(item.percentage) || 0,
      }));

      setData(mapped);
      setFilteredData(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load audits');
    } finally {
      setLoading(false);
    }
  }, []);



  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, activeFilter);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    applyFilters(searchText, filter);
  };

  const applyFilters = (search: string, filter: string) => {
    let filtered = [...data];

    const lower = (search || '').toString().toLowerCase().trim();

    if (lower) {
      filtered = filtered.filter((item) => {
        const id = String(item.id || '').toLowerCase();
        const audit = (item.audit_name || '').toString().toLowerCase();
        const activity = (item.activity_name || '').toString().toLowerCase();
        const by = (item.conducted_by_name || item.conducted_by || '').toString().toLowerCase();
        const site = (item.site_name || '').toString().toLowerCase();
        const status = (item.status || '').toString().toLowerCase();

        return (
          id.includes(lower) ||
          audit.includes(lower) ||
          activity.includes(lower) ||
          by.includes(lower) ||
          site.includes(lower) ||
          status.includes(lower)
        );
      });
    }

    if (filter && filter !== 'All') {
      const tf = filter.toString().toLowerCase().trim();
      // Use normalized status to match variants like 'Pending', 'pending_review', 'In Progress', 'completed_success', etc.
      filtered = filtered.filter((item) => {
        const ns = normalizeStatus(item.status);
        return ns === tf || ns.includes(tf);
      });
    }

    setFilteredData(filtered);
  };

  // Reapply filters when the source data changes (e.g., after fetch)
  useEffect(() => {
    applyFilters(searchText, activeFilter);
  }, [data]);


  const handleExport = () => {
    const dataToExport = Array.isArray(filteredData) ? filteredData : [];
    const csvContent = [
      ['ID', 'Audit Name', 'Start Date', 'Conducted By', 'Status', 'Site', 'Duration', '%'].join(','),
      ...dataToExport.map(item => [
        item.id,
        item.audit_name || item.activity_name || '',
        item.start_from ? new Date(item.start_from).toLocaleString() : '',
        item.conducted_by_name || '',
        item.status || '',
        item.site_name || '',
        item.duration || '',
        item.percentage || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'operational_conducted_audits.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Exported successfully');
  };

  const handlePrint = (id: number) => {
    toast.success(`Printing report for audit ${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this audit?')) return;
    toast.success('Audit deleted successfully');
    fetchData();
  };

  const columns = [
    {
      name: 'REPORT',
      width: '80px',
      cell: (row: ConductedAudit) => (
        <button
          onClick={() => handlePrint(row.id)}
          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
          title="Print Report"
        >
          <Printer size={16} />
        </button>
      ),
    },
    { name: 'ID', selector: (row: ConductedAudit) => row.id, sortable: true, width: '80px' },
    { name: 'AUDIT NAME', selector: (row: ConductedAudit) => row.audit_name || row.activity_name || '-', sortable: true },
    { name: 'START DATE & TIME', selector: (row: ConductedAudit) => row.start_from ? new Date(row.start_from).toLocaleString() : '-', sortable: true },
    { name: 'CONDUCTED BY', selector: (row: ConductedAudit) => row.conducted_by_name || '-', sortable: true },
    {
      name: 'STATUS',
      cell: (row: ConductedAudit) => (
        <span className={`px-2 py-1 text-xs rounded-full ${row.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          row.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
          }`}>
          {row.status || 'N/A'}
        </span>
      ),
      sortable: true
    },
    { name: 'SITE', selector: (row: ConductedAudit) => row.site_name || '-', sortable: true },
    { name: 'DURATION', selector: (row: ConductedAudit) => row.duration || '-', sortable: true },
    { name: '%', selector: (row: ConductedAudit) => row.percentage ? `${row.percentage}%` : '-', sortable: true },
    {
      name: 'DELETE',
      width: '80px',
      cell: (row: ConductedAudit) => (
        <button
          onClick={() => handleDelete(row.id)}
          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  const AuditCard = ({ item }: { item: ConductedAudit }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ClipboardList className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{item.audit_name || item.activity_name || 'N/A'}</h3>
            <p className="text-sm text-muted-foreground">{item.id}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${item.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
          }`}>
          {item.status || 'N/A'}
        </span>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground mb-4">
        <p>Conducted By: {item.conducted_by_name || '-'}</p>
        <p>Site: {item.site_name || '-'}</p>
        <p>Duration: {item.duration || '-'}</p>
        {item.percentage && <p>Progress: {item.percentage}%</p>}
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button
          onClick={() => handlePrint(item.id)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
          title="Print"
        >
          <Printer size={16} />
        </button>
        <button
          onClick={() => handleDelete(item.id)}
          className="p-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  const safeFilteredData = Array.isArray(filteredData) ? filteredData : [];

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {statusFilters.map((filter) => (
          <label
            key={filter}
            className={`relative inline-flex items-center gap-2 px-3 pt-1.5 pb-2.5 text-sm cursor-pointer
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
        showAddButton={false}
        showFilter={false}
        showExport
        onExportClick={handleExport}
      />

      {viewMode === 'grid' ? (
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">
              Loading...
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No conducted audits found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredData.slice(0, recordsPerPage).map((item) => (
                <AuditCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <DataTable
          key={`table-${searchText}-${activeFilter}`}
          columns={columns}
          data={filteredData}
          loading={loading}
          pagination
          paginationPerPage={recordsPerPage}
        />
      )}

    </div>
  );
};

export default ConductedList;