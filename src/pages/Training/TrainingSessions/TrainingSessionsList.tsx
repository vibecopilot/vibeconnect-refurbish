import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Calendar, Loader2, FileText, Users, MapPin } from 'lucide-react';
import ListToolbar from '../../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import DataCard from '../../../components/ui/DataCard';
import StatusBadge from '../../../components/ui/StatusBadge';

interface TrainingSession {
  id: string | number;
  session_name: string;
  training_program: string;
  date_time: string;
  location: string;
  instructor: string;
  enrolled_count: number;
  attended_count: number;
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
}

const TrainingSessionsList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrainingSession[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await getTrainingSessionsList(pagination.page, pagination.perPage, { search: searchValue });
      // setData(response.data);
      // setPagination(prev => ({ ...prev, total: response.total, totalPages: response.total_pages }));
      
      const mockData: TrainingSession[] = [];
      setData(mockData);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
    } catch (error) {
      console.error('Error fetching Training Sessions:', error);
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

  const handleView = (row: TrainingSession) => {
    navigate(`/training/module/training-sessions/${row.id}`);
  };

  const handleEdit = (row: TrainingSession) => {
    navigate(`/training/module/training-sessions/${row.id}/edit`);
  };

  const handleAdd = () => {
    navigate('/training/module/training-sessions/create');
  };

  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log('Filter Training Sessions');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export Training Sessions');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'approved';
      case 'Ongoing': return 'pending';
      case 'Scheduled': return 'info';
      case 'Cancelled': return 'rejected';
      default: return 'default';
    }
  };

  const columns: TableColumn<TrainingSession>[] = [
    {
      key: 'session_name',
      header: 'Session Name',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-foreground">{value || '-'}</span>,
    },
    {
      key: 'training_program',
      header: 'Training Program',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'date_time',
      header: 'Date & Time',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{formatDateTime(String(value))}</span>,
    },
    {
      key: 'location',
      header: 'Location/Venue',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'instructor',
      header: 'Instructor',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'enrolled_count',
      header: 'Enrolled/Attended',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{row.attended_count || 0}/{value || 0}</span>
        </div>
      ),
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
        searchPlaceholder="Search Training Sessions..."
        searchValue={searchValue}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={handleFilter}
        onExport={handleExport}
        showViewToggle={true}
        onAdd={handleAdd}
        addLabel="Create Training Session"
      />

      {viewMode === 'table' ? (
        <>
          <DataTable
            columns={columns}
            data={data}
            getRowId={(row) => String(row.id)}
            viewPath={(row) => `/training/module/training-sessions/${row.id}`}
            onView={handleView}
            showActions={true}
          />
          {data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-card border-t border-border">
              <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No Training Sessions Found</p>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Create Training Session
              </button>
            </div>
          )}
        </>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Training Sessions Found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating a new Training Session</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Create Training Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <DataCard
              key={item.id}
              title={item.session_name}
              subtitle={item.training_program}
              viewPath={`/training/module/training-sessions/${item.id}`}
              editPath={`/training/module/training-sessions/${item.id}/edit`}
              fields={[
                { label: 'Date & Time', value: formatDateTime(item.date_time) },
                { label: 'Location', value: item.location || '-' },
                { label: 'Instructor', value: item.instructor || '-' },
                { label: 'Enrolled/Attended', value: `${item.attended_count || 0}/${item.enrolled_count || 0}` },
                { label: 'Status', value: item.status },
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

export default TrainingSessionsList;
