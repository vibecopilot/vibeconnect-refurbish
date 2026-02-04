import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BsEye, BsX } from 'react-icons/bs';
import { IoAddCircleOutline } from 'react-icons/io5';
import { FaDownload, FaUpload, FaRegFileAlt } from 'react-icons/fa';
import { BiFilterAlt } from 'react-icons/bi';
import { BsGrid3X3, BsList } from 'react-icons/bs';
import Table from '../../../components/table/Table';
import {
  getInvoiceReceipt,
  getFloors,
  getUnits,
  getReceiptInvoiceCamDownload,
  gatReceiptInvoiceFilter,
  downloadReceiptInvoice,
} from '../../../api';
import toast from 'react-hot-toast';
import { getItemInLocalStorage } from '../../../utils/localStorage';
import ReceiptInvoiceModal from '@/containers/modals/ReceiptInvoiceModal';

interface ReceiptItem {
  id: number;
  receipt_number: string;
  invoice_number: string;
  building?: { name: string };
  unit?: { name: string };
  amount_received: number;
  payment_mode: string;
  transaction_or_cheque_number: string;
  payment_date: string;
  receipt_date: string;
}

// ✅ Receipt Filter Modal Component
interface ReceiptFilterModalProps {
  onclose: () => void;
  setFilterSearchData: (data: ReceiptItem[]) => void;
  fetchData: () => void;
  themeColor: string;
}

