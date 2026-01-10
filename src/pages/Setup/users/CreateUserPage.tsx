import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { getAllUnits, getSites, postSetupUsers } from '../../../api';
import FormSection from '../../../components/ui/FormSection';
import FormInput from '../../../components/ui/FormInput';
import FormGrid from '../../../components/ui/FormGrid';
import Button from '../../../components/ui/Button';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: string;
  unitId: string;
  mobile: string;
  site_ids: number[];
}

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [selectedSites, setSelectedSites] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    userType: '',
    unitId: '',
    mobile: '',
    site_ids: [],
  });

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const sitesResp = await getSites();
        const transformedSites = sitesResp.data.map((site: any) => ({
          value: site.id,
          label: site.name,
        }));
        setSites(transformedSites);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchUnits = async () => {
      try {
        const unitResp = await getAllUnits();
        setUnits(unitResp.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUnits();
    fetchSites();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChangeSites = (selectedOptions: any) => {
    setSelectedSites(selectedOptions);
    const selectedSiteIds = selectedOptions.map((option: any) => option.value);
    setFormData({ ...formData, site_ids: selectedSiteIds });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.userType
    ) {
      return toast.error('All required fields must be filled!');
    }

    const postData = new FormData();
    postData.append('user[firstname]', formData.firstName);
    postData.append('user[lastname]', formData.lastName);
    postData.append('user[email]', formData.email);
    postData.append('user[mobile]', formData.mobile);
    postData.append('user[password]', formData.password);
    postData.append('user[user_type]', formData.userType);
    postData.append('user[unit_id]', formData.unitId);
    formData.site_ids.forEach((siteId) => {
      postData.append('site_ids[]', String(siteId));
    });

    try {
      await postSetupUsers(postData);
      toast.success('User created successfully');
      navigate('/setup/users');
    } catch (error) {
      console.log(error);
      toast.error('Failed to create user');
    }
  };

  const userTypeOptions = [
    { value: '', label: 'Select User Type' },
    { value: 'pms_admin', label: 'Admin' },
    { value: 'pms_technician', label: 'Technician' },
    { value: 'pms_occupant_admin', label: 'Unit Owner' },
    { value: 'pms_occupant', label: 'Unit Resident' },
    { value: 'face_scanner', label: 'Face Scanner' },
    { value: 'Tm', label: 'Approving Authority' },
  ];

  const unitOptions = [
    { value: '', label: 'Select Unit' },
    ...units.map((unit: any) => ({
      value: String(unit.id),
      label: unit.name,
    })),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Add New User</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Create a new user account with permissions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
          <FormSection title="Basic Information">
            <FormGrid columns={3}>
              <FormInput
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Enter first name"
              />
              <FormInput
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Enter last name"
              />
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </FormGrid>

            <FormGrid columns={3}>
              <FormInput
                label="Mobile Number"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
              />
              <FormInput
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
              />
              <FormInput
                label="User Type"
                name="userType"
                type="select"
                value={formData.userType}
                onChange={handleChange}
                options={userTypeOptions}
                required
                placeholder="Select user type"
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Unit & Site Assignment">
            <FormGrid columns={2}>
              <FormInput
                label="Select Unit"
                name="unitId"
                type="select"
                value={formData.unitId}
                onChange={handleChange}
                options={unitOptions}
                placeholder="Select unit"
              />

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Associated Sites
                </label>
                <Select
                  isMulti
                  value={selectedSites}
                  onChange={handleChangeSites}
                  options={sites}
                  placeholder="Select associated sites"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      minHeight: '42px',
                      borderColor: 'hsl(var(--border))',
                      '&:hover': {
                        borderColor: 'hsl(var(--border))',
                      },
                    }),
                  }}
                />
              </div>
            </FormGrid>
          </FormSection>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/setup/users')}
            >
              Cancel
            </Button>
            <Button type="submit">
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserPage;