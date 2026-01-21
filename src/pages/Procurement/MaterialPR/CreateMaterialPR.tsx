import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X } from 'lucide-react';
import FormSection from '../../../components/ui/FormSection';
import FormInput from '../../../components/ui/FormInput';
import FormGrid from '../../../components/ui/FormGrid';
import { Building2, Package, Paperclip } from 'lucide-react';

interface ItemDetail {
  id: string;
  item_details: string;
  tax_code: string;
  amount: string;
  sac_hsn_code: string;
  expected_date: string;
  storage_location: string;
  product_description: string;
  rate: string;
  gl_account: string;
  quantity: string;
}

const CreateMaterialPR: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = window.location.pathname;
  const isEditMode = location.includes('/edit');
  const isViewMode = Boolean(id && !isEditMode);
  
  // Form state
  const [formData, setFormData] = useState({
    supplier: '',
    pr_date: '',
    related_to: '',
    tds: '',
    advance_amount: '',
    plant_detail: '',
    billing_address: '',
    transportation: '',
    qc: '',
    terms_conditions: '',
    type: '',
    delivery_address: '',
    retention: '',
    payment_terms: '',
  });

  const [items, setItems] = useState<ItemDetail[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    const newItem: ItemDetail = {
      id: Date.now().toString(),
      item_details: '',
      tax_code: '',
      amount: '',
      sac_hsn_code: '',
      expected_date: '',
      storage_location: '',
      product_description: '',
      rate: '',
      gl_account: '',
      quantity: '',
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleItemChange = (id: string, field: keyof ItemDetail, value: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Auto-calculate amount if rate and quantity are provided
        if (field === 'rate' || field === 'quantity') {
          const rate = parseFloat(field === 'rate' ? value : item.rate) || 0;
          const quantity = parseFloat(field === 'quantity' ? value : item.quantity) || 0;
          updated.amount = (rate * quantity).toFixed(2);
        }
        return updated;
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotalAmount = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2);
  };

  // TODO: Fetch data when in view/edit mode
  useEffect(() => {
    if (id) {
      // TODO: Replace with actual API call
      // const fetchMaterialPR = async () => {
      //   const response = await getMaterialPRById(id);
      //   setFormData(response.data);
      //   setItems(response.data.items || []);
      //   setFiles(response.data.files || []);
      // };
      // fetchMaterialPR();
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate API when ready
    if (isEditMode) {
      // TODO: Update API call
      // await updateMaterialPR(id, { ...formData, items, files });
    } else {
      // TODO: Create API call
      // await createMaterialPR({ ...formData, items, files });
    }
    console.log('Form Data:', formData);
    console.log('Items:', items);
    console.log('Files:', files);
    // Navigate to list after successful submission
    // navigate('/finance/procurement/material-pr');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="h-8 w-px bg-border" />
            <div>
              <h1 className="text-lg font-bold text-foreground uppercase">
                {isViewMode ? 'VIEW MATERIAL PR' : isEditMode ? 'EDIT MATERIAL PR' : 'NEW MATERIAL PR'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section 1: Supplier Details */}
        <FormSection title="1 SUPPLIER DETAILS" icon={Building2}>
          <FormGrid columns={3}>
            <FormInput
              label="Supplier"
              name="supplier"
              type="select"
              value={formData.supplier}
              onChange={handleChange}
              required
              placeholder="Select Supplier"
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="PR Date"
              name="pr_date"
              type="date"
              value={formData.pr_date}
              onChange={handleChange}
              required
              placeholder="dd mm yyyy"
            />
            <FormInput
              label="Related To"
              name="related_to"
              value={formData.related_to}
              onChange={handleChange}
              placeholder="Related To"
            />
            <FormInput
              label="TDS(%)"
              name="tds"
              type="number"
              value={formData.tds}
              onChange={handleChange}
              placeholder="Enter Number"
            />
            <FormInput
              label="Advance Amount"
              name="advance_amount"
              type="number"
              value={formData.advance_amount}
              onChange={handleChange}
              placeholder="Enter Number"
            />
            <FormInput
              label="Plant Detail"
              name="plant_detail"
              type="select"
              value={formData.plant_detail}
              onChange={handleChange}
              required
              placeholder="Select Plant Detail"
              options={[]} // TODO: Populate from API
            />
            <FormInput
              label="Billing Address"
              name="billing_address"
              type="select"
              value={formData.billing_address}
              onChange={handleChange}
              required
              placeholder="Select Billing Address"
              options={[]} // TODO: Populate from API
            />
            <FormInput
              label="Transportation"
              name="transportation"
              type="number"
              value={formData.transportation}
              onChange={handleChange}
              placeholder="Enter Number"
            />
            <FormInput
              label="QC(%)"
              name="qc"
              type="number"
              value={formData.qc}
              onChange={handleChange}
              placeholder="Enter number"
            />
            <FormInput
              label="Type"
              name="type"
              type="select"
              value={formData.type}
              onChange={handleChange}
              required
              placeholder="Select Type"
              options={[]} // TODO: Populate from API
            />
            <FormInput
              label="Delivery Address"
              name="delivery_address"
              type="select"
              value={formData.delivery_address}
              onChange={handleChange}
              required
              placeholder="Select Delivery Address"
              options={[]} // TODO: Populate from API
            />
            <FormInput
              label="Retention(%)"
              name="retention"
              type="number"
              value={formData.retention}
              onChange={handleChange}
              placeholder="Enter Number"
            />
            <FormInput
              label="Payment Terms(In Days)"
              name="payment_terms"
              type="number"
              value={formData.payment_terms}
              onChange={handleChange}
              placeholder="Enter Number"
            />
          </FormGrid>
          <div className="mt-4">
            <FormInput
              label="Terms & Conditions"
              name="terms_conditions"
              type="textarea"
              value={formData.terms_conditions}
              onChange={handleChange}
              placeholder="Enter terms and conditions"
              rows={4}
            />
          </div>
        </FormSection>

        {/* Section 2: Item Details */}
        <FormSection title="2 ITEM DETAILS" icon={Package}>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {items.length > 0 && `Total Items: ${items.length}`}
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-2 px-4 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Click "Add Item" to add item details
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="border border-border rounded-lg p-4 bg-secondary/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Item {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 hover:bg-destructive/10 rounded text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <FormGrid columns={3}>
                    <FormInput
                      label="Item Details"
                      name={`item_details_${item.id}`}
                      type="select"
                      value={item.item_details}
                      onChange={(e) => handleItemChange(item.id, 'item_details', e.target.value)}
                      required
                      placeholder="Select Inventory"
                      options={[]} // TODO: Populate from API
                    />
                    <FormInput
                      label="Tax Code"
                      name={`tax_code_${item.id}`}
                      type="select"
                      value={item.tax_code}
                      onChange={(e) => handleItemChange(item.id, 'tax_code', e.target.value)}
                      required
                      placeholder="Select Tax Code"
                      options={[]} // TODO: Populate from API
                    />
                    <FormInput
                      label="Amount"
                      name={`amount_${item.id}`}
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleItemChange(item.id, 'amount', e.target.value)}
                      required
                      placeholder="Calculated Amount"
                      readOnly
                    />
                    <FormInput
                      label="SAC/HSN Code"
                      name={`sac_hsn_code_${item.id}`}
                      value={item.sac_hsn_code}
                      onChange={(e) => handleItemChange(item.id, 'sac_hsn_code', e.target.value)}
                      placeholder="Auto-populated from material master"
                      readOnly
                    />
                    <FormInput
                      label="Expected Date"
                      name={`expected_date_${item.id}`}
                      type="date"
                      value={item.expected_date}
                      onChange={(e) => handleItemChange(item.id, 'expected_date', e.target.value)}
                      required
                      placeholder="dd mm yyyy"
                    />
                    <FormInput
                      label="Storage Location"
                      name={`storage_location_${item.id}`}
                      type="select"
                      value={item.storage_location}
                      onChange={(e) => handleItemChange(item.id, 'storage_location', e.target.value)}
                      required
                      placeholder="Select Storage Location"
                      options={[]} // TODO: Populate from API
                    />
                    <FormInput
                      label="Product Description"
                      name={`product_description_${item.id}`}
                      value={item.product_description}
                      onChange={(e) => handleItemChange(item.id, 'product_description', e.target.value)}
                      required
                      placeholder="Product Description"
                    />
                    <FormInput
                      label="Rate"
                      name={`rate_${item.id}`}
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                      placeholder="Enter Number"
                    />
                    <FormInput
                      label="GL Account"
                      name={`gl_account_${item.id}`}
                      type="select"
                      value={item.gl_account}
                      onChange={(e) => handleItemChange(item.id, 'gl_account', e.target.value)}
                      required
                      placeholder="Select GL Account"
                      options={[]} // TODO: Populate from API
                    />
                    <FormInput
                      label="Quantity"
                      name={`quantity_${item.id}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      required
                      placeholder="Enter Number"
                    />
                  </FormGrid>
                </div>
              ))}
            </div>
          )}

          {/* Total Amount */}
          {items.length > 0 && (
            <div className="mt-6 flex justify-end">
              <div className="text-lg font-semibold text-error">
                Total Amount: {calculateTotalAmount()}
              </div>
            </div>
          )}
        </FormSection>

        {/* Section 3: Attachments */}
        <FormSection title="3 ATTACHMENTS" icon={Paperclip}>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-sm text-muted-foreground mb-2">
              Drag & Drop or Click to Upload
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {files.length === 0 ? 'No images chosen' : `${files.length} file(s) selected`}
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              Choose Files
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="text-sm text-foreground">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="p-1 hover:bg-destructive/10 rounded text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </FormSection>

        {/* Submit Button */}
        {!isViewMode && (
          <div className="flex justify-center pb-6">
            <button
              type="submit"
              className="px-8 py-3 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium uppercase"
            >
              {isEditMode ? 'Update' : 'Submit'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateMaterialPR;

