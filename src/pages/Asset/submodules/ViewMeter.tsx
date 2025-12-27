import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, Edit, ArrowLeft, AlertTriangle, Gauge, MapPin, Settings } from 'lucide-react';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import StatusBadge, { StatusType } from '../../../components/ui/StatusBadge';
import { meterService, Meter } from '../../../services/assetSubModules.service';

interface MeterDetail extends Meter {
  serial_number?: string;
  model_number?: string;
  capacity?: string;
  uom?: string;
  vendor_name?: string;
  asset_params?: { id: number; name: string; unit_type?: string; min_val?: string; max_val?: string }[];
  created_at?: string;
}

const ViewMeter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meter, setMeter] = useState<MeterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMeterDetails();
  }, [id]);

  const fetchMeterDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await meterService.getMeterById(id);
      setMeter(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meter details');
    } finally {
      setLoading(false);
    }
  };

  const getMeterStatus = (): StatusType => {
    if (!meter) return 'available';
    const status = meter.status?.toLowerCase();
    if (status === 'active' || status === 'in_use') return 'in-use';
    if (status === 'maintenance') return 'pending';
    return 'available';
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading meter details...</p>
      </div>
    );
  }

  if (error || !meter) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Meter</h3>
        <p className="text-muted-foreground mb-4">{error || 'Meter not found'}</p>
        <button onClick={() => navigate('/asset/meter')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'FM Module', path: '/asset' },
        { label: 'Asset', path: '/asset' },
        { label: 'Meter', path: '/asset/meter' },
        { label: meter.name || `Meter #${meter.id}` }
      ]} />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/asset/meter')} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{meter.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={getMeterStatus()} />
              {meter.asset_number && <span className="text-sm text-muted-foreground">#{meter.asset_number}</span>}
            </div>
          </div>
        </div>
        <Link to={`/asset/meter/${id}/edit`} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Edit className="w-4 h-4" /> Edit Meter
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Gauge className="w-5 h-5 text-primary" /> Meter Details
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <InfoItem label="Name" value={meter.name || '-'} />
            <InfoItem label="Asset Number" value={meter.asset_number || '-'} />
            <InfoItem label="OEM" value={meter.oem_name || '-'} />
            <InfoItem label="Serial Number" value={meter.serial_number || '-'} />
            <InfoItem label="Model Number" value={meter.model_number || '-'} />
            <InfoItem label="Meter Type" value={meter.meter_type || '-'} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Location
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <InfoItem label="Building" value={meter.building_name || '-'} />
            <InfoItem label="Floor" value={meter.floor_name || '-'} />
            <InfoItem label="Unit" value={meter.unit_name || '-'} />
            <InfoItem label="Capacity" value={meter.capacity || '-'} />
            <InfoItem label="Unit of Measurement" value={meter.uom || '-'} />
          </div>
        </div>

        {meter.asset_params && meter.asset_params.length > 0 && (
          <div className="md:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" /> Parameters ({meter.asset_params.length})
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
                    {meter.asset_params.map((param) => (
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

export default ViewMeter;
