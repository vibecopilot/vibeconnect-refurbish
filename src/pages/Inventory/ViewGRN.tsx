import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, FileText, ArrowLeft, Edit, Download, Paperclip, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { getGRNById } from '../../api';

interface InventoryDetail {
  id: number;
  inventory_id: number;
  inventory_name: string;
  quantity: number;
  rate: number;
  unit: string;
  amount: number;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  igst_rate: number;
  igst_amount: number;
  total_amount: number;
}

interface GRNData {
  id: number;
  vendor_id: number;
  vendor_name: string;
  invoice_number: string;
  invoice_date: string;
  posting_date: string;
  payment_mode: string;
  related_to: string;
  other_expenses: number;
  loading_expenses: number;
  adjustment_amount: number;
  invoice_amount: number;
  status: string;
  description: string;
  created_at: string;
  created_by: string;
  inventory_details: InventoryDetail[];
  attachments?: any[];
}

const ViewGRN: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [grnData, setGrnData] = useState<GRNData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchGRNDetails();
    }
  }, [id]);

  const fetchGRNDetails = async () => {
    try {
      const response = await getGRNById(id);
      setGrnData(response?.data || null);
    } catch (err) {
      console.error('Error fetching GRN details:', err);
      setError('Failed to fetch GRN details');
      toast.error('Failed to fetch GRN details');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    if (!grnData?.inventory_details) {
      return { subtotal: 0, totalCgst: 0, totalSgst: 0, totalIgst: 0, totalTax: 0, grandTotal: 0 };
    }
    const subtotal = grnData.inventory_details.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalCgst = grnData.inventory_details.reduce((sum, item) => sum + (item.cgst_amount || 0), 0);
    const totalSgst = grnData.inventory_details.reduce((sum, item) => sum + (item.sgst_amount || 0), 0);
    const totalIgst = grnData.inventory_details.reduce((sum, item) => sum + (item.igst_amount || 0), 0);
    const totalTax = totalCgst + totalSgst + totalIgst;
    const otherExp = grnData.other_expenses || 0;
    const loadingExp = grnData.loading_expenses || 0;
    const adjustment = grnData.adjustment_amount || 0;
    const grandTotal = subtotal + totalTax + otherExp + loadingExp + adjustment;
    return { subtotal, totalCgst, totalSgst, totalIgst, totalTax, grandTotal };
  };

  const totals = calculateTotals();

  const InfoField = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
    const display = value === null || value === undefined ? '' : value;
    return (
      <div>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-medium text-foreground">{display}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!grnData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">{error || 'GRN not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 pb-0">
        <Breadcrumb
          items={[
            { label: 'FM Module' },
            { label: 'Inventory', path: '/inventory/grn' },
            { label: 'GRN', path: '/inventory/grn' },
            { label: `GRN #${grnData.id}` },
          ]}
        />
      </div>

      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/inventory/grn')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="h-8 w-px bg-border" />
            <div>
              <h1 className="text-lg font-bold text-foreground">GRN #{grnData.id}</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                {grnData.vendor_name || ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/inventory/grn/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span className="text-sm">Edit</span>
          </button>
        </div>
      </header>

      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-xs text-muted-foreground">Vendor</p>
          <p className="text-sm font-semibold">{grnData.vendor_name || ''}</p>
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="text-sm font-semibold capitalize">{grnData.status || ''}</p>
        </div>
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-xs text-muted-foreground">Invoice</p>
          <p className="text-sm font-semibold">{grnData.invoice_number || ''}</p>
          <p className="text-xs text-muted-foreground">Invoice Date</p>
          <p className="text-sm font-semibold">
            {grnData.invoice_date ? new Date(grnData.invoice_date).toLocaleDateString() : ''}
          </p>
        </div>
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-xs text-muted-foreground">Posting Date</p>
          <p className="text-sm font-semibold">
            {grnData.posting_date ? new Date(grnData.posting_date).toLocaleDateString() : ''}
          </p>
          <p className="text-xs text-muted-foreground">Payment Mode</p>
          <p className="text-sm font-semibold">{grnData.payment_mode || ''}</p>
        </div>
      </div>

      <div className="px-6 pb-12 space-y-6">
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">GRN Details</h2>
            </div>
            <span className="px-2 py-1 rounded-full bg-muted text-foreground text-xs border border-border capitalize">
              {grnData.status || ''}
            </span>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoField label="Vendor" value={grnData.vendor_name} />
            <InfoField label="Invoice Number" value={grnData.invoice_number} />
            <InfoField label="Invoice Date" value={grnData.invoice_date ? new Date(grnData.invoice_date).toLocaleDateString() : ''} />
            <InfoField label="Posting Date" value={grnData.posting_date ? new Date(grnData.posting_date).toLocaleDateString() : ''} />
            <InfoField label="Payment Mode" value={grnData.payment_mode} />
            <InfoField label="Related To" value={grnData.related_to} />
            <div className="sm:col-span-2 lg:col-span-3">
              <InfoField label="Description" value={grnData.description} />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Inventory Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">Inventory</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground border-b border-border">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">Unit</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground border-b border-border">Rate</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground border-b border-border">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground border-b border-border">CGST</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground border-b border-border">SGST</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground border-b border-border">IGST</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground border-b border-border">Total</th>
                </tr>
              </thead>
              <tbody>
                {grnData.inventory_details && grnData.inventory_details.length > 0 ? (
                  grnData.inventory_details.map((item, index) => (
                    <tr key={item.id || index} className="border-b border-border">
                      <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{item.inventory_name || ''}</td>
                      <td className="px-4 py-3 text-sm text-foreground text-right">{item.quantity ?? ''}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{item.unit || ''}</td>
                      <td className="px-4 py-3 text-sm text-foreground text-right">{(item.rate || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-foreground text-right">{(item.amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-foreground text-right">
                        {item.cgst_rate}% ({(item.cgst_amount || 0).toFixed(2)})
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground text-right">
                        {item.sgst_rate}% ({(item.sgst_amount || 0).toFixed(2)})
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground text-right">
                        {item.igst_rate}% ({(item.igst_amount || 0).toFixed(2)})
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground font-medium text-right">{(item.total_amount || 0).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                      No inventory items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Additional Expenses</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Other Expenses</span>
                <span className="text-foreground">{(grnData.other_expenses || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loading Expenses</span>
                <span className="text-foreground">{(grnData.loading_expenses || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Adjustment Amount</span>
                <span className="text-foreground">{(grnData.adjustment_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Tax & Total Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total CGST</span>
                <span className="text-foreground">{totals.totalCgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total SGST</span>
                <span className="text-foreground">{totals.totalSgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total IGST</span>
                <span className="text-foreground">{totals.totalIgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="text-foreground font-semibold">Grand Total</span>
                <span className="text-foreground font-bold text-lg">{totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {grnData.attachments && grnData.attachments.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Paperclip className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Attachments</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {grnData.attachments.map((attachment: any, index: number) => (
                <div key={index} className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-foreground truncate">{attachment.name || `Attachment ${index + 1}`}</span>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Created By:</span> {grnData.created_by || ''}
            </div>
            <div>
              <span className="font-medium">Created On:</span>{' '}
              {grnData.created_at ? new Date(grnData.created_at).toLocaleString() : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewGRN;
