import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  postSoftServices,
  EditSoftServices,
  getSoftServicesDetails,
  getBuildings,
  getFloors,
  getUnits,
  getGenericGroup,
  getGenericSubGroup,
  getPerPageSiteAsset
} from '../../api';
import { 
  Loader2, Save, X, ArrowLeft, CheckCircle, 
  MapPin, Layers, FileText, Paperclip, Plus, Link2, Search, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import Breadcrumb from '../../components/ui/Breadcrumb';
import CategorySelector from '../../components/assets/CategorySelector';
import { assetCategories } from '../../config/assetCategorySchema';

type AssetModalStep = 'category' | 'assets' | 'usage';

// cn utility function
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

interface ServiceFormData {
  name: string;
  building_id: string;
  floor_id: string;
  unit_id: any[];
  group_id: string;
  sub_group_id: string;
  latitude: string;
  longitude: string;
  attachments: File[];
  asset_ids: any[];
}

interface AssetUsageFormState {
  category_label: string;
  usage_type: string;
  availability: string;
  home_location: string;
  expected_usage_hours: string;
  tasked: boolean;
  selected_assets: any[];
  employee_identifier: string;
  task_location: string;
  checkout_date: string;
  checkin_date: string;
  duration: string;
  comment: string;
}

const CreateService: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const fromOverview = location.state?.from === 'soft-services-overview';

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    building_id: '',
    floor_id: '',
    unit_id: [],
    group_id: '',
    sub_group_id: '',
    latitude: '',
    longitude: '',
    attachments: [],
    asset_ids: [],
  });

  const [buildings, setBuildings] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subGroups, setSubGroups] = useState<any[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);

  // Asset Association State
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');
  const [selectedAssetsDetail, setSelectedAssetsDetail] = useState<any[]>([]);
  const [assetModalStep, setAssetModalStep] = useState<AssetModalStep>('category');
  const [assetUsageForm, setAssetUsageForm] = useState<AssetUsageFormState>({
    category_label: '',
    usage_type: '',
    availability: '',
    home_location: '',
    expected_usage_hours: '',
    tasked: false,
    selected_assets: [],
    employee_identifier: '',
    task_location: '',
    checkout_date: '',
    checkin_date: '',
    duration: '',
    comment: '',
  });
  const [usageErrors, setUsageErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchDropdownData();
    if (isEdit && id) {
      fetchServiceDetails(id);
    }
  }, [id, isEdit]);

  // Cleanup selected assets detail when formData.asset_ids changes (if needed)
  // But usually we want to keep them in sync. For now, we trust the manual add/remove.

  const fetchDropdownData = async () => {
    try {
      const [buildingRes, groupsRes] = await Promise.all([
        getBuildings(),
        getGenericGroup(),
      ]);
      setBuildings(buildingRes.data || []);
      setGroups(groupsRes.data || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchServiceDetails = async (serviceId: string) => {
    setLoading(true);
    try {
      const response = await getSoftServicesDetails(serviceId);
      const data = response.data;

      setFormData({
        name: data.name || '',
        building_id: data.building_id?.toString() || '',
        floor_id: data.floor_id?.toString() || '',
        unit_id: Array.isArray(data.unit_id)
          ? data.unit_id.map((id: any) => ({ value: id, label: id }))
          : data.unit_id
            ? [{ value: data.unit_id, label: data.unit_id }]
            : [],
        group_id: data.group_id?.toString() || '',
        sub_group_id: data.sub_group_id?.toString() || '',
        latitude: data.latitude?.toString() || '',
        longitude: data.longitude?.toString() || '',
        attachments: [],
        asset_ids: data.asset_ids || [],
      });

      if (data.building_id) await fetchFloors(data.building_id.toString());
      if (data.floor_id) await fetchUnits(data.floor_id.toString());
      if (data.group_id) await fetchSubGroups(data.group_id.toString());

      setExistingAttachments(data.attachments || []);
      // If the API returns asset details, we should populate selectedAssetsDetail here
      // For now assuming data.assets is available, else we might just show IDs
      if (data.assets) {
         setSelectedAssetsDetail(data.assets);
      }
      
    } catch (error) {
      toast.error('Failed to fetch service details');
      navigate(fromOverview ? '/soft-services/overview' : '/soft-services');
    } finally {
      setLoading(false);
    }
  };

  const fetchFloors = async (buildingId: string) => {
    try {
      const response = await getFloors(buildingId);
      setFloors(response.data || []);
    } catch (error) { console.error('Error fetching floors:', error); }
  };

  const fetchUnits = async (floorId: string) => {
    try {
      const response = await getUnits(floorId);
      const unitList = (response.data || []).map((u: any) => ({
        value: u.id,
        label: u.name || u.unit_name
      }));
      setUnits(unitList);
    } catch (error) { console.error('Error fetching units:', error); }
  };

  const fetchSubGroups = async (groupId: string) => {
    try {
      const response = await getGenericSubGroup(groupId);
      setSubGroups(response.data || []);
    } catch (error) { console.error('Error fetching sub-groups:', error); }
  };

  const fetchAssetsForCategory = async (categoryId: string) => {
    setLoadingAssets(true);
    try {
      // Build filter string
      let filter = `&q[category_eq]=${categoryId}`; // Assuming backend supports this or similar
      if (formData.building_id) filter += `&q[building_id_eq]=${formData.building_id}`;
      if (formData.floor_id) filter += `&q[floor_id_eq]=${formData.floor_id}`;
      // Note: Adjust api method if 'category' isn't a direct field or needs mapping
      
      const response = await getPerPageSiteAsset(1, 50, assetSearch, filter); 
      setAvailableAssets(response.data || []);
    } catch (error) {
      console.error("Error fetching assets", error);
      toast.error("Failed to load assets");
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    if (selectedCategory && showAssetModal && assetModalStep !== 'usage') {
      fetchAssetsForCategory(selectedCategory);
    }
  }, [selectedCategory, showAssetModal, formData.building_id, formData.floor_id, assetModalStep]);

  const handleBuildingChange = async (value: string) => {
    setFormData(prev => ({ ...prev, building_id: value, floor_id: '', unit_id: [] }));
    setFloors([]);
    setUnits([]);
    if (value) await fetchFloors(value);
  };

  const handleFloorChange = async (value: string) => {
    setFormData(prev => ({ ...prev, floor_id: value, unit_id: [] }));
    setUnits([]);
    if (value) await fetchUnits(value);
  };

  const handleGroupChange = async (value: string) => {
    setFormData(prev => ({ ...prev, group_id: value, sub_group_id: '' }));
    setSubGroups([]);
    if (value) await fetchSubGroups(value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files!)],
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const toggleAssetSelection = (asset: any) => {
    const isSelected = selectedAssetsDetail.some(a => a.id === asset.id);
    if (isSelected) {
      setSelectedAssetsDetail(prev => prev.filter(a => a.id !== asset.id));
      setFormData(prev => ({ ...prev, asset_ids: prev.asset_ids.filter(id => id !== asset.id) }));
      setAssetUsageForm(prev => ({
        ...prev,
        selected_assets: prev.selected_assets.filter((a) => a.id !== asset.id),
      }));
    } else {
      setSelectedAssetsDetail(prev => [...prev, asset]);
      setFormData(prev => ({ ...prev, asset_ids: [...prev.asset_ids, asset.id] }));
      setAssetUsageForm(prev => ({
        ...prev,
        selected_assets: [...prev.selected_assets, asset],
      }));
    }
  };

  const resetAssetModalState = () => {
    setSelectedCategory(undefined);
    setAssetModalStep('category');
    setAssetSearch('');
    setAssetUsageForm({
      category_label: '',
      usage_type: '',
      availability: '',
      home_location: '',
      expected_usage_hours: '',
      tasked: false,
      selected_assets: [],
      employee_identifier: '',
      task_location: '',
      checkout_date: '',
      checkin_date: '',
      duration: '',
      comment: '',
    });
    setUsageErrors({});
  };

  const handleUsageFieldChange = (field: keyof AssetUsageFormState, value: string | boolean | any[]) => {
    setAssetUsageForm(prev => {
      const next = { ...prev, [field]: value } as AssetUsageFormState;
      if (field === 'checkout_date' || field === 'checkin_date') {
        const start = field === 'checkout_date' ? (value as string) : prev.checkout_date;
        const end = field === 'checkin_date' ? (value as string) : prev.checkin_date;
        if (start && end) {
          const durationMs = new Date(end).getTime() - new Date(start).getTime();
          if (!Number.isNaN(durationMs) && durationMs > 0) {
            const hours = (durationMs / (1000 * 60 * 60)).toFixed(2);
            next.duration = `${hours} hrs`;
          } else {
            next.duration = '';
          }
        } else {
          next.duration = '';
        }
      }
      return next;
    });
    setUsageErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleUsageSubmit = () => {
    const errors: { [key: string]: string } = {};
    if (!assetUsageForm.selected_assets.length) errors.selected_assets = 'Select at least one asset';
    if (!assetUsageForm.employee_identifier) errors.employee_identifier = 'Required';
    if (!assetUsageForm.task_location) errors.task_location = 'Required';
    if (!assetUsageForm.usage_type) errors.usage_type = 'Required';
    if (!assetUsageForm.availability) errors.availability = 'Required';
    setUsageErrors(errors);
    if (Object.keys(errors).length) return;

    toast.success('Asset usage saved and assets linked');
    setShowAssetModal(false);
    resetAssetModalState();
  };

  const handleAddAssetNavigate = () => {
    // Adjust the route if your app uses a different path for the new asset form
    navigate('/assets/new');
    resetAssetModalState();
    setShowAssetModal(false);
  };

  const handleSubmit = async (showDetails = false) => {
    if (!formData.name || !formData.building_id || !formData.floor_id) {
      toast.error('Service name, building, and floor are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      const siteId = localStorage.getItem("SITEID") || localStorage.getItem("siteId") || "";
      const userId = localStorage.getItem("UserId") || localStorage.getItem("USER_ID") || "";

      payload.append("soft_service[site_id]", siteId);
      payload.append("soft_service[user_id]", userId);
      payload.append("soft_service[name]", formData.name);

      if (formData.building_id) payload.append("soft_service[building_id]", formData.building_id);
      if (formData.floor_id) payload.append("soft_service[floor_id]", formData.floor_id);

      if (formData.unit_id && Array.isArray(formData.unit_id)) {
        formData.unit_id.forEach((unit: any) => {
          payload.append("soft_service[unit_id][]", unit.value || unit);
        });
      }

      if (formData.group_id) payload.append("soft_service[group_id]", formData.group_id);
      if (formData.sub_group_id) payload.append("soft_service[sub_group_id]", formData.sub_group_id);
      if (formData.latitude) payload.append("soft_service[latitude]", formData.latitude);
      if (formData.longitude) payload.append("soft_service[longitude]", formData.longitude);

      // Assets
      formData.asset_ids.forEach((id) => {
        payload.append("soft_service[asset_ids][]", id);
      });

      // Attachments
      formData.attachments.forEach((file) => {
        payload.append("attachments[]", file);
      });

      if (isEdit && id) {
        await EditSoftServices(payload, id);
        toast.success('Service updated successfully');
      } else {
        const response = await postSoftServices(payload);
        toast.success('Service created successfully');
      }
      
      navigate(fromOverview ? '/soft-services/overview' : '/soft-services');

    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(isEdit ? 'Failed to update service' : 'Failed to create service');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading service details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-4">
                <div className="flex items-center justify-between">
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
                    <h1 className="text-lg font-bold text-foreground">{isEdit ? 'Edit Service' : 'Create New Service'}</h1>
                    <Breadcrumb 
                        items={[
                        fromOverview
                          ? { label: 'Overview', path: '/soft-services/overview' }
                          : { label: 'Soft Services', path: '/soft-services' }, 
                        { label: isEdit ? 'Edit' : 'Create' }
                        ]} 
                    />
                  </div>
                </div>
            <div className="flex items-center gap-3">
               <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit()}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Service
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-6 max-w-[1600px] mx-auto"
      >
        
        {/* Left Column - Core Info */}
        <div className="md:col-span-8 space-y-6">
            {/* General Information Card */}
            <motion.div variants={item} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Service Information</h2>
                        <p className="text-sm text-muted-foreground">Basic details about the service</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Service Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}
                            className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            placeholder="e.g. Daily Cleaning, HVAC Maintenance"
                        />
                    </div>
                </div>
            </motion.div>

             {/* Location Details Card */}
             <motion.div variants={item} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                        <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Location Details</h2>
                        <p className="text-sm text-muted-foreground">Where is this service performed?</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Building *</label>
                        <select
                            value={formData.building_id}
                            onChange={(e) => handleBuildingChange(e.target.value)}
                            className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        >
                            <option value="">Select Building</option>
                            {buildings.map((b) => (
                                <option key={b.id} value={b.id}>{b.name || b.building_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Floor *</label>
                        <select
                            value={formData.floor_id}
                            onChange={(e) => handleFloorChange(e.target.value)}
                            className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            disabled={!formData.building_id}
                        >
                            <option value="">Select Floor</option>
                            {floors.map((f) => (
                                <option key={f.id} value={f.id}>{f.name || f.floor_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">Units</label>
                         <Select
                            isMulti
                            closeMenuOnSelect={false}
                            value={formData.unit_id}
                            onChange={(selected) => setFormData(prev => ({ ...prev, unit_id: selected || [] }))}
                            options={units}
                            placeholder="Select Units"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isDisabled={!formData.floor_id}
                            noOptionsMessage={() => "No Units Available"}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '0.5rem',
                                    padding: '2px',
                                    backgroundColor: 'hsl(var(--background))',
                                }),
                                menu: (base) => ({
                                    ...base,
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'transparent',
                                    color: 'hsl(var(--foreground))',
                                })
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Latitude</label>
                        <input
                            type="text"
                            value={formData.latitude}
                            onChange={(e) => setFormData(p => ({...p, latitude: e.target.value}))}
                            className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            placeholder="e.g. 12.9716"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Longitude</label>
                        <input
                            type="text"
                            value={formData.longitude}
                            onChange={(e) => setFormData(p => ({...p, longitude: e.target.value}))}
                            className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            placeholder="e.g. 77.5946"
                        />
                    </div>
                </div>
            </motion.div>

        </div>

        {/* Right Column - Classification & Extras */}
        <div className="md:col-span-4 space-y-6">
            
            {/* Classification Card */}
            <motion.div variants={item} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                        <Layers className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Classification</h2>
                        <p className="text-sm text-muted-foreground">Categorize this service</p>
                    </div>
                </div>

                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Group</label>
                        <select
                            value={formData.group_id}
                            onChange={(e) => handleGroupChange(e.target.value)}
                            className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        >
                            <option value="">Select Group</option>
                            {groups.filter(g => !g.parent_id).map((g) => (
                                <option key={g.id} value={g.id}>{g.name || g.info_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Sub-Group</label>
                        <select
                            value={formData.sub_group_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, sub_group_id: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            disabled={!formData.group_id}
                        >
                            <option value="">Select Sub-Group</option>
                            {subGroups.map((g) => (
                                <option key={g.id} value={g.id}>{g.name || g.info_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </motion.div>

             {/* Asset Association Card */}
             <motion.div variants={item} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
                            <Link2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Associate Assets</h2>
                            <p className="text-sm text-muted-foreground">{selectedAssetsDetail.length} assets linked</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                          resetAssetModalState();
                          setShowAssetModal(true);
                        }}
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-primary"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </div>

                {selectedAssetsDetail.length > 0 ? (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                        {selectedAssetsDetail.map((asset) => (
                            <div key={asset.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg group hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-200">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{asset.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{asset.asset_number || '#' + asset.id}</p>
                                </div>
                                <button 
                                    onClick={() => toggleAssetSelection(asset)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 border-2 border-dashed border-border rounded-xl bg-muted/20">
                        <p className="text-sm text-muted-foreground">No assets linked</p>
                        <button 
                            onClick={() => {
                              resetAssetModalState();
                              setShowAssetModal(true);
                            }}
                            className="text-sm text-primary font-medium hover:underline mt-1"
                        >
                            Link an asset
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Attachments Card */}
             <motion.div variants={item} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center">
                        <Paperclip className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Attachments</h2>
                        <p className="text-sm text-muted-foreground">Photos or docs</p>
                    </div>
                </div>

                <div className="space-y-3">
                     <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Plus className="h-6 w-6 text-muted-foreground mb-1" />
                            <p className="text-xs text-muted-foreground">Click to upload</p>
                        </div>
                        <input type="file" multiple onChange={handleFileChange} className="hidden" />
                    </label>

                    {(formData.attachments.length > 0 || existingAttachments.length > 0) && (
                        <div className="space-y-2">
                             {existingAttachments.map((att, idx) => (
                                <div key={`ex-${idx}`} className="flex items-center justify-between p-2 bg-muted/40 rounded-lg">
                                    <span className="text-xs truncate max-w-[150px]">{att.name || att.filename || `Attachment ${idx+1}`}</span>
                                </div>
                             ))}
                             {formData.attachments.map((file, idx) => (
                                <div key={`new-${idx}`} className="flex items-center justify-between p-2 bg-muted/40 rounded-lg">
                                    <span className="text-xs truncate max-w-[150px]">{file.name}</span>
                                    <button onClick={() => removeAttachment(idx)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                             ))}
                        </div>
                    )}
                </div>
            </motion.div>

        </div>
      </motion.div>

      {/* Asset Selection Modal */}
      <AnimatePresence>
        {showAssetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-background rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
             >
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">
                          {assetModalStep === 'category' && 'Select Category'}
                          {assetModalStep === 'assets' && 'Select Assets'}
                          {assetModalStep === 'usage' && 'Asset Usage & Association'}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {assetModalStep === 'category' && 'Choose a category to narrow assets'}
                          {assetModalStep === 'assets' && 'Choose assets to associate with this service'}
                          {assetModalStep === 'usage' && 'Capture usage details and link assets'}
                        </p>
                    </div>
                    <button onClick={() => { setShowAssetModal(false); resetAssetModalState(); }} className="p-2 hover:bg-muted rounded-full">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {assetModalStep === 'category' && (
                      <CategorySelector 
                        categories={assetCategories}
                        onSelect={(id) => {
                          setSelectedCategory(id);
                          const label = assetCategories.find(c => c.id === id)?.label || '';
                          setAssetUsageForm(prev => ({ ...prev, category_label: label }));
                          setAssetModalStep('assets');
                        }}
                      />
                    )}
                    {assetModalStep === 'assets' && selectedCategory && (
                      <div className="space-y-6">
                          <div className="flex items-center gap-4">
                              <button 
                                  onClick={() => {
                                    setAssetModalStep('category');
                                    setSelectedCategory(undefined);
                                    setAvailableAssets([]);
                                  }} 
                                  className="text-sm text-primary hover:underline flex items-center gap-1"
                              >
                                  <ArrowLeft className="h-3 w-3" /> Change Category
                              </button>
                              <div className="h-4 w-px bg-border"/>
                              <span className="text-sm font-semibold">{assetCategories.find(c => c.id === selectedCategory)?.label}</span>
                          </div>
                          
                          {/* Search */}
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <input 
                                  type="text" 
                                  placeholder="Search assets..." 
                                  value={assetSearch}
                                  onChange={(e) => setAssetSearch(e.target.value)}
                                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg"
                              />
                          </div>

                          {/* Asset List */}
                          {loadingAssets ? (
                              <div className="py-10 flex justify-center"><Loader2 className="animate-spin" /></div>
                          ) : availableAssets.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {availableAssets.map(asset => {
                                      const isSelected = selectedAssetsDetail.some(a => a.id === asset.id);
                                      return (
                                          <div 
                                              key={asset.id} 
                                              onClick={() => toggleAssetSelection(asset)}
                                              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                                  isSelected 
                                                  ? 'border-primary bg-primary/5 shadow-sm' 
                                                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                              }`}
                                          >
                                              <div className="flex justify-between items-start">
                                                  <div>
                                                      <p className="font-semibold text-sm">{asset.name}</p>
                                                      <p className="text-xs text-muted-foreground mt-1">{asset.asset_number}</p>
                                                      <div className="flex gap-2 mt-2">
                                                          <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full border border-border">
                                                              {asset.building_name}
                                                          </span>
                                                           <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full border border-border">
                                                              {asset.floor_name}
                                                           </span>
                                                      </div>
                                                  </div>
                                                  {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          ) : (
                              <div className="text-center py-10 text-muted-foreground">
                                  No assets found in this category
                              </div>
                          )}

                      </div>
                    )}
                    {assetModalStep === 'usage' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold px-3 py-1 bg-muted rounded-full border border-border">{assetUsageForm.category_label || 'Category'}</span>
                          <span className="text-xs text-muted-foreground">{assetUsageForm.selected_assets.length} assets selected</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground flex items-center justify-between mb-1">
                              <span>Usage Type *</span>
                              {usageErrors.usage_type && <span className="text-xs text-destructive">{usageErrors.usage_type}</span>}
                            </label>
                            <select
                              value={assetUsageForm.usage_type}
                              onChange={(e) => handleUsageFieldChange('usage_type', e.target.value)}
                              className="w-full px-4 py-2.5 border border-border rounded-lg bg-background"
                            >
                              <option value="">Select</option>
                              <option value="hourly">Hourly</option>
                              <option value="daily">Daily</option>
                              <option value="task-based">Task-based</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground flex items-center justify-between mb-1">
                              <span>Availability *</span>
                              {usageErrors.availability && <span className="text-xs text-destructive">{usageErrors.availability}</span>}
                            </label>
                            <select
                              value={assetUsageForm.availability}
                              onChange={(e) => handleUsageFieldChange('availability', e.target.value)}
                              className="w-full px-4 py-2.5 border border-border rounded-lg bg-background"
                            >
                              <option value="">Select</option>
                              <option value="available">Available</option>
                              <option value="unavailable">Unavailable</option>
                              <option value="maintenance">Under Maintenance</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1">Home Location / Storage</label>
                            <input
                              type="text"
                              value={assetUsageForm.home_location}
                              onChange={(e) => handleUsageFieldChange('home_location', e.target.value)}
                              className="w-full px-4 py-2.5 border border-border rounded-lg bg-background"
                              placeholder="e.g. Basement Storage"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1">Expected Usage (hrs)</label>
                            <input
                              type="number"
                              min="0"
                              value={assetUsageForm.expected_usage_hours}
                              onChange={(e) => handleUsageFieldChange('expected_usage_hours', e.target.value)}
                              className="w-full px-4 py-2.5 border border-border rounded-lg bg-background"
                              placeholder="e.g. 4"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1">Tasked</label>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleUsageFieldChange('tasked', true)}
                                className={cn(
                                  'px-4 py-2 rounded-lg border',
                                  assetUsageForm.tasked ? 'bg-primary text-primary-foreground border-primary' : 'border-border'
                                )}
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUsageFieldChange('tasked', false)}
                                className={cn(
                                  'px-4 py-2 rounded-lg border',
                                  !assetUsageForm.tasked ? 'bg-primary text-primary-foreground border-primary' : 'border-border'
                                )}
                              >
                                No
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground flex items-center justify-between mb-1">
                              <span>Select Assets *</span>
                              {usageErrors.selected_assets && <span className="text-xs text-destructive">{usageErrors.selected_assets}</span>}
                            </label>
                            <div className="space-y-2 max-h-28 overflow-y-auto border border-border rounded-lg p-3 bg-muted/30">
                              {assetUsageForm.selected_assets.map((asset) => (
                                <div key={asset.id} className="text-xs flex items-center justify-between">
                                  <span className="truncate">{asset.name || `#${asset.id}`}</span>
                                  <button
                                    className="text-destructive text-[10px] underline"
                                    onClick={() => toggleAssetSelection(asset)}
                                  >
                                    remove
                                  </button>
                                </div>
                              ))}
                              {!assetUsageForm.selected_assets.length && (
                                <p className="text-xs text-muted-foreground">Select assets first</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground flex items-center justify-between mb-1">
                              <span>Employee Name / ID *</span>
                              {usageErrors.employee_identifier && <span className="text-xs text-destructive">{usageErrors.employee_identifier}</span>}
                            </label>
                            <input
                              type="text"
                              value={assetUsageForm.employee_identifier}
                              onChange={(e) => handleUsageFieldChange('employee_identifier', e.target.value)}
                              className="w-full px-4 py-2.5 border border-border rounded-lg bg-background"
                              placeholder="e.g. Jane Doe / EMP-123"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground flex items-center justify-between mb-1">
                              <span>Task Location *</span>
                              {usageErrors.task_location && <span className="text-xs text-destructive">{usageErrors.task_location}</span>}
                            </label>
                            <input
                              type="text"
                              value={assetUsageForm.task_location}
                              onChange={(e) => handleUsageFieldChange('task_location', e.target.value)}
                              className="w-full px-4 py-2.5 border border-border rounded-lg bg-background"
                              placeholder="e.g. Lobby, Floor 1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1">Checkout date (start)</label>
                            <input
                              type="datetime-local"
                              value={assetUsageForm.checkout_date}
                              onChange={(e) => handleUsageFieldChange('checkout_date', e.target.value)}
                              className="w-full px-4 py-2.5 border border-border rounded-lg bg-background"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1">Checkin date (end)</label>
                            <input
                              type="datetime-local"
                              value={assetUsageForm.checkin_date}
                              onChange={(e) => handleUsageFieldChange('checkin_date', e.target.value)}
                              className="w-full px-4 py-2.5 border border-border rounded-lg bg-background"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1">Duration</label>
                            <input
                              type="text"
                              value={assetUsageForm.duration}
                              readOnly
                              className="w-full px-4 py-2.5 border border-border rounded-lg bg-muted/50 text-muted-foreground"
                              placeholder="Auto-calculated"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-foreground mb-1">Comment</label>
                            <textarea
                              value={assetUsageForm.comment}
                              onChange={(e) => handleUsageFieldChange('comment', e.target.value)}
                              className="w-full px-4 py-2.5 border border-border rounded-lg bg-background"
                              rows={3}
                              placeholder="Notes about usage"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                <div className="p-4 border-t border-border flex justify-between items-center">
                    <button 
                      onClick={handleAddAssetNavigate}
                      className="text-sm text-primary font-medium hover:underline flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> Add Asset
                    </button>
                    <div className="flex items-center gap-3">
                      {assetModalStep === 'assets' && (
                        <button
                          onClick={() => setAssetModalStep('category')}
                          className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted"
                        >
                          Back
                        </button>
                      )}
                      {assetModalStep === 'usage' && (
                        <button
                          onClick={() => setAssetModalStep('assets')}
                          className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted"
                        >
                          Back to Assets
                        </button>
                      )}
                      {assetModalStep === 'assets' && (
                        <button 
                          onClick={() => {
                            setAssetUsageForm(prev => ({ ...prev, selected_assets: selectedAssetsDetail }));
                            setAssetModalStep('usage');
                          }}
                          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                        >
                          Next: Usage Form
                        </button>
                      )}
                      {assetModalStep === 'category' && (
                        <button
                          onClick={() => setShowAssetModal(false)}
                          className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted"
                        >
                          Close
                        </button>
                      )}
                      {assetModalStep === 'usage' && (
                        <button 
                          onClick={handleUsageSubmit}
                          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                        >
                          Save Usage & Link
                        </button>
                      )}
                    </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateService;
