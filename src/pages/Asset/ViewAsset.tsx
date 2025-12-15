import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, Edit, ArrowLeft, AlertTriangle, Package, MapPin, Calendar, FileText, Settings, Shield, Gauge, ClipboardList, Activity } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import { assetService } from '../../services/asset.service';

interface AssetDetail {
  id: number;
  name?: string;
  asset_number?: string;
  serial_number?: string;
  model_number?: string;
  oem_name?: string;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  site_name?: string;
  status?: string;
  purchase_date?: string;
  purchased_on?: string;
  purchase_cost?: number;
  warranty_start?: string;
  warranty_expiry?: string;
  installation?: string;
  capacity?: string;
  critical?: boolean;
  breakdown?: boolean;
  is_meter?: boolean;
  asset_type?: string;
  latitude?: string;
  longitude?: string;
  equipment_id?: string;
  equipemnt_id?: string;
  comprehensive?: string;
  uom?: string;
  vendor_name?: string;
  created_at?: string;
  updated_at?: string;
  asset_group?: { id?: number; name?: string };
  sub_group?: { id?: number; name?: string };
  parent_asset?: { id?: number; name?: string };
  purchase_invoices?: { name: string; url: string }[];
  insurances?: { name: string; url: string }[];
  manuals?: { name: string; url: string }[];
  other_files?: { name: string; url: string }[];
  asset_params?: {
    id: number;
    name: string;
    unit_type?: string;
    min_val?: string;
    max_val?: string;
  }[];
}

