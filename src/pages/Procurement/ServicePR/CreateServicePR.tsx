import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X } from 'lucide-react';
import FormSection from '../../../components/ui/FormSection';
import FormInput from '../../../components/ui/FormInput';
import FormGrid from '../../../components/ui/FormGrid';
import { Building2, Wrench, Paperclip } from 'lucide-react';

interface ServiceItemDetail {
  id: string;
  service_name: string;
  service_description: string;
  expected_date: string;
  gl_code: string;
  tax_code: string;
  quantity: string;
  rate: string;
  amount: string;
  sac_hsn_code: string;
  storage_location: string;
  terms_conditions: string;
}

const CreateServicePR: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = window.location.pathname;
  const isEditMode = location.includes('/edit');
  const isViewMode = Boolean(id && !isEditMode);
  
  // Form state
  const [formData, setFormData] = useState({
    service_contractor: '',
    pr_date: '',
    related_to: '',
    plant_detail: '',
    tds: '',
    retention: '',
    payment_terms: '',
    type: '',
    are_tax_same: '',
  });

  const [items, setItems] = useState<ServiceItemDetail[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ ...prev, are_tax_same: value }));
  };

  const handleAddItem = () => {
    const newItem: ServiceItemDetail = {
      id: Date.now().toString(),
      service_name: '',
      service_description: '',
      expected_date: '',
      gl_code: '',
      tax_code: '',
      quantity: '',
      rate: '',
      amount: '',
      sac_hsn_code: '',
      storage_location: '',
      terms_conditions: '',
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleItemChange = (id: string, field: keyof ServiceItemDetail, value: string) => {
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
      // const fetchServicePR = async () => {
      //   const response = await getServicePRById(id);
      //   setFormData(response.data);
      //   setItems(response.data.items || []);
      //   setFiles(response.data.files || []);
      // };
      // fetchServicePR();
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate API when ready
    if (isEditMode) {
      // TODO: Update API call
      // await updateServicePR(id, { ...formData, items, files });
    } else {
      // TODO: Create API call
      // await createServicePR({ ...formData, items, files });
    }
    console.log('Form Data:', formData);
    console.log('Items:', items);
    console.log('Files:', files);
    // Navigate to list after successful submission
    // navigate('/finance/procurement/service-pr');
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
                {isViewMode ? 'VIEW SERVICE PR' : isEditMode ? 'EDIT SERVICE PR' : 'NEW SERVICE PR'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section 1: Service PR Details */}
        <FormSection title="SERVICE PR DETAILS" icon={Building2}>
          <FormGrid columns={3}>
            <FormInput
              label="Service Contractor"
              name="service_contractor"
              type="select"
              value={formData.service_contractor}
              onChange={handleChange}
              required
              placeholder="Select Contractor"
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
              placeholder="DD-MM-YYYY"
              disabled={isViewMode}
            />
            <FormInput
              label="Related To"
              name="related_to"
              type="select"
              value={formData.related_to}
              onChange={handleChange}
              placeholder="Select Related To"
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="Plant Detail"
              name="plant_detail"
              type="select"
              value={formData.plant_detail}
              onChange={handleChange}
              required
              placeholder="Select Plant"
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="TDS"
              name="tds"
              type="select"
              value={formData.tds}
              onChange={handleChange}
              placeholder="Select TDS"
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="Retention"
              name="retention"
              type="select"
              value={formData.retention}
              onChange={handleChange}
              placeholder="Select Retention"
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="Payment Terms"
              name="payment_terms"
              type="select"
              value={formData.payment_terms}
              onChange={handleChange}
              placeholder="Select Payment Terms"
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
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
              disabled={isViewMode}
            />
          </FormGrid>
          
          {/* Are Tax Same? Radio Button */}
          <div className="mt-4">
            <label className="text-sm text-muted-foreground mb-1.5 block">
              Are Tax Same?
            </label>
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="are_tax_same"
                  value="yes"
                  checked={formData.are_tax_same === 'yes'}
                  onChange={(e) => handleRadioChange(e.target.value)}
                  disabled={isViewMode}
                  className="w-4 h-4 text-primary focus:ring-primary border-border"
                />
                <span className="text-sm text-foreground">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="are_tax_same"
                  value="no"
                  checked={formData.are_tax_same === 'no'}
                  onChange={(e) => handleRadioChange(e.target.value)}
                  disabled={isViewMode}
                  className="w-4 h-4 text-primary focus:ring-primary border-border"
                />
                <span className="text-sm text-foreground">No</span>
              </label>
            </div>
          </div>
        </FormSection>

        {/* Section 2: Details (Service Items) */}
        <FormSection title="DETAILS" icon={Wrench}>
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
              Click "Add Item" to add service details
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
                      label="Service Name"
                      name={`service_name_${item.id}`}
                      type="select"
                      value={item.service_name}
                      onChange={(e) => handleItemChange(item.id, 'service_name', e.target.value)}
                      required
                      placeholder="Select Service"
                      options={[]} // TODO: Populate from API
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Service Description"
                      name={`service_description_${item.id}`}
                      value={item.service_description}
                      onChange={(e) => handleItemChange(item.id, 'service_description', e.target.value)}
                      placeholder="Service Description"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Expected Date"
                      name={`expected_date_${item.id}`}
                      type="date"
                      value={item.expected_date}
                      onChange={(e) => handleItemChange(item.id, 'expected_date', e.target.value)}
                      required
                      placeholder="DD-MM-YYYY"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="GL Code"
                      name={`gl_code_${item.id}`}
                      type="select"
                      value={item.gl_code}
                      onChange={(e) => handleItemChange(item.id, 'gl_code', e.target.value)}
                      required
                      placeholder="Select GL Code"
                      options={[]} // TODO: Populate from API
                      disabled={isViewMode}
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
                      label="Amount"
                      name={`amount_${item.id}`}
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleItemChange(item.id, 'amount', e.target.value)}
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
                      label="Storage Location"
                      name={`storage_location_${item.id}`}
                      value={item.storage_location}
                      onChange={(e) => handleItemChange(item.id, 'storage_location', e.target.value)}
                      placeholder="Storage Location"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Terms & Conditions"
                      name={`terms_conditions_${item.id}`}
                      value={item.terms_conditions}
                      onChange={(e) => handleItemChange(item.id, 'terms_conditions', e.target.value)}
                      placeholder="Terms & Conditions"
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
              Drag & Drop or Click to Upload Files
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
              {isEditMode ? 'Update Service PR' : 'Save Service PR'}
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

export default CreateServicePR;
