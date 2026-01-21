import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Paperclip, Truck, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/ui/Breadcrumb';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchGDNDetails();
    }
  }, [id]);

  const fetchGDNDetails = async () => {
    try {
      const response = await getGDN();
      const rawData = Array.isArray(response?.data)
        ? response.data
        : response?.data?.items || response?.data?.data || response?.data?.gdn_details || [];

      const matched = rawData.find((g: any) => g.id?.toString() === id);

      if (matched) {
        const inventoryDetails = matched.inventory_details || matched.gdn_inventory_details || [];
        const statusValue =
          typeof matched.status === 'string'
            ? matched.status
            : matched.status === true
              ? 'Completed'
              : 'Pending';

        const normalized: GDNData = {
          id: matched.id,
          gdn_date: matched.gdn_date || '',
          handed_over_to: matched.handed_over_to || '-',
          handed_over_to_id: matched.handed_over_to_id || matched.created_by_id || 0,
          status: statusValue,
          description: matched.description || '-',
          inventory_count: matched.inventory_count ?? inventoryDetails.length ?? 0,
          created_at: matched.created_at || '',
          created_by: matched.created_by || matched.created_by_id?.toString() || '-',
          inventory_details: inventoryDetails.map((item: any) => ({
            id: item.id,
            inventory_id: item.inventory_id,
            inventory_name: item.inventory_name || item.inventory?.name || '-',
            quantity: item.quantity || 0,
            unit: item.unit || '-',
            purpose: item.purpose || '-',
            reason: item.reason || '-',
            consuming_in: item.consuming_in || '-',
          })),
          attachments: matched.attachments || [],
        };

        setGdnData(normalized);
        setError(null);
      } else {
        setGdnData(null);
        setError('GDN not found');
      }
    } catch (error) {
      console.error('Error fetching GDN details:', error);
      toast.error('Failed to fetch GDN details');
      setError('Failed to fetch GDN details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const d = new Date(value);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (value?: string) => {
    if (!value) return '-';
    const d = new Date(value);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!gdnData) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">{error || 'GDN not found'}</p>
        <button
          onClick={() => navigate('/inventory/gdn')}
          className="mt-4 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          Back to GDN list
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur pb-2">
          <Breadcrumb
            items={[
              { label: 'FM Module', path: '/inventory/gdn' },
              { label: 'Inventory', path: '/inventory/gdn' },
              { label: 'GDN', path: '/inventory/gdn' },
              { label: `GDN #${gdnData.id}` },
            ]}
          />
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => navigate('/inventory/gdn')}
              className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
              aria-label="Back to GDN"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold text-foreground">GDN #{gdnData.id}</h1>
              <p className="text-sm text-muted-foreground">Goods Delivery Note details</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card title="GDN Details" icon={<Truck className="h-5 w-5 text-primary" />}>
            <InfoRow label="GDN Date" value={formatDate(gdnData.gdn_date)} />
            <InfoRow label="Handed Over To" value={gdnData.handed_over_to || '-'} />
            <InfoRow label="Status" value={gdnData.status || '-'} />
            <InfoRow label="Inventory Count" value={gdnData.inventory_count?.toString() || '0'} />
          </Card>

          <Card title="Description" icon={<FileText className="h-5 w-5 text-primary" />}>
            <p className="text-sm text-foreground">{gdnData.description || '-'}</p>
          </Card>

          <Card title="Created Info" icon={<User className="h-5 w-5 text-primary" />}>
            <InfoRow label="Created By" value={gdnData.created_by || '-'} />
            <InfoRow label="Created On" value={formatDateTime(gdnData.created_at)} />
          </Card>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Inventory Items</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              Total {gdnData.inventory_details?.length || 0}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left w-12">#</th>
                  <th className="px-4 py-3 text-left">Inventory</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3 text-left">Unit</th>
                  <th className="px-4 py-3 text-left">Purpose</th>
                  <th className="px-4 py-3 text-left">Consuming In</th>
                  <th className="px-4 py-3 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                {gdnData.inventory_details && gdnData.inventory_details.length > 0 ? (
                  gdnData.inventory_details.map((item, index) => (
                    <tr key={item.id || index} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                      <td className="px-4 py-3 text-foreground">{item.inventory_name || '-'}</td>
                      <td className="px-4 py-3 text-right text-foreground">{item.quantity || 0}</td>
                      <td className="px-4 py-3 text-foreground">{item.unit || '-'}</td>
                      <td className="px-4 py-3 text-foreground">{item.purpose || '-'}</td>
                      <td className="px-4 py-3 text-foreground">{item.consuming_in || '-'}</td>
                      <td className="px-4 py-3 text-foreground">{item.reason || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No inventory items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {gdnData.attachments && gdnData.attachments.length > 0 && (
          <div className="bg-card border border-border rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <Paperclip className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Attachments</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gdnData.attachments.map((attachment: any, index: number) => (
                <div
                  key={attachment.id || index}
                  className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3"
                >
                  <span className="text-sm text-foreground truncate">
                    {attachment.name || `Attachment ${index + 1}`}
                  </span>
                  {attachment.url && (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                      aria-label="Download attachment"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Card: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  children,
}) => (
  <div className="rounded-2xl border border-border bg-card shadow-sm">
    <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/30">
      {icon}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
    <div className="p-5 space-y-3">{children}</div>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground text-right">{value}</span>
  </div>
);

export default ViewGDN;
