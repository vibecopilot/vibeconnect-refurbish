import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import PageTitle from '../../components/ui/PageTitle';
import FormSection from '../../components/ui/FormSection';
import FormInput from '../../components/ui/FormInput';
import FormActions from '../../components/ui/FormActions';
import toast from 'react-hot-toast';

const CreateVisitor: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    idType: '',
    idNumber: '',
    purpose: '',
    hostName: '',
    hostDepartment: '',
    building: '',
    floor: '',
    expectedDate: '',
    expectedTime: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.purpose || !formData.hostName) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Visitor created successfully');
      navigate('/vms/visitors');
    } catch (error) {
      toast.error('Failed to create visitor');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!formData.name || !formData.phone || !formData.purpose || !formData.hostName) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Visitor created successfully');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        idType: '',
        idNumber: '',
        purpose: '',
        hostName: '',
        hostDepartment: '',
        building: '',
        floor: '',
        expectedDate: '',
        expectedTime: '',
        notes: '',
      });
    } catch (error) {
      toast.error('Failed to create visitor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageTitle
        title="NEW VISITOR"
        breadcrumbs={[
          { label: 'VMS', path: '/vms' },
          { label: 'Visitors', path: '/vms/visitors' },
          { label: 'New Visitor' }
        ]}
      />

      <FormSection title="VISITOR DETAILS" icon={Settings}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormInput
            label="Visitor Name"
            name="name"
            placeholder="Enter visitor name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Email"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleChange}
          />
          <FormInput
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Company"
            name="company"
            placeholder="Enter company name"
            value={formData.company}
            onChange={handleChange}
          />
          <FormInput
            label="ID Type"
            name="idType"
            type="select"
            value={formData.idType}
            onChange={handleChange}
            options={[
              { value: 'aadhar', label: 'Aadhar Card' },
              { value: 'passport', label: 'Passport' },
              { value: 'driving', label: 'Driving License' },
              { value: 'pan', label: 'PAN Card' },
            ]}
          />
          <FormInput
            label="ID Number"
            name="idNumber"
            placeholder="Enter ID number"
            value={formData.idNumber}
            onChange={handleChange}
          />
        </div>
      </FormSection>

      <FormSection title="VISIT DETAILS" icon={Settings}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormInput
            label="Purpose of Visit"
            name="purpose"
            type="select"
            value={formData.purpose}
            onChange={handleChange}
            required
            options={[
              { value: 'meeting', label: 'Meeting' },
              { value: 'interview', label: 'Interview' },
              { value: 'delivery', label: 'Delivery' },
              { value: 'vendor', label: 'Vendor Meeting' },
              { value: 'personal', label: 'Personal Visit' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <FormInput
            label="Host Name"
            name="hostName"
            placeholder="Enter host name"
            value={formData.hostName}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Host Department"
            name="hostDepartment"
            type="select"
            value={formData.hostDepartment}
            onChange={handleChange}
            options={[
              { value: 'hr', label: 'Human Resources' },
              { value: 'it', label: 'IT Department' },
              { value: 'finance', label: 'Finance' },
              { value: 'operations', label: 'Operations' },
              { value: 'admin', label: 'Administration' },
            ]}
          />
          <FormInput
            label="Building"
            name="building"
            type="select"
            value={formData.building}
            onChange={handleChange}
            options={[
              { value: 'tower-a', label: 'Tower A' },
              { value: 'tower-b', label: 'Tower B' },
              { value: 'tower-c', label: 'Tower C' },
            ]}
          />
          <FormInput
            label="Floor"
            name="floor"
            type="select"
            value={formData.floor}
            onChange={handleChange}
            options={Array.from({ length: 10 }, (_, i) => ({
              value: String(i + 1),
              label: `Floor ${i + 1}`,
            }))}
          />
          <FormInput
            label="Expected Date"
            name="expectedDate"
            type="date"
            value={formData.expectedDate}
            onChange={handleChange}
          />
          <FormInput
            label="Expected Time"
            name="expectedTime"
            type="time"
            value={formData.expectedTime}
            onChange={handleChange}
          />
        </div>
        <div className="mt-6">
          <FormInput
            label="Notes"
            name="notes"
            type="textarea"
            placeholder="Enter any additional notes..."
            value={formData.notes}
            onChange={handleChange}
            rows={4}
          />
        </div>
      </FormSection>

      <FormActions
        onSave={handleSave}
        onSaveAndContinue={handleSaveAndContinue}
        cancelPath="/vms/visitors"
        saving={saving}
      />
    </div>
  );
};

export default CreateVisitor;