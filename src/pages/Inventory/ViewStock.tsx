import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Boxes, ArrowLeft, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import { getInventoryDetails } from '../../api';

interface StockDetails {
  id: number;
  name: string;
  description: string;
  available_quantity: number;
  rate: number;
  group_name: string;
  sub_group_name: string;
  min_stock_level: number;
  max_stock_level: number;
  created_at: string;
}

const ViewStock: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [stock, setStock] = useState<StockDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const response = await getInventoryDetails(id);
        setStock(response?.data || null);
      } catch (error) {
        console.error('Error fetching stock details:', error);
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

  if (!stock) {
    return (
      <div className="p-6">
        <div className="text-center py-10 text-muted-foreground">Stock not found</div>
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
        title="Stock Details"
        breadcrumbs={[
          { label: 'FM Module', path: '/inventory/stocks' },
          { label: 'Inventory', path: '/inventory/stocks' },
          { label: 'Stocks', path: '/inventory/stocks' },
          { label: 'View' },
        ]}
      />

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Boxes className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Stock Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField label="Name" value={stock.name} />
            <InfoField label="Rate" value={stock.rate} />
            <InfoField label="Available Quantity" value={stock.available_quantity} />
            <InfoField label="Group" value={stock.group_name} />
            <InfoField label="Sub Group" value={stock.sub_group_name} />
            <InfoField label="Min Stock Level" value={stock.min_stock_level} />
            <InfoField label="Max Stock Level" value={stock.max_stock_level} />
            <InfoField label="Added On" value={stock.created_at ? new Date(stock.created_at).toLocaleDateString() : '-'} />
          </div>

          <div className="mt-6">
            <InfoField label="Description" value={stock.description} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate('/inventory/stocks')}
            className="flex items-center gap-2 px-6 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <button
            onClick={() => navigate(`/inventory/stocks/${id}/edit`)}
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

export default ViewStock;
