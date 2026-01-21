import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, FileText, ArrowLeft, Edit2, Layers, Activity, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { getInventoryDetails } from '../../api';

interface MasterDetails {
  id: number;
  site_id: number;
  name: string;
  description?: string;
  rate?: number;
  available_quantity?: number;
  created_by_id?: number;
  created_at?: string;
  updated_at?: string;
  max_stock?: number;
  min_stock?: number;
  group_id?: number;
  group_name?: string;
  sub_group_id?: number;
  sub_group_name?: string;
  url?: string;
}

const ViewMaster: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [master, setMaster] = useState<MasterDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const response = await getInventoryDetails(id);
        setMaster(response?.data || null);
      } catch (err) {
        console.error('Error fetching master details:', err);
        setError('Failed to fetch details');
        toast.error('Failed to fetch details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const InfoField = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
    const display = value === null || value === undefined || value === '' ? '' : value;
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

  if (!master) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">{error || 'Master not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 pb-0">
        <Breadcrumb
          items={[
            { label: 'FM Module' },
            { label: 'Inventory', path: '/inventory/masters' },
            { label: 'Masters', path: '/inventory/masters' },
            { label: master.name || 'View' },
          ]}
        />
      </div>

      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/inventory/masters')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="h-8 w-px bg-border" />
            <div>
              <h1 className="text-lg font-bold text-foreground">{master.name}</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                {master.url || ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/inventory/masters/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            <span className="text-sm">Edit</span>
          </button>
        </div>
      </header>

      <div className="px-6 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Basic Info</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField label="Name" value={master.name} />
            <InfoField label="Description" value={master.description} />
            <InfoField label="Group" value={master.group_name} />
            <InfoField label="Sub Group" value={master.sub_group_name} />
            <InfoField label="Site ID" value={master.site_id} />
            <InfoField label="Created By ID" value={master.created_by_id} />
          </div>
        </div>

        <div className="lg:col-span-6 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Stock & Rate</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField label="Rate" value={master.rate} />
            <InfoField label="Available Qty" value={master.available_quantity} />
            <InfoField label="Max Stock" value={master.max_stock} />
            <InfoField label="Min Stock" value={master.min_stock} />
            <InfoField
              label="Created At"
              value={master.created_at ? new Date(master.created_at).toLocaleString() : ''}
            />
            <InfoField
              label="Updated At"
              value={master.updated_at ? new Date(master.updated_at).toLocaleString() : ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMaster;
