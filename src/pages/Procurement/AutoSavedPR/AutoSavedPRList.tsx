import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2, FileText } from 'lucide-react';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';

// Interface matching API response structure
interface AutoSavedPR {
  id: string | number;
  type: string; // 'Service PR' or 'Material PR'
  last_updated: string;
  pr_id?: string | number; // ID of the actual PR
}

const AutoSavedPRList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AutoSavedPR[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });

  // TODO: Replace with actual API call when ready
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Static data for now - replace with API call
      // const response = await getAutoSavedPRList(pagination.page, pagination.perPage);
      // setData(response.data);
      // setPagination(prev => ({ ...prev, total: response.total, totalPages: response.total_pages }));
      
      // Static placeholder data
      const mockData: AutoSavedPR[] = [];
      setData(mockData);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
    } catch (error) {
      console.error('Error fetching Auto Saved PR:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleView = (row: AutoSavedPR) => {
    // Navigate to the appropriate PR based on type
    if (row.type === 'Service PR') {
      navigate(`/finance/procurement/service-pr/${row.pr_id || row.id}`);
    } else if (row.type === 'Material PR') {
      navigate(`/finance/procurement/material-pr/${row.pr_id || row.id}`);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  // Table columns - Simple 3 columns as per image
  const columns: TableColumn<AutoSavedPR>[] = [
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'last_updated',
      header: 'Last Updated',
      sortable: true,
      render: (value) => <span className="text-sm text-muted-foreground">{formatDateTime(value)}</span>,
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
      <h1 className="text-2xl font-bold text-foreground">Auto Saved PR</h1>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => String(row.id)}
          viewPath={(row) => {
            if (row.type === 'Service PR') {
              return `/finance/procurement/service-pr/${row.pr_id || row.id}`;
            } else if (row.type === 'Material PR') {
              return `/finance/procurement/material-pr/${row.pr_id || row.id}`;
            }
            return '#';
          }}
          onView={handleView}
          showActions={true}
        />
        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 border-t border-border">
            <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No Auto Saved PR Found</p>
          </div>
        )}
      </div>

      {/* Pagination - TODO: Add when API is ready */}
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

export default AutoSavedPRList;