const ReceiptFilterModal: React.FC<ReceiptFilterModalProps> = ({
  onclose,
  setFilterSearchData,
  fetchData,
  themeColor,
}) => {
  const [formData, setFormData] = useState({
    block: '',
    floor_name: '',
    flat: '',
    invoiceNumber: '',
    receiptNumber: '',
    receiptDate: '',
  });

  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const buildings = getItemInLocalStorage('Building') || [];

  const ensureArray = (data: any): ReceiptItem[] => {
    if (Array.isArray(data)) return data;
    if (data?.receipts) return data.receipts;
    if (data?.invoice_receipts) return data.invoice_receipts;
    if (data?.data) return Array.isArray(data.data) ? data.data : [];
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

  const handleFilterData = async () => {
    try {
      const resp = await gatReceiptInvoiceFilter(
        formData.block,
        formData.floor_name,
        formData.flat,
        formData.invoiceNumber,
        formData.receiptNumber,
        formData.receiptDate
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Filter Receipts</h3>
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

            {/* Invoice Number */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Invoice Number</label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                placeholder="Invoice Number"
                className="border p-2 px-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Receipt Number */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Receipt Number</label>
              <input
                type="text"
                name="receiptNumber"
                value={formData.receiptNumber}
                onChange={handleChange}
                placeholder="Receipt Number"
                className="border p-2 px-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Receipt Date */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Receipt Date</label>
              <input
                type="date"
                name="receiptDate"
                value={formData.receiptDate}
                onChange={handleChange}
                className="border p-2 px-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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

const ReceiptInvoiceList: React.FC = () => {
  const themeColor = useSelector((state: any) => state.theme.color);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Data States
  const [invoiceReceipt, setInvoiceReceipt] = useState<ReceiptItem[]>([]);
  const [filterSearchData, setFilterSearchData] = useState<ReceiptItem[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // UI States
  const [filterModal, setFilterModal] = useState(false);
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

  const ensureArray = (data: any): ReceiptItem[] => {
    if (Array.isArray(data)) return data;
    if (data?.receipts) return data.receipts;
    if (data?.invoice_receipts) return data.invoice_receipts;
    if (data?.data) return Array.isArray(data.data) ? data.data : [];
    return [];
  };

  // ✅ Helper to determine items per page
  const getPerPage = (mode: 'grid' | 'table') => (mode === 'grid' ? 12 : 10);

  const fetchInvoiceReceipt = async () => {
    setLoading(true);
    try {
      const response = await getInvoiceReceipt();
      const dataArray = ensureArray(response.data);
      setInvoiceReceipt(dataArray);
      setFilterSearchData(dataArray);
    } catch (err) {
      console.error('Failed to fetch Receipt Invoice data:', err);
      setInvoiceReceipt([]);
      setFilterSearchData([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect: Fetch data on mount
  useEffect(() => {
    fetchInvoiceReceipt();
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

  const handleDownloadReceipt = async (id: number) => {
    try {
      const response = await downloadReceiptInvoice(id);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers['content-type'] })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'receipt_invoice_file.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      toast.error('Error downloading receipt');
    }
  };

  const columns = [
    {
      name: 'Action',
      cell: (row: ReceiptItem) => (
        <Link to={`/finance/cam/receipt-invoice/${row.id}`}>
          <BsEye size={15} className="cursor-pointer hover:text-primary" />
        </Link>
      ),
      width: '80px',
    },
    { name: 'Receipt No.', selector: (row: ReceiptItem) => row.receipt_number, sortable: true },
    { name: 'Invoice No.', selector: (row: ReceiptItem) => row.invoice_number, sortable: true },
    { name: 'Block', selector: (row: ReceiptItem) => row.building?.name || 'N/A', sortable: true },
    { name: 'Flat', selector: (row: ReceiptItem) => row.unit?.name || 'N/A', sortable: true },
    { name: 'Amount Received', selector: (row: ReceiptItem) => row.amount_received, sortable: true },
    { name: 'Payment Mode', selector: (row: ReceiptItem) => row.payment_mode, sortable: true },
    { name: 'Transaction No.', selector: (row: ReceiptItem) => row.transaction_or_cheque_number, sortable: true },
    { name: 'Payment Date', selector: (row: ReceiptItem) => row.payment_date, sortable: true },
    { name: 'Receipt Date', selector: (row: ReceiptItem) => row.receipt_date, sortable: true },
    {
      name: 'Attachments',
      cell: (row: ReceiptItem) => (
        <button onClick={() => handleDownloadReceipt(row.id)}>
          <FaRegFileAlt className="cursor-pointer hover:text-primary" />
        </button>
      ),
    },
  ];

  const handleSelectedRows = (rows: ReceiptItem[]) => {
    const selectedId = rows.map((row) => row.id);
    setSelectedRows(selectedId);
  };

  const handleDownload = async () => {
    if (selectedRows.length === 0) {
      return toast.error('Please select at least one record.');
    }
    toast.loading('Downloading Receipt Invoice...');
    try {
      const response = await getReceiptInvoiceCamDownload(selectedRows);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers['content-type'] })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'receipt_invoice_file.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success('Receipt Invoice downloaded successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Something went wrong, please try again');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchText(searchValue);
    
    if (searchValue.trim() === '') {
      setFilterSearchData(invoiceReceipt);
    } else {
      // ✅ FIX 1: Filter 'filterSearchData' (current view) instead of 'invoiceReceipt' (full list)
      // This ensures search respects the modal filter.
      const filterResult = filterSearchData.filter(
        (item) => {
          const q = searchValue.toLowerCase();
          // ✅ FIX 2: Expanded search criteria based on provided JSON structure
          return (
            item?.invoice_number?.toLowerCase().includes(q) ||
            item?.receipt_number?.toLowerCase().includes(q) ||
            item?.payment_mode?.toLowerCase().includes(q) ||
            item?.building?.name?.toLowerCase().includes(q) ||
            item?.unit?.name?.toLowerCase().includes(q) ||
            String(item?.amount_received || '').includes(q) ||
            item?.transaction_or_cheque_number?.toLowerCase().includes(q)
          );
        }
      );
      setFilterSearchData(filterResult);
    }
    // Reset to page 1 on search
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // ✅ Client-Side Pagination Logic
  const { displayedData, totalRecords, totalPages } = useMemo(() => {
    const total = filterSearchData.length;
    const pages = Math.ceil(total / pagination.perPage);
    const start = (pagination.page - 1) * pagination.perPage;
    const end = start + pagination.perPage;
    const data = filterSearchData.slice(start, end);
    return { displayedData: data, totalRecords: total, totalPages: pages };
  }, [filterSearchData, pagination.page, pagination.perPage]);

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
            // ✅ FIX 3: Updated placeholder to reflect new search capabilities
            placeholder="Search By Receipt No, Invoice No, Building, Unit, Bank, Amount..."
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
          to="/finance/cam/receipt-invoice/add"
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
                <p className="mt-2">Loading Receipts...</p>
            </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && displayedData.length === 0 && (
        <div className="text-center text-gray-400 py-10 bg-white rounded-lg border">
          No records found.
        </div>
      )}

      {/* Grid View */}
      {!loading && viewMode === 'grid' && displayedData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedData.map((receipt) => (
            <div
              key={receipt.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">Receipt #{receipt.receipt_number}</span>
                <button onClick={() => handleDownloadReceipt(receipt.id)}>
                  <FaRegFileAlt className="w-4 h-4 text-primary cursor-pointer hover:text-primary/80" />
                </button>
              </div>
              
              <h3 className="font-semibold text-foreground text-sm mb-2">
                Invoice: {receipt.invoice_number}
              </h3>
              
              <div className="space-y-1 text-xs text-muted-foreground mb-4">
                <p><span className="font-medium">Block:</span> {receipt.building?.name || 'N/A'}</p>
                <p><span className="font-medium">Flat:</span> {receipt.unit?.name || 'N/A'}</p>
                <p><span className="font-medium">Amount:</span> ₹{receipt.amount_received?.toFixed(2) || '0.00'}</p>
                <p><span className="font-medium">Payment Mode:</span> {receipt.payment_mode || 'N/A'}</p>
                <p><span className="font-medium">Transaction:</span> {receipt.transaction_or_cheque_number || 'N/A'}</p>
                <p><span className="font-medium">Payment Date:</span> {formatDate(receipt.payment_date)}</p>
                <p><span className="font-medium">Receipt Date:</span> {formatDate(receipt.receipt_date)}</p>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Link
                  to={`/finance/cam/receipt-invoice/${receipt.id}`}
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
      {!loading && viewMode === 'table' && displayedData.length > 0 && (
        <div className="border rounded-md bg-white overflow-hidden">
          <Table
            columns={columns}
            data={displayedData}
            selectableRow={true}
            onSelectedRows={handleSelectedRows}
            pagination={false}
          />
        </div>
      )}

      {/* ✅ PAGINATION FOOTER */}
      {!loading && displayedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border rounded-md mt-4">
          
          {/* Records info */}
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.perPage + 1}{' '}
            to {Math.min(pagination.page * pagination.perPage, totalRecords)}{' '}
            of {totalRecords} records
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
            >
              «
            </button>

            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
              }
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
            >
              ‹ Prev
            </button>

            <span className="px-3 py-1 border rounded bg-primary text-white">
              {pagination.page}
            </span>

            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(totalPages, prev.page + 1)
                }))
              }
              disabled={pagination.page >= totalPages}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
            >
              Next ›
            </button>

            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: totalPages
                }))
              }
              disabled={pagination.page >= totalPages}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
            >
              »
            </button>
          </div>

          {/* Items per page */}
          <select
            value={pagination.perPage}
            onChange={(e) => {
              setPagination((prev) => ({
                ...prev,
                perPage: Number(e.target.value),
                page: 1,
              }));
            }}
            className="px-3 py-1 border rounded bg-white text-sm"
          >
            <option value={10}>10 / page</option>
            <option value={12}>12 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      )}

      {/* ✅ FILTER MODAL */}
      {filterModal && (
        <ReceiptFilterModal
          onclose={() => setFilterModal(false)}
          setFilterSearchData={setFilterSearchData}
          fetchData={fetchInvoiceReceipt}
          themeColor={themeColor}
        />
      )}

      {importModal && (
        <ReceiptInvoiceModal onclose={() => setImportModal(false)} fetchInvoiceReceipt={fetchInvoiceReceipt} />
      )}
    </div>
  );
};

export default ReceiptInvoiceList;