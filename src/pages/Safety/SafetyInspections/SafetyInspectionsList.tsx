import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Loader2, FileText } from 'lucide-react';
import ListToolbar from '../../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import DataCard from '../../../components/ui/DataCard';
import StatusBadge from '../../../components/ui/StatusBadge';

interface SafetyInspection {
  id: string | number;
  inspection_id: string;
  safety_measure_name: string;
  inspector_name: string;
  inspection_date: string;
  status: 'Pending' | 'Completed' | 'Failed';
  score: number | null;
  next_inspection_date: string;
}

const SafetyInspectionsList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SafetyInspection[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await getSafetyInspectionsList(pagination.page, pagination.perPage, { search: searchValue });
      // setData(response.data);
      // setPagination(prev => ({ ...prev, total: response.total, totalPages: response.total_pages }));
      
      const mockData: SafetyInspection[] = [];
      setData(mockData);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
    } catch (error) {
      console.error('Error fetching Safety Inspections:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, searchValue]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleView = (row: SafetyInspection) => {
    navigate(`/safety/module/safety-inspections/${row.id}`);
  };

  const handleEdit = (row: SafetyInspection) => {
    navigate(`/safety/module/safety-inspections/${row.id}/edit`);
  };

  const handleAdd = () => {
    navigate('/safety/module/safety-inspections/create');
  };

  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log('Filter Safety Inspections');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export Safety Inspections');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusType = (status: string): 'pending' | 'approved' | 'rejected' => {
    if (status === 'Completed') return 'approved';
    if (status === 'Failed') return 'rejected';
    return 'pending';
  };

  const columns: TableColumn<SafetyInspection>[] = [
    {
      key: 'inspection_id',
      header: 'Inspection ID',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-foreground">{value || '-'}</span>,
    },
    {
      key: 'safety_measure_name',
      header: 'Safety Measure',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'inspector_name',
      header: 'Inspector Name',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'inspection_date',
      header: 'Inspection Date',
      sortable: true,
      render: (value) => <span className="text-sm text-muted-foreground">{formatDate(value)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={getStatusType(String(value))} label={String(value)} />,
    },
    {
      key: 'score',
      header: 'Score/Result',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-foreground">
          {value !== null && value !== undefined ? `${value}%` : '-'}
        </span>
      ),
    },
    {
      key: 'next_inspection_date',
      header: 'Next Inspection Date',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{formatDate(value)}</span>,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ListToolbar
        searchPlaceholder="Search Safety Inspections..."
        searchValue={searchValue}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={handleFilter}
        onExport={handleExport}
        showViewToggle={true}
        onAdd={handleAdd}
        addLabel="Create Safety Inspection"
      />

      {viewMode === 'table' ? (
        <>
          <DataTable
            columns={columns}
            data={data}
            getRowId={(row) => String(row.id)}
            viewPath={(row) => `/safety/module/safety-inspections/${row.id}`}
            onView={handleView}
            showActions={true}
          />
          {data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-card border-t border-border">
              <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No Safety Inspections Found</p>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Create Safety Inspection
              </button>
            </div>
          )}
        </>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Safety Inspections Found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating a new Safety Inspection</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Create Safety Inspection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <DataCard
              key={item.id}
              title={item.inspection_id || `Inspection #${item.id}`}
              subtitle={item.safety_measure_name}
              viewPath={`/safety/module/safety-inspections/${item.id}`}
              editPath={`/safety/module/safety-inspections/${item.id}/edit`}
              fields={[
                { label: 'Inspector', value: item.inspector_name || '-' },
                { label: 'Date', value: formatDate(item.inspection_date) },
                { label: 'Status', value: item.status },
                { label: 'Score', value: item.score !== null ? `${item.score}%` : '-' },
              ]}
            />
          ))}
        </div>
      )}

      {data.length > 0 && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyInspectionsList;