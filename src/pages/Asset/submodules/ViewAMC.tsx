import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  Edit,
  ArrowLeft,
  AlertTriangle,
  FileText,
  Calendar,
  Building,
  Download,
} from "lucide-react";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import { amcService, AMC } from "../../../services/assetSubModules.service";

interface AMCDetail extends AMC {
  created_at?: string;
  updated_at?: string;
  asset_name?: string;
  vendor_name?: string | null;
  attachments?: any[];
  frequency?: string;
  start_date?: string;
  end_date?: string;
}

const ViewAMC: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [amc, setAmc] = useState<AMCDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAMCDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAMCDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await amcService.getAMCById(id);
      setAmc(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch AMC details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const safeText = (v: any) => {
    if (v === null || v === undefined || v === "" || v === "null") return "-";
    return String(v);
  };

  const attachmentCount = Array.isArray(amc?.attachments) ? amc!.attachments.length : 0;

  const openFirstAttachment = () => {
    const doc = amc?.attachments?.[0]?.document;
    if (!doc) return;

    const href = doc.startsWith("http") ? doc : `https://admin.vibecopilot.ai${doc}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading AMC details...</p>
      </div>
    );
  }

  if (error || !amc) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load AMC</h3>
        <p className="text-muted-foreground mb-4">{error || "AMC not found"}</p>
        <button
          onClick={() => navigate("/asset/amc")}
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
          { label: "AMC", path: "/asset/amc" },
          { label: amc.asset_name || `AMC #${amc.id}` },
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/asset/amc")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {amc.asset_name || `AMC #${amc.id}`}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-muted-foreground">
                Vendor: {safeText(amc.vendor_name)}
              </span>
              {attachmentCount > 0 && (
                <button
                  type="button"
                  onClick={openFirstAttachment}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                  title="Open attachment"
                >
                  <Download className="w-4 h-4" />
                  Attachment
                </button>
              )}
            </div>
          </div>
        </div>

        <Link
          to={`/asset/amc/${id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Edit className="w-4 h-4" /> Edit AMC
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contract Details */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Contract Details
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <InfoItem label="Vendor" value={safeText(amc.vendor_name)} />
            <InfoItem label="Frequency" value={safeText(amc.frequency)} />
            <InfoItem label="Attachments" value={String(attachmentCount)} />
          </div>
        </div>

        {/* Duration */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Duration
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <InfoItem label="Start Date" value={formatDate(amc.start_date)} />
            <InfoItem label="End Date" value={formatDate(amc.end_date)} />
            <InfoItem label="Created On" value={formatDate(amc.created_at)} />
            <InfoItem label="Updated On" value={formatDate(amc.updated_at)} />
          </div>
        </div>

        {/* Asset */}
        <div className="md:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" /> Asset
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <InfoItem label="Asset Name" value={safeText(amc.asset_name)} />
            <InfoItem label="Asset ID" value={safeText(amc.asset_id)} />
            <InfoItem label="Vendor ID" value={safeText(amc.vendor_id)} />
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

export default ViewAMC;