const ViewAsset: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const domainPrefix = "https://admin.vibecopilot.ai";

  useEffect(() => {
    fetchAssetDetails();
  }, [id]);

  const fetchAssetDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await assetService.getAssetById(id);
      setAsset(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch asset details');
    } finally {
      setLoading(false);
    }
  };

  const getAssetStatus = (asset: AssetDetail): StatusType => {
    if (asset.breakdown) return 'breakdown';
    const status = asset.status?.toLowerCase();
    if (status === 'active' || status === 'in_use') return 'in-use';
    if (status === 'maintenance' || status === 'under_maintenance') return 'pending';
    if (status === 'retired' || status === 'disposed') return 'breakdown';
    return 'available';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return `₹${value.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading asset details...</p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Asset</h3>
        <p className="text-muted-foreground mb-4">{error || 'Asset not found'}</p>
        <button onClick={() => navigate('/asset')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Breadcrumb items={[
        { label: 'FM Module', path: '/asset' },
        { label: 'Asset', path: '/asset' },
        { label: asset.name || `Asset #${asset.id}` }
      ]} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/asset')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{asset.name || `Asset #${asset.id}`}</h1>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={getAssetStatus(asset)} />
              {asset.asset_number && (
                <span className="text-sm text-muted-foreground">#{asset.asset_number}</span>
              )}
              {asset.critical && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full border bg-red-100 text-red-700 border-red-200">
                  Critical
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          to={`/asset/${id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Asset
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Location Details */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Location Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoItem label="Site" value={asset.site_name || '-'} />
                <InfoItem label="Building" value={asset.building_name || '-'} />
                <InfoItem label="Floor" value={asset.floor_name || '-'} />
                <InfoItem label="Unit" value={asset.unit_name || '-'} />
                <InfoItem label="Latitude" value={asset.latitude || '-'} />
                <InfoItem label="Longitude" value={asset.longitude || '-'} />
              </div>
            </div>
          </div>

          {/* Asset Details */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Asset Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoItem label="Asset Name" value={asset.name || '-'} />
                <InfoItem label="OEM Name" value={asset.oem_name || '-'} />
                <InfoItem label="Asset Number" value={asset.asset_number || '-'} />
                <InfoItem label="Equipment ID" value={asset.equipment_id || asset.equipemnt_id || '-'} />
                <InfoItem label="Serial Number" value={asset.serial_number || '-'} />
                <InfoItem label="Model Number" value={asset.model_number || '-'} />
                <InfoItem label="Group" value={asset.asset_group?.name || '-'} />
                <InfoItem label="Sub Group" value={asset.sub_group?.name || '-'} />
                <InfoItem label="Parent Asset" value={asset.parent_asset?.name || '-'} />
                <InfoItem label="Asset Type" value={asset.asset_type || '-'} />
                <InfoItem label="Vendor" value={asset.vendor_name || '-'} />
                <InfoItem label="Capacity" value={asset.capacity || '-'} />
                <InfoItem label="UoM" value={asset.uom || '-'} />
              </div>
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${asset.critical ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                  <span className="text-sm text-muted-foreground">Critical Asset</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${asset.breakdown ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                  <span className="text-sm text-muted-foreground">Breakdown</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${asset.is_meter ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <span className="text-sm text-muted-foreground">Is Meter</span>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase & Warranty Details */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Purchase & Warranty Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoItem label="Purchase Date" value={formatDate(asset.purchase_date || asset.purchased_on)} />
                <InfoItem label="Purchase Cost" value={formatCurrency(asset.purchase_cost)} />
                <InfoItem label="Installation Date" value={formatDate(asset.installation)} />
                <InfoItem label="Warranty Start" value={formatDate(asset.warranty_start)} />
                <InfoItem label="Warranty Expiry" value={formatDate(asset.warranty_expiry)} />
                <InfoItem label="Comprehensive" value={asset.comprehensive || '-'} />
              </div>
            </div>
          </div>

          {/* Meter Parameters */}
          {asset.asset_params && asset.asset_params.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="bg-primary/5 px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-primary" />
                  Meter Parameters ({asset.asset_params.length})
                </h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Unit Type</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Min Value</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Max Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asset.asset_params.map((param) => (
                        <tr key={param.id} className="border-b border-border last:border-0">
                          <td className="py-2 px-3 text-foreground">{param.name}</td>
                          <td className="py-2 px-3 text-foreground">{param.unit_type || '-'}</td>
                          <td className="py-2 px-3 text-foreground">{param.min_val || '-'}</td>
                          <td className="py-2 px-3 text-foreground">{param.max_val || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Attachments */}
          {(asset.purchase_invoices?.length || asset.insurances?.length || asset.manuals?.length || asset.other_files?.length) ? (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="bg-primary/5 px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Attachments
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {asset.purchase_invoices && asset.purchase_invoices.length > 0 && (
                  <AttachmentSection title="Purchase Invoices" files={asset.purchase_invoices} domainPrefix={domainPrefix} />
                )}
                {asset.insurances && asset.insurances.length > 0 && (
                  <AttachmentSection title="Insurance Documents" files={asset.insurances} domainPrefix={domainPrefix} />
                )}
                {asset.manuals && asset.manuals.length > 0 && (
                  <AttachmentSection title="Manuals" files={asset.manuals} domainPrefix={domainPrefix} />
                )}
                {asset.other_files && asset.other_files.length > 0 && (
                  <AttachmentSection title="Other Files" files={asset.other_files} domainPrefix={domainPrefix} />
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Quick Info</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={getAssetStatus(asset)} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">OEM</span>
                <span className="text-sm font-medium text-foreground">{asset.oem_name || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Model</span>
                <span className="text-sm font-medium text-foreground">{asset.model_number || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Building</span>
                <span className="text-sm font-medium text-foreground">{asset.building_name || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Purchase Cost</span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(asset.purchase_cost)}</span>
              </div>
            </div>
          </div>

          {/* Warranty Status */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Warranty Status
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Start Date</span>
                <span className="text-sm font-medium text-foreground">{formatDate(asset.warranty_start)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expiry Date</span>
                <span className="text-sm font-medium text-foreground">{formatDate(asset.warranty_expiry)}</span>
              </div>
              {asset.warranty_expiry && (
                <div className="pt-2 mt-2 border-t border-border">
                  {new Date(asset.warranty_expiry) > new Date() ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Expired</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Timestamps</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created On</span>
                <span className="text-sm font-medium text-foreground">{formatDate(asset.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Updated On</span>
                <span className="text-sm font-medium text-foreground">{formatDate(asset.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Info Item Component
const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);

// Attachment Section Component
const AttachmentSection: React.FC<{ title: string; files: { name: string; url: string }[]; domainPrefix: string }> = ({ title, files, domainPrefix }) => (
  <div>
    <h4 className="text-sm font-medium text-muted-foreground mb-2">{title}</h4>
    <div className="flex flex-wrap gap-2">
      {files.map((file, index) => (
        <a
          key={index}
          href={domainPrefix + file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-muted rounded-md hover:bg-muted/80 transition-colors"
        >
          <FileText className="w-4 h-4 text-primary" />
          {file.name || `File ${index + 1}`}
        </a>
      ))}
    </div>
  </div>
);

export default ViewAsset;
