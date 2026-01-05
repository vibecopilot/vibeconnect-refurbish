import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BsEye } from 'react-icons/bs';
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

const CamBillingList: React.FC = () => {
  const themeColor = useSelector((state: any) => state.theme.color);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [billingPeriod, setBillingPeriod] = useState<[Date | null, Date | null]>([null, null]);
  const [importModal, setImportModal] = useState(false);
  const [filter, setFilter] = useState(false);
  const [camBilling, setCamBilling] = useState<CamBillingItem[]>([]);
  const [filteredData, setFilteredData] = useState<CamBillingItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const buildings = getItemInLocalStorage('Building') || [];
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    block: '',
    floor_name: '',
    flat: '',
    status: '',
    dueDate: '',
  });

  const ensureArray = (data: any): CamBillingItem[] => {
    if (Array.isArray(data)) return data;
    if (data?.cam_billings) return data.cam_billings;
    if (data?.billings) return data.billings;
    if (data?.data) return Array.isArray(data.data) ? data.data : [];
    return [];
  };

  const fetchCamBilling = async () => {
    try {
      const response = await getCamBillingData();
      const dataArray = ensureArray(response.data);
      setCamBilling(dataArray);
      setFilteredData(dataArray);
    } catch (err) {
      console.error('Failed to fetch CAM Billing data:', err);
      setCamBilling([]);
      setFilteredData([]);
    }
  };

  useEffect(() => {
    fetchCamBilling();
  }, []);

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

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    setBillingPeriod(dates);
  };

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
      setFilteredData(ensureArray(resp.data));
      setFilter(false);
    } catch (error) {
      console.error('Error filtering data:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchText(searchValue);
    if (searchValue.trim() === '') {
      setFilteredData(camBilling);
    } else {
      const filterResult = camBilling.filter(
        (item) =>
          item?.invoice_number?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item?.status?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item?.flat_id?.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredData(filterResult);
    }
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
            placeholder="Search By Invoice No, Payment Status"
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
          className="font-semibold text-white px-4 py-2 flex gap-2 items-center justify-center rounded-md"
          style={{ background: themeColor }}
          onClick={handleDownload}
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
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border p-2 px-4 border-gray-500 rounded-md"
          >
            <option value="">Select Payment Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="Partially Paid">Partially Paid</option>
          </select>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="border p-2 px-4 border-gray-500 rounded-md"
          />
          <DatePicker
            selectsRange
            startDate={billingPeriod[0]}
            endDate={billingPeriod[1]}
            onChange={handleDateChange}
            placeholderText="Select Billing Period"
            className="border p-2 px-4 border-gray-500 rounded-md"
            isClearable
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
            onClick={() => { fetchCamBilling(); setFilter(false); }}
          >
            Reset
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' ? (
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
      ) : (
        /* Table View */
        <Table
          columns={columns}
          data={filteredData}
          selectableRow={true}
          onSelectedRows={handleSelectedRows}
        />
      )}

      {importModal && (
        <InvoiceImportModal onclose={() => setImportModal(false)} fetchCamBilling={fetchCamBilling} />
      )}
    </div>
  );
};

export default CamBillingList;