import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Truck, FileText, ArrowLeft, Edit, Download, Paperclip, User } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import { getGDN } from '../../api';

interface InventoryDetail {
  id: number;
  inventory_id: number;
  inventory_name: string;
  quantity: number;
  unit: string;
  purpose: string;
  reason: string;
  consuming_in: string;
}

interface GDNData {
  id: number;
  gdn_date: string;
  handed_over_to: string;
  handed_over_to_id: number;
  status: string;
  description: string;
  inventory_count: number;
  created_at: string;
  created_by: string;
  inventory_details: InventoryDetail[];
  attachments?: any[];
}

const ViewGDN: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [gdnData, setGdnData] = useState<GDNData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchGDNDetails();
    }
  }, [id]);

  const fetchGDNDetails = async () => {
    try {
      const response = await getGDN();
      const allGdns = Array.isArray(response?.data) ? response.data : [];
      const data = allGdns.find((g: any) => g.id?.toString() === id);
      setGdnData(data || null);
    } catch (error) {
      console.error('Error fetching GDN details:', error);
      toast.error('Failed to fetch GDN details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!gdnData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">GDN not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title={`GDN #${gdnData.id}`}
        breadcrumbs={[
          { label: 'FM Module', path: '/inventory/gdn' },
          { label: 'Inventory', path: '/inventory/gdn' },
          { label: 'GDN', path: '/inventory/gdn' },
          { label: `View #${gdnData.id}` },
        ]}
      />

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/inventory/gdn')}
          className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>
        <button
          onClick={() => navigate(`/inventory/gdn/${id}/edit`)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>

      <div className="space-y-6">
        {/* GDN Details Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">GDN Details</h2>
            </div>
            <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(gdnData.status)}`}>
              {gdnData.status || 'Pending'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">GDN Date</label>
              <p className="text-foreground font-medium">
                {gdnData.gdn_date ? new Date(gdnData.gdn_date).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Handed Over To</label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <p className="text-foreground font-medium">{gdnData.handed_over_to || '-'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Inventory Count</label>
              <p className="text-foreground font-medium">{gdnData.inventory_count || 0} items</p>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm text-muted-foreground mb-1">Description</label>
              <p className="text-foreground">{gdnData.description || '-'}</p>
            </div>
          </div>
        </div>

        {/* Inventory Items Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Inventory Items</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">#</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">Inventory</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-foreground border-b border-border">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">Unit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">Purpose</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">Consuming In</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">Reason</th>
                </tr>
              </thead>
              <tbody>
                {gdnData.inventory_details && gdnData.inventory_details.length > 0 ? (
                  gdnData.inventory_details.map((item, index) => (
                    <tr key={item.id || index} className="border-b border-border">
                      <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{item.inventory_name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-foreground text-right">{item.quantity || 0}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{item.unit || '-'}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{item.purpose || '-'}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{item.consuming_in || '-'}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{item.reason || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No inventory items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attachments Section */}
        {gdnData.attachments && gdnData.attachments.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Paperclip className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Attachments</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gdnData.attachments.map((attachment: any, index: number) => (
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

        {/* Meta Information */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Created By:</span> {gdnData.created_by || '-'}
            </div>
            <div>
              <span className="font-medium">Created On:</span>{' '}
              {gdnData.created_at ? new Date(gdnData.created_at).toLocaleString() : '-'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewGDN;
