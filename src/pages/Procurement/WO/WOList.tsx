import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Loader2, FileText } from 'lucide-react';
import ListToolbar from '../../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import DataCard from '../../../components/ui/DataCard';
import StatusBadge from '../../../components/ui/StatusBadge';

// Interface matching API response structure
interface WO {
  id: string | number;
  wo_no: string;
  reference_no: string;
  created_on: string;
  supplier: string;
  approval_status: string;
  payment_tenure: string | number;
  advance_amount: string | number;
  total_amount: string | number;
  total_work_completed: string | number;
  retention: string | number;
  tds: string | number;
  qc: string | number;
  is_active: boolean;
  last_approved_by: string | null;
  tds_amount: string | number;
  retention_amount: string | number;
  retention_outstanding: string | number;
  qc_amount: string | number;
  qc_outstanding: string | number;
  no_of_invoices: string | number;
  total_amount_paid: string | number;
  outstanding: string | number;
  debit_credit_note_raised: string | boolean;
  created_by: string;
  updated_by: string;
  updated_on: string;
}

const WOList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WO[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });

  // TODO: Replace with actual API call when ready
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Static data for now - replace with API call
      // const response = await getWOList(pagination.page, pagination.perPage, { search: searchValue });
      // setData(response.data);
      // setPagination(prev => ({ ...prev, total: response.total, totalPages: response.total_pages }));
      
      // Static placeholder data
      const mockData: WO[] = [];
      setData(mockData);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
    } catch (error) {
      console.error('Error fetching WO:', error);
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

  const handleView = (row: WO) => {
    navigate(`/finance/procurement/wo/${row.id}`);
  };

  const handleEdit = (row: WO) => {
    navigate(`/finance/procurement/wo/${row.id}/edit`);
  };

  const handleAdd = () => {
    navigate('/finance/procurement/wo/create');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export WO');
  };

  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log('Filter WO');
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

  const formatPercentage = (value: string | number) => {
    if (!value) return '-';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num}%`;
  };

  const getStatusType = (status: string): 'pending' | 'approved' | 'rejected' => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved')) return 'approved';
    if (statusLower.includes('rejected')) return 'rejected';
    return 'pending';
  };

  // Table columns - All 26 columns as specified
  const columns: TableColumn<WO>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value}</span>,
    },
    {
      key: 'wo_no',
      header: 'WO No.',
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
      key: 'created_on',
      header: 'Created On',
      sortable: true,
      render: (value) => <span className="text-sm text-muted-foreground">{formatDate(value)}</span>,
    },
    {
      key: 'supplier',
      header: 'Supplier',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'approval_status',
      header: 'Approved Status',
      sortable: true,
      render: (value) => <StatusBadge status={getStatusType(String(value))} label={String(value)} />,
    },
    {
      key: 'payment_tenure',
      header: 'Payment Tenure (Days)',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value ? `${value} days` : '-'}</span>,
    },
    {
      key: 'advance_amount',
      header: 'Advance Amount',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-foreground">₹{formatCurrency(value)}</span>,
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-foreground">₹{formatCurrency(value)}</span>,
    },
    {
      key: 'total_work_completed',
      header: 'Total Work Completed (%)',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{formatPercentage(value)}</span>,
    },
    {
      key: 'retention',
      header: 'Retention (%)',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{formatPercentage(value)}</span>,
    },
    {
      key: 'tds',
      header: 'TDS (%)',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{formatPercentage(value)}</span>,
    },
    {
      key: 'qc',
      header: 'QC (%)',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{formatPercentage(value)}</span>,
    },
    {
      key: 'is_active',
      header: 'Active/Inactive',
      sortable: true,
      render: (value) => {
        const isActive = Boolean(value);
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            isActive 
              ? 'bg-success-light text-success' 
              : 'bg-error-light text-error'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      key: 'last_approved_by',
      header: 'Last Approved By',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'tds_amount',
      header: 'TDS Amount',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-foreground">₹{formatCurrency(value)}</span>,
    },
    {
      key: 'retention_amount',
      header: 'Retention Amount',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-foreground">₹{formatCurrency(value)}</span>,
    },
    {
      key: 'retention_outstanding',
      header: 'Retention Outstanding',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-foreground">₹{formatCurrency(value)}</span>,
    },
    {
      key: 'qc_amount',
      header: 'QC Amount',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-foreground">₹{formatCurrency(value)}</span>,
    },
    {
      key: 'qc_outstanding',
      header: 'QC Outstanding',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-foreground">₹{formatCurrency(value)}</span>,
    },
    {
      key: 'no_of_invoices',
      header: 'No. of Invoices',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '0'}</span>,
    },
    {
      key: 'total_amount_paid',
      header: 'Total Amount Paid',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-foreground">₹{formatCurrency(value)}</span>,
    },
    {
      key: 'outstanding',
      header: 'Outstanding',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-foreground">₹{formatCurrency(value)}</span>,
    },
    {
      key: 'debit_credit_note_raised',
      header: 'Debit/Credit Note Raised',
      sortable: true,
      render: (value) => {
        const isRaised = typeof value === 'boolean' ? value : String(value).toLowerCase() === 'yes' || String(value).toLowerCase() === 'true';
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            isRaised 
              ? 'bg-warning-light text-warning' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {isRaised ? 'Yes' : 'No'}
          </span>
        );
      },
    },
    {
      key: 'created_by',
      header: 'Created By',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'updated_by',
      header: 'Updated By',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'updated_on',
      header: 'Updated On',
      sortable: true,
      render: (value) => <span className="text-sm text-muted-foreground">{formatDate(value)}</span>,
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
        searchPlaceholder="Search Work Orders..."
        searchValue={searchValue}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={handleFilter}
        onExport={handleExport}
        showViewToggle={true}
        onAdd={handleAdd}
        addLabel="Create WO"
      />

      {/* Content */}
      {viewMode === 'table' ? (
        <>
          <DataTable
            columns={columns}
            data={data}
            getRowId={(row) => String(row.id)}
            viewPath={(row) => `/finance/procurement/wo/${row.id}`}
            onView={handleView}
            showActions={true}
          />
          {data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-card border-t border-border">
              <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No Work Orders Found</p>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Create WO
              </button>
            </div>
          )}
        </>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Work Orders Found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating a new Work Order</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Create WO
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <DataCard
              key={item.id}
              title={item.wo_no || `WO #${item.id}`}
              subtitle={item.supplier}
              viewPath={`/finance/procurement/wo/${item.id}`}
              editPath={`/finance/procurement/wo/${item.id}/edit`}
              fields={[
                { label: 'Reference No', value: item.reference_no || '-' },
                { label: 'Created On', value: formatDate(item.created_on) },
                { label: 'Total Amount', value: `₹${formatCurrency(item.total_amount)}` },
                { label: 'Status', value: item.approval_status },
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

export default WOList;
