import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Save, FileCheck } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FormInput from '../../components/ui/FormInput';
import { getPermitType, getPermitDetails, postNewPermit, editPermit } from '../../api';
import { getItemInLocalStorage } from '../../utils/localStorage';
import toast from 'react-hot-toast';

interface PermitType {
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
  building_id?: number;
}

interface Unit {
  id: number;
  name: string;
  floor_id?: number;
}

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Open', label: 'Open' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Extended', label: 'Extended' },
  { value: 'Closed', label: 'Closed' },
];

const CreatePermit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEdit);

  // Dropdown options
  const [permitTypes, setPermitTypes] = useState<PermitType[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [filteredFloors, setFilteredFloors] = useState<Floor[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);

  const [formData, setFormData] = useState({
    permit_type_id: '',
    permit_for: '',
    building_id: '',
    floor_id: '',
    unit_id: '',
    permit_expiry_date: '',
    permit_expiry_time: '',
    status: 'Draft',
    description: '',
  });

  useEffect(() => {
    fetchDropdownData();
    if (isEdit) {
      fetchPermitDetails();
    }
  }, [id]);

  const fetchDropdownData = async () => {
    try {
      // Fetch permit types
      const permitTypesRes = await getPermitType();
      const typesData = permitTypesRes.data;
      setPermitTypes(Array.isArray(typesData) ? typesData : (typesData?.permit_types || typesData?.data || []));

      // Get buildings, floors, units from localStorage
      const storedBuildings = getItemInLocalStorage('Building');
      setBuildings(Array.isArray(storedBuildings) ? storedBuildings : []);

      const storedFloors = getItemInLocalStorage('Floors');
      setFloors(Array.isArray(storedFloors) ? storedFloors : []);

      const storedUnits = getItemInLocalStorage('Units');
      setUnits(Array.isArray(storedUnits) ? storedUnits : []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchPermitDetails = async () => {
    try {
      setFetchingData(true);
      const res = await getPermitDetails(id);
      const data = res.data;

      setFormData({
        permit_type_id: String(data.permit_type_id || ''),
        permit_for: data.permit_for || '',
        building_id: String(data.building_id || ''),
        floor_id: String(data.floor_id || ''),
        unit_id: String(data.unit_id || ''),
        permit_expiry_date: data.permit_expiry_date?.split('T')[0] || '',
        permit_expiry_time: data.permit_expiry_time || '',
        status: data.status || 'Draft',
        description: data.description || '',
      });

      // Filter floors and units based on building/floor
      if (data.building_id) {
        const storedFloors = getItemInLocalStorage('Floors') || [];
        const filtered = storedFloors.filter((f: Floor) => f.building_id === Number(data.building_id));
        setFilteredFloors(filtered);
      }
      if (data.floor_id) {
        const storedUnits = getItemInLocalStorage('Units') || [];
        const filtered = storedUnits.filter((u: Unit) => u.floor_id === Number(data.floor_id));
        setFilteredUnits(filtered);
      }
    } catch (error) {
      console.error('Error fetching permit details:', error);
      toast.error('Failed to load permit details');
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Handle building change - filter floors
    if (name === 'building_id') {
      const filtered = floors.filter((f) => f.building_id === Number(value));
      setFilteredFloors(filtered);
      setFormData((prev) => ({ ...prev, floor_id: '', unit_id: '' }));
      setFilteredUnits([]);
    }

    // Handle floor change - filter units
    if (name === 'floor_id') {
      const filtered = units.filter((u) => u.floor_id === Number(value));
      setFilteredUnits(filtered);
      setFormData((prev) => ({ ...prev, unit_id: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.permit_for) {
      toast.error('Please enter Permit For');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();

      submitData.append('permit[permit_for]', formData.permit_for);
      submitData.append('permit[status]', formData.status);
      
      if (formData.permit_type_id) {
        submitData.append('permit[permit_type_id]', formData.permit_type_id);
      }
      if (formData.building_id) {
        submitData.append('permit[building_id]', formData.building_id);
      }
      if (formData.floor_id) {
        submitData.append('permit[floor_id]', formData.floor_id);
      }
      if (formData.unit_id) {
        submitData.append('permit[unit_id]', formData.unit_id);
      }
      if (formData.permit_expiry_date) {
        submitData.append('permit[permit_expiry_date]', formData.permit_expiry_date);
      }
      if (formData.permit_expiry_time) {
        submitData.append('permit[permit_expiry_time]', formData.permit_expiry_time);
      }
      if (formData.description) {
        submitData.append('permit[description]', formData.description);
      }

      if (isEdit) {
        await editPermit(id, submitData);
        toast.success('Permit updated successfully');
      } else {
        await postNewPermit(submitData);
        toast.success('Permit created successfully');
      }
      navigate('/safety/permit');
    } catch (error) {
      console.error('Error saving permit:', error);
      toast.error(isEdit ? 'Failed to update permit' : 'Failed to create permit');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Breadcrumb items={[
        { label: 'Safety', path: '/safety/incident' },
        { label: 'Permit', path: '/safety/permit' },
        { label: isEdit ? 'Edit Permit' : 'Add Permit' }
      ]} />

      <div className="bg-card border border-border rounded-xl shadow-sm mt-4">
        <div className="bg-primary text-primary-foreground px-6 py-4 rounded-t-xl">
          <h1 className="text-xl font-semibold">{isEdit ? 'Edit Permit' : 'Add Permit'}</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">Fill in the details to {isEdit ? 'update the' : 'create a new'} permit</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Details Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                <FileCheck className="w-4 h-4" />
              </span>
              Permit Details
            </h2>
            
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormInput
                label="Permit Type"
                name="permit_type_id"
                type="select"
                value={formData.permit_type_id}
                onChange={handleChange}
                options={permitTypes.map((t) => ({ value: String(t.id), label: t.name }))}
                placeholder="Select Permit Type"
              />
              <FormInput
                label="Permit For"
                name="permit_for"
                type="text"
                value={formData.permit_for}
                onChange={handleChange}
                placeholder="Enter Permit For"
                required
              />
              <FormInput
                label="Building Name"
                name="building_id"
                type="select"
                value={formData.building_id}
                onChange={handleChange}
                options={buildings.map((b) => ({ value: String(b.id), label: b.name }))}
                placeholder="Select Building"
              />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormInput
                label="Floor Name"
                name="floor_id"
                type="select"
                value={formData.floor_id}
                onChange={handleChange}
                options={filteredFloors.map((f) => ({ value: String(f.id), label: f.name }))}
                placeholder="Select Floor"
                disabled={!formData.building_id}
              />
              <FormInput
                label="Unit Name"
                name="unit_id"
                type="select"
                value={formData.unit_id}
                onChange={handleChange}
                options={filteredUnits.map((u) => ({ value: String(u.id), label: u.name }))}
                placeholder="Select Unit"
                disabled={!formData.floor_id}
              />
              <FormInput
                label="Permit Expiry Date"
                name="permit_expiry_date"
                type="date"
                value={formData.permit_expiry_date}
                onChange={handleChange}
                placeholder="Select Date"
              />
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormInput
                label="Permit Expiry Time"
                name="permit_expiry_time"
                type="time"
                value={formData.permit_expiry_time}
                onChange={handleChange}
                placeholder="Select Time"
              />
              <FormInput
                label="Status"
                name="status"
                type="select"
                value={formData.status}
                onChange={handleChange}
                options={STATUS_OPTIONS}
                placeholder="Select Status"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <FormInput
                label="Description"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => navigate('/safety/permit')}
              className="px-6 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Submit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePermit;
