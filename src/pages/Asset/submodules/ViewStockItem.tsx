import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader2, Edit, ArrowLeft, AlertTriangle, Package, DollarSign } from "lucide-react";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import { stockItemService, StockItem } from "../../../services/assetSubModules.service";

interface StockItemDetail extends StockItem {
  description?: string | null;
  group_name?: string | null;
  sub_group_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  // backend fields from your response
  available_quantity?: number | null;
  rate?: number | null;
  min_stock?: number | null;
  max_stock?: number | null;
}

const ViewStockItem: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<StockItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItemDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchItemDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await stockItemService.getStockItemById(id);
      setItem(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stock item details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined) return "-";
    return `₹${Number(value).toLocaleString("en-IN")}`;
  };

  const safeText = (v: any) => {
    if (v === null || v === undefined || v === "" || v === "null") return "-";
    return String(v);
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading stock item details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Stock Item</h3>
        <p className="text-muted-foreground mb-4">{error || "Stock item not found"}</p>
        <button
          onClick={() => navigate("/asset/stock-items")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: "FM Module", path: "/asset" },
          { label: "Asset", path: "/asset" },
          { label: "Stock Items", path: "/asset/stock-items" },
          { label: item.name || `Stock Item #${item.id}` },
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/asset/stock-items")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-foreground">{safeText(item.name)}</h1>
            <div className="flex items-center gap-3 mt-1">
              {/* ✅ No status badge (as you requested) */}
              <span className="text-sm text-muted-foreground">#{item.id}</span>
            </div>
          </div>
        </div>

        <Link
          to={`/asset/stock-items/${id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Edit className="w-4 h-4" /> Edit Item
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Item Details */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Item Details
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <InfoItem label="Name" value={safeText(item.name)} />
            <InfoItem label="Group" value={safeText(item.group_name)} />
            <InfoItem label="Sub Group" value={safeText(item.sub_group_name)} />
            <InfoItem label="Description" value={safeText(item.description)} />
          </div>
        </div>

        {/* Stock & Pricing */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" /> Stock & Pricing
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <InfoItem label="Available Qty" value={safeText(item.available_quantity)} />
            <InfoItem label="Min Stock" value={safeText(item.min_stock)} />
            <InfoItem label="Max Stock" value={safeText(item.max_stock)} />
            <InfoItem label="Rate" value={formatCurrency(item.rate)} />
          </div>
        </div>

        {/* Timestamps */}
        <div className="md:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Timestamps</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Created On" value={formatDate(item.created_at)} />
              <InfoItem label="Updated On" value={formatDate(item.updated_at)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);

export default ViewStockItem;
