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
  Calendar,
  MapPin,
  Banknote,
  CheckCircle,
  Clock,
  Loader2,
  Maximize2,
  FileCheck,
} from 'lucide-react';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import Table from '../../../components/table/Table';
import { domainPrefix,getReceiveInvoiceData,getCamLogo,downloadReceiptInvoice } from '../../../api';
import { toWords } from 'number-to-words';
import toast from 'react-hot-toast';

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

const ViewReceiptInvoice: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const themeColor = useSelector((state: any) => state.theme.color);
  const [receiptInvoice, setReceiptInvoice] = useState<any>({});
  const [paymentDetails, setPaymentDetails] = useState<any[]>([]);
  const [logo, setLogo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceiveInvoice = async () => {
      try {
        setLoading(true);
        const response = await getReceiveInvoiceData(id);
        setReceiptInvoice(response.data);
        setPaymentDetails([response.data]);
      } catch (error) {
        console.error('Failed to fetch Receipt Invoice data:', error);
        toast.error('Failed to load Receipt Invoice details');
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

    fetchLogo();
    fetchReceiveInvoice();
  }, [id]);

  const columnsPaymentDetails = [
    { name: 'Date', selector: (row: any) => row.payment_date, sortable: true },
    { name: 'Amount', selector: (row: any) => row.amount_received, sortable: true },
    { name: 'Payment Mode', selector: (row: any) => row.payment_mode, sortable: true },
    { name: 'Transaction Number', selector: (row: any) => row.transaction_or_cheque_number, sortable: true },
  ];

  const amount = receiptInvoice?.amount_received || 0;
  const amountInWords = Number.isFinite(amount) ? toWords(amount) : 'Invalid Amount';

  const handleDownload = async () => {
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
      toast.success('Receipt Invoice downloaded successfully');
    } catch (error) {
      toast.error('Error downloading receipt');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading Receipt Invoice details...</p>
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
            { label: 'CAM', path: '/finance/cam/receipt-invoice' },
            { label: 'Receipt Invoice Details' },
          ]}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/finance/cam/receipt-invoice')}
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
                      {receiptInvoice?.receipt_number || `Receipt #${id}`}
                    </h1>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-success/10 text-success border border-success/20">
                      Paid
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Invoice Receipt Details</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                Download Receipt
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
        className="w-full px-8 pb-6 grid grid-cols-12 gap-4 auto-rows-[minmax(120px,auto)] mt-3"
      >
        {/* Amount Received Card */}
        <motion.div 
          variants={item} 
          className="col-span-12 lg:col-span-4 row-span-1 bg-gradient-to-br from-primary/10 to-transparent rounded-xl border p-4 shadow-sm"
        >
          <DollarSign className="h-8 w-8 text-primary mb-2" />
          <p className="text-3xl font-bold">₹{amount.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Amount Received</p>
        </motion.div>

        {/* Receipt Number Card */}
        <motion.div 
          variants={item} 
          className="col-span-12 lg:col-span-4 row-span-1 bg-gradient-to-br from-success/10 to-transparent rounded-xl border p-4 shadow-sm"
        >
          <FileCheck className="h-8 w-8 text-success mb-2" />
          <p className="text-lg font-bold">{receiptInvoice?.receipt_number || '-'}</p>
          <p className="text-sm text-muted-foreground">Receipt Number</p>
        </motion.div>

        {/* Receipt Date Card */}
        <motion.div 
          variants={item} 
          className="col-span-12 lg:col-span-4 row-span-1 bg-gradient-to-br from-info/10 to-transparent rounded-xl border p-4 shadow-sm"
        >
          <Calendar className="h-8 w-8 text-info mb-2" />
          <p className="text-lg font-bold">{receiptInvoice?.receipt_date || '-'}</p>
          <p className="text-sm text-muted-foreground">Receipt Date</p>
        </motion.div>

        {/* Customer Details */}
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
            <User className="h-5 w-5 text-primary" />
            Received From
          </h2>
          <div className="space-y-3">
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Customer Name</p>
              <p className="text-lg font-semibold text-primary">
                {receiptInvoice?.customer_name || 'Customer'}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Unit Name</p>
              <p className="font-medium text-sm">{receiptInvoice?.unit_name || 'Property Details'}</p>
            </div>
          </div>
        </motion.div>

        {/* Receipt Information */}
        <motion.div 
          variants={item} 
          className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Receipt Information
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Receipt Number</p>
              <p className="font-medium text-sm">{receiptInvoice?.receipt_number || '-'}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Receipt Date</p>
              <p className="font-medium text-sm">{receiptInvoice?.receipt_date || '-'}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 col-span-2">
              <p className="text-xs text-muted-foreground">Amount Received</p>
              <p className="font-bold text-lg text-primary">₹{amount.toLocaleString()}</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-3 col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Amount in Words</p>
              <p className="font-medium text-sm text-primary">{amountInWords}</p>
            </div>
          </div>
        </motion.div>

        {/* Payment Method Details */}
        <motion.div 
          variants={item} 
          className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Method
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Payment Mode</span>
              <span className="font-medium">{receiptInvoice?.payment_mode || '-'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Transaction/Cheque No.</span>
              <span className="font-medium">{receiptInvoice?.transaction_or_cheque_number || '-'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Payment Date</span>
              <span className="font-medium">{receiptInvoice?.payment_date || '-'}</span>
            </div>
            {(receiptInvoice?.bank_name || receiptInvoice?.branch_name) && (
              <div className="bg-primary/10 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Bank & Branch</p>
                <p className="font-medium text-sm text-primary">
                  {receiptInvoice?.bank_name || ''} {receiptInvoice?.branch_name || ''}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Company Logo & Details */}
        <motion.div 
          variants={item} 
          className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Company Details
          </h2>
          <div className="flex flex-col items-center justify-center space-y-4">
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
            <div className="text-center">
              <p className="text-sm font-bold">294, CST Road, Santacruz (E), Mumbai 400098 </p>
              <span className="text-sm font-medium">For Company Limited</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Details */}
        <motion.div 
          variants={item} 
          className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Payment Details
          </h2>
          <div className="overflow-x-auto">
            <Table columns={columnsPaymentDetails} data={paymentDetails} />
          </div>
        </motion.div>

        {/* Notes & Additional Information */}
        <motion.div 
          variants={item} 
          className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Additional Information
          </h2>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">In Respect of</p>
              <p className="font-bold">{receiptInvoice?.unit_name || 'Locketed Demo B-1505, 2nd Floor, Jyoti Tower, opposite Police Station, Mumbai maharashtra 400053'}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Notes</p>
              <p className="font-medium text-sm">{receiptInvoice?.notes || '-'}</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
              <p className="font-bold text-lg text-primary">
                ₹{receiptInvoice?.amount_received?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Summary Card */}
        <motion.div 
          variants={item} 
          className="col-span-12 row-span-1 bg-card rounded-2xl border p-6 shadow-sm"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Amount Received</p>
              <p className="text-2xl font-bold text-primary mt-1">
                ₹{ amount.toLocaleString()|| '-'} 
              </p>
            </div>
              <div className="h-12 w-px bg-border"/>
              <div className="text-right justify-end">
                <p className="text-sm text-muted-foreground">Amount in Words</p>
                <p className="text-sm font-medium mt-1 text-foreground max-w-[200px]">
                  {amountInWords}
                </p>
              </div>
            </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ViewReceiptInvoice;