import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BsEye } from 'react-icons/bs';
import { IoAddCircleOutline } from 'react-icons/io5';
import { FaDownload, FaUpload, FaRegFileAlt } from 'react-icons/fa';
import { BiFilterAlt } from 'react-icons/bi';
import { BsGrid3X3, BsList } from 'react-icons/bs';
import Table from '@/components/table/Table';
import {
  getInvoiceReceipt,
  getFloors,
  getUnits,
  getReceiptInvoiceCamDownload,
  gatReceiptInvoiceFilter,
  downloadReceiptInvoice,
} from '@/api';
import toast from 'react-hot-toast';
import { getItemInLocalStorage } from '@/utils/localStorage';
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

const ReceiptInvoiceList: React.FC = () => {
  const themeColor = useSelector((state: any) => state.theme.color);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [invoiceReceipt, setInvoiceReceipt] = useState<ReceiptItem[]>([]);
  const [filter, setFilter] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterSearchData, setFilterSearchData] = useState<ReceiptItem[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const buildings = getItemInLocalStorage('Building') || [];
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    block: '',
    floor_name: '',
    flat: '',
    invoiceNumber: '',
    receiptNumber: '',
    receiptDate: '',
  });

  const ensureArray = (data: any): ReceiptItem[] => {
    if (Array.isArray(data)) return data;
    if (data?.receipts) return data.receipts;
    if (data?.invoice_receipts) return data.invoice_receipts;
    if (data?.data) return Array.isArray(data.data) ? data.data : [];
    return [];
  };

  const fetchInvoiceReceipt = async () => {
    try {
      const response = await getInvoiceReceipt();
      const dataArray = ensureArray(response.data);
      setInvoiceReceipt(dataArray);
      setFilterSearchData(dataArray);
    } catch (err) {
      console.error('Failed to fetch Receipt Invoice data:', err);
      setInvoiceReceipt([]);
      setFilterSearchData([]);
    }
  };

  useEffect(() => {
    fetchInvoiceReceipt();
  }, []);

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
      setFilterSearchData(ensureArray(resp.data));
      setFilter(false);
    } catch (error) {
      console.error('Error filtering data:', error);
    }
  };

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
      const filterResult = invoiceReceipt.filter(
        (item) =>
          item?.invoice_number?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item?.receipt_number?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item?.payment_mode?.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilterSearchData(filterResult);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const isFlatDisabled = !formData.block || !formData.floor_name || !units.length;

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
            placeholder="Search By Invoice No, Receipt No, Payment Mode"
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
          onClick={() => setFilter(!filter)}
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

      {/* Filter Panel */}
      {filter && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-100 rounded-lg">
          <select
            className="border p-2 px-4 border-gray-500 rounded-md"
            onChange={handleChange}
            value={formData.block}
            name="block"
          >
            <option value="">Select Building</option>
            {buildings?.map((building: any) => (
              <option key={building.id} value={building.id}>{building.name}</option>
            ))}
          </select>
          <select
            className="border p-2 px-4 border-gray-500 rounded-md"
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
          <select
            name="flat"
            value={formData.flat}
            onChange={handleChange}
            disabled={isFlatDisabled}
            className="border p-2 px-4 border-gray-500 rounded-md"
          >
            <option value="">Select Flat</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
          <input
            type="text"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={handleChange}
            placeholder="Invoice Number"
            className="border p-2 px-4 border-gray-500 rounded-md"
          />
          <input
            type="text"
            name="receiptNumber"
            value={formData.receiptNumber}
            onChange={handleChange}
            placeholder="Receipt Number"
            className="border p-2 px-4 border-gray-500 rounded-md"
          />
          <input
            type="date"
            name="receiptDate"
            value={formData.receiptDate}
            onChange={handleChange}
            className="border p-2 px-4 border-gray-500 rounded-md"
          />
          <button
            onClick={handleFilterData}
            className="p-2 px-4 text-white rounded-md"
            style={{ background: themeColor }}
          >
            Apply
          </button>
          <button
            className="bg-red-400 p-2 px-4 text-white rounded-md"
            onClick={() => { fetchInvoiceReceipt(); setFilter(false); }}
          >
            Reset
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filterSearchData.map((receipt) => (
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
      ) : (
        /* Table View */
        <Table
          columns={columns}
          data={filterSearchData}
          selectableRow={true}
          onSelectedRows={handleSelectedRows}
        />
      )}

      {importModal && (
        <ReceiptInvoiceModal onclose={() => setImportModal(false)} fetchInvoiceReceipt={fetchInvoiceReceipt} />
      )}
    </div>
  );
};

export default ReceiptInvoiceList;