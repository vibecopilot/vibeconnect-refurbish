import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2, FileText } from 'lucide-react';
import ListToolbar from '../../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import DataCard from '../../../components/ui/DataCard';

// Interface matching API response structure
interface PendingApproval {
  id: string | number;
  type: string; // 'Material PR', 'Service PR', 'PO', 'WO', etc.
  pr_no: string;
  site_name: string;
  level: string | number;
  pr_id?: string | number; // ID of the actual PR/PO/WO
}

const PendingApprovalsList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PendingApproval[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 1 });

  // TODO: Replace with actual API call when ready
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Static data for now - replace with API call
      // const response = await getPendingApprovalsList(pagination.page, pagination.perPage, { search: searchValue });
      // setData(response.data);
      // setPagination(prev => ({ ...prev, total: response.total, totalPages: response.total_pages }));
      
      // Static placeholder data
      const mockData: PendingApproval[] = [];
      setData(mockData);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 1 }));
    } catch (error) {
      console.error('Error fetching Pending Approvals:', error);
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

  const handleView = (row: PendingApproval) => {
    // Navigate to the appropriate page based on type
    const basePath = '/finance/procurement';
    if (row.type === 'Material PR') {
      navigate(`${basePath}/material-pr/${row.pr_id || row.id}`);
    } else if (row.type === 'Service PR') {
      navigate(`${basePath}/service-pr/${row.pr_id || row.id}`);
    } else if (row.type === 'PO') {
      navigate(`${basePath}/po/${row.pr_id || row.id}`);
    } else if (row.type === 'WO') {
      navigate(`${basePath}/wo/${row.pr_id || row.id}`);
    }
  };

  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log('Filter Pending Approvals');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export Pending Approvals');
  };

  // Table columns as per image
  const columns: TableColumn<PendingApproval>[] = [
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value}</span>,
    },
    {
      key: 'pr_no',
      header: 'PR No.',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'site_name',
      header: 'Site Name',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'level',
      header: 'Level',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
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
      {/* Toolbar */}
      <ListToolbar
        searchPlaceholder="Search by PR no..."
        searchValue={searchValue}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={handleFilter}
        onExport={handleExport}
        showViewToggle={true}
      />

      {/* Content */}
      {viewMode === 'table' ? (
        <>
          <DataTable
            columns={columns}
            data={data}
            getRowId={(row) => String(row.id)}
            viewPath={(row) => {
              const basePath = '/finance/procurement';
              if (row.type === 'Material PR') {
                return `${basePath}/material-pr/${row.pr_id || row.id}`;
              } else if (row.type === 'Service PR') {
                return `${basePath}/service-pr/${row.pr_id || row.id}`;
              } else if (row.type === 'PO') {
                return `${basePath}/po/${row.pr_id || row.id}`;
              } else if (row.type === 'WO') {
                return `${basePath}/wo/${row.pr_id || row.id}`;
              }
              return '#';
            }}
            onView={handleView}
            showActions={true}
          />
          {data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-card border-t border-border">
              <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No pending approvals found</p>
            </div>
          )}
        </>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Pending Approvals Found</h3>
          <p className="text-muted-foreground">No pending approvals available at this time</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <DataCard
              key={item.id}
              title={item.type}
              subtitle={item.pr_no || `ID: ${item.id}`}
              viewPath={
                (() => {
                  const basePath = '/finance/procurement';
                  if (item.type === 'Material PR') {
                    return `${basePath}/material-pr/${item.pr_id || item.id}`;
                  } else if (item.type === 'Service PR') {
                    return `${basePath}/service-pr/${item.pr_id || item.id}`;
                  } else if (item.type === 'PO') {
                    return `${basePath}/po/${item.pr_id || item.id}`;
                  } else if (item.type === 'WO') {
                    return `${basePath}/wo/${item.pr_id || item.id}`;
                  }
                  return '#';
                })()
              }
              fields={[
                { label: 'ID', value: String(item.id) },
                { label: 'PR No', value: item.pr_no || '-' },
                { label: 'Site Name', value: item.site_name || '-' },
                { label: 'Level', value: String(item.level || '-') },
              ]}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
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

export default PendingApprovalsList;
