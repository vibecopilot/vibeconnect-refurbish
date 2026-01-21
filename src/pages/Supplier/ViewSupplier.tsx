import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, FileText, Landmark, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { getVendorsDetails } from '../../api';

interface SupplierData {
  id: number;
  vendor_name: string;
  company_name: string;
  mobile: string;
  primary_phone: string;
  secondary_phone: string;
  email: string;
  primary_email: string;
  secondary_email: string;
  pan: string;
  vendor_supplier_id: string;
  supplier_type_name: string;
  category_id: string;
  category_name: string;
  website: string;
  website_url: string;
  gst_number: string;
  address: string;
  address_line_1: string;
  address_line_2: string;
  district: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  account_name: string;
  account_number: string;
  bank_branch_name: string;
  ifsc_code: string;
  status: string;
  created_at: string;
  attachment_url: string;
}

const ViewSupplier: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSupplierDetails();
  }, [id]);

  const fetchSupplierDetails = async () => {
    try {
      const response = await getVendorsDetails(id);
      setSupplier(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching supplier:', error);
      toast.error('Failed to fetch supplier details');
      setError('Failed to fetch supplier details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading supplier...
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-muted-foreground mb-3">{error || 'Supplier not found'}</p>
        <button
          onClick={() => navigate('/supplier')}
          className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          Back to suppliers
        </button>
      </div>
    );
  }

  const InfoRow = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value || '-'}</span>
    </div>
  );

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur pb-2">
          <Breadcrumb
            items={[
              { label: 'FM Module', path: '/supplier' },
              { label: 'Supplier/Vendor', path: '/supplier' },
              { label: 'View Supplier' },
            ]}
          />
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => navigate('/supplier')}
              className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
              aria-label="Back to suppliers"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold text-foreground">
                {supplier.company_name || supplier.vendor_name || 'Supplier'}
              </h1>
              <p className="text-sm text-muted-foreground">Supplier details</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Company Details" icon={<Building2 className="h-5 w-5 text-primary" />}>
            <InfoRow label="Company Name" value={supplier.company_name} />
            <InfoRow label="Vendor Name" value={supplier.vendor_name} />
            <InfoRow label="Supplier Type" value={supplier.supplier_type_name || supplier.vendor_supplier_id} />
            <InfoRow label="Category" value={supplier.category_name || supplier.category_id} />
            <InfoRow label="Status" value={supplier.status} />
            <InfoRow label="Supplier ID" value={supplier.id} />
          </Card>

          <Card title="Contact & Communication" icon={<MapPin className="h-5 w-5 text-primary" />}>
            <InfoRow label="Primary Phone" value={supplier.mobile || supplier.primary_phone} />
            <InfoRow label="Secondary Phone" value={supplier.secondary_phone} />
            <InfoRow label="Primary Email" value={supplier.email || supplier.primary_email} />
            <InfoRow label="Secondary Email" value={supplier.secondary_email} />
            <InfoRow label="Website" value={supplier.website || supplier.website_url} />
          </Card>

          <Card title="Tax & Compliance" icon={<FileText className="h-5 w-5 text-primary" />}>
            <InfoRow label="PAN" value={supplier.pan} />
            <InfoRow label="GST Number" value={supplier.gst_number} />
            <InfoRow label="Created On" value={supplier.created_at} />
          </Card>
        </div>

        <Card title="Address" icon={<MapPin className="h-5 w-5 text-primary" />}>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow label="Address Line 1" value={supplier.address_line_1 || supplier.address} />
            <InfoRow label="Address Line 2" value={supplier.address_line_2} />
            <InfoRow label="District" value={supplier.district} />
            <InfoRow label="City" value={supplier.city} />
            <InfoRow label="State" value={supplier.state} />
            <InfoRow label="Pin Code" value={supplier.pincode} />
            <InfoRow label="Country" value={supplier.country} />
          </div>
        </Card>

        <Card title="Bank Details" icon={<Landmark className="h-5 w-5 text-primary" />}>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow label="Account Name" value={supplier.account_name} />
            <InfoRow label="Account Number" value={supplier.account_number} />
            <InfoRow label="Bank & Branch Name" value={supplier.bank_branch_name} />
            <InfoRow label="IFSC Code" value={supplier.ifsc_code} />
          </div>
        </Card>

        {supplier.attachment_url && (
          <Card title="Attachments" icon={<FileText className="h-5 w-5 text-primary" />}>
            <a
              href={supplier.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <FileText className="h-4 w-4" />
              View Attachment
            </a>
          </Card>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => navigate(`/supplier/${id}/edit`)}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Edit
          </button>
        </div>
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

export default ViewSupplier;
