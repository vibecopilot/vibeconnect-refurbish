import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, FileText, ArrowLeft, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import { getInventoryDetails } from '../../api';

interface MasterDetails {
  id: number;
  name: string;
  code: string;
  serial_number: string;
  item_type: string;
  group_name: string;
  sub_group_name: string;
  category: string;
  criticality: string;
  unit: string;
  cost: number;
  sac_hsn_code: string;
  min_stock_level: number;
  min_order_level: number;
  quantity: number;
  status: string;
  expiry_date: string;
  sgst_rate: number;
  cgst_rate: number;
  igst_rate: number;
  created_at: string;
}

const ViewMaster: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [master, setMaster] = useState<MasterDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const response = await getInventoryDetails(id);
        setMaster(response?.data || null);
      } catch (error) {
        console.error('Error fetching master details:', error);
        toast.error('Failed to fetch details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-10 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!master) {
    return (
      <div className="p-6">
        <div className="text-center py-10 text-muted-foreground">Master not found</div>
      </div>
    );
  }

  const InfoField = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
      <p className="text-foreground">{value || '-'}</p>
    </div>
  );

  return (
    <div className="p-6">
      <PageHeader
        title="Master Details"
        breadcrumbs={[
          { label: 'FM Module', path: '/inventory/masters' },
          { label: 'Inventory', path: '/inventory/masters' },
          { label: 'Masters', path: '/inventory/masters' },
          { label: 'View' },
        ]}
      />

      <div className="space-y-6">
        {/* Basic Info Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Basic Info</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField label="Inventory Type" value={master.item_type} />
            <InfoField label="Criticality" value={master.criticality} />
            <InfoField label="Min. Order Level" value={master.min_order_level} />
            <InfoField label="Unit" value={master.unit} />
            <InfoField label="Expiry Date" value={master.expiry_date ? new Date(master.expiry_date).toLocaleDateString() : '-'} />
            <InfoField label="Category" value={master.category} />
          </div>
        </div>

        {/* Tax Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Tax Section</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField label="Name" value={master.name} />
            <InfoField label="Code" value={master.code} />
            <InfoField label="Serial Number" value={master.serial_number} />
            <InfoField label="Group" value={master.group_name} />
            <InfoField label="Subgroup" value={master.sub_group_name} />
            <InfoField label="Quantity" value={master.quantity} />
            <InfoField label="Min. Stock Level" value={master.min_stock_level} />
            <InfoField label="Cost" value={master.cost} />
            <InfoField label="SAC/HSN Code" value={master.sac_hsn_code} />
            <InfoField label="SGST Rate" value={master.sgst_rate} />
            <InfoField label="CGST Rate" value={master.cgst_rate} />
            <InfoField label="IGST Rate" value={master.igst_rate} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate('/inventory/masters')}
            className="flex items-center gap-2 px-6 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <button
            onClick={() => navigate(`/inventory/masters/${id}/edit`)}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Edit2 size={18} />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewMaster;
