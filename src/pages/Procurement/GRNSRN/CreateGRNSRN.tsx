import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X } from 'lucide-react';
import FormSection from '../../../components/ui/FormSection';
import FormInput from '../../../components/ui/FormInput';
import FormGrid from '../../../components/ui/FormGrid';
import { Building2, Package, Paperclip } from 'lucide-react';

interface InventoryDetail {
  id: string;
  inventory_type: string;
  expected_quantity: string;
  received_quantity: string;
  approved_quantity: string;
  rejected_quantity: string;
  rate: string;
  cgst_rate: string;
  cgst_amount: string;
  sgst_rate: string;
  sgst_amount: string;
  igst_rate: string;
  igst_amount: string;
  tcs_rate: string;
  tcs_amount: string;
  total_amount: string;
  batch_numbers: string[];
}

const CreateGRNSRN: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = window.location.pathname;
  const isEditMode = location.includes('/edit');
  const isViewMode = Boolean(id && !isEditMode);
  
  // Form state - GRN DETAILS
  const [formData, setFormData] = useState({
    purchase_order: '',
    supplier: '',
    invoice_number: '',
    related_to: '',
    invoice_amount: '',
    payment_mode: '',
    invoice_date: '',
    posting_date: '',
    other_expense: '',
    loading_expense: '',
    adjustment_amount: '',
    notes: '',
  });

  const [inventoryItems, setInventoryItems] = useState<InventoryDetail[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddInventoryItem = () => {
    const newItem: InventoryDetail = {
      id: Date.now().toString(),
      inventory_type: '',
      expected_quantity: '',
      received_quantity: '',
      approved_quantity: '',
      rejected_quantity: '',
      rate: '',
      cgst_rate: '',
      cgst_amount: '',
      sgst_rate: '',
      sgst_amount: '',
      igst_rate: '',
      igst_amount: '',
      tcs_rate: '',
      tcs_amount: '',
      total_amount: '',
      batch_numbers: [],
    };
    setInventoryItems(prev => [...prev, newItem]);
  };

  const handleInventoryItemChange = (id: string, field: keyof InventoryDetail, value: string | string[]) => {
    setInventoryItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Calculate amounts based on rate and approved quantity
        const rate = parseFloat(item.rate || '0');
        const approvedQty = parseFloat(item.approved_quantity || '0');
        const baseAmount = rate * approvedQty;
        
        // Calculate GST amounts
        const cgstRate = parseFloat(item.cgst_rate || '0');
        const sgstRate = parseFloat(item.sgst_rate || '0');
        const igstRate = parseFloat(item.igst_rate || '0');
        const tcsRate = parseFloat(item.tcs_rate || '0');
        
        const cgstAmount = (baseAmount * cgstRate) / 100;
        const sgstAmount = (baseAmount * sgstRate) / 100;
        const igstAmount = (baseAmount * igstRate) / 100;
        const tcsAmount = (baseAmount * tcsRate) / 100;
        
        const totalAmount = baseAmount + cgstAmount + sgstAmount + igstAmount + tcsAmount;
        
        // Update calculated fields
        if (field === 'rate' || field === 'approved_quantity' || field === 'cgst_rate' || field === 'sgst_rate' || field === 'igst_rate' || field === 'tcs_rate') {
          updated.cgst_amount = cgstAmount.toFixed(2);
          updated.sgst_amount = sgstAmount.toFixed(2);
          updated.igst_amount = igstAmount.toFixed(2);
          updated.tcs_amount = tcsAmount.toFixed(2);
          updated.total_amount = totalAmount.toFixed(2);
        }
        
        return updated;
      }
      return item;
    }));
  };

  const handleAddBatch = (itemId: string) => {
    setInventoryItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          batch_numbers: [...item.batch_numbers, '']
        };
      }
      return item;
    }));
  };

  const handleBatchChange = (itemId: string, batchIndex: number, value: string) => {
    setInventoryItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedBatches = [...item.batch_numbers];
        updatedBatches[batchIndex] = value;
        return { ...item, batch_numbers: updatedBatches };
      }
      return item;
    }));
  };

  const handleRemoveBatch = (itemId: string, batchIndex: number) => {
    setInventoryItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          batch_numbers: item.batch_numbers.filter((_, idx) => idx !== batchIndex)
        };
      }
      return item;
    }));
  };

  const handleRemoveInventoryItem = (id: string) => {
    setInventoryItems(prev => prev.filter(item => item.id !== id));
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
    return inventoryItems.reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0).toFixed(2);
  };

  // TODO: Fetch data when in view/edit mode
  useEffect(() => {
    if (id) {
      // TODO: Replace with actual API call
      // const fetchGRNSRN = async () => {
      //   const response = await getGRNSRNById(id);
      //   setFormData(response.data);
      //   setInventoryItems(response.data.inventory_items || []);
      //   setFiles(response.data.files || []);
      // };
      // fetchGRNSRN();
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate API when ready
    if (isEditMode) {
      // TODO: Update API call
      // await updateGRNSRN(id, { ...formData, inventoryItems, files });
    } else {
      // TODO: Create API call
      // await createGRNSRN({ ...formData, inventoryItems, files });
    }
    console.log('Form Data:', formData);
    console.log('Inventory Items:', inventoryItems);
    console.log('Files:', files);
    // Navigate to list after successful submission
    // navigate('/finance/procurement/grn-srn');
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
                {isViewMode ? 'VIEW GRN/SRN' : isEditMode ? 'EDIT GRN/SRN' : 'ADD GRN'}
              </h1>
            </div>
            {/* Total Amount Display */}
            {inventoryItems.length > 0 && (
              <div className="ml-auto text-lg font-semibold text-error">
                Total Amount: ₹{calculateTotalAmount()}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section 1: GRN Details */}
        <FormSection title="GRN DETAILS" icon={Building2}>
          <FormGrid columns={3}>
            <FormInput
              label="Purchase Order"
              name="purchase_order"
              type="select"
              value={formData.purchase_order}
              onChange={handleChange}
              required
              placeholder="Select Purchase Order"
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
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
              label="Invoice Number"
              name="invoice_number"
              value={formData.invoice_number}
              onChange={handleChange}
              required
              placeholder="Enter Number"
              disabled={isViewMode}
            />
            <FormInput
              label="Related To"
              name="related_to"
              value={formData.related_to}
              onChange={handleChange}
              placeholder="Enter Text"
              disabled={isViewMode}
            />
            <FormInput
              label="Invoice Amount"
              name="invoice_amount"
              type="number"
              value={formData.invoice_amount}
              onChange={handleChange}
              placeholder="Enter Number"
              disabled={isViewMode}
            />
            <FormInput
              label="Payment Mode"
              name="payment_mode"
              type="select"
              value={formData.payment_mode}
              onChange={handleChange}
              placeholder="Select Payment Mode"
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="Invoice Date"
              name="invoice_date"
              type="date"
              value={formData.invoice_date}
              onChange={handleChange}
              required
              placeholder="dd-mm-yyyy"
              disabled={isViewMode}
            />
            <FormInput
              label="Posting Date"
              name="posting_date"
              type="date"
              value={formData.posting_date}
              onChange={handleChange}
              required
              placeholder="dd-mm-yyyy"
              disabled={isViewMode}
            />
            <FormInput
              label="Other Expense"
              name="other_expense"
              type="number"
              value={formData.other_expense}
              onChange={handleChange}
              placeholder="Other Expense"
              disabled={isViewMode}
            />
            <FormInput
              label="Loading Expense"
              name="loading_expense"
              type="number"
              value={formData.loading_expense}
              onChange={handleChange}
              placeholder="Enter Number"
              disabled={isViewMode}
            />
            <FormInput
              label="Adjustment Amount"
              name="adjustment_amount"
              type="number"
              value={formData.adjustment_amount}
              onChange={handleChange}
              placeholder="Enter Number"
              disabled={isViewMode}
            />
          </FormGrid>
          <div className="mt-4">
            <FormInput
              label="Notes"
              name="notes"
              type="textarea"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter any additional notes..."
              rows={4}
              disabled={isViewMode}
            />
          </div>
        </FormSection>

        {/* Section 2: Inventory Details */}
        <FormSection title="INVENTORY DETAILS 1" icon={Package}>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {inventoryItems.length > 0 && `Total Items: ${inventoryItems.length}`}
            </div>
            <button
              type="button"
              onClick={handleAddInventoryItem}
              disabled={isViewMode}
              className="flex items-center gap-2 px-4 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {inventoryItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Click "Add Item" to add inventory details
            </div>
          ) : (
            <div className="space-y-4">
              {inventoryItems.map((item, index) => (
                <div key={item.id} className="border border-border rounded-lg p-4 bg-secondary/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Item {index + 1}</h3>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveInventoryItem(item.id)}
                        className="p-1 hover:bg-destructive/10 rounded text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <FormGrid columns={3}>
                    <FormInput
                      label="Inventory Type"
                      name={`inventory_type_${item.id}`}
                      type="select"
                      value={item.inventory_type}
                      onChange={(e) => handleInventoryItemChange(item.id, 'inventory_type', e.target.value)}
                      placeholder="Select"
                      options={[]} // TODO: Populate from API
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Expected Quantity"
                      name={`expected_quantity_${item.id}`}
                      type="number"
                      value={item.expected_quantity}
                      onChange={(e) => handleInventoryItemChange(item.id, 'expected_quantity', e.target.value)}
                      required
                      placeholder="Expected Quantity"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Received Quantity"
                      name={`received_quantity_${item.id}`}
                      type="number"
                      value={item.received_quantity}
                      onChange={(e) => handleInventoryItemChange(item.id, 'received_quantity', e.target.value)}
                      required
                      placeholder="Received Quantity"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Approved Quantity"
                      name={`approved_quantity_${item.id}`}
                      type="number"
                      value={item.approved_quantity}
                      onChange={(e) => handleInventoryItemChange(item.id, 'approved_quantity', e.target.value)}
                      required
                      placeholder="Approved Quantity"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Rejected Quantity"
                      name={`rejected_quantity_${item.id}`}
                      type="number"
                      value={item.rejected_quantity}
                      onChange={(e) => handleInventoryItemChange(item.id, 'rejected_quantity', e.target.value)}
                      placeholder="Rejected Quantity"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Rate"
                      name={`rate_${item.id}`}
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleInventoryItemChange(item.id, 'rate', e.target.value)}
                      placeholder="Enter Number"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="CGST Rate"
                      name={`cgst_rate_${item.id}`}
                      type="number"
                      value={item.cgst_rate}
                      onChange={(e) => handleInventoryItemChange(item.id, 'cgst_rate', e.target.value)}
                      placeholder="Enter Number"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="CGST Amount"
                      name={`cgst_amount_${item.id}`}
                      type="number"
                      value={item.cgst_amount}
                      onChange={(e) => handleInventoryItemChange(item.id, 'cgst_amount', e.target.value)}
                      placeholder="Enter Number"
                      readOnly
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="SGST Rate"
                      name={`sgst_rate_${item.id}`}
                      type="number"
                      value={item.sgst_rate}
                      onChange={(e) => handleInventoryItemChange(item.id, 'sgst_rate', e.target.value)}
                      placeholder="Enter Number"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="SGST Amount"
                      name={`sgst_amount_${item.id}`}
                      type="number"
                      value={item.sgst_amount}
                      onChange={(e) => handleInventoryItemChange(item.id, 'sgst_amount', e.target.value)}
                      placeholder="Enter Number"
                      readOnly
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="IGST Rate"
                      name={`igst_rate_${item.id}`}
                      type="number"
                      value={item.igst_rate}
                      onChange={(e) => handleInventoryItemChange(item.id, 'igst_rate', e.target.value)}
                      placeholder="Enter Number"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="IGST Amount"
                      name={`igst_amount_${item.id}`}
                      type="number"
                      value={item.igst_amount}
                      onChange={(e) => handleInventoryItemChange(item.id, 'igst_amount', e.target.value)}
                      placeholder="Enter Number"
                      readOnly
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="TCS Rate"
                      name={`tcs_rate_${item.id}`}
                      type="number"
                      value={item.tcs_rate}
                      onChange={(e) => handleInventoryItemChange(item.id, 'tcs_rate', e.target.value)}
                      placeholder="Enter Number"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="TCS Amount"
                      name={`tcs_amount_${item.id}`}
                      type="number"
                      value={item.tcs_amount}
                      onChange={(e) => handleInventoryItemChange(item.id, 'tcs_amount', e.target.value)}
                      placeholder="Enter Number"
                      readOnly
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Total Amount"
                      name={`total_amount_${item.id}`}
                      type="number"
                      value={item.total_amount}
                      onChange={(e) => handleInventoryItemChange(item.id, 'total_amount', e.target.value)}
                      placeholder="Total Amount"
                      readOnly
                      disabled={isViewMode}
                    />
                  </FormGrid>
                  
                  {/* Batch Numbers */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-muted-foreground">Batch Numbers</label>
                      {!isViewMode && (
                        <button
                          type="button"
                          onClick={() => handleAddBatch(item.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add Batch
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {item.batch_numbers.map((batch, batchIndex) => (
                        <div key={batchIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={batch}
                            onChange={(e) => handleBatchChange(item.id, batchIndex, e.target.value)}
                            placeholder="Enter batch number"
                            disabled={isViewMode}
                            className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={() => handleRemoveBatch(item.id, batchIndex)}
                              className="p-2 hover:bg-destructive/10 rounded text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total Amount */}
          {inventoryItems.length > 0 && (
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
          <div className="flex justify-center gap-4 pb-6">
            <button
              type="submit"
              className="px-8 py-3 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium uppercase"
            >
              {isEditMode ? 'Update GRN' : 'Submit GRN'}
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

export default CreateGRNSRN;
