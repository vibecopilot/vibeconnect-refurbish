import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Loader2, FileText } from 'lucide-react';
import ListToolbar from '../../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import DataCard from '../../../components/ui/DataCard';
import StatusBadge from '../../../components/ui/StatusBadge';

// Interface matching API response structure
interface MaterialPR {
  id: string | number;
  pr_no: string;
  reference_no: string;
  supplier_name: string;
  created_by: string;
  created_on: string;
  last_approved_by: string | null;
  approved_status: string;
  pr_amount: string | number;
  is_active: boolean;
}

const MaterialPRList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MaterialPR[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });

  // TODO: Replace with actual API call when ready
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Static data for now - replace with API call
      // const response = await getMaterialPRList(pagination.page, pagination.perPage, { search: searchValue });
      // setData(response.data);
      // setPagination(prev => ({ ...prev, total: response.total, totalPages: response.total_pages }));
      
      // Static placeholder data
      const mockData: MaterialPR[] = [];
      setData(mockData);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
    } catch (error) {
      console.error('Error fetching Material PR:', error);
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

  const handleView = (row: MaterialPR) => {
    navigate(`/finance/procurement/material-pr/${row.id}`);
  };

  const handleEdit = (row: MaterialPR) => {
    navigate(`/finance/procurement/material-pr/${row.id}/edit`);
  };

  const handleAdd = () => {
    navigate('/finance/procurement/material-pr/create');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export Material PR');
  };

  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log('Filter Material PR');
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

  const formatCurrency = (amount: string | number) => {
    if (!amount) return '0.00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getStatusType = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved')) return 'success';
    if (statusLower.includes('pending')) return 'warning';
    if (statusLower.includes('rejected')) return 'error';
    return 'info';
  };

  // Table columns
  const columns: TableColumn<MaterialPR>[] = [
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
      render: (value) => <span className="text-sm font-medium text-foreground">{value || '-'}</span>,
    },
    {
      key: 'reference_no',
      header: 'Reference No.',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'supplier_name',
      header: 'Supplier Name',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'created_by',
      header: 'Created By',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'created_on',
      header: 'Created On',
      sortable: true,
      render: (value) => <span className="text-sm text-muted-foreground">{formatDate(value)}</span>,
    },
    {
      key: 'last_approved_by',
      header: 'Last Approved By',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'approved_status',
      header: 'Approved Status',
      sortable: true,
      render: (value) => <StatusBadge status={value} type={getStatusType(value)} />,
    },
    {
      key: 'pr_amount',
      header: 'PR Amount',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-foreground">₹{formatCurrency(value)}</span>,
    },
    {
      key: 'is_active',
      header: 'Active/Inactive',
      sortable: true,
      render: (value) => (
        <StatusBadge 
          status={value ? 'Active' : 'Inactive'} 
          type={value ? 'success' : 'error'} 
        />
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
      {/* Toolbar */}
      <ListToolbar
        searchPlaceholder="Search Material PR..."
        searchValue={searchValue}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={handleFilter}
        onExport={handleExport}
        showViewToggle={true}
        onAdd={handleAdd}
        addLabel="Create Material PR"
      />

      {/* Content */}
      {viewMode === 'table' ? (
        <>
          <DataTable
            columns={columns}
            data={data}
            getRowId={(row) => String(row.id)}
            viewPath={(row) => `/finance/procurement/material-pr/${row.id}`}
            onView={handleView}
            showActions={true}
          />
          {data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-card border-t border-border">
              <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No Material PR Found</p>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Create Material PR
              </button>
            </div>
          )}
        </>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Material PR Found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating a new Material PR</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Create Material PR
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <DataCard
              key={item.id}
              title={item.pr_no || `PR #${item.id}`}
              subtitle={item.supplier_name}
              viewPath={`/finance/procurement/material-pr/${item.id}`}
              editPath={`/finance/procurement/material-pr/${item.id}/edit`}
              fields={[
                { label: 'Reference No', value: item.reference_no || '-' },
                { label: 'Created By', value: item.created_by || '-' },
                { label: 'Created On', value: formatDate(item.created_on) },
                { label: 'Amount', value: `₹${formatCurrency(item.pr_amount)}` },
                { label: 'Status', value: item.approved_status },
                { label: 'Active', value: item.is_active ? 'Yes' : 'No' },
              ]}
            />
          ))}
        </div>
      )}

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

export default MaterialPRList;
