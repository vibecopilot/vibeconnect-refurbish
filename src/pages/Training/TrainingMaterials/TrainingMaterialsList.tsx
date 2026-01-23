import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, FileText, Video, Link as LinkIcon, Loader2, File } from 'lucide-react';
import ListToolbar from '../../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import DataCard from '../../../components/ui/DataCard';
import StatusBadge from '../../../components/ui/StatusBadge';

interface TrainingMaterial {
  id: string | number;
  title: string;
  description: string;
  category: string;
  type: 'Document' | 'Video' | 'Link';
  tags: string[];
  status: 'Active' | 'Archived';
  created_date: string;
}

const TrainingMaterialsList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrainingMaterial[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await getTrainingMaterialsList(pagination.page, pagination.perPage, { search: searchValue });
      // setData(response.data);
      // setPagination(prev => ({ ...prev, total: response.total, totalPages: response.total_pages }));
      
      const mockData: TrainingMaterial[] = [];
      setData(mockData);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
    } catch (error) {
      console.error('Error fetching Training Materials:', error);
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

  const handleView = (row: TrainingMaterial) => {
    navigate(`/training/module/training-materials/${row.id}`);
  };

  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log('Filter Training Materials');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export Training Materials');
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Video': return <Video className="w-4 h-4 text-primary" />;
      case 'Link': return <LinkIcon className="w-4 h-4 text-primary" />;
      default: return <FileText className="w-4 h-4 text-primary" />;
    }
  };

  const columns: TableColumn<TrainingMaterial>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(row.type)}
          <span className="text-sm font-medium text-foreground">{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-foreground">{value || '-'}</span>
      ),
    },
    {
      key: 'tags',
      header: 'Tags',
      sortable: false,
      render: (value) => {
        const tags = Array.isArray(value) ? value : [];
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-secondary text-xs rounded">
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{tags.length - 3}</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => {
        return (
          <StatusBadge 
            status={value === 'Active' ? 'approved' : 'rejected'} 
            label={String(value)} 
          />
        );
      },
    },
    {
      key: 'created_date',
      header: 'Created Date',
      sortable: true,
      render: (value) => <span className="text-sm text-muted-foreground">{formatDate(String(value))}</span>,
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
        searchPlaceholder="Search Training Materials..."
        searchValue={searchValue}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={handleFilter}
        onExport={handleExport}
        showViewToggle={true}
        onAdd={undefined}
        addLabel=""
      />

      {viewMode === 'table' ? (
        <>
          <DataTable
            columns={columns}
            data={data}
            getRowId={(row) => String(row.id)}
            viewPath={(row) => `/training/module/training-materials/${row.id}`}
            onView={handleView}
            showActions={true}
          />
          {data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-card border-t border-border">
              <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No Training Materials Found</p>
            </div>
          )}
        </>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Training Materials Found</h3>
          <p className="text-muted-foreground">Training materials will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <DataCard
              key={item.id}
              title={item.title}
              subtitle={item.category}
              viewPath={`/training/module/training-materials/${item.id}`}
              editPath={undefined}
              fields={[
                { label: 'Type', value: item.type },
                { label: 'Status', value: item.status },
                { label: 'Created', value: formatDate(item.created_date) },
                { label: 'Tags', value: Array.isArray(item.tags) ? item.tags.join(', ') : '-' },
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

export default TrainingMaterialsList;
