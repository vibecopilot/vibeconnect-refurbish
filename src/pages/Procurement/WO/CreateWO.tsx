import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X } from 'lucide-react';
import FormSection from '../../../components/ui/FormSection';
import FormInput from '../../../components/ui/FormInput';
import FormGrid from '../../../components/ui/FormGrid';
import { Building2, Package, Paperclip, FileText } from 'lucide-react';

interface ItemDetail {
  id: string;
  select_service: string;
  product_description: string;
  expected_date: string;
  uom: string;
  quantity_area: string;
  rate: string;
  cgst_rate: string;
  cgst_amt: string;
  sgst_rate: string;
  sgst_amt: string;
  igst_rate: string;
  igst_amt: string;
  tcs_rate: string;
  tcs_amt: string;
  tax_amount: string;
  amount: string;
  total_amount: string;
}

const CreateWO: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = window.location.pathname;
  const isEditMode = location.includes('/edit');
  const isViewMode = Boolean(id && !isEditMode);
  
  // Form state - WORK ORDER DETAILS
  const [formData, setFormData] = useState({
    select_service_pr: '',
    select_contractor: '',
    plant_detail: '',
    select_wo_date: '',
    select_billing_address: '',
    related_to: '',
    retention: '',
    tds: '',
    qc: '',
    payment_tenure: '',
    advance_amount: '',
  });

  // Additional DETAILS section
  const [additionalDetails, setAdditionalDetails] = useState({
    kind_attention: '',
    subject: '',
    description: '',
    terms_conditions: '',
  });

  const [items, setItems] = useState<ItemDetail[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdditionalDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdditionalDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    const newItem: ItemDetail = {
      id: Date.now().toString(),
      select_service: '',
      product_description: '',
      expected_date: '',
      uom: '',
      quantity_area: '',
      rate: '',
      cgst_rate: '',
      cgst_amt: '',
      sgst_rate: '',
      sgst_amt: '',
      igst_rate: '',
      igst_amt: '',
      tcs_rate: '',
      tcs_amt: '',
      tax_amount: '',
      amount: '',
      total_amount: '',
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleItemChange = (id: string, field: keyof ItemDetail, value: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Calculate amounts based on rate and quantity
        const rate = parseFloat(item.rate || '0');
        const quantity = parseFloat(item.quantity_area || '0');
        const baseAmount = rate * quantity;
        
        // Calculate GST amounts
        const cgstRate = parseFloat(item.cgst_rate || '0');
        const sgstRate = parseFloat(item.sgst_rate || '0');
        const igstRate = parseFloat(item.igst_rate || '0');
        const tcsRate = parseFloat(item.tcs_rate || '0');
        
        const cgstAmount = (baseAmount * cgstRate) / 100;
        const sgstAmount = (baseAmount * sgstRate) / 100;
        const igstAmount = (baseAmount * igstRate) / 100;
        const tcsAmount = (baseAmount * tcsRate) / 100;
        
        const taxAmount = cgstAmount + sgstAmount + igstAmount;
        const totalAmount = baseAmount + taxAmount + tcsAmount;
        
        // Update calculated fields
        if (field === 'rate' || field === 'quantity_area' || field === 'cgst_rate' || field === 'sgst_rate' || field === 'igst_rate' || field === 'tcs_rate') {
          updated.cgst_amt = cgstAmount.toFixed(2);
          updated.sgst_amt = sgstAmount.toFixed(2);
          updated.igst_amt = igstAmount.toFixed(2);
          updated.tcs_amt = tcsAmount.toFixed(2);
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
      // const fetchWO = async () => {
      //   const response = await getWOById(id);
      //   setFormData(response.data);
      //   setAdditionalDetails(response.data.additional_details || {});
      //   setItems(response.data.items || []);
      //   setFiles(response.data.files || []);
      // };
      // fetchWO();
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate API when ready
    if (isEditMode) {
      // TODO: Update API call
      // await updateWO(id, { ...formData, additionalDetails, items, files });
    } else {
      // TODO: Create API call
      // await createWO({ ...formData, additionalDetails, items, files });
    }
    console.log('Form Data:', formData);
    console.log('Additional Details:', additionalDetails);
    console.log('Items:', items);
    console.log('Files:', files);
    // Navigate to list after successful submission
    // navigate('/finance/procurement/wo');
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
                {isViewMode ? 'VIEW WORK ORDER' : isEditMode ? 'EDIT WORK ORDER' : 'NEW WORK ORDER'}
              </h1>
            </div>
            {/* Total Amount Display */}
            {items.length > 0 && (
              <div className="ml-auto text-lg font-semibold text-error">
                Total Amount: ₹{calculateTotalAmount()}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section 1: Work Order Details */}
        <FormSection title="WORK ORDER DETAILS" icon={Building2}>
          <FormGrid columns={3}>
            <FormInput
              label="Select Service PR"
              name="select_service_pr"
              type="select"
              value={formData.select_service_pr}
              onChange={handleChange}
              required
              placeholder="Select Service PR"
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="Select Contractor"
              name="select_contractor"
              type="select"
              value={formData.select_contractor}
              onChange={handleChange}
              required
              placeholder="Select Contractor"
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="Plant Detail"
              name="plant_detail"
              type="select"
              value={formData.plant_detail}
              onChange={handleChange}
              placeholder="Select Plant Id"
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="Select WO Date"
              name="select_wo_date"
              type="date"
              value={formData.select_wo_date}
              onChange={handleChange}
              required
              placeholder="dd-mm-yyyy"
              disabled={isViewMode}
            />
            <FormInput
              label="Select Billing Address"
              name="select_billing_address"
              type="select"
              value={formData.select_billing_address}
              onChange={handleChange}
              required
              placeholder="Select Billing Address"
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="Related To"
              name="related_to"
              type="select"
              value={formData.related_to}
              onChange={handleChange}
              placeholder="Related To"
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="Retention(%)"
              name="retention"
              type="number"
              value={formData.retention}
              onChange={handleChange}
              placeholder="Retention"
              disabled={isViewMode}
            />
            <FormInput
              label="TDS(%)"
              name="tds"
              type="number"
              value={formData.tds}
              onChange={handleChange}
              placeholder="TDS"
              disabled={isViewMode}
            />
            <FormInput
              label="QC(%)"
              name="qc"
              type="number"
              value={formData.qc}
              onChange={handleChange}
              placeholder="QC"
              disabled={isViewMode}
            />
            <FormInput
              label="Payment Tenure(In Days)"
              name="payment_tenure"
              type="number"
              value={formData.payment_tenure}
              onChange={handleChange}
              placeholder="Payment Tenure"
              disabled={isViewMode}
            />
            <FormInput
              label="Advance Amount"
              name="advance_amount"
              type="number"
              value={formData.advance_amount}
              onChange={handleChange}
              placeholder="Advance Amount"
              disabled={isViewMode}
            />
          </FormGrid>
        </FormSection>

        {/* Section 2: Item Details */}
        <FormSection title="DETAILS" icon={Package}>
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
              Add Items
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Click "Add Items" to add item details
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
                  <FormGrid columns={4}>
                    <FormInput
                      label="Select Service"
                      name={`select_service_${item.id}`}
                      type="select"
                      value={item.select_service}
                      onChange={(e) => handleItemChange(item.id, 'select_service', e.target.value)}
                      required
                      placeholder="Select Service"
                      options={[]} // TODO: Populate from API
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Product Description"
                      name={`product_description_${item.id}`}
                      value={item.product_description}
                      onChange={(e) => handleItemChange(item.id, 'product_description', e.target.value)}
                      required
                      placeholder="Product Description"
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
                      label="UOM"
                      name={`uom_${item.id}`}
                      value={item.uom}
                      onChange={(e) => handleItemChange(item.id, 'uom', e.target.value)}
                      placeholder="UOM"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Quantity/Area"
                      name={`quantity_area_${item.id}`}
                      type="number"
                      value={item.quantity_area}
                      onChange={(e) => handleItemChange(item.id, 'quantity_area', e.target.value)}
                      required
                      placeholder="Enter Number"
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
                      label="CGST Rate"
                      name={`cgst_rate_${item.id}`}
                      type="number"
                      value={item.cgst_rate}
                      onChange={(e) => handleItemChange(item.id, 'cgst_rate', e.target.value)}
                      placeholder="Enter Number"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="CGST Amt"
                      name={`cgst_amt_${item.id}`}
                      type="number"
                      value={item.cgst_amt}
                      onChange={(e) => handleItemChange(item.id, 'cgst_amt', e.target.value)}
                      placeholder="Calculated Amount"
                      readOnly
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
                      label="SGST Amt"
                      name={`sgst_amt_${item.id}`}
                      type="number"
                      value={item.sgst_amt}
                      onChange={(e) => handleItemChange(item.id, 'sgst_amt', e.target.value)}
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
                      label="IGST Amt"
                      name={`igst_amt_${item.id}`}
                      type="number"
                      value={item.igst_amt}
                      onChange={(e) => handleItemChange(item.id, 'igst_amt', e.target.value)}
                      placeholder="Calculated Amount"
                      readOnly
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
                      label="TCS Amt"
                      name={`tcs_amt_${item.id}`}
                      type="number"
                      value={item.tcs_amt}
                      onChange={(e) => handleItemChange(item.id, 'tcs_amt', e.target.value)}
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
                    <FormInput
                      label="Total Amount"
                      name={`total_amount_${item.id}`}
                      type="number"
                      value={item.total_amount}
                      onChange={(e) => handleItemChange(item.id, 'total_amount', e.target.value)}
                      placeholder="Calculated Amount"
                      readOnly
                      disabled={isViewMode}
                      className="col-span-4"
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

        {/* Section 3: Additional Details */}
        <FormSection title="DETAILS" icon={FileText}>
          <FormGrid columns={2}>
            <FormInput
              label="Kind Attention"
              name="kind_attention"
              value={additionalDetails.kind_attention}
              onChange={handleAdditionalDetailsChange}
              placeholder="Kind Attention"
              disabled={isViewMode}
            />
            <FormInput
              label="Subject"
              name="subject"
              value={additionalDetails.subject}
              onChange={handleAdditionalDetailsChange}
              placeholder="Subject"
              disabled={isViewMode}
            />
            <FormInput
              label="Description"
              name="description"
              type="textarea"
              value={additionalDetails.description}
              onChange={handleAdditionalDetailsChange}
              placeholder="Enter description here..."
              rows={4}
              disabled={isViewMode}
            />
            <FormInput
              label="Terms & Conditions"
              name="terms_conditions"
              type="textarea"
              value={additionalDetails.terms_conditions}
              onChange={handleAdditionalDetailsChange}
              placeholder="Enter terms and conditions here..."
              rows={4}
              disabled={isViewMode}
            />
          </FormGrid>
        </FormSection>

        {/* Section 4: Attachments */}
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
          <div className="flex justify-center gap-4 pb-6">
            <button
              type="submit"
              className="px-8 py-3 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium uppercase"
            >
              {isEditMode ? 'Update Work Order' : 'Save Work Order'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-3 border border-error text-error rounded-lg hover:bg-error/10 transition-colors text-sm font-medium uppercase"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateWO;
