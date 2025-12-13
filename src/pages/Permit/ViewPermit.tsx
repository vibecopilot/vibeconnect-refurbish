import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, Edit, ArrowLeft, FileCheck, Clock, Building, Calendar, User } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import { getPermitDetails } from '../../api';
import { dateFormatSTD } from '../../utils/dateUtils';

interface PermitDetail {
  id: number;
  permit_type_name?: string;
  permit_type?: string;
  permit_for?: string;
  status?: string;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  permit_expiry_date?: string;
  permit_expiry_time?: string;
  description?: string;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

const ViewPermit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [permit, setPermit] = useState<PermitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPermitDetails();
  }, [id]);

  const fetchPermitDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getPermitDetails(id);
      setPermit(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch permit details');
    } finally {
      setLoading(false);
    }
  };

  const getPermitStatus = (permit: PermitDetail): StatusType => {
    const status = String(permit.status || '').toLowerCase();
    if (status.includes('approved')) return 'checked-out';
    if (status.includes('rejected')) return 'rejected';
    if (status.includes('open')) return 'pending';
    if (status.includes('closed')) return 'checked-out';
    return 'pending';
  };

  const getStatusColor = (status?: string) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('draft')) return 'bg-gray-100 text-gray-700 border-gray-200';
    if (s.includes('open')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (s.includes('approved')) return 'bg-green-100 text-green-700 border-green-200';
    if (s.includes('rejected')) return 'bg-red-100 text-red-700 border-red-200';
    if (s.includes('extended')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (s.includes('closed')) return 'bg-slate-100 text-slate-700 border-slate-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading permit details...</p>
      </div>
    );
  }

  if (error || !permit) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <FileCheck className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Permit</h3>
        <p className="text-muted-foreground mb-4">{error || 'Permit not found'}</p>
        <button onClick={() => navigate('/safety/permit')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Breadcrumb items={[
        { label: 'Safety', path: '/safety/incident' },
        { label: 'Permit', path: '/safety/permit' },
        { label: `Permit #${permit.id}` }
      ]} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/safety/permit')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Permit #{permit.id}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(permit.status)}`}>
                {permit.status || 'Draft'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/safety/permit')}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <Link
            to={`/safety/permit/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Permit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                Permit Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Permit ID" value={`#${permit.id}`} />
                <InfoItem label="Permit Type" value={permit.permit_type_name || permit.permit_type || '-'} />
                <InfoItem label="Permit For" value={permit.permit_for || '-'} />
                <InfoItem label="Status" value={permit.status || 'Draft'} />
                <InfoItem label="Building Name" value={permit.building_name || '-'} />
                <InfoItem label="Floor Name" value={permit.floor_name || '-'} />
                <InfoItem label="Unit Name" value={permit.unit_name || '-'} />
                <InfoItem label="Expiry Date" value={permit.permit_expiry_date ? dateFormatSTD(permit.permit_expiry_date) : '-'} />
                <InfoItem label="Expiry Time" value={permit.permit_expiry_time || '-'} />
                <InfoItem label="Created By" value={permit.created_by_name || '-'} />
              </div>
            </div>
          </div>

          {/* Description */}
          {permit.description && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="bg-primary/5 px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Description</h2>
              </div>
              <div className="p-6">
                <p className="text-foreground bg-muted p-3 rounded-lg">{permit.description}</p>
              </div>
            </div>
          )}
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
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(permit.status)}`}>
                  {permit.status || 'Draft'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Permit Type</span>
                <span className="text-sm font-medium text-foreground">{permit.permit_type_name || permit.permit_type || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Building</span>
                <span className="text-sm font-medium text-foreground">{permit.building_name || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Floor</span>
                <span className="text-sm font-medium text-foreground">{permit.floor_name || '-'}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Timeline
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <p className="text-sm text-foreground">Created</p>
                  <p className="text-xs text-muted-foreground">{permit.created_at ? formatDate(permit.created_at) : '-'}</p>
                </div>
              </div>
              {permit.updated_at && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-foreground">Last Updated</p>
                    <p className="text-xs text-muted-foreground">{formatDate(permit.updated_at)}</p>
                  </div>
                </div>
              )}
              {permit.permit_expiry_date && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-foreground">Expiry</p>
                    <p className="text-xs text-muted-foreground">{dateFormatSTD(permit.permit_expiry_date)} {permit.permit_expiry_time || ''}</p>
                  </div>
                </div>
              )}
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

export default ViewPermit;
