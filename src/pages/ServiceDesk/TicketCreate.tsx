import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FormInput from '../../components/ui/FormInput';
import { serviceDeskService } from '../../services/serviceDesk.service';
import { getItemInLocalStorage } from '../../utils/localStorage';
import { Loader2, Save, X, Upload, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
}

interface Building {
  id: number;
  name: string;
}

interface Floor {
  id: number;
  name: string;
}

interface Unit {
  id: number;
  name: string;
}

interface AssignedUser {
  id: number;
  firstname: string;
  lastname?: string;
}

interface ComplaintMode {
  id: number;
  name: string;
}

const TicketCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
  const [complaintModes, setComplaintModes] = useState<ComplaintMode[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const siteID = getItemInLocalStorage('SITEID');

  const [formData, setFormData] = useState({
    issue_type_id: '',
    complaint_type: '',
    category_type_id: '',
    sub_category_id: '',
    building_name: '',
    floor_name: '',
    unit_id: '',
    heading: '',
    text: '',
    priority: '',
    assigned_to: '',
    complaint_mode_id: '',
    of_phase: 'pms',
    site_id: '',
  });

  useEffect(() => {
    // Load from localStorage
    const storedCategories = getItemInLocalStorage('categories') || [];
    const storedBuildings = getItemInLocalStorage('Building') || [];
    const storedSiteId = getItemInLocalStorage('SITEID');
    
    setCategories(storedCategories);
    setBuildings(storedBuildings);
    setFormData(prev => ({ ...prev, site_id: storedSiteId }));

    // Fetch data from APIs
    fetchAssignedUsers();
    fetchComplaintModes();
  }, []);

  const fetchAssignedUsers = async () => {
    try {
      const response = await serviceDeskService.getAssignedUsers();
      setAssignedUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching assigned users:', error);
    }
  };

  const fetchComplaintModes = async () => {
    try {
      const response = await serviceDeskService.getComplaintModes();
      setComplaintModes(response.data || []);
    } catch (error) {
      console.error('Error fetching complaint modes:', error);
    }
  };

  const handleCategoryChange = async (categoryId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      category_type_id: categoryId, 
      sub_category_id: '' 
    }));
    
    setSubCategories([]);
    
    if (categoryId) {
      try {
        const response = await serviceDeskService.getSubCategories(Number(categoryId));
        const subCats = response.data?.sub_categories || [];
        setSubCategories(subCats);
      } catch (error) {
        console.error('Error fetching sub-categories:', error);
      }
    }
  };

  const handleBuildingChange = async (buildingId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      building_name: buildingId, 
      floor_name: '', 
      unit_id: '' 
    }));
    
    setFloors([]);
    setUnits([]);
    
    if (buildingId) {
      try {
        const response = await serviceDeskService.getFloors(Number(buildingId));
        setFloors(response.data || []);
      } catch (error) {
        console.error('Error fetching floors:', error);
      }
    }
  };

  const handleFloorChange = async (floorId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      floor_name: floorId, 
      unit_id: '' 
    }));
    
    setUnits([]);
    
    if (floorId) {
      try {
        const response = await serviceDeskService.getUnits(Number(floorId));
        setUnits(response.data || []);
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'category_type_id') {
      handleCategoryChange(value);
    } else if (name === 'building_name') {
      handleBuildingChange(value);
    } else if (name === 'floor_name') {
      handleFloorChange(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (fileList: FileList | null) => {
    if (fileList) {
      const newFiles = Array.from(fileList);
      if (files.length + newFiles.length > 4) {
        toast.error('You can upload maximum up to 4 images.');
        return;
      }
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validations (matching existing project)
  if (!formData.building_name) {
    return toast.error('Please Select Building Name');
  }
  if (!formData.floor_name) {
    return toast.error('Please Select Floor Name!');
  }
  if (!formData.category_type_id) {
    return toast.error('Please select category');
  }
  if (!formData.heading) {
    return toast.error('Please provide title');
  }
  if (files.length > 4) {
    return toast.error('You can upload maximum up to 4 images.');
  }

  setLoading(true);
  const toastId = toast.loading('Please wait generating ticket!');
  
  try {
    const submitData = new FormData();
    
    // 🔥 REMOVE the complaints[] prefix - send fields directly
    if (formData.category_type_id) {
      submitData.append('category_type_id', formData.category_type_id);
    }
    if (formData.sub_category_id) {
      submitData.append('sub_category_id', formData.sub_category_id);
    }
    if (formData.text) {
      submitData.append('text', formData.text);
    }
    if (formData.heading) {
      submitData.append('heading', formData.heading);
    }
    
    // Always append these
    submitData.append('of_phase', formData.of_phase);
    submitData.append('site_id', formData.site_id);
    
    if (formData.assigned_to) {
      submitData.append('assigned_to', formData.assigned_to);
    }
    if (formData.priority) {
      submitData.append('priority', formData.priority);
    }
    if (formData.building_name) {
      submitData.append('building_name', formData.building_name);
    }
    if (formData.unit_id) {
      submitData.append('unit_id', formData.unit_id);
    }
    if (formData.floor_name) {
      submitData.append('floor_name', formData.floor_name);
    }
    if (formData.issue_type_id) {
      submitData.append('issue_type_id', formData.issue_type_id);
    }
    if (formData.complaint_type) {
      submitData.append('complaint_type', formData.complaint_type);
    }
    if (formData.complaint_mode_id) {
      submitData.append('complaint_mode_id', formData.complaint_mode_id);
    }

    // Append files
    files.forEach((file) => {
      submitData.append('documents[]', file);
    });

    // Debug: Log what's being sent
    console.log('FormData entries:');
    for (let pair of submitData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    const response = await serviceDeskService.createTicket(submitData);
    console.log('API Response:', response.data);
    
    toast.dismiss(toastId);
    toast.success(`Ticket #${response.data.ticket_number} generated successfully!`);
    
    // Navigate with refresh state
    navigate('/service-desk', { 
      replace: true, 
      state: { refresh: true } 
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    toast.dismiss(toastId);
    toast.error('Failed to create ticket');
  } finally {
    setLoading(false);
  }
};

// Add this useEffect to watch form changes
useEffect(() => {
  console.log('📝 Form Data Changed:', formData);
}, [formData]);

  const handleReset = () => {
    setFormData({
      issue_type_id: '',
      complaint_type: '',
      category_type_id: '',
      sub_category_id: '',
      building_name: '',
      floor_name: '',
      unit_id: '',
      heading: '',
      text: '',
      priority: '',
      assigned_to: '',
      complaint_mode_id: '',
      of_phase: 'pms',
      site_id: formData.site_id,
    });
    setFiles([]);
    setSubCategories([]);
    setFloors([]);
    setUnits([]);
  };

  const priorityOptions = [
    { value: 'P1', label: 'P1' },
    { value: 'P2', label: 'P2' },
    { value: 'P3', label: 'P3' },
    { value: 'P4', label: 'P4' },
    { value: 'P5', label: 'P5' },
  ];

  const issueTypeOptions = [
    { value: 'Apartment', label: 'Apartment' },
    { value: 'common Area', label: 'Common Area' },
  ];

  const complaintTypeOptions = [
    { value: 'Complaint', label: 'Complaint' },
    { value: 'Request', label: 'Request' },
    { value: 'Suggestion', label: 'Suggestion' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Breadcrumb items={[
        { label: 'Service Desk', path: '/service-desk' },
        { label: 'Create Ticket' }
      ]} />

      <div className="bg-card border border-border rounded-xl shadow-sm mt-4">
        <div className="bg-primary text-primary-foreground px-6 py-4 rounded-t-xl">
          <h1 className="text-xl font-semibold">Create Ticket</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Show Related To only for specific site */}
              {siteID === 25 && (
                <FormInput
                  label="Related To"
                  name="issue_type_id"
                  type="select"
                  value={formData.issue_type_id}
                  onChange={handleChange}
                  options={issueTypeOptions}
                  placeholder="Select Area"
                />
              )}
              
              <FormInput
                label="Type of"
                name="complaint_type"
                type="select"
                value={formData.complaint_type}
                onChange={handleChange}
                options={complaintTypeOptions}
                placeholder="Select Issue Type"
              />

              <FormInput
                label="Priority"
                name="priority"
                type="select"
                value={formData.priority}
                onChange={handleChange}
                options={priorityOptions}
                placeholder="Select Priority"
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b">
              Location Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Building Name"
                name="building_name"
                type="select"
                value={formData.building_name}
                onChange={handleChange}
                options={buildings.map(b => ({ value: String(b.id), label: b.name }))}
                placeholder="Select Building"
                required
              />
              <FormInput
                label="Floor Name"
                name="floor_name"
                type="select"
                value={formData.floor_name}
                onChange={handleChange}
                options={floors.map(f => ({ value: String(f.id), label: f.name }))}
                placeholder="Select Floor"
                disabled={!formData.building_name}
                required
              />
              <FormInput
                label="Unit Name"
                name="unit_id"
                type="select"
                value={formData.unit_id}
                onChange={handleChange}
                options={units.map(u => ({ value: String(u.id), label: u.name }))}
                placeholder="Select Unit"
                disabled={!formData.floor_name}
              />
            </div>
          </div>

          {/* Category Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b">
              Category & Assignment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Category"
                name="category_type_id"
                type="select"
                value={formData.category_type_id}
                onChange={handleChange}
                options={categories.map(c => ({ value: String(c.id), label: c.name }))}
                placeholder="Select Category"
                required
              />
              <FormInput
                label="Sub Category"
                name="sub_category_id"
                type="select"
                value={formData.sub_category_id}
                onChange={handleChange}
                options={subCategories.map(s => ({ value: String(s.id), label: s.name }))}
                placeholder="Sub Category"
                disabled={!formData.category_type_id}
              />
              <FormInput
                label="Assigned To"
                name="assigned_to"
                type="select"
                value={formData.assigned_to}
                onChange={handleChange}
                options={assignedUsers.map(u => ({ 
                  value: String(u.id), 
                  label: `${u.firstname} ${u.lastname || ''}`.trim() 
                }))}
                placeholder="Select Assign To"
              />
            </div>
          </div>

          {/* Ticket Details */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b">
              Ticket Details
            </h2>
            <div className="space-y-4">
              <FormInput
                label="Title"
                name="heading"
                type="text"
                value={formData.heading}
                onChange={handleChange}
                placeholder="Enter Title"
                required
              />
              <FormInput
                label="Description"
                name="text"
                type="textarea"
                value={formData.text}
                onChange={handleChange}
                placeholder="Describe your concern!"
                rows={4}
              />
            </div>
          </div>

          {/* Attachments */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b">
              Attachment
            </h2>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">Drag and drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground mb-4">Maximum 4 files allowed</p>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e.target.files)}
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

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-sm text-foreground">{file.name}</span>
                      <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-background rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground hover:text-error" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 pt-6 border-t border-border">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Submit
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketCreate;