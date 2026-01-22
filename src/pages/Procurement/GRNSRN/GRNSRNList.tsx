import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Loader2, FileText } from 'lucide-react';
import ListToolbar from '../../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import DataCard from '../../../components/ui/DataCard';
import StatusBadge from '../../../components/ui/StatusBadge';

// Interface matching API response structure
interface GRNSRN {
  id: string | number;
  inventory: string;
  supplier: string;
  invoice_number: string;
  reference_no: string;
  po_number: string;
  po_reference_number: string;
  approval_status: string;
  last_approved_by: string | null;
  po_amount: string | number;
  total_grn_amount: string | number;
  payable_amount: string | number;
  retention_amount: string | number;
  tds_amount: string | number;
  qc_amount: string | number;
  invoice_date: string;
}

const GRNSRNList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GRNSRN[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });

  // TODO: Replace with actual API call when ready
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Static data for now - replace with API call
      // const response = await getGRNSRNList(pagination.page, pagination.perPage, { search: searchValue });
      // setData(response.data);
      // setPagination(prev => ({ ...prev, total: response.total, totalPages: response.total_pages }));
      
      // Static placeholder data
      const mockData: GRNSRN[] = [];
      setData(mockData);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
    } catch (error) {
      console.error('Error fetching GRN/SRN:', error);
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

  const handleView = (row: GRNSRN) => {
    navigate(`/finance/procurement/grn-srn/${row.id}`);
  };

  const handleEdit = (row: GRNSRN) => {
    navigate(`/finance/procurement/grn-srn/${row.id}/edit`);
  };

  const handleAdd = () => {
    navigate('/finance/procurement/grn-srn/create');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export GRN/SRN');
  };

  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log('Filter GRN/SRN');
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

  const getStatusType = (status: string): 'pending' | 'approved' | 'rejected' => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved')) return 'approved';
    if (statusLower.includes('rejected')) return 'rejected';
    return 'pending';
  };

  // Table columns
  const columns: TableColumn<GRNSRN>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value}</span>,
    },
    {
      key: 'inventory',
      header: 'Inventory',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'supplier',
      header: 'Supplier',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'invoice_number',
      header: 'Invoice Number',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'reference_no',
      header: 'Reference No.',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'po_number',
      header: 'P.O. Number',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'po_reference_number',
      header: 'PO Reference Number',
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
      key: 'last_approved_by',
      header: 'Last Approved By',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'po_amount',
      header: 'PO Amount',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-foreground">₹{formatCurrency(value)}</span>,
    },
    {
      key: 'total_grn_amount',
      header: 'Total GRN Amount',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-foreground">₹{formatCurrency(value)}</span>,
    },
    {
      key: 'payable_amount',
      header: 'Payable Amount',
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
      key: 'tds_amount',
      header: 'TDS Amount',
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
      key: 'invoice_date',
      header: 'Invoice Date',
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
        searchPlaceholder="Search GRN/SRN..."
        searchValue={searchValue}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={handleFilter}
        onExport={handleExport}
        showViewToggle={true}
        onAdd={handleAdd}
        addLabel="Create GRN/SRN"
      />

      {/* Content */}
      {viewMode === 'table' ? (
        <>
          <DataTable
            columns={columns}
            data={data}
            getRowId={(row) => String(row.id)}
            viewPath={(row) => `/finance/procurement/grn-srn/${row.id}`}
            onView={handleView}
            showActions={true}
          />
          {data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-card border-t border-border">
              <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No GRN/SRN Found</p>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Create GRN/SRN
              </button>
            </div>
          )}
        </>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No GRN/SRN Found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating a new GRN/SRN</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Create GRN/SRN
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <DataCard
              key={item.id}
              title={item.inventory || `GRN #${item.id}`}
              subtitle={item.supplier}
              viewPath={`/finance/procurement/grn-srn/${item.id}`}
              editPath={`/finance/procurement/grn-srn/${item.id}/edit`}
              fields={[
                { label: 'Invoice Number', value: item.invoice_number || '-' },
                { label: 'PO Number', value: item.po_number || '-' },
                { label: 'Total GRN Amount', value: `₹${formatCurrency(item.total_grn_amount)}` },
                { label: 'Status', value: item.approval_status },
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

export default GRNSRNList;
