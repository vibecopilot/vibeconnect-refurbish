import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  FileText,
  Receipt,
  CreditCard,
  DollarSign,
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  FileCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Loader2,
  Maximize2,
  Landmark,
  List,
  X,
} from 'lucide-react';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import Table from '../../../components/table/Table';
import { domainPrefix, getAddressSetupDetails, getCamBillingDataDetails, getCamLogo, getCamBillInvoiceDownload, downloadReceiptInvoice, postInvoiceReceipt } from '../../../api';
import { toWords } from 'number-to-words';
import toast from 'react-hot-toast';
import RecallInvoiceModal from '@/containers/modals/RecallInvoiceModal';
import CAMBillInvoiceReceivePaymentModal from '@/containers/modals/CAMBillInvoiceReceivePaymentModal';

// cn utility function
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 }
};

// ✅ UPDATED: Create Invoice Receipt Modal Component
interface CreateInvoiceReceiptModalProps {
  onClose: () => void;
  invoiceData: any;
  themeColor: string;
  fetchCamBilling: () => void;
}

const CreateInvoiceReceiptModal: React.FC<CreateInvoiceReceiptModalProps> = ({
  onClose,
  invoiceData,
  themeColor,
  fetchCamBilling,
}) => {
  const [formData, setFormData] = useState({
    receipt_number: '',
    payment_mode: 'online',
    amount_received: invoiceData?.total_amount || 0,
    transaction_or_cheque_number: '',
    bank_name: '',
    branch_name: '',
    payment_date: new Date().toISOString().split('T')[0],
    receipt_date: new Date().toISOString().split('T')[0],
    notes: '',
    cam_bill_id: invoiceData?.id,
    resource_type: 'CamBill',
    resource_id: invoiceData?.id,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation check
    if (!invoiceData?.id) {
      toast.error('Invoice data not available');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        receipt_number: formData.receipt_number,
        payment_mode: formData.payment_mode,
        amount_received: Number(formData.amount_received),
        transaction_or_cheque_number: formData.transaction_or_cheque_number,
        bank_name: formData.bank_name,
        branch_name: formData.branch_name,
        payment_date: formData.payment_date,
        receipt_date: formData.receipt_date,
        notes: formData.notes,
        resource_type: 'CamBill',
        resource_id: invoiceData.id,
        cam_bill_id: invoiceData.id,
      };

      console.log('Submitting Receipt Payload:', payload);
      await postInvoiceReceipt(invoiceData.id, payload);

      toast.success('Receipt created successfully');
      fetchCamBilling();
      onClose();
    } catch (error) {
      console.error('Error submitting receipt:', error);
      toast.error('Error creating receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* ✅ FIX: Added flex-col, max-h-[90vh] to keep modal in view, handle overflow */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header - flex-none ensures it doesn't shrink */}
        <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Create Invoice Receipt</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body - flex-1 + overflow-y-auto handles scrolling */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Invoice Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoiceData.invoice_number || '-'}
                disabled
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-600"
              />
            </div>

            {/* Receipt Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
              <input
                type="text"
                name="receipt_number"
                value={formData.receipt_number}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Enter Receipt Number"
              />
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
              <input
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            {/* Receipt Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Date</label>
              <input
                type="date"
                name="receipt_date"
                value={formData.receipt_date}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
              <select
                name="payment_mode"
                value={formData.payment_mode}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="online">Online</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            {/* Amount Received */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Received</label>
              <input
                type="number"
                name="amount_received"
                value={formData.amount_received}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            {/* Transaction / Cheque Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction / Cheque No.</label>
              <input
                type="text"
                name="transaction_or_cheque_number"
                value={formData.transaction_or_cheque_number}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Transaction ID"
              />
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="e.g. SBI"
              />
            </div>

            {/* Branch Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
              <input
                type="text"
                name="branch_name"
                value={formData.branch_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Enter Branch Name"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Additional notes..."
              />
            </div>
          </div>
        </form>

        {/* Footer - flex-none ensures it stays visible at bottom */}
        <div className="flex-none bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ background: themeColor }}
            className="px-6 py-2 text-white rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ViewCamBilling: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const themeColor = useSelector((state: any) => state.theme.color);
  const [recallModal, setRecallModal] = useState(false);
  const [receivePayment, setReceivePayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [camBilling, setCamBilling] = useState<any>({});
  const [camBillingAllData, setCamBillingAllData] = useState<any>({});
  const [invoiceReceipt, setInvoiceReceipt] = useState<any[]>([]);
  const [addressInvoice, setAddressInvoice] = useState<any>({});
  const [receiver, setReceiver] = useState<any>({});
  const [logo, setLogo] = useState<any>({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalAmountPaid, setTotalAmountPaid] = useState(0);
  const [receivePaymentDetails, setReceivePaymentDetails] = useState<any[]>([]);

  const [createReceiptModal, setCreateReceiptModal] = useState(false);

  const fetchAddressSetupDetails = async (id: number) => {
    try {
      const response = await getAddressSetupDetails(id);
      setAddressInvoice(response.data);
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const fetchCamBilling = async () => {
    try {
      setLoading(true);
      const response = await getCamBillingDataDetails(id);
      setCamBillingAllData(response.data);
      setCamBilling(response.data);
      if (response.data.invoice_address_id) {
        await fetchAddressSetupDetails(response.data.invoice_address_id);
      }
      setReceiver(response.data.reciever_details || {});
      setInvoiceReceipt(response.data.invoice_receipts || []);
      setReceivePaymentDetails(response.data.payments || []);
      setTotalAmount(response.data.total_amount || 0);
      setTotalAmountPaid(
        (response.data.payments || []).reduce(
          (sum: number, item: any) => sum + (Number(item.paid_amount) || 0),
          0
        )
      );

    } catch (err) {
      console.error('Failed to fetch CAM Billing data:', err);
      toast.error('Failed to load CAM Billing details');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogo = async () => {
    try {
      const response = await getCamLogo();
      setLogo(response.data);
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  };

  useEffect(() => {
    fetchCamBilling();
    fetchLogo();
  }, [id]);

  const handleDownload = async () => {
    try {
      const response = await getCamBillInvoiceDownload(id);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers['content-type'] })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cam_invoice_file.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CAM Billing Invoice downloaded successfully');
    } catch (error) {
      toast.error('Error downloading invoice');
    }
  };

  const columnsCharges = [
    {
      name: 'Sr.No',
      selector: (row: any, index: number) => index + 1,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Description',
      selector: (row: any) => row.description || '-',
      sortable: true,
      wrap: true,
    },
    {
      name: 'Qty',
      selector: (row: any) => row.quantity ?? '-',
      sortable: true,
      center: true,
    },
    {
      name: 'Unit',
      selector: (row: any) => row.unit ?? '-',
      center: true,
    },
    {
      name: 'Rate',
      selector: (row: any) => row.rate ?? '-',
      right: true,
      cell: (row: any) => `₹${row.rate ?? 0}`,
    },
    {
      name: 'Taxable Val',
      selector: ( row: any) => row.taxable_value ?? '-',
      right: true,
      cell: (row: any) => `₹${row.taxable_value ?? 0}`,
    },
    {
      name: 'CGST',
      selector: (row: any) => row.cgst_amount ?? '-',
      right: true,
      cell: (row: any) =>
        row.cgst_rate
          ? `${row.cgst_rate}% (₹${row.cgst_amount})`
          : '-',
    },
    {
      name: 'SGST',
      selector: (row: any) => row.sgst_amount ?? '-',
      right: true,
      cell: (row: any) =>
        row.sgst_rate
          ? `${row.sgst_rate}% (₹${row.sgst_amount})`
          : '-',
    },
    {
      name: 'IGST',
      selector: (row: any) => row.igst_amount ?? '-',
      right: true,
      cell: (row: any) =>
        row.igst_rate
          ? `${row.igst_rate}% (₹${row.igst_amount})`
          : '-',
    },
    {
      name: 'Total',
      selector: (row: any) => row.total ?? '-',
      right: true,
      cell: (row: any) => (
        <span className="font-semibold">
          ₹{row.total ?? 0}
        </span>
      ),
    },
  ];

  const downloadReceipt = async (receiptId: number) => {
    try {
      const response = await downloadReceiptInvoice(receiptId);
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

  const getStatusBadge = () => {
    if (totalAmountPaid === 0) {
      return {
        label: 'Unpaid',
        className: 'bg-gray-900 text-white border-gray-900',
        icon: AlertCircle,
        color: 'text-gray-900'
      };
    } else if (totalAmountPaid < totalAmount) {
      return {
        label: 'Partial Paid',
        className: 'bg-warning text-white border-warning',
        icon: Clock,
        color: 'text-warning'
      };
    } else if (totalAmountPaid > totalAmount) {
      return {
        label: 'Paid Extra',
        className: 'bg-primary text-primary-foreground border-primary',
        icon: TrendingUp,
        color: 'text-primary'
      };
    }
    return {
      label: 'Paid',
      className: 'bg-success text-white border-success',
      icon: CheckCircle,
      color: 'text-success'
    };
  };

  const statusInfo = getStatusBadge();
  const StatusIcon = statusInfo.icon;

  const columnsPaymentDetails = [
    { name: 'Previous Amount Due', selector: (row: any) => row.due_amount, sortable: true },
    { name: 'Current Charges', selector: (row: any) => row.total_charge, sortable: true },
    { name: 'Interest Amt on previous dues', selector: (row: any) => row.due_amount_interst, sortable: true },
    { name: 'Total Amount Due', selector: (row: any) => row.total_amount, sortable: true },
    { name: 'quotes', selector: (row: any) => row.due_date, sortable: true },
  ];

  const columnsReceipts = [
    { name: 'Receipt No.', selector: (row: any) => row.receipt_number, sortable: true },
    { name: 'Invoice No.', selector: (row: any) => row.invoice_number, sortable: true },
    { name: 'Customer Name', selector: (row: any) => row.customer_name, sortable: true },
    { name: 'Amount Received', selector: (row: any) => row.amount_received, sortable: true },
    { name: 'Payment Mode', selector: (row: any) => row.payment_mode, sortable: true },
    { name: 'Transaction No.', selector: (row: any) => row.transaction_or_cheque_number, sortable: true },
    { name: 'Payment Date', selector: (row: any) => row.payment_date, sortable: true },
    { name: 'Receipt Date', selector:  (row: any) => row.receipt_date, sortable: true },
    {
      name: 'Attachments',
      cell: (row: any) => (
        <button
          onClick={() => downloadReceipt(row.id)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <FileText className="h-4 w-4 text-primary" />
        </button>
      ),
    },
  ];

  const columnsTransaction = [
    { name: 'Date', selector: (row: any) => row.created_at, sortable: true },
    { name: 'Amount', selector: (row: any) => row.paid_amount, sortable: true },
    { name: 'Payment Mode', selector: (row: any) => row.payment_method, sortable: true },
    { name: 'Transaction No.', selector: (row: any) => row.transaction_id, sortable: true },
    { name: 'Payment Date', selector: (row: any) => row.paymen_date, sortable: true },
    {
      name: 'Images',
      cell: (row: any) => (
        <button
          onClick={() => window.open(`${domainPrefix}${row.image_url}`, '_blank')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <FileText className="h-4 w-4 text-primary" />
        </button>
      ),
    },
  ];

  const amount = camBilling.total_amount || 0;
  const amountInWords = Number.isFinite(amount) ? toWords(amount) : 'Invalid Amount';

  if (loading) {
    return (
      <div className="p-6 flex flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading CAM Billing details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="p-6 pb-0">
        <Breadcrumb
          items={[
            { label: 'Finance', path: '/finance/cam' },
            { label: 'CAM', path: '/finance/cam/billing' },
            { label: 'CAM Billing Details' },
          ]}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/finance/cam/billing')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">
                      {camBillingAllData.invoice_number || `Invoice #${id}`}
                    </h1>
                    <span className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded-full border",
                      statusInfo.className
                    )}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">CAM Billing Invoice</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRecallModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <AlertCircle className="h-4 w-4" />
                Recall
              </button>              
              <button
                onClick={() => setCreateReceiptModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <FileCheck className="h-4 w-4" />
                Create Receipt
              </button>

              <button
                onClick={() => setReceivePayment(true)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <CreditCard className="h-4 w-4" />
                Receive Payment
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Bento Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full px-6 pb-6 grid grid-cols-12 gap-4 auto-rows-[minmax(120px,auto)] mt-4"
      >
        {/* Status Card */}
        <motion.div
          variants={item}
          className={cn(
            "col-span-12 lg:col-span-3 row-span-1 rounded-xl border p-4 shadow-sm relative group",
            statusInfo.label === 'Unpaid' && "bg-gradient-to-br from-gray-900/10 to-transparent border-gray-200",
            statusInfo.label === 'Partial Paid' && "bg-gradient-to-br from-warning/10 to-transparent border-warning/20",
            statusInfo.label === 'Paid Extra' && "bg-gradient-to-br from-primary/10 to-transparent border-primary/20",
            statusInfo.label === 'Paid' && "bg-gradient-to-br from-success/10 to-transparent border-success/20"
          )}
        >
          <StatusIcon className={cn("h-8 w-8 mb-2", statusInfo.color)} />
          <p className="text-3xl font-bold">{statusInfo.label}</p>
          <p className="text-sm text-muted-foreground mt-1">
            ₹{totalAmountPaid.toLocaleString()} / ₹{totalAmount.toLocaleString()}
          </p>
        </motion.div>

        {/* Total Amount Card */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-3 row-span-1 bg-gradient-to-br from-primary/10 to-transparent rounded-xl border p-4 shadow-sm"
        >
          <DollarSign className="h-8 w-8 text-primary mb-2" />
          <p className="text-3xl font-bold">₹{totalAmount.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Amount</p>
        </motion.div>

        {/* Amount Paid Card */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-3 row-span-1 bg-gradient-to-br from-success/10 to-transparent rounded-xl border p-4 shadow-sm"
        >
          <CheckCircle className="h-8 w-8 w-8 text-success mb-2" />
          <p className="text-3xl font-bold">₹{totalAmountPaid.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Amount Paid</p>
        </motion.div>

        {/* Remaining Balance Card */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-3 row-span-1 bg-gradient-to-br from-warning/10 to-transparent rounded-xl border p-4 shadow-sm"
        >
          <Clock className="h-8 w-8 w-8 text-warning mb-2" />
          <p className="text-3xl font-bold">₹{(totalAmount - totalAmountPaid).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Remaining Balance</p>
        </motion.div>

        {/* Invoice Header - Logo & Address */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group"
        >
          <button
            onClick={() => handleDownload()}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg z-10"
          >
            <Maximize2 className="h-4 w-4 text-primary" />
          </button>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Invoice Header
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {logo?.logo_url ? (
                <img
                  src={`${domainPrefix}${logo.logo_url}`}
                  className="w-full max-w-[200px] h-auto rounded-lg border border-border"
                  alt="Invoice Logo"
                />
              ) : (
                <div className="w-full max-w-[200px] h-32 rounded-lg border border-border bg-muted flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">No logo</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">{addressInvoice.title || '-'}</h3>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">{addressInvoice.address || '-'}</p>
                {addressInvoice.phone_number && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {addressInvoice.phone_number}
                  </p>
                )}
                {addressInvoice.fax_number && (
                  <p className="text-muted-foreground">Fax: {addressInvoice.fax_number}</p>
                )}
                {addressInvoice.email_address && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {addressInvoice.email_address}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tax Invoice Details */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Tax Invoice Details
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">GSTIN</p>
              <p className="font-medium text-sm">{addressInvoice.gst_number || '-'}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">PAN</p>
              <p className="font-medium text-sm">{addressInvoice.pan_number || '-'}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Invoice No</p>
              <p className="font-medium text-sm">{camBillingAllData.invoice_number || '-'}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Date of Supply</p>
              <p className="font-medium text-sm">{camBillingAllData.supply_date || '-'}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 col-span-2">
              <p className="text-xs text-muted-foreground">Billing Period</p>
              <p className="font-medium text-sm">
                {camBillingAllData.bill_period_start_date || '-'} to {camBillingAllData.bill_period_end_date || '-'}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 col-span-2">
              <p className="text-xs text-muted-foreground">Place of Supply</p>
              <p className="font-medium text-sm">{addressInvoice.state || '-'}</p>
            </div>
          </div>
        </motion.div>

        {/* Receiver Details */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Receiver Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="font-medium">
                {addressInvoice.account_name || addressInvoice.title || '-'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Address</span>
              <span className="font-medium text-right max-w-[60%]">
                {addressInvoice.address || '-'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">PAN</span>
              <span className="font-medium">
                {addressInvoice.pan_number || '-'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">GSTIN / Unique ID </span>
              <span className="font-medium">
                {addressInvoice.gst_number || '-'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">State</span>
              <span className="font-medium">
                {addressInvoice.state || '-'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Bank Details */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            Bank Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Account Name</span>
              <span className="font-medium">{addressInvoice.account_name || '-'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Account Number</span>
              <span className="font-mono text-sm">{addressInvoice.account_number || '-'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Bank & Branch</span>
              <span className="font-medium text-right max-w-[60%]">{addressInvoice.bank_branch_name || '-'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">IFSC Code</span>
              <span className="font-mono text-sm">{addressInvoice.ifsc_code || '-'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Account Type</span>
              <span className="font-medium capitalize">{addressInvoice.account_type || '-'}</span>
            </div>
          </div>
        </motion.div>

        {/* Invoice Charges */}
        <motion.div
          variants={item}
          className="col-span-12 row-span-3 bg-card rounded-2xl border p-6 shadow-sm relative group mb-8"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            Invoice Charges
          </h2>
          <div className="overflow-x-auto">
            <Table columns={columnsCharges} data={camBillingAllData.charges || []} />
          </div>
        </motion.div>

        {/* Invoice Receipts */}
        {invoiceReceipt.length > 0 && (
          <motion.div
            variants={item}
            className="col-span-12 row-span-3 bg-card rounded-2xl border p-6 shadow-sm relative group"
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Invoice Receipts ({invoiceReceipt.length})
            </h2>
            <div className="overflow-x-auto">
              <Table columns={columnsReceipts} data={invoiceReceipt} />
            </div>
          </motion.div>
        )}

        {/* Payment Details */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-12 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Details
          </h2>
          <div className="overflow-x-auto">
            <Table columns={columnsPaymentDetails} data={[camBillingAllData]} />
          </div>
        </motion.div>

        {/* Payment Transactions */}
        {receivePaymentDetails.length > 0 && (
          <motion.div
            variants={item}
            className="col-span-12 row-span-3 bg-card rounded-2xl border p-6 shadow-sm relative group"
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Payment Transactions ({receivePaymentDetails.length})
            </h2>
            <div className="overflow-x-auto">
              <Table columns={columnsTransaction} data={receivePaymentDetails} />
            </div>
          </motion.div>
        )}

        {/* Total Amount Summary */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-12 row-span-1 bg-card rounded-2xl border p-6 shadow-sm "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold mt-1">₹{totalAmount.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Amount in words</p>
              <p className="text-sm font-medium mt-1 text-foreground">{amountInWords}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Modals */}
      {recallModal && (
        <RecallInvoiceModal onclose={() => setRecallModal(false)} fetchCamBilling={fetchCamBilling} />
      )}
      
      {/* ✅ NEW MODAL: Create Receipt (Updated) */}
      {createReceiptModal && (
        <CreateInvoiceReceiptModal
          onClose={() => setCreateReceiptModal(false)}
          invoiceData={camBillingAllData}
          themeColor={themeColor}
          fetchCamBilling={fetchCamBilling}
        />
      )}

      {/* ✅ NEW MODAL: Receive Payment */}
      {receivePayment && (
        <CAMBillInvoiceReceivePaymentModal onclose={() => setReceivePayment(false)} fetchCamBilling={fetchCamBilling} />
      )}
    </div>
  );
};

export default ViewCamBilling;