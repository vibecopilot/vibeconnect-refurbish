import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Truck, FileText, Plus, Trash2, Upload, User } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import { 
  postGDN, 
  getGDN,
  getInventory,
  getStandardUnits,
  getGDNPurposeSetup,
  getGDNConsumingSetup,
  getStaff
} from '../../api';

interface InventoryItem {
  id: number;
  name: string;
  code?: string;
  unit?: string;
  cost?: number;
  available_quantity?: number;
}

interface LineItem {
  inventory_id: string;
  inventory_name: string;
  quantity: string;
  unit: string;
  purpose: string;
  reason: string;
  consuming_in: string;
}

interface FormData {
  gdn_date: string;
  handed_over_to: string;
  handed_over_to_name: string;
  status: string;
  description: string;
}

const CreateGDN: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    gdn_date: new Date().toISOString().split('T')[0],
    handed_over_to: '',
    handed_over_to_name: '',
    status: 'Pending',
    description: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([{
    inventory_id: '',
    inventory_name: '',
    quantity: '',
    unit: '',
    purpose: '',
    reason: '',
    consuming_in: '',
  }]);

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [purposes, setPurposes] = useState<any[]>([]);
  const [consumingOptions, setConsumingOptions] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const statusOptions = ['Pending', 'Completed', 'Rejected', 'Draft'];

  useEffect(() => {
    fetchDropdowns();
    if (isEditMode && id) {
      fetchGDNDetails();
    }
  }, [id, isEditMode]);

  const fetchDropdowns = async () => {
    try {
      const [inventoryRes, unitsRes, purposeRes, consumingRes, staffRes] = await Promise.all([
        getInventory(),
        getStandardUnits?.() || Promise.resolve({ data: [] }),
        getGDNPurposeSetup?.() || Promise.resolve({ data: [] }),
        getGDNConsumingSetup?.() || Promise.resolve({ data: [] }),
        getStaff?.() || Promise.resolve({ data: [] }),
      ]);
      setInventoryItems(Array.isArray(inventoryRes?.data) ? inventoryRes.data : []);
      setUnits(Array.isArray(unitsRes?.data) ? unitsRes.data : []);
      setPurposes(Array.isArray(purposeRes?.data) ? purposeRes.data : []);
      setConsumingOptions(Array.isArray(consumingRes?.data) ? consumingRes.data : []);
      setStaffList(Array.isArray(staffRes?.data) ? staffRes.data : []);
    } catch (error) {
      console.error('Error fetching dropdowns:', error);
    }
  };

  const fetchGDNDetails = async () => {
    try {
      const response = await getGDN();
      const allGdns = Array.isArray(response?.data) ? response.data : [];
      const data = allGdns.find((g: any) => g.id?.toString() === id);
      if (data) {
        setFormData({
          gdn_date: data.gdn_date ? data.gdn_date.split('T')[0] : '',
          handed_over_to: data.handed_over_to_id?.toString() || '',
          handed_over_to_name: data.handed_over_to || '',
          status: data.status || 'Pending',
          description: data.description || '',
        });

        if (Array.isArray(data.inventory_details) && data.inventory_details.length > 0) {
          setLineItems(data.inventory_details.map((item: any) => ({
            inventory_id: item.inventory_id?.toString() || '',
            inventory_name: item.inventory_name || '',
            quantity: item.quantity?.toString() || '',
            unit: item.unit || '',
            purpose: item.purpose || '',
            reason: item.reason || '',
            consuming_in: item.consuming_in || '',
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching GDN details:', error);
      toast.error('Failed to fetch GDN details');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Update handed_over_to_name when staff is selected
    if (name === 'handed_over_to' && value) {
      const selectedStaff = staffList.find(s => s.id?.toString() === value);
      if (selectedStaff) {
        setFormData(prev => ({
          ...prev,
          handed_over_to: value,
          handed_over_to_name: selectedStaff.name || selectedStaff.first_name || ''
        }));
      }
    }
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string) => {
    setLineItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Auto-fill inventory details when selecting inventory item
      if (field === 'inventory_id' && value) {
        const selectedItem = inventoryItems.find(item => item.id.toString() === value);
        if (selectedItem) {
          updated[index].inventory_name = selectedItem.name || '';
          updated[index].unit = selectedItem.unit || '';
        }
      }

      return updated;
    });
  };

  const addLineItem = () => {
    setLineItems(prev => [...prev, {
      inventory_id: '',
      inventory_name: '',
      quantity: '',
      unit: '',
      purpose: '',
      reason: '',
      consuming_in: '',
    }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.every(item => !item.inventory_id)) {
      toast.error('Please add at least one inventory item');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        gdn_detail: {
          gdn_date: formData.gdn_date,
          handed_over_to: formData.handed_over_to_name,
          handed_over_to_id: formData.handed_over_to ? parseInt(formData.handed_over_to) : null,
          status: formData.status,
          description: formData.description,
          inventory_count: lineItems.filter(item => item.inventory_id).length,
          inventory_details_attributes: lineItems
            .filter(item => item.inventory_id)
            .map(item => ({
              inventory_id: parseInt(item.inventory_id),
              inventory_name: item.inventory_name,
              quantity: parseFloat(item.quantity) || 0,
              unit: item.unit,
              purpose: item.purpose,
              reason: item.reason,
              consuming_in: item.consuming_in,
            })),
        }
      };

      await postGDN(payload);
      toast.success(isEditMode ? 'GDN updated successfully' : 'GDN created successfully');
      navigate('/inventory/gdn');
    } catch (error) {
      console.error('Error saving GDN:', error);
      toast.error(isEditMode ? 'Failed to update GDN' : 'Failed to create GDN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title={isEditMode ? 'Edit GDN' : 'Add GDN'}
        breadcrumbs={[
          { label: 'FM Module', path: '/inventory/gdn' },
          { label: 'Inventory', path: '/inventory/gdn' },
          { label: 'GDN', path: '/inventory/gdn' },
          { label: isEditMode ? 'Edit' : 'Add' },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">GDN Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">GDN Date *</label>
              <input
                type="date"
                name="gdn_date"
                value={formData.gdn_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Hand Over To</label>
              <select
                name="handed_over_to"
                value={formData.handed_over_to}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Person</option>
                {staffList.map((staff: any) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name || staff.first_name || `Staff #${staff.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Enter description"
              />
            </div>
          </div>
        </div>

        {/* Inventory Items Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Inventory Items</h2>
            </div>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">Inventory *</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">Quantity *</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">Unit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">Purpose</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">Consuming In</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">Reason</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-foreground border-b border-border w-16">Action</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="px-4 py-3">
                      <select
                        value={item.inventory_id}
                        onChange={(e) => handleLineItemChange(index, 'inventory_id', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select Inventory</option>
                        {inventoryItems.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} {inv.available_quantity ? `(Avail: ${inv.available_quantity})` : ''}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0"
                        min="0"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.unit}
                        onChange={(e) => handleLineItemChange(index, 'unit', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select Unit</option>
                        {units.map((unit: any) => (
                          <option key={unit.id} value={unit.name || unit.unit_name}>
                            {unit.name || unit.unit_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.purpose}
                        onChange={(e) => handleLineItemChange(index, 'purpose', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select Purpose</option>
                        {purposes.map((purpose: any) => (
                          <option key={purpose.id} value={purpose.name || purpose.info_value}>
                            {purpose.name || purpose.info_value}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.consuming_in}
                        onChange={(e) => handleLineItemChange(index, 'consuming_in', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select</option>
                        {consumingOptions.map((opt: any) => (
                          <option key={opt.id} value={opt.name || opt.info_value}>
                            {opt.name || opt.info_value}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.reason}
                        onChange={(e) => handleLineItemChange(index, 'reason', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter reason"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        disabled={lineItems.length === 1}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Attachments</h2>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              type="file"
              id="attachments"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="attachments" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-medium">Click to upload files</p>
              <p className="text-sm text-muted-foreground mt-1">or drag and drop</p>
            </label>
          </div>

          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-2 bg-muted/50 rounded-lg">
                  <span className="text-sm text-foreground">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/inventory/gdn')}
            className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update GDN' : 'Save GDN'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGDN;
