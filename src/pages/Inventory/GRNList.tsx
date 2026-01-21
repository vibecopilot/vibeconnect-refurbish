import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../components/list/ListToolbar';
import DataTable from '../../components/table/DataTable';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { getGRN, getVendorById } from '../../api';
import { useViewMode } from '../../hooks/useViewMode';

interface GRN {
  id: number;
  vendor_id: number;
  vendor_name?: string;
  invoice_number: string;
  invoice_date: string;
  posting_date: string;
  payment_mode: string;
  related_to: string;
  invoice_amount: number;
  other_expenses: number;
  loading_expenses: number;
  adjustment_amount: number;
  status: string;
  created_at: string;
  created_by: string;
}

const GRNList: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode, recordsPerPage } = useViewMode();
  const [grns, setGrns] = useState<GRN[]>([]);
  const [filteredData, setFilteredData] = useState<GRN[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [vendorMap, setVendorMap] = useState<Record<number, string>>({});

  const fetchGRNs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getGRN();
      const rawData = Array.isArray(response?.data)
        ? response.data
        : response?.data?.items || response?.data?.data || response?.data?.grn_details || [];

      const normalizedData = rawData.map((item: any) => ({
        id: item.id,
        vendor_id: item.vendor_id,
        vendor_name: item.vendor_name || '',
        invoice_number: item.invoice_number || '-',
        invoice_date: item.invoice_date || '',
        posting_date: item.posting_date || '',
        payment_mode: item.payment_mode || '-',
        related_to: item.related_to || '-',
        invoice_amount: item.invoice_amount ?? 0,
        other_expenses: item.other_expenses ?? 0,
        loading_expenses: item.loading_expenses ?? 0,
        adjustment_amount: item.adjustment_amount ?? 0,
        status: item.status || 'Pending',
        created_at: item.created_at || '',
        created_by: item.created_by || '',
      })) as GRN[];

      setGrns(normalizedData);
      setFilteredData(normalizedData);

      // Fetch vendor names
      // Build vendor map from existing data; fallback to API only if missing names
      const map: Record<number, string> = {};
      normalizedData.forEach((grn) => {
        if (grn.vendor_id && grn.vendor_name) {
          map[grn.vendor_id] = grn.vendor_name;
        }
      });

      const missingVendorIds = [...new Set(
        normalizedData
          .filter((grn) => grn.vendor_id && !map[grn.vendor_id])
          .map((grn) => grn.vendor_id)
      )];

      for (const vid of missingVendorIds) {
        try {
          const vendorResp = await getVendorById(vid);
          const vendorData = vendorResp?.data;
          map[vid] = Array.isArray(vendorData) ? vendorData[0]?.vendor_name : vendorData?.vendor_name || 'Unknown';
        } catch {
          map[vid] = 'Unknown';
        }
      }

      setVendorMap(map);
    } catch (error) {
      console.error('Error fetching GRNs:', error);
      toast.error('Failed to fetch GRNs');
      setGrns([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGRNs();
  }, [fetchGRNs]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    const dataToFilter = Array.isArray(grns) ? grns : [];
    const filtered = dataToFilter.filter((item) =>
      item.invoice_number?.toLowerCase().includes(value.toLowerCase()) ||
      (vendorMap[item.vendor_id] || item.vendor_name || '')
        .toLowerCase()
        .includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const safeFilteredData = Array.isArray(filteredData) ? filteredData : [];

  const enrichedGRNs = safeFilteredData.map((grn) => ({
    ...grn,
    vendor_name: vendorMap[grn.vendor_id] || grn.vendor_name || 'Loading...',
  }));

  const columns = [
    {
      name: 'VIEW',
      width: '80px',
      cell: (row: GRN) => (
        <button
          onClick={() => navigate(`/inventory/grn/${row.id}`)}
          className="text-primary hover:text-primary/80 transition-colors"
          title="View"
        >
          <Eye size={16} className="w-4 h-4" />
        </button>
      ),
    },
    { name: 'ID', selector: (row: GRN) => row.id, sortable: true, width: '80px' },
    { name: 'VENDOR', selector: (row: GRN) => row.vendor_name || vendorMap[row.vendor_id] || '-', sortable: true },
    { name: 'INVOICE NUMBER', selector: (row: GRN) => row.invoice_number || '-', sortable: true },
    { 
      name: 'INVOICE DATE', 
      selector: (row: GRN) => row.invoice_date ? new Date(row.invoice_date).toLocaleDateString() : '-', 
      sortable: true 
    },
    { 
      name: 'POSTING DATE', 
      selector: (row: GRN) => row.posting_date ? new Date(row.posting_date).toLocaleDateString() : '-', 
      sortable: true 
    },
    { name: 'PAYMENT MODE', selector: (row: GRN) => row.payment_mode || '-', sortable: true },
    { name: 'RELATED TO', selector: (row: GRN) => row.related_to || '-', sortable: true },
    { name: 'INVOICE AMOUNT', selector: (row: GRN) => row.invoice_amount || 0, sortable: true },
    { name: 'OTHER EXPENSES', selector: (row: GRN) => row.other_expenses || 0, sortable: true },
    { name: 'LOADING EXPENSES', selector: (row: GRN) => row.loading_expenses || 0, sortable: true },
    { name: 'ADJUSTMENT AMOUNT', selector: (row: GRN) => row.adjustment_amount || 0, sortable: true },
    { 
      name: 'STATUS', 
      cell: (row: GRN) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          row.status === 'Approved' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : row.status === 'Pending'
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {row.status || 'Pending'}
        </span>
      ),
      sortable: true 
    },
    { 
      name: 'CREATED ON', 
      selector: (row: GRN) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-', 
      sortable: true 
    },
    { name: 'CREATED BY', selector: (row: GRN) => row.created_by || '-', sortable: true },
  ];

  const GRNCard = ({ grn }: { grn: GRN & { vendor_name?: string } }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ClipboardList className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">GRN #{grn.id}</h3>
            <p className="text-sm text-muted-foreground">{grn.vendor_name || '-'}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          grn.status === 'Approved' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : grn.status === 'Pending'
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {grn.status || 'Pending'}
        </span>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground mb-4">
        <p>Invoice: {grn.invoice_number || '-'}</p>
        <p>Invoice Date: {grn.invoice_date ? new Date(grn.invoice_date).toLocaleDateString() : '-'}</p>
        <p>Amount: {grn.invoice_amount || 0}</p>
        <p>Payment Mode: {grn.payment_mode || '-'}</p>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button
          onClick={() => navigate(`/inventory/grn/${grn.id}`)}
          className="text-primary hover:text-primary/80 transition-colors"
          title="View"
        >
          <Eye size={16} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Inventory', path: '/inventory/grn' }, { label: 'GRN' }]} />


      <ListToolbar
        searchPlaceholder="Search by Invoice Number, Vendor..."
        searchValue={searchText}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle
        showAddButton
        addButtonLabel="Add"
        onAddClick={() => navigate('/inventory/grn/create')}
        showFilter
      />

      {viewMode === 'grid' ? (
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading...</div>
          ) : enrichedGRNs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No GRNs found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {enrichedGRNs.slice(0, recordsPerPage).map((grn) => (
                <GRNCard key={grn.id} grn={grn} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={enrichedGRNs}
          loading={loading}
          pagination
          paginationPerPage={recordsPerPage}
        />
      )}
    </div>
  );
};

export default GRNList;
