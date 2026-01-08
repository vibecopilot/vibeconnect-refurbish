import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Save, Plus, Trash2, User, ClipboardList, FileText } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FormInput from '../../components/ui/FormInput';
import FormSection from '../../components/ui/FormSection';
import FormGrid from '../../components/ui/FormGrid';
import FileInputBox from '../../containers/Inputs/FileInputBox';
import {
  getPermitType,
  getPermitDetails,
  postNewPermit,
  editPermit,
  getFloors,
  getUnits,
  getVendors,
  getSetupUsers,
  fetchPermitEntity,
  getPermitActivity,
  getPermitSubActivity,
  getHazardCategory,
  getPermitRisks,
} from '../../api';
import { getItemInLocalStorage } from '../../utils/localStorage';
import toast from 'react-hot-toast';

interface PermitType {
  id: number;
  name: string;
  created_at?: string;
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

interface Vendor {
  id: number;
  vendor_name?: string;
  company_name?: string;
  name?: string;
}

interface AssignedUser {
  id: number;
  firstname?: string;
  lastname?: string;
}

interface PermitEntity {
  id: number;
  name?: string;
  entity_name?: string;
}

interface Activity {
  activity: string;
  sub_activity: string;
  category_of_hazards: string;
  risks: string;
  subOptions?: any[];
  hazardOptions?: any[];
  riskOptions?: any[];
}

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Open', label: 'Open' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

const toDateTimeLocal = (value?: string) => {
  if (!value) return '';
  if (value.includes('T') && value.length >= 16) {
    return value.slice(0, 16);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 16);
};

const CreatePermit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const firstName = getItemInLocalStorage('Name') || '';
  const lastName = getItemInLocalStorage('LASTNAME') || '';
  const siteName = getItemInLocalStorage('SITENAME') || '';
  const userId = getItemInLocalStorage('UserId');

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEdit);

  const [permitTypes, setPermitTypes] = useState<PermitType[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
  const [permitEntities, setPermitEntities] = useState<PermitEntity[]>([]);
  const [allPermitActivities, setAllPermitActivities] = useState<any[]>([]);
  const [allPermitSubActivities, setAllPermitSubActivities] = useState<any[]>([]);
  const [allHazardCategories, setAllHazardCategories] = useState<any[]>([]);
  const [allPermitRisks, setAllPermitRisks] = useState<any[]>([]);
  const [permitActivityOptions, setPermitActivityOptions] = useState<any[]>([]);
  const [activitiesHydrated, setActivitiesHydrated] = useState(false);

  const [showEntityList, setShowEntityList] = useState(false);

  const [activities, setActivities] = useState<Activity[]>([
    {
      activity: '',
      sub_activity: '',
      category_of_hazards: '',
      risks: '',
      subOptions: [],
      hazardOptions: [],
      riskOptions: [],
    },
  ]);

  const [formData, setFormData] = useState({
    contact_number: '',
    permit_for: '',
    building_id: '',
    floor_id: '',
    unit_id: '',
    client_specific: 'internal',
    entity: '',
    copy_to_string: '',
    permit_type: '',
    vendor_id: '',
    expiry_date_and_time: '',
    permit_status: 'Draft',
    comment: '',
  });

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    const fetchPermitActivityData = async () => {
      try {
        const [activitiesRes, subActivitiesRes, hazardRes, risksRes] =
          await Promise.allSettled([
            getPermitActivity(),
            getPermitSubActivity(),
            getHazardCategory(),
            getPermitRisks(),
          ]);

        const activitiesData =
          activitiesRes.status === 'fulfilled' ? activitiesRes.value?.data || [] : [];
        const subActivitiesData =
          subActivitiesRes.status === 'fulfilled' ? subActivitiesRes.value?.data || [] : [];
        const hazardData =
          hazardRes.status === 'fulfilled' ? hazardRes.value?.data || [] : [];
        const risksData =
          risksRes.status === 'fulfilled' ? risksRes.value?.data || [] : [];

        setAllPermitActivities(Array.isArray(activitiesData) ? activitiesData : []);
        setAllPermitSubActivities(Array.isArray(subActivitiesData) ? subActivitiesData : []);
        setAllHazardCategories(Array.isArray(hazardData) ? hazardData : []);
        setAllPermitRisks(Array.isArray(risksData) ? risksData : []);
      } catch (error) {
        console.error('Error fetching permit activity data:', error);
      }
    };

    fetchPermitActivityData();
  }, []);

  useEffect(() => {
    if (isEdit) {
      fetchPermitDetails();
    }
  }, [id]);

  useEffect(() => {
    if (!formData.permit_type) return;
    const filtered = allPermitActivities.filter(
      (act) => act.parent_id === Number(formData.permit_type)
    );
    setPermitActivityOptions(filtered);
  }, [allPermitActivities, formData.permit_type]);

  const fetchDropdownData = async () => {
    try {
      const [permitTypesRes, vendorsRes, usersRes, entitiesRes] = await Promise.allSettled([
        getPermitType(),
        getVendors(),
        getSetupUsers(),
        fetchPermitEntity(),
      ]);

      const typesData =
        permitTypesRes.status === 'fulfilled'
          ? permitTypesRes.value?.data || []
          : [];
      const normalizedTypes = Array.isArray(typesData)
        ? typesData
        : typesData?.permit_types || typesData?.data || [];
      const sortedTypes = [...normalizedTypes].sort((a, b) => {
        const aDate = a?.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b?.created_at ? new Date(b.created_at).getTime() : 0;
        return bDate - aDate;
      });
      setPermitTypes(sortedTypes);

      const vendorsData =
        vendorsRes.status === 'fulfilled' ? vendorsRes.value?.data || [] : [];
      setVendors(Array.isArray(vendorsData) ? vendorsData : []);

      const usersData =
        usersRes.status === 'fulfilled' ? usersRes.value?.data || [] : [];
      setAssignedUsers(Array.isArray(usersData) ? usersData : []);

      const entityData =
        entitiesRes.status === 'fulfilled'
          ? entitiesRes.value?.data || []
          : [];
      const normalizedEntities = Array.isArray(entityData)
        ? entityData
        : entityData?.permit_entities || entityData?.data || [];
      setPermitEntities(normalizedEntities);

      const storedBuildings = getItemInLocalStorage('Building');
      setBuildings(Array.isArray(storedBuildings) ? storedBuildings : []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchFloorsByBuilding = async (buildingId: string | number) => {
    if (!buildingId) {
      setFloors([]);
      setUnits([]);
      return;
    }
    try {
      const res = await getFloors(buildingId);
      const data = res?.data || [];
      setFloors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching floors:', error);
      setFloors([]);
    }
  };

  const fetchUnitsByFloor = async (floorId: string | number) => {
    if (!floorId) {
      setUnits([]);
      return;
    }
    try {
      const res = await getUnits(floorId);
      const data = res?.data || [];
      setUnits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching units:', error);
      setUnits([]);
    }
  };

  const fetchPermitDetails = async () => {
    if (!id) return;
    try {
      setFetchingData(true);
      const res = await getPermitDetails(id);
      const data = res.data || {};

      const permitTypeValue = data.permit_type_id ?? data.permit_type ?? '';
      const statusValue = data.permit_status ?? data.status ?? 'Draft';

      setFormData({
        contact_number: data.contact_number || '',
        permit_for: data.permit_for || '',
        building_id: String(data.building_id || ''),
        floor_id: String(data.floor_id || ''),
        unit_id: String(data.unit_id || ''),
        client_specific: data.client_specific || 'internal',
        entity: data.entity || '',
        copy_to_string: String(data.copy_to_string || ''),
        permit_type: String(permitTypeValue || ''),
        vendor_id: String(data.vendor_id || ''),
        expiry_date_and_time: toDateTimeLocal(data.expiry_date_and_time),
        permit_status: statusValue || 'Draft',
        comment: data.comment || '',
      });

      setShowEntityList((data.client_specific || 'internal') === 'client');

      if (Array.isArray(data.permit_activities) && data.permit_activities.length) {
        setActivities(
          data.permit_activities.map((activity: Activity) => ({
            activity: activity.activity || '',
            sub_activity: activity.sub_activity || '',
            category_of_hazards: activity.category_of_hazards || '',
            risks: activity.risks || '',
            subOptions: [],
            hazardOptions: [],
            riskOptions: [],
          }))
        );
        setActivitiesHydrated(false);
      }

      if (data.building_id) {
        await fetchFloorsByBuilding(data.building_id);
      }
      if (data.floor_id) {
        await fetchUnitsByFloor(data.floor_id);
      }
    } catch (error) {
      console.error('Error fetching permit details:', error);
      toast.error('Failed to load permit details');
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    if (activitiesHydrated || !activities.length) return;
    if (
      allPermitActivities.length === 0 &&
      allPermitSubActivities.length === 0 &&
      allHazardCategories.length === 0 &&
      allPermitRisks.length === 0
    ) {
      return;
    }

    const resolveId = (value: string, list: any[], nameKeys: string[]) => {
      if (!value) return '';
      const numeric = Number(value);
      if (!Number.isNaN(numeric) && String(numeric) === String(value)) {
        return String(value);
      }
      const match = list.find((item) =>
        nameKeys.some((key) => String(item?.[key] || '').toLowerCase() === value.toLowerCase())
      );
      return match ? String(match.id) : value;
    };

    setActivities((prev) =>
      prev.map((entry) => {
        const activityId = resolveId(entry.activity, allPermitActivities, ['name']);
        const subOptions = allPermitSubActivities.filter(
          (sub) => sub.permit_activity_setup_id === Number(activityId)
        );
        const subActivityId = resolveId(entry.sub_activity, subOptions, ['name']);
        const hazardOptions = allHazardCategories.filter(
          (haz) => haz.sub_activity_id === Number(subActivityId)
        );
        const hazardId = resolveId(entry.category_of_hazards, hazardOptions, ['name']);
        const riskOptions = allPermitRisks.filter(
          (risk) => risk.hazard_category_id === Number(hazardId)
        );
        const riskId = resolveId(entry.risks, riskOptions, ['risk_name', 'name']);

        return {
          ...entry,
          activity: activityId,
          sub_activity: subActivityId,
          category_of_hazards: hazardId,
          risks: riskId,
          subOptions,
          hazardOptions,
          riskOptions,
        };
      })
    );
    setActivitiesHydrated(true);
  }, [
    allPermitActivities,
    allPermitSubActivities,
    allHazardCategories,
    allPermitRisks,
    activitiesHydrated,
    activities.length,
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'permit_type') {
      setFormData((prev) => ({ ...prev, permit_type: value }));
      const filtered = allPermitActivities.filter(
        (act) => act.parent_id === Number(value)
      );
      setPermitActivityOptions(filtered);
      return;
    }

    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'building_id') {
        next.floor_id = '';
        next.unit_id = '';
      }
      if (name === 'floor_id') {
        next.unit_id = '';
      }
      return next;
    });

    if (name === 'building_id') {
      fetchFloorsByBuilding(value);
      setUnits([]);
    }

    if (name === 'floor_id') {
      fetchUnitsByFloor(value);
    }
  };

  const handleClientSpecificChange = (value: string) => {
    setShowEntityList(value === 'client');
    setFormData((prev) => ({ ...prev, client_specific: value }));
  };

  const handleActivityChange = (
    index: number,
    value: string
  ) => {
    setActivities((prev) => {
      const updated = [...prev];
      const subOptions = allPermitSubActivities.filter(
        (sub) => sub.permit_activity_setup_id === Number(value)
      );
      updated[index] = {
        ...updated[index],
        activity: value,
        sub_activity: '',
        category_of_hazards: '',
        risks: '',
        subOptions,
        hazardOptions: [],
        riskOptions: [],
      };
      return updated;
    });
  };

  const handleSubActivityChange = (index: number, value: string) => {
    setActivities((prev) => {
      const updated = [...prev];
      const hazardOptions = allHazardCategories.filter(
        (haz) => haz.sub_activity_id === Number(value)
      );
      updated[index] = {
        ...updated[index],
        sub_activity: value,
        category_of_hazards: '',
        risks: '',
        hazardOptions,
        riskOptions: [],
      };
      return updated;
    });
  };

  const handleHazardChange = (index: number, value: string) => {
    setActivities((prev) => {
      const updated = [...prev];
      const riskOptions = allPermitRisks.filter(
        (risk) => risk.hazard_category_id === Number(value)
      );
      updated[index] = {
        ...updated[index],
        category_of_hazards: value,
        risks: '',
        riskOptions,
      };
      return updated;
    });
  };

  const handleRiskChange = (index: number, value: string) => {
    setActivities((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], risks: value };
      return updated;
    });
  };

  const handleAddActivity = () => {
    setActivities((prev) => [
      ...prev,
      {
        activity: '',
        sub_activity: '',
        category_of_hazards: '',
        risks: '',
        subOptions: [],
        hazardOptions: [],
        riskOptions: [],
      },
    ]);
  };

  const handleDeleteActivity = (index: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== index));
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

      const requestorName = `${firstName} ${lastName}`.trim();
      if (requestorName) {
        submitData.append('permit[name]', requestorName);
      }
      if (formData.contact_number) {
        submitData.append('permit[contact_number]', formData.contact_number);
      }
      submitData.append('permit[permit_for]', formData.permit_for);

      if (formData.building_id) {
        submitData.append('permit[building_id]', formData.building_id);
      }
      if (formData.floor_id) {
        submitData.append('permit[floor_id]', formData.floor_id);
      }
      if (formData.unit_id) {
        submitData.append('permit[unit_id]', formData.unit_id);
      }

      submitData.append('permit[client_specific]', formData.client_specific);
      if (formData.entity) {
        submitData.append('permit[entity]', formData.entity);
      }
      if (formData.copy_to_string) {
        submitData.append('permit[copy_to_string]', formData.copy_to_string);
      }
      if (formData.permit_type) {
        submitData.append('permit[permit_type]', formData.permit_type);
      }
      if (formData.vendor_id) {
        submitData.append('permit[vendor_id]', formData.vendor_id);
      }
      if (formData.expiry_date_and_time) {
        submitData.append('permit[expiry_date_and_time]', formData.expiry_date_and_time);
      }
      if (formData.comment) {
        submitData.append('permit[comment]', formData.comment);
      }
      if (formData.permit_status) {
        submitData.append('permit[permit_status]', formData.permit_status);
      }
      if (userId) {
        submitData.append('permit[created_by_id]', String(userId));
      }

      activities.forEach((activity) => {
        submitData.append('permit[permit_activities][][activity]', activity.activity);
        submitData.append('permit[permit_activities][][sub_activity]', activity.sub_activity);
        submitData.append(
          'permit[permit_activities][][category_of_hazards]',
          activity.category_of_hazards
        );
        submitData.append('permit[permit_activities][][risks]', activity.risks);
      });

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
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: 'Safety', path: '/safety/incident' },
          { label: 'Permit', path: '/safety/permit' },
          { label: isEdit ? 'Edit Permit' : 'Add Permit' },
        ]}
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <FormSection title="Requestor Details" icon={User}>
          <FormGrid columns={3}>
            <FormInput
              label="Name"
              name="requestor_name"
              value={`${firstName} ${lastName}`.trim()}
              readOnly
            />
            <FormInput label="Site" name="requestor_site" value={siteName} readOnly />
            <FormInput
              label="Contact Number"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="Enter contact number"
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Basic Details" icon={ClipboardList}>
          <FormGrid columns={3}>
            <FormInput
              label="Permit For"
              name="permit_for"
              value={formData.permit_for}
              onChange={handleChange}
              placeholder="Enter Permit For"
              required
            />
            <FormInput
              label="Building"
              name="building_id"
              type="select"
              value={formData.building_id}
              onChange={handleChange}
              options={buildings.map((b) => ({ value: String(b.id), label: b.name }))}
              placeholder="Select Building"
            />
            <FormInput
              label="Floor"
              name="floor_id"
              type="select"
              value={formData.floor_id}
              onChange={handleChange}
              options={floors.map((f) => ({ value: String(f.id), label: f.name }))}
              placeholder="Select Floor"
              disabled={!formData.building_id}
            />
            <FormInput
              label="Unit"
              name="unit_id"
              type="select"
              value={formData.unit_id}
              onChange={handleChange}
              options={units.map((u) => ({ value: String(u.id), label: u.name }))}
              placeholder="Select Unit"
              disabled={!formData.floor_id}
            />
            <div className="flex flex-col">
              <label className="text-sm text-muted-foreground mb-1.5">Client Specific</label>
              <div className="flex items-center gap-6 px-4 py-2.5 border rounded-lg bg-muted/40">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="client_specific"
                    value="internal"
                    checked={formData.client_specific === 'internal'}
                    onChange={(e) => handleClientSpecificChange(e.target.value)}
                  />
                  Internal
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="client_specific"
                    value="client"
                    checked={formData.client_specific === 'client'}
                    onChange={(e) => handleClientSpecificChange(e.target.value)}
                  />
                  Client
                </label>
              </div>
            </div>
            {showEntityList && (
              <FormInput
                label="List of Entity"
                name="entity"
                type="select"
                value={formData.entity}
                onChange={handleChange}
                options={permitEntities.map((entity) => ({
                  value: String(entity.id),
                  label: entity.name || entity.entity_name || `Entity ${entity.id}`,
                }))}
                placeholder="Select Entity"
              />
            )}
            <FormInput
              label="Copy To"
              name="copy_to_string"
              type="select"
              value={formData.copy_to_string}
              onChange={handleChange}
              options={assignedUsers.map((user) => ({
                value: String(user.id),
                label: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
              }))}
              placeholder="Select User"
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Permit Details" icon={FileText}>
          <FormGrid columns={3}>
            <FormInput
              label="Permit Type"
              name="permit_type"
              type="select"
              value={formData.permit_type}
              onChange={handleChange}
              options={permitTypes.map((type) => ({
                value: String(type.id),
                label: type.name,
              }))}
              placeholder="Select Permit Type"
            />
            <FormInput
              label="Vendor"
              name="vendor_id"
              type="select"
              value={formData.vendor_id}
              onChange={handleChange}
              options={vendors.map((vendor) => ({
                value: String(vendor.id),
                label: vendor.vendor_name || vendor.company_name || vendor.name || `Vendor ${vendor.id}`,
              }))}
              placeholder="Select Vendor"
            />
            <FormInput
              label="Expiry Date & Time"
              name="expiry_date_and_time"
              type="datetime-local"
              value={formData.expiry_date_and_time}
              onChange={handleChange}
              placeholder="dd-mm-yyyy --:--"
            />
            <FormInput
              label="Status"
              name="permit_status"
              type="select"
              value={formData.permit_status}
              onChange={handleChange}
              options={STATUS_OPTIONS}
              placeholder="Select Status"
            />
          </FormGrid>

          <div className="mt-4">
            <FormInput
              label="Comment (Optional)"
              name="comment"
              type="textarea"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Enter Comment"
            />
          </div>
        </FormSection>

        <FormSection title="Permit Activities" icon={ClipboardList}>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="border border-border rounded-xl p-4 bg-muted/20">
                <FormGrid columns={2}>
                  <FormInput
                    label="Activity"
                    name={`activity-${index}`}
                    type="select"
                    value={activity.activity}
                    onChange={(e) => handleActivityChange(index, e.target.value)}
                    options={permitActivityOptions.map((act) => ({
                      value: String(act.id),
                      label: act.name,
                    }))}
                    placeholder="Select Activity"
                  />
                  <FormInput
                    label="Sub Activity"
                    name={`sub_activity-${index}`}
                    type="select"
                    value={activity.sub_activity}
                    onChange={(e) => handleSubActivityChange(index, e.target.value)}
                    options={(activity.subOptions || []).map((option) => ({
                      value: String(option.id),
                      label: option.name,
                    }))}
                    placeholder="Select Sub Activity"
                    disabled={!activity.activity}
                  />
                  <FormInput
                    label="Category of Hazards"
                    name={`category_of_hazards-${index}`}
                    type="select"
                    value={activity.category_of_hazards}
                    onChange={(e) => handleHazardChange(index, e.target.value)}
                    options={(activity.hazardOptions || []).map((option) => ({
                      value: String(option.id),
                      label: option.name,
                    }))}
                    placeholder="Select Category of Hazards"
                    disabled={!activity.sub_activity}
                  />
                  <FormInput
                    label="Risks"
                    name={`risks-${index}`}
                    type="select"
                    value={activity.risks}
                    onChange={(e) => handleRiskChange(index, e.target.value)}
                    options={(activity.riskOptions || []).map((option) => ({
                      value: String(option.id),
                      label: option.risk_name || option.name,
                    }))}
                    placeholder="Select Risks"
                    disabled={!activity.category_of_hazards}
                  />
                </FormGrid>

                {activities.length > 1 && (
                  <div className="flex justify-end mt-3">
                    <button
                      type="button"
                      onClick={() => handleDeleteActivity(index)}
                      className="flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddActivity}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground"
            >
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          </div>
        </FormSection>

        <FormSection title="Attachments" icon={FileText}>
          <FileInputBox fieldName="permit_attachments" isMulti />
        </FormSection>

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
  );
};

export default CreatePermit;
