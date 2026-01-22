import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X, Image as ImageIcon } from 'lucide-react';
import FormSection from '../../../components/ui/FormSection';
import FormInput from '../../../components/ui/FormInput';
import FormGrid from '../../../components/ui/FormGrid';
import { Shield, ClipboardList, Calendar, FileCheck } from 'lucide-react';

interface ChecklistItem {
  id: string;
  task_name: string;
  description: string;
  photo_required: boolean;
  status: 'Not Started' | 'In Progress' | 'Completed';
  photo?: File | string;
}

interface Certification {
  id: string;
  name: string;
  issued_date: string;
  expiry_date: string;
  certificate_file?: File | string;
}

const CreateSafetyMeasure: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = window.location.pathname;
  const isEditMode = location.includes('/edit');
  const isViewMode = Boolean(id && !isEditMode);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    description: '',
    priority: '',
    status: 'Active',
    frequency: '',
    next_inspection_date: '',
    assigned_to: '',
    regulatory_requirements: '',
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      task_name: '',
      description: '',
      photo_required: false,
      status: 'Not Started',
    };
    setChecklistItems(prev => [...prev, newItem]);
  };

  const handleChecklistItemChange = (id: string, field: keyof ChecklistItem, value: string | boolean) => {
    setChecklistItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddCertification = () => {
    const newCert: Certification = {
      id: Date.now().toString(),
      name: '',
      issued_date: '',
      expiry_date: '',
    };
    setCertifications(prev => [...prev, newCert]);
  };

  const handleCertificationChange = (id: string, field: keyof Certification, value: string) => {
    setCertifications(prev => prev.map(cert => {
      if (cert.id === id) {
        return { ...cert, [field]: value };
      }
      return cert;
    }));
  };

  const handleRemoveCertification = (id: string) => {
    setCertifications(prev => prev.filter(cert => cert.id !== id));
  };

  const handlePhotoUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setPhotos(prev => [...prev, ...newFiles]);
    
    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
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
    handlePhotoUpload(e.dataTransfer.files);
  };

  useEffect(() => {
    if (id) {
      // TODO: Fetch data when in view/edit mode
      // const fetchSafetyMeasure = async () => {
      //   const response = await getSafetyMeasureById(id);
      //   setFormData(response.data);
      //   setChecklistItems(response.data.checklist_items || []);
      //   setCertifications(response.data.certifications || []);
      //   setPhotoPreviews(response.data.photos || []);
      // };
      // fetchSafetyMeasure();
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate API when ready
    console.log('Form Data:', formData);
    console.log('Checklist Items:', checklistItems);
    console.log('Certifications:', certifications);
    console.log('Photos:', photos);
    // navigate('/safety/module/safety-measures');
  };

  return (
    <div className="min-h-screen bg-background">
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
                {isViewMode ? 'VIEW SAFETY MEASURE' : isEditMode ? 'EDIT SAFETY MEASURE' : 'CREATE SAFETY MEASURE'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section 1: Basic Info */}
        <FormSection title="BASIC INFORMATION" icon={Shield}>
          <FormGrid columns={3}>
            <FormInput
              label="Safety Measure Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter Safety Measure Name"
              disabled={isViewMode}
            />
            <FormInput
              label="Category"
              name="category"
              type="select"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="Select Category"
              options={[
                { value: 'Fire Safety', label: 'Fire Safety' },
                { value: 'Electrical Safety', label: 'Electrical Safety' },
                { value: 'Structural Safety', label: 'Structural Safety' },
                { value: 'Chemical Safety', label: 'Chemical Safety' },
                { value: 'Mechanical Safety', label: 'Mechanical Safety' },
                { value: 'Environmental Safety', label: 'Environmental Safety' },
                { value: 'Other', label: 'Other' },
              ]}
              disabled={isViewMode}
            />
            <FormInput
              label="Location/Area"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Enter Location/Area"
              disabled={isViewMode}
            />
            <FormInput
              label="Priority"
              name="priority"
              type="select"
              value={formData.priority}
              onChange={handleChange}
              placeholder="Select Priority"
              options={[
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' },
              ]}
              disabled={isViewMode}
            />
            <FormInput
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
              disabled={isViewMode}
            />
          </FormGrid>
          <div className="mt-4">
            <FormInput
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              rows={4}
              disabled={isViewMode}
            />
          </div>
        </FormSection>

        {/* Section 2: Photos */}
        <FormSection title="PHOTOS" icon={ImageIcon}>
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
              Drag & Drop or Click to Upload Photos
            </p>
            {!isViewMode && (
              <>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <Upload className="w-4 h-4" />
                  Choose Photos
                </label>
              </>
            )}
          </div>

          {/* Photo Gallery */}
          {(photoPreviews.length > 0 || photos.length > 0) && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-border"
                  />
                  {!isViewMode && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </FormSection>

        {/* Section 3: Work Checklist */}
        <FormSection title="WORK CHECKLIST" icon={ClipboardList}>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {checklistItems.length > 0 && `Total Items: ${checklistItems.length}`}
            </div>
            {!isViewMode && (
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="flex items-center gap-2 px-4 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Checklist Item
              </button>
            )}
          </div>

          {checklistItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Click "Add Checklist Item" to add work checklist items
            </div>
          ) : (
            <div className="space-y-4">
              {checklistItems.map((item, index) => (
                <div key={item.id} className="border border-border rounded-lg p-4 bg-secondary/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Item {index + 1}</h3>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistItem(item.id)}
                        className="p-1 hover:bg-destructive/10 rounded text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <FormGrid columns={2}>
                    <FormInput
                      label="Task Name"
                      name={`task_name_${item.id}`}
                      value={item.task_name}
                      onChange={(e) => handleChecklistItemChange(item.id, 'task_name', e.target.value)}
                      required
                      placeholder="Enter Task Name"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Status"
                      name={`status_${item.id}`}
                      type="select"
                      value={item.status}
                      onChange={(e) => handleChecklistItemChange(item.id, 'status', e.target.value as ChecklistItem['status'])}
                      options={[
                        { value: 'Not Started', label: 'Not Started' },
                        { value: 'In Progress', label: 'In Progress' },
                        { value: 'Completed', label: 'Completed' },
                      ]}
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Description"
                      name={`description_${item.id}`}
                      type="textarea"
                      value={item.description}
                      onChange={(e) => handleChecklistItemChange(item.id, 'description', e.target.value)}
                      placeholder="Enter Description"
                      rows={2}
                      disabled={isViewMode}
                      className="col-span-2"
                    />
                    <div className="col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.photo_required}
                          onChange={(e) => handleChecklistItemChange(item.id, 'photo_required', e.target.checked)}
                          disabled={isViewMode}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="text-sm text-foreground">Photo Required</span>
                      </label>
                    </div>
                  </FormGrid>
                </div>
              ))}
            </div>
          )}
        </FormSection>

        {/* Section 4: Inspection Schedule */}
        <FormSection title="INSPECTION SCHEDULE" icon={Calendar}>
          <FormGrid columns={3}>
            <FormInput
              label="Frequency"
              name="frequency"
              type="select"
              value={formData.frequency}
              onChange={handleChange}
              required
              placeholder="Select Frequency"
              options={[
                { value: 'Daily', label: 'Daily' },
                { value: 'Weekly', label: 'Weekly' },
                { value: 'Monthly', label: 'Monthly' },
                { value: 'Quarterly', label: 'Quarterly' },
              ]}
              disabled={isViewMode}
            />
            <FormInput
              label="Next Inspection Date"
              name="next_inspection_date"
              type="date"
              value={formData.next_inspection_date}
              onChange={handleChange}
              required
              placeholder="dd-mm-yyyy"
              disabled={isViewMode}
            />
            <FormInput
              label="Assigned To"
              name="assigned_to"
              type="select"
              value={formData.assigned_to}
              onChange={handleChange}
              required
              placeholder="Select User"
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
          </FormGrid>
        </FormSection>

        {/* Section 5: Compliance */}
        <FormSection title="COMPLIANCE" icon={FileCheck}>
          <div className="mb-4">
            <FormInput
              label="Regulatory Requirements"
              name="regulatory_requirements"
              type="textarea"
              value={formData.regulatory_requirements}
              onChange={handleChange}
              placeholder="Enter regulatory requirements"
              rows={4}
              disabled={isViewMode}
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {certifications.length > 0 && `Total Certifications: ${certifications.length}`}
            </div>
            {!isViewMode && (
              <button
                type="button"
                onClick={handleAddCertification}
                className="flex items-center gap-2 px-4 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Certification
              </button>
            )}
          </div>

          {certifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Click "Add Certification" to add certifications
            </div>
          ) : (
            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div key={cert.id} className="border border-border rounded-lg p-4 bg-secondary/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Certification {index + 1}</h3>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCertification(cert.id)}
                        className="p-1 hover:bg-destructive/10 rounded text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <FormGrid columns={3}>
                    <FormInput
                      label="Certification Name"
                      name={`cert_name_${cert.id}`}
                      value={cert.name}
                      onChange={(e) => handleCertificationChange(cert.id, 'name', e.target.value)}
                      required
                      placeholder="Enter Certification Name"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Issued Date"
                      name={`issued_date_${cert.id}`}
                      type="date"
                      value={cert.issued_date}
                      onChange={(e) => handleCertificationChange(cert.id, 'issued_date', e.target.value)}
                      required
                      placeholder="dd-mm-yyyy"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Expiry Date"
                      name={`expiry_date_${cert.id}`}
                      type="date"
                      value={cert.expiry_date}
                      onChange={(e) => handleCertificationChange(cert.id, 'expiry_date', e.target.value)}
                      required
                      placeholder="dd-mm-yyyy"
                      disabled={isViewMode}
                    />
                    <div className="col-span-3">
                      <FormInput
                        label="Certificate File"
                        name={`cert_file_${cert.id}`}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleCertificationChange(cert.id, 'certificate_file', e.target.files[0] as any);
                          }
                        }}
                        disabled={isViewMode}
                      />
                    </div>
                  </FormGrid>
                </div>
              ))}
            </div>
          )}
        </FormSection>

        {!isViewMode && (
          <div className="flex justify-center gap-4 pb-6">
            <button
              type="submit"
              className="px-8 py-3 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium uppercase"
            >
              {isEditMode ? 'Update' : 'Submit'}
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

export default CreateSafetyMeasure;