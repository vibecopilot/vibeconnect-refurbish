import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
  Calendar,
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
} from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Table from '@/components/table/Table';
import {
  domainPrefix,
  getAddressSetupDetails,
  getCamBillingDataDetails,
  getCamBillInvoiceDownload,
  getCamLogo,
  downloadReceiptInvoice,
} from '@/api';
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

  const fetchAddressSetupDetails = async (addressId: number) => {
    try {
      const response = await getAddressSetupDetails(addressId);
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
        (response.data.payments || []).reduce((sum: number, item: any) => sum + (item.total_amount || 0), 0)
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
    { name: 'Due Date', selector: (row: any) => row.due_date, sortable: true },
  ];

  const columnsReceipts = [
    { name: 'Receipt No.', selector: (row: any) => row.receipt_number, sortable: true },
    { name: 'Invoice No.', selector: (row: any) => row.invoice_number, sortable: true },
    { name: 'Customer Name', selector: (row: any) => row.customer_name, sortable: true },
    { name: 'Amount Received', selector: (row: any) => row.amount_received, sortable: true },
    { name: 'Payment Mode', selector: (row: any) => row.payment_mode, sortable: true },
    { name: 'Transaction No.', selector: (row: any) => row.transaction_or_cheque_number, sortable: true },
    { name: 'Payment Date', selector: (row: any) => row.payment_date, sortable: true },
    { name: 'Receipt Date', selector: (row: any) => row.receipt_date, sortable: true },
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
    { name: 'Amount', selector: (row: any) => row.total_amount, sortable: true },
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
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
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
              <Link
                to={`/finance/cam/billing/${id}/create-receipt`}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <FileCheck className="h-4 w-4" />
                Create Receipt
              </Link>
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
        className="w-full px-6 pb-6 grid grid-cols-12 gap-4 auto-rows-[minmax(120px,auto)]"
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
          <CheckCircle className="h-8 w-8 text-success mb-2" />
          <p className="text-3xl font-bold">₹{totalAmountPaid.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Amount Paid</p>
        </motion.div>

        {/* Remaining Balance Card */}
        <motion.div 
          variants={item} 
          className="col-span-12 lg:col-span-3 row-span-1 bg-gradient-to-br from-warning/10 to-transparent rounded-xl border p-4 shadow-sm"
        >
          <Clock className="h-8 w-8 text-warning mb-2" />
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
              <span className="font-medium">{receiver?.firstname} {receiver?.lastname || '-'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Address</span>
              <span className="font-medium text-right max-w-[60%]">{receiver?.user_address || '-'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">PAN</span>
              <span className="font-medium">{receiver?.pan_number || '-'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">GSTIN</span>
              <span className="font-medium">{receiver?.gst_number || '-'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
              <span className="text-sm text-muted-foreground">State</span>
              <span className="font-medium text-primary">{receiver?.state || '-'}</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Details */}
        <motion.div 
          variants={item} 
          className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Details
          </h2>
          <div className="overflow-x-auto">
            <Table columns={columnsPaymentDetails} data={[camBillingAllData]} />
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
          className="col-span-12 lg:col-span-8 row-span-1 bg-card rounded-2xl border p-6 shadow-sm"
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
      {receivePayment && (
        <CAMBillInvoiceReceivePaymentModal onclose={() => setReceivePayment(false)} fetchCamBilling={fetchCamBilling} />
      )}
    </div>
  );
};

export default ViewCamBilling;