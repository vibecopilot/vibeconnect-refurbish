import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, Edit, ArrowLeft, AlertTriangle, FileText, Calendar, DollarSign, Building } from 'lucide-react';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import StatusBadge, { StatusType } from '../../../components/ui/StatusBadge';
import { amcService, AMC } from '../../../services/assetSubModules.service';

interface AMCDetail extends AMC {
  vendor?: { name?: string };
  asset?: { name?: string; asset_number?: string };
  description?: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
}

const ViewAMC: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [amc, setAmc] = useState<AMCDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAMCDetails();
  }, [id]);

  const fetchAMCDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await amcService.getAMCById(id);
      setAmc(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AMC details');
    } finally {
      setLoading(false);
    }
  };

  const getAMCStatus = (amc: AMCDetail): StatusType => {
    const today = new Date();
    const endDate = amc.end_date ? new Date(amc.end_date) : null;
    if (endDate && endDate < today) return 'breakdown';
    if (amc.status?.toLowerCase() === 'active') return 'in-use';
    if (amc.status?.toLowerCase() === 'expired') return 'breakdown';
    return 'pending';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return `₹${value.toLocaleString('en-IN')}`;
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
        <p className="text-muted-foreground mb-4">{error || 'AMC not found'}</p>
        <button onClick={() => navigate('/asset/amc')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Breadcrumb items={[
        { label: 'FM Module', path: '/asset' },
        { label: 'Asset', path: '/asset' },
        { label: 'AMC', path: '/asset/amc' },
        { label: amc.vendor_name || `AMC #${amc.id}` }
      ]} />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/asset/amc')} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{amc.vendor_name || `AMC #${amc.id}`}</h1>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={getAMCStatus(amc)} />
              {amc.contract_number && <span className="text-sm text-muted-foreground">#{amc.contract_number}</span>}
            </div>
          </div>
        </div>
        <Link to={`/asset/amc/${id}/edit`} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Edit className="w-4 h-4" /> Edit AMC
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Contract Details
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <InfoItem label="Contract Number" value={amc.contract_number || '-'} />
            <InfoItem label="Vendor" value={amc.vendor_name || amc.vendor?.name || '-'} />
            <InfoItem label="AMC Type" value={amc.amc_type || '-'} />
            <InfoItem label="Status" value={amc.status || '-'} />
            <InfoItem label="Frequency" value={amc.frequency || '-'} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Duration & Cost
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <InfoItem label="Start Date" value={formatDate(amc.start_date)} />
            <InfoItem label="End Date" value={formatDate(amc.end_date)} />
            <InfoItem label="Amount" value={formatCurrency(amc.amount)} />
            <InfoItem label="Asset" value={amc.asset_name || amc.asset?.name || '-'} />
          </div>
        </div>

        {amc.description && (
          <div className="md:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Description</h2>
            </div>
            <div className="p-6">
              <p className="text-foreground">{amc.description}</p>
            </div>
          </div>
        )}
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
