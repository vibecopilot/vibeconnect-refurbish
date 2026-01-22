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
  quantity: string;
  sgst_rate: string;
  tcs_rate: string;
  total_amount: string;
  sac_hsn_code: string;
  rate: string;
  sgst_amount: string;
  tcs_amount: string;
  expected_date: string;
  select_unit: string;
  cgst_rate: string;
  cgst_amount: string;
  igst_rate: string;
  igst_amount: string;
  tax_amount: string;
  amount: string;
}

const CreatePO: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = window.location.pathname;
  const isEditMode = location.includes('/edit');
  const isViewMode = Boolean(id && !isEditMode);
  
  // Form state
  const [formData, setFormData] = useState({
    select_material_pr: '',
    po_date: '',
    related_to: '',
    qc: '',
    terms_conditions: '',
    supplier: '',
    billing_address: '',
    retention: '',
    payment_tenure: '',
    plant_detail: '',
    delivery_address: '',
    tds: '',
    advance_amount: '',
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
      quantity: '',
      sgst_rate: '',
      tcs_rate: '',
      total_amount: '',
      sac_hsn_code: '',
      rate: '',
      sgst_amount: '',
      tcs_amount: '',
      expected_date: '',
      select_unit: '',
      cgst_rate: '',
      cgst_amount: '',
      igst_rate: '',
      igst_amount: '',
      tax_amount: '',
      amount: '',
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleItemChange = (id: string, field: keyof ItemDetail, value: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Calculate amounts based on rate and quantity
        const rate = parseFloat(item.rate || '0');
        const quantity = parseFloat(item.quantity || '0');
        const baseAmount = rate * quantity;
        
        // Calculate GST amounts
        const sgstRate = parseFloat(item.sgst_rate || '0');
        const cgstRate = parseFloat(item.cgst_rate || '0');
        const igstRate = parseFloat(item.igst_rate || '0');
        const tcsRate = parseFloat(item.tcs_rate || '0');
        
        const sgstAmount = (baseAmount * sgstRate) / 100;
        const cgstAmount = (baseAmount * cgstRate) / 100;
        const igstAmount = (baseAmount * igstRate) / 100;
        const tcsAmount = (baseAmount * tcsRate) / 100;
        
        const taxAmount = sgstAmount + cgstAmount + igstAmount;
        const totalAmount = baseAmount + taxAmount + tcsAmount;
        
        // Update calculated fields
        if (field === 'rate' || field === 'quantity' || field === 'sgst_rate' || field === 'cgst_rate' || field === 'igst_rate' || field === 'tcs_rate') {
          updated.sgst_amount = sgstAmount.toFixed(2);
          updated.cgst_amount = cgstAmount.toFixed(2);
          updated.igst_amount = igstAmount.toFixed(2);
          updated.tcs_amount = tcsAmount.toFixed(2);
          updated.tax_amount = taxAmount.toFixed(2);
          updated.amount = baseAmount.toFixed(2);
          updated.total_amount = totalAmount.toFixed(2);
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
    return items.reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0).toFixed(2);
  };

  // TODO: Fetch data when in view/edit mode
  useEffect(() => {
    if (id) {
      // TODO: Replace with actual API call
      // const fetchPO = async () => {
      //   const response = await getPOById(id);
      //   setFormData(response.data);
      //   setItems(response.data.items || []);
      //   setFiles(response.data.files || []);
      // };
      // fetchPO();
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate API when ready
    if (isEditMode) {
      // TODO: Update API call
      // await updatePO(id, { ...formData, items, files });
    } else {
      // TODO: Create API call
      // await createPO({ ...formData, items, files });
    }
    console.log('Form Data:', formData);
    console.log('Items:', items);
    console.log('Files:', files);
    // Navigate to list after successful submission
    // navigate('/finance/procurement/po');
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
                {isViewMode ? 'VIEW PURCHASE ORDER' : isEditMode ? 'EDIT PURCHASE ORDER' : 'NEW PURCHASE ORDER'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section 1: Supplier Details */}
        <FormSection title="SUPPLIER DETAILS" icon={Building2}>
          <FormGrid columns={3}>
            <FormInput
              label="Select Material PR"
              name="select_material_pr"
              type="select"
              value={formData.select_material_pr}
              onChange={handleChange}
              placeholder="Select..."
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="PO Date"
              name="po_date"
              type="date"
              value={formData.po_date}
              onChange={handleChange}
              required
              placeholder="dd-mm-yyyy"
              disabled={isViewMode}
            />
            <FormInput
              label="Related To"
              name="related_to"
              value={formData.related_to}
              onChange={handleChange}
              placeholder="Related To"
              disabled={isViewMode}
            />
            <FormInput
              label="QC(%)"
              name="qc"
              type="number"
              value={formData.qc}
              onChange={handleChange}
              placeholder="Enter Number"
              disabled={isViewMode}
            />
            <FormInput
              label="Supplier"
              name="supplier"
              type="select"
              value={formData.supplier}
              onChange={handleChange}
              required
              placeholder="Select..."
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="Billing Address"
              name="billing_address"
              type="select"
              value={formData.billing_address}
              onChange={handleChange}
              required
              placeholder="Select..."
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="Retention(%)"
              name="retention"
              type="number"
              value={formData.retention}
              onChange={handleChange}
              placeholder="Enter Number"
              disabled={isViewMode}
            />
            <FormInput
              label="Payment Tenure(In Days)"
              name="payment_tenure"
              type="number"
              value={formData.payment_tenure}
              onChange={handleChange}
              placeholder="Enter Number"
              disabled={isViewMode}
            />
            <FormInput
              label="Plant Detail"
              name="plant_detail"
              type="select"
              value={formData.plant_detail}
              onChange={handleChange}
              required
              placeholder="Select..."
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="Delivery Address"
              name="delivery_address"
              type="select"
              value={formData.delivery_address}
              onChange={handleChange}
              required
              placeholder="Select..."
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="TDS(%)"
              name="tds"
              type="number"
              value={formData.tds}
              onChange={handleChange}
              placeholder="Enter Number"
              disabled={isViewMode}
            />
            <FormInput
              label="Advance Amount"
              name="advance_amount"
              type="number"
              value={formData.advance_amount}
              onChange={handleChange}
              placeholder="Enter Number"
              disabled={isViewMode}
            />
          </FormGrid>
          <div className="mt-4">
            <FormInput
              label="Terms & Conditions"
              name="terms_conditions"
              type="textarea"
              value={formData.terms_conditions}
              onChange={handleChange}
              placeholder="Enter..."
              rows={4}
              disabled={isViewMode}
            />
          </div>
        </FormSection>

        {/* Section 2: Item Details */}
        <FormSection title="ITEM DETAILS" icon={Package}>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {items.length > 0 && `Total Items: ${items.length}`}
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              disabled={isViewMode}
              className="flex items-center gap-2 px-4 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 hover:bg-destructive/10 rounded text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <FormGrid columns={3}>
                    <FormInput
                      label="Item Details"
                      name={`item_details_${item.id}`}
                      type="select"
                      value={item.item_details}
                      onChange={(e) => handleItemChange(item.id, 'item_details', e.target.value)}
                      required
                      placeholder="Select..."
                      options={[]} // TODO: Populate from API
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Quantity"
                      name={`quantity_${item.id}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      required
                      placeholder="Enter Number"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="SGST Rate"
                      name={`sgst_rate_${item.id}`}
                      type="number"
                      value={item.sgst_rate}
                      onChange={(e) => handleItemChange(item.id, 'sgst_rate', e.target.value)}
                      placeholder="Enter Number"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="TCS Rate"
                      name={`tcs_rate_${item.id}`}
                      type="number"
                      value={item.tcs_rate}
                      onChange={(e) => handleItemChange(item.id, 'tcs_rate', e.target.value)}
                      placeholder="Enter Number"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Total Amount"
                      name={`total_amount_${item.id}`}
                      type="number"
                      value={item.total_amount}
                      onChange={(e) => handleItemChange(item.id, 'total_amount', e.target.value)}
                      required
                      placeholder="Calculated Amount"
                      readOnly
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="SAC/HSN Code"
                      name={`sac_hsn_code_${item.id}`}
                      value={item.sac_hsn_code}
                      onChange={(e) => handleItemChange(item.id, 'sac_hsn_code', e.target.value)}
                      placeholder="SAC/HSN Code"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Rate"
                      name={`rate_${item.id}`}
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                      required
                      placeholder="Enter Number"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="SGST Amount"
                      name={`sgst_amount_${item.id}`}
                      type="number"
                      value={item.sgst_amount}
                      onChange={(e) => handleItemChange(item.id, 'sgst_amount', e.target.value)}
                      placeholder="Calculated Amount"
                      readOnly
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="TCS Amount"
                      name={`tcs_amount_${item.id}`}
                      type="number"
                      value={item.tcs_amount}
                      onChange={(e) => handleItemChange(item.id, 'tcs_amount', e.target.value)}
                      placeholder="Calculated Amount"
                      readOnly
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Expected Date"
                      name={`expected_date_${item.id}`}
                      type="date"
                      value={item.expected_date}
                      onChange={(e) => handleItemChange(item.id, 'expected_date', e.target.value)}
                      required
                      placeholder="dd-mm-yyyy"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Select Unit"
                      name={`select_unit_${item.id}`}
                      type="select"
                      value={item.select_unit}
                      onChange={(e) => handleItemChange(item.id, 'select_unit', e.target.value)}
                      placeholder="Select..."
                      options={[]} // TODO: Populate from API
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="CGST Rate"
                      name={`cgst_rate_${item.id}`}
                      type="number"
                      value={item.cgst_rate}
                      onChange={(e) => handleItemChange(item.id, 'cgst_rate', e.target.value)}
                      placeholder="Enter Number"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="CGST Amount"
                      name={`cgst_amount_${item.id}`}
                      type="number"
                      value={item.cgst_amount}
                      onChange={(e) => handleItemChange(item.id, 'cgst_amount', e.target.value)}
                      placeholder="Calculated Amount"
                      readOnly
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="IGST Rate"
                      name={`igst_rate_${item.id}`}
                      type="number"
                      value={item.igst_rate}
                      onChange={(e) => handleItemChange(item.id, 'igst_rate', e.target.value)}
                      placeholder="Enter Number"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="IGST Amount"
                      name={`igst_amount_${item.id}`}
                      type="number"
                      value={item.igst_amount}
                      onChange={(e) => handleItemChange(item.id, 'igst_amount', e.target.value)}
                      placeholder="Calculated Amount"
                      readOnly
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Tax Amount"
                      name={`tax_amount_${item.id}`}
                      type="number"
                      value={item.tax_amount}
                      onChange={(e) => handleItemChange(item.id, 'tax_amount', e.target.value)}
                      placeholder="Calculated Amount"
                      readOnly
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Amount"
                      name={`amount_${item.id}`}
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleItemChange(item.id, 'amount', e.target.value)}
                      placeholder="Calculated Amount"
                      readOnly
                      disabled={isViewMode}
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
                Total Amount: ₹{calculateTotalAmount()}
              </div>
            </div>
          )}
        </FormSection>

        {/* Section 3: Attachments */}
        <FormSection title="ATTACHMENTS" icon={Paperclip}>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            } ${isViewMode ? 'pointer-events-none opacity-50' : ''}`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-sm text-muted-foreground mb-2">
              Drag & Drop or Click to Upload
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {files.length === 0 ? 'No files chosen' : `${files.length} file(s) selected`}
            </p>
            {!isViewMode && (
              <>
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
              </>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="text-sm text-foreground">{file.name}</span>
                  {!isViewMode && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="p-1 hover:bg-destructive/10 rounded text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
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

export default CreatePO;
