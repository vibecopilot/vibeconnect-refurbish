import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BsEye, BsX } from 'react-icons/bs'; // Added BsX
import { IoAddCircleOutline } from 'react-icons/io5';
import { FaDownload, FaUpload } from 'react-icons/fa';
import { BiFilterAlt } from 'react-icons/bi';
import { BsGrid3X3, BsList } from 'react-icons/bs';
import Table from '@/components/table/Table';
import {
  getCamBillingData,
  getCamBillingDownload,
  getFloors,
  getUnits,
  getCamBillFilter,
} from '@/api';
import toast from 'react-hot-toast';
import { getItemInLocalStorage } from '@/utils/localStorage';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import InvoiceImportModal from '@/containers/modals/InvoiceImportModal';

interface CamBillingItem {
  id: number;
  flat_id: string;
  bill_period_start_date: string;
  bill_period_end_date: string;
  total_amount: number;
  due_date: string;
  invoice_number: string;
  amount_paid: number;
  payment_status: string;
  status: string;
  created_at: string;
}

// ✅ NEW: CAM Billing Filter Modal Component
interface CamBillingFilterModalProps {
  onclose: () => void;
  setFilterSearchData: (data: CamBillingItem[]) => void;
  fetchData: () => void;
  themeColor: string;
}

const CamBillingFilterModal: React.FC<CamBillingFilterModalProps> = ({
  onclose,
  setFilterSearchData,
  fetchData,
  themeColor,
}) => {
  const [formData, setFormData] = useState({
    block: '',
    floor_name: '',
    flat: '',
    status: '',
    dueDate: '',
  });

  const [billingPeriod, setBillingPeriod] = useState<[Date | null, Date | null]>([null, null]);
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  const buildings = getItemInLocalStorage('Building') || [];

  const ensureArray = (data: any): CamBillingItem[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.cam_bills)) return data.cam_bills;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'block') {
      try {
        const response = await getFloors(Number(value));
        setFloors(response.data.map((item: any) => ({ name: item.name, id: item.id })));
      } catch (error) {
        console.error('Error fetching floors:', error);
      }
      setFormData((prev) => ({ ...prev, block: value, floor_name: '', flat: '' }));
    } else if (name === 'floor_name') {
      try {
        const response = await getUnits(Number(value));
        setUnits(response.data.map((item: any) => ({ name: item.name, id: item.id })));
      } catch (error) {
        console.error('Error fetching units:', error);
      }
      setFormData((prev) => ({ ...prev, floor_name: value, flat: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    setBillingPeriod(dates);
  };

  const handleFilterData = async () => {
    try {
      const [startDate, endDate] = billingPeriod;
      const resp = await getCamBillFilter(
        formData.block,
        formData.floor_name,
        formData.flat,
        formData.status,
        startDate,
        endDate,
        formData.dueDate
      );

      const dataArray = ensureArray(resp.data);
      setFilterSearchData(dataArray);
      toast.success('Filters applied successfully');
      onclose(); // Close modal on apply
      
    } catch (error) {
      console.error('Error filtering data:', error);
      toast.error('Failed to apply filters');
    }
  };

  const isFlatDisabled = !formData.block || !formData.floor_name || !units.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Filter CAM Bills</h3>
          <button onClick={onclose} className="text-gray-500 hover:text-gray-700">
            <BsX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Building */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Building</label>
              <select
                className="border p-2 px-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                onChange={handleChange}
                value={formData.block}
                name="block"
              >
                <option value="">Select Building</option>
                {buildings?.map((building: any) => (
                  <option key={building.id} value={building.id}>{building.name}</option>
                ))}
              </select>
            </div>

            {/* Floor */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Floor</label>
              <select
                className="border p-2 px-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                onChange={handleChange}
                value={formData.floor_name}
                name="floor_name"
                disabled={!floors.length}
              >
                <option value="">Select Floor</option>
                {floors.map((floor) => (
                  <option key={floor.id} value={floor.id}>{floor.name}</option>
                ))}
              </select>
            </div>

            {/* Flat */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Flat</label>
              <select
                name="flat"
                value={formData.flat}
                onChange={handleChange}
                disabled={isFlatDisabled}
                className="border p-2 px-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Flat</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Payment Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border p-2 px-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Payment Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="border p-2 px-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Billing Period */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Billing Period</label>
              <DatePicker
                selectsRange
                startDate={billingPeriod[0]}
                endDate={billingPeriod[1]}
                onChange={handleDateChange}
                placeholderText="Select Billing Period"
                className="border p-2 px-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full"
                isClearable
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
          <button
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 font-medium"
            onClick={() => { fetchData(); onclose(); }}
          >
            Reset
          </button>
          <button
            className="px-6 py-2 text-white rounded-md font-medium"
            style={{ background: themeColor }}
            onClick={handleFilterData}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

const CamBillingList: React.FC = () => {
  const themeColor = useSelector((state: any) => state.theme.color);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Data States
  const [camBilling, setCamBilling] = useState<CamBillingItem[]>([]);
  const [filteredData, setFilteredData] = useState<CamBillingItem[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // UI States
  const [filterModal, setFilterModal] = useState(false); // ✅ Filter Modal State
  const [importModal, setImportModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Unified Pagination State
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 12, // Default to Grid
    total: 0,
    totalPages: 0,
  });

  const ensureArray = (data: any): CamBillingItem[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.cam_bills)) return data.cam_bills;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  // ✅ Helper to determine items per page
  const getPerPage = (mode: 'grid' | 'table') => (mode === 'grid' ? 12 : 10);

  const fetchCamBilling = async (page: number = pagination.page, limit: number = pagination.perPage) => {
    setLoading(true);
    try {
      const response = await getCamBillingData(page, limit);

      const dataArray = ensureArray(response.data);
      const totalCount = response.data?.total_count || 0;

      setCamBilling(dataArray);
      setFilteredData(dataArray);

      // Update pagination state
      setPagination((prev) => ({
        ...prev,
        page,
        perPage: limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }));
    } catch (err) {
      console.error('Failed to fetch CAM Billing data:', err);
      setCamBilling([]);
      setFilteredData([]);
      setPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // Effect: Fetch data on mount
  useEffect(() => {
    fetchCamBilling();
  }, []);

  // Effect: Update perPage when viewMode changes
  useEffect(() => {
    const newPerPage = getPerPage(viewMode);
    setPagination((prev) => ({
      ...prev,
      perPage: newPerPage,
      page: 1, // Reset to page 1 when switching views
    }));
  }, [viewMode]);

  // Fetch data whenever pagination changes
  useEffect(() => {
    fetchCamBilling(pagination.page, pagination.perPage);
  }, [pagination.page, pagination.perPage]);

  const columns = [
    {
      name: 'Action',
      cell: (row: CamBillingItem) => (
        <Link to={`/finance/cam/billing/${row.id}`}>
          <BsEye size={15} className="cursor-pointer hover:text-primary" />
        </Link>
      ),
      width: '80px',
    },
    { name: 'Flat', selector: (row: CamBillingItem) => row.flat_id, sortable: true },
    { name: 'Start Date', selector: (row: CamBillingItem) => row.bill_period_start_date, sortable: true },
    { name: 'End Date', selector: (row: CamBillingItem) => row.bill_period_end_date, sortable: true },
    { name: 'Amount', selector: (row: CamBillingItem) => row.total_amount, sortable: true },
    { name: 'Due Date', selector: (row: CamBillingItem) => row.due_date, sortable: true },
    { name: 'Invoice No.', selector: (row: CamBillingItem) => row.invoice_number, sortable: true },
    { name: 'Amount Paid', selector: (row: CamBillingItem) => row.amount_paid, sortable: true },
    {
      name: 'Payment Status',
      cell: (row: CamBillingItem) => {
        if (row.status === 'pending' || row.status === 'recall' || row.status === null) {
          return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Unpaid</span>;
        }
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Paid</span>;
      },
      sortable: true,
    },
    { name: 'Recall', selector: (row: CamBillingItem) => row.status, sortable: true },
    { name: 'Created On', selector: (row: CamBillingItem) => row.created_at, sortable: true },
  ];

  const handleSelectedRows = (rows: CamBillingItem[]) => {
    const selectedId = rows.map((row) => row.id);
    setSelectedRows(selectedId);
  };

  const handleDownload = async () => {
    if (selectedRows.length === 0) {
      return toast.error('Please select at least one record.');
    }
    toast.loading('Downloading CAM Billing Invoice...');
    try {
      const response = await getCamBillingDownload(selectedRows);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers['content-type'] })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cam_invoice_file.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success('CAM Billing Invoice downloaded successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Something went wrong, please try again');
    }
  };

const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value.toLowerCase();
  setSearchText(value);

  if (!value) {
    fetchCamBilling(1, pagination.perPage);
    return;
  }

  const result = camBilling.filter((item) =>
    item.invoice_number?.toLowerCase().includes(value) ||
    item.flat?.name?.toLowerCase().includes(value) ||
    item.status?.toLowerCase().includes(value)
  );

  setFilteredData(result);
};


  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getStatusColor = (status?: string) => {
    if (status === 'pending' || status === 'recall' || status === null) {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getPaymentStatusText = (status?: string) => {
    if (status === 'pending' || status === 'recall' || status === null) {
      return 'Unpaid';
    }
    return 'Paid';
  };

  // // ✅ Client-Side Pagination Logic
  // const { filteredData, totalRecords, totalPages } = useMemo(() => {
  //   const total = filteredData.length;
  //   const pages = Math.ceil(total / pagination.perPage);
  //   const start = (pagination.page - 1) * pagination.perPage;
  //   const end = start + pagination.perPage;
  //   const data = filteredData.slice(start, end);
  //   return { filteredData: data, totalRecords: total, totalPages: pages };
  // }, [filteredData, pagination.page, pagination.perPage]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-3 mb-6">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            onChange={handleSearch}
            value={searchText}
            placeholder="Search By Invoice No, Flat, Payment Status"
            className="pl-10 pr-4 py-2 w-64 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* View Toggle */}
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
          >
            <BsGrid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
          >
            <BsList className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Button */}
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
          onClick={() => setFilterModal(true)}
        >
          <BiFilterAlt className="w-4 h-4" />
          Filter
        </button>

        {/* Export Button */}
        <button
          onClick={handleDownload}
          className="font-semibold text-white px-4 py-2 flex gap-2 items-center justify-center rounded-md"
          style={{ background: themeColor }}
        >
          <FaDownload />
          Export
        </button>

        {/* Import Button */}
        <button
          className="font-semibold text-white px-4 py-2 flex gap-2 items-center justify-center rounded-md"
          style={{ background: themeColor }}
          onClick={() => setImportModal(true)}
        >
          <FaUpload />
          Import
        </button>

        {/* Add Button */}
        <Link
          to="/finance/cam/billing/add"
          style={{ background: themeColor }}
          className="px-4 py-2 font-medium text-white rounded-md flex gap-2 items-center justify-center"
        >
          <IoAddCircleOutline />
          Add
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center text-gray-400 py-10 bg-white rounded-lg border">
            <div className="inline-block">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2">Loading CAM Bills...</p>
            </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredData.length === 0 && (
        <div className="text-center text-gray-400 py-10 bg-white rounded-lg border">
          No records found.
        </div>
      )}

      {/* Grid View */}
      {!loading && viewMode === 'grid' && filteredData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredData.map((billing) => (
            <div
              key={billing.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">#{billing.invoice_number || billing.id}</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(billing.status)}`}>
                  {getPaymentStatusText(billing.status)}
                </span>
              </div>

              <h3 className="font-semibold text-foreground text-sm mb-2">
                Flat: {billing.flat_id}
              </h3>

              <div className="space-y-1 text-xs text-muted-foreground mb-4">
                <p><span className="font-medium">Period:</span> {formatDate(billing.bill_period_start_date)} - {formatDate(billing.bill_period_end_date)}</p>
                <p><span className="font-medium">Amount:</span> ₹{billing.total_amount?.toFixed(2) || '0.00'}</p>
                <p><span className="font-medium">Paid:</span> ₹{billing.amount_paid?.toFixed(2) || '0.00'}</p>
                <p><span className="font-medium">Due Date:</span> {formatDate(billing.due_date)}</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Link
                  to={`/finance/cam/billing/${billing.id}`}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <BsEye className="w-4 h-4 text-primary" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {!loading && viewMode === 'table' && filteredData.length > 0 && (
        <div className="border rounded-md bg-white overflow-hidden">
          <Table
            columns={columns}
            data={filteredData}
            selectableRow={true}
            onSelectedRows={handleSelectedRows}
            pagination={false} // Disable internal pagination to use custom one below
          />
        </div>
      )}

      {/* ✅ PAGINATION FOOTER */}
      {!loading && filteredData.length > 0 && (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border rounded-md mt-4">

    <div className="text-sm text-gray-600">
      Showing {(pagination.page - 1) * pagination.perPage + 1}
      {' '}to{' '}
      {(pagination.page - 1) * pagination.perPage + filteredData.length}
      {' '}of {pagination.total} records
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={() => setPagination((p) => ({ ...p, page: 1 }))}
        disabled={pagination.page === 1}
      >
        «
      </button>

      <button
        onClick={() =>
          setPagination((p) => ({ ...p, page: p.page - 1 }))
        }
        disabled={pagination.page === 1}
      >
        Prev
      </button>

      <span className="px-3 py-1 bg-primary text-white rounded mx-2">
        {pagination.page}
      </span>

      <button
        onClick={() =>
          setPagination((p) => ({ ...p, page: p.page + 1 }))
        }
        disabled={pagination.page >= pagination.totalPages}
      >
        Next 
      </button>

      <button
        onClick={() =>
          setPagination((p) => ({ ...p, page: pagination.totalPages }))
        }
        disabled={pagination.page >= pagination.totalPages}
      >
        »
      </button>
    </div>
    {/* Items per page */}
     <select value={pagination.perPage} onChange={(e) => 
      { setPagination((prev) => 
      ({ ...prev, perPage: Number(e.target.value), page: 1, }));
       }} 
       className="px-3 py-1 border rounded bg-white text-sm" >
         <option value={10}>10 / page</option>
          <option value={12}>12 / page</option>
           <option value={25}>25 / page</option> 
           <option value={50}>50 / page</option> </select> 
  </div>
)}


      {/* ✅ FILTER MODAL (Popup) */}
      {filterModal && (
        <CamBillingFilterModal
          onclose={() => setFilterModal(false)}
          setFilterSearchData={setFilteredData}
          fetchData={fetchCamBilling}
          themeColor={themeColor}
        />
      )}

      {importModal && (
        <InvoiceImportModal onclose={() => setImportModal(false)} fetchCamBilling={fetchCamBilling} />
      )}
    </div>
  );
};

export default CamBillingList;