import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Play, Loader2, FileText } from 'lucide-react';
import ListToolbar from '../../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import DataCard from '../../../components/ui/DataCard';
import StatusBadge from '../../../components/ui/StatusBadge';
import { cn } from '../../../lib/utils';

interface SafetyChecklist {
  id: string | number;
  name: string;
  category: string;
  questions_count: number;
  last_updated: string;
  status: 'Active' | 'Inactive';
  test_mode: boolean;
}

const SafetyChecklistsList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SafetyChecklist[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await getSafetyChecklistsList(pagination.page, pagination.perPage, { search: searchValue });
      // setData(response.data);
      // setPagination(prev => ({ ...prev, total: response.total, totalPages: response.total_pages }));
      
      const mockData: SafetyChecklist[] = [];
      setData(mockData);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
    } catch (error) {
      console.error('Error fetching Safety Checklists:', error);
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

  const handleView = (row: SafetyChecklist) => {
    navigate(`/safety/module/safety-checklists/${row.id}`);
  };

  const handleEdit = (row: SafetyChecklist) => {
    navigate(`/safety/module/safety-checklists/${row.id}/edit`);
  };

  const handleExecute = (row: SafetyChecklist) => {
    navigate(`/safety/module/safety-checklists/${row.id}/execute`);
  };

  const handleAdd = () => {
    navigate('/safety/module/safety-checklists/create');
  };

  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log('Filter Safety Checklists');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export Safety Checklists');
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

  const columns: TableColumn<SafetyChecklist>[] = [
    {
      key: 'name',
      header: 'Checklist Name',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-foreground">{value || '-'}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'questions_count',
      header: 'Questions Count',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || 0}</span>,
    },
    {
      key: 'last_updated',
      header: 'Last Updated',
      sortable: true,
      render: (value) => <span className="text-sm text-muted-foreground">{formatDate(value)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => {
        const isActive = value === 'Active';
        return (
          <StatusBadge 
            status={isActive ? 'approved' : 'rejected'} 
            label={String(value)} 
          />
        );
      },
    },
    {
      key: 'test_mode',
      header: 'Test Mode',
      sortable: true,
      render: (value) => (
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          value ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
        )}>
          {value ? 'Yes' : 'No'}
        </span>
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
        searchPlaceholder="Search Safety Checklists..."
        searchValue={searchValue}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={handleFilter}
        onExport={handleExport}
        showViewToggle={true}
        onAdd={handleAdd}
        addLabel="Create Safety Checklist"
      />

      {viewMode === 'table' ? (
        <>
          <DataTable
            columns={columns}
            data={data}
            getRowId={(row) => String(row.id)}
            viewPath={(row) => `/safety/module/safety-checklists/${row.id}`}
            onView={handleView}
            showActions={true}
            customActions={(row) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExecute(row)}
                  className="p-1.5 hover:bg-primary/10 rounded text-primary"
                  title="Execute/Test"
                >
                  <Play className="w-4 h-4" />
                </button>
              </div>
            )}
          />
          {data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-card border-t border-border">
              <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No Safety Checklists Found</p>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Create Safety Checklist
              </button>
            </div>
          )}
        </>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Safety Checklists Found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating a new Safety Checklist</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Create Safety Checklist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <DataCard
              key={item.id}
              title={item.name}
              subtitle={item.category}
              viewPath={`/safety/module/safety-checklists/${item.id}`}
              editPath={`/safety/module/safety-checklists/${item.id}/edit`}
              fields={[
                { label: 'Questions', value: String(item.questions_count) },
                { label: 'Status', value: item.status },
                { label: 'Test Mode', value: item.test_mode ? 'Yes' : 'No' },
                { label: 'Last Updated', value: formatDate(item.last_updated) },
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

export default SafetyChecklistsList;