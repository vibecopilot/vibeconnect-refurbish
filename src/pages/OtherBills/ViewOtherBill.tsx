import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, DollarSign } from 'lucide-react';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { getOtherBillsDetails  } from '../../api';
import { dateFormatSTD } from '../../utils/dateUtils';

interface OtherBill {
  id: number;
  vendor_id?: number | string;
  description?: string;
  suplier_name?: string;
  vendor_name?: string;
  last_approved_by?: string;
  total_amount?: number;
  deduction?: number;
  tds_percentage?: number;
  tds_amount?: number;
  retention_percentage?: number;
  retention_amount?: number;
  payable_amount?: number;
  bill_date?: string;
  invoice_number?: string;
  gst_number?: string;
  pan_number?: string;
  payment_tenure?: number;
  amount_paid?: number;
  balance_amount?: number;
  payment_status?: string;
  created_at?: string;
  updated_at?: string;
  created_by_name?: string;
  created_by_id?: number;
}

const ViewOtherBill = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bill, setBill] = useState<OtherBill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillDetail();
  }, [id]);

  const fetchBillDetail = async () => {
    try {
      setLoading(true);
      const res = await getOtherBillsDetails (Number(id));
      const data = res.data;
      // Handle different response structures
      const billData = data?.other_bill || data?.bill || data;
      setBill(billData);
    } catch (error) {
      console.error('Error fetching bill details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getStatusColor = (status?: string) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('paid') || s.includes('completed')) return 'bg-green-100 text-green-700 border-green-200';
    if (s.includes('partial')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (s.includes('pending') || s.includes('unpaid')) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <p className="text-muted-foreground">Bill not found</p>
          <button
            onClick={() => navigate('/finance/other-bills')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w mx-auto">
      <Breadcrumb
        items={[
          // { label: 'FM Module', path: '/fm-module' },
          // { label: 'Finance', path: '/finance' },
          { label: 'Other Bill', path: '/finance/other-bills' },
          { label: bill.description || `Bill #${bill.id}` },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between mt-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/finance/other-bills')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {bill.description || 'Other Bill'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {bill.invoice_number && (
                <span className="inline-flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {bill.invoice_number}
                </span>
              )}
            </p>
          </div>
        </div>
        <Link
          to={`/finance/other-bills/${bill.id}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info & Stock */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Basic Info</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground">Name</label>
                <p className="text-foreground font-medium mt-1">
                  {bill.description || '-'}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Description</label>
                <p className="text-foreground font-medium mt-1">
                  {bill.description || '-'}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Supplier/Vendor</label>
                <p className="text-foreground font-medium mt-1">
                  {bill.suplier_name || bill.vendor_name || '-'}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Invoice Number</label>
                <p className="text-foreground font-medium mt-1">
                  {bill.invoice_number || '-'}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Site ID</label>
                <p className="text-foreground font-medium mt-1">
                  {bill.vendor_id || '-'}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Created By ID</label>
                <p className="text-foreground font-medium mt-1">
                  {bill.created_by_id || bill.created_by_name || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Details Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Financial Details</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground">Total Amount</label>
                <p className="text-foreground font-bold text-lg mt-1">
                  {formatCurrency(bill.total_amount)}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Payable Amount</label>
                <p className="text-foreground font-bold text-lg mt-1">
                  {formatCurrency(bill.payable_amount)}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Deduction</label>
                <p className="text-foreground font-medium mt-1">
                  {formatCurrency(bill.deduction)}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">TDS Percentage</label>
                <p className="text-foreground font-medium mt-1">
                  {bill.tds_percentage ?? '-'}%
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">TDS Amount</label>
                <p className="text-foreground font-medium mt-1">
                  {formatCurrency(bill.tds_amount)}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Retention Percentage</label>
                <p className="text-foreground font-medium mt-1">
                  {bill.retention_percentage ?? '-'}%
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Retention Amount</label>
                <p className="text-foreground font-medium mt-1">
                  {formatCurrency(bill.retention_amount)}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Amount Paid</label>
                <p className="text-foreground font-medium mt-1">
                  {formatCurrency(bill.amount_paid)}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Balance Amount</label>
                <p className="text-foreground font-medium mt-1">
                  {formatCurrency(bill.balance_amount)}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Payment Tenure</label>
                <p className="text-foreground font-medium mt-1">
                  {bill.payment_tenure ?? '-'} days
                </p>
              </div>
            </div>
          </div>

          {/* Tax & Legal Information Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Tax & Legal Information
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground">GST Number</label>
                <p className="text-foreground font-medium mt-1">
                  {bill.gst_number || '-'}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">PAN Number</label>
                <p className="text-foreground font-medium mt-1">
                  {bill.pan_number || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Status & Dates */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Payment Status</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <div className="mt-2">
                  <span
                    className={`inline-flex px-3 py-1.5 text-sm font-medium rounded-full border ${getStatusColor(
                      bill.payment_status
                    )}`}
                  >
                    {bill.payment_status || 'Pending'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Last Approved By</label>
                <p className="text-foreground font-medium mt-1">
                  {bill.last_approved_by || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Dates Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Important Dates</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Bill Date</label>
                <p className="text-foreground font-medium mt-1">
                  {bill.bill_date ? dateFormatSTD(bill.bill_date) : '-'}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Created At</label>
                <p className="text-foreground font-medium mt-1">
                  {bill.created_at ? dateFormatSTD(bill.created_at) : '-'}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Updated At</label>
                <p className="text-foreground font-medium mt-1">
                  {bill.updated_at ? dateFormatSTD(bill.updated_at) : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Payment Progress</span>
                <span className="text-sm font-bold text-foreground">
                  {bill.total_amount
                    ? Math.round(((bill.amount_paid || 0) / bill.total_amount) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      bill.total_amount
                        ? Math.min(
                            100,
                            ((bill.amount_paid || 0) / bill.total_amount) * 100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOtherBill;