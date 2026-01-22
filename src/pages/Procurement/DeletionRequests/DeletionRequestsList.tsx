import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2, FileText } from 'lucide-react';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';

// Interface matching API response structure
interface DeletionRequest {
  id: string | number;
  type: string; // 'Material PR', 'Service PR', 'PO', 'WO', etc.
  pr_no: string;
  site_name: string;
  level: string | number;
  pr_id?: string | number; // ID of the actual PR/PO/WO
}

const DeletionRequestsList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DeletionRequest[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 1 });

  // TODO: Replace with actual API call when ready
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Static data for now - replace with API call
      // const response = await getDeletionRequestsList(pagination.page, pagination.perPage);
      // setData(response.data);
      // setPagination(prev => ({ ...prev, total: response.total, totalPages: response.total_pages }));
      
      // Static placeholder data
      const mockData: DeletionRequest[] = [];
      setData(mockData);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 1 }));
    } catch (error) {
      console.error('Error fetching Deletion Requests:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleView = (row: DeletionRequest) => {
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

  // Table columns as per image
  const columns: TableColumn<DeletionRequest>[] = [
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
      {/* Title */}
      <h1 className="text-2xl font-bold text-foreground">PR Deletion Requests</h1>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
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
          <div className="flex flex-col items-center justify-center py-12 border-t border-border">
            <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No PR deletion requests found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <button
          onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
          disabled={pagination.page === 1}
          className="p-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="sr-only">Previous</span>
          ←
        </button>
        <button
          className="px-4 py-2 bg-error text-error-foreground rounded-lg font-medium"
        >
          {pagination.page}
        </button>
        <button
          onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
          disabled={pagination.page >= pagination.totalPages}
          className="p-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="sr-only">Next</span>
          →
        </button>
      </div>
    </div>
  );
};

export default DeletionRequestsList;
