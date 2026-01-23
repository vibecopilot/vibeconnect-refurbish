import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Users, Loader2, FileText } from 'lucide-react';
import ListToolbar from '../../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import DataCard from '../../../components/ui/DataCard';
import StatusBadge from '../../../components/ui/StatusBadge';

interface TrainingProgram {
  id: string | number;
  program_name: string;
  category: string;
  duration: string;
  status: 'Active' | 'Draft' | 'Archived';
  enrolled_count: number;
  completion_rate: number;
}

const TrainingProgramsList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrainingProgram[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await getTrainingProgramsList(pagination.page, pagination.perPage, { search: searchValue });
      // setData(response.data);
      // setPagination(prev => ({ ...prev, total: response.total, totalPages: response.total_pages }));
      
      const mockData: TrainingProgram[] = [];
      setData(mockData);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
    } catch (error) {
      console.error('Error fetching Training Programs:', error);
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

  const handleView = (row: TrainingProgram) => {
    navigate(`/training/module/training-programs/${row.id}`);
  };

  const handleEdit = (row: TrainingProgram) => {
    navigate(`/training/module/training-programs/${row.id}/edit`);
  };

  const handleEnroll = (row: TrainingProgram) => {
    // TODO: Implement enroll functionality
    console.log('Enroll in program:', row.id);
  };

  const handleAdd = () => {
    navigate('/training/module/training-programs/create');
  };

  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log('Filter Training Programs');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export Training Programs');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'approved';
      case 'Draft': return 'pending';
      case 'Archived': return 'rejected';
      default: return 'default';
    }
  };

  const columns: TableColumn<TrainingProgram>[] = [
    {
      key: 'program_name',
      header: 'Program Name',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-foreground">{value || '-'}</span>,
    },
    {
      key: 'category',
      header: 'Category/Type',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'duration',
      header: 'Duration',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => {
        return (
          <StatusBadge 
            status={getStatusColor(String(value)) as 'pending' | 'approved' | 'rejected'} 
            label={String(value)} 
          />
        );
      },
    },
    {
      key: 'enrolled_count',
      header: 'Enrolled Count',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{value || 0}</span>
        </div>
      ),
    },
    {
      key: 'completion_rate',
      header: 'Completion Rate',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-foreground">{value || 0}%</span>
      ),
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
        searchPlaceholder="Search Training Programs..."
        searchValue={searchValue}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={handleFilter}
        onExport={handleExport}
        showViewToggle={true}
        onAdd={handleAdd}
        addLabel="Create Training Program"
      />

      {viewMode === 'table' ? (
        <>
          <DataTable
            columns={columns}
            data={data}
            getRowId={(row) => String(row.id)}
            viewPath={(row) => `/training/module/training-programs/${row.id}`}
            onView={handleView}
            showActions={true}
          />
          {data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-card border-t border-border">
              <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No Training Programs Found</p>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Create Training Program
              </button>
            </div>
          )}
        </>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Training Programs Found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating a new Training Program</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Create Training Program
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <DataCard
              key={item.id}
              title={item.program_name}
              subtitle={item.category}
              viewPath={`/training/module/training-programs/${item.id}`}
              editPath={`/training/module/training-programs/${item.id}/edit`}
              fields={[
                { label: 'Duration', value: item.duration || '-' },
                { label: 'Status', value: item.status },
                { label: 'Enrolled', value: `${item.enrolled_count} users` },
                { label: 'Completion Rate', value: `${item.completion_rate}%` },
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

export default TrainingProgramsList;
