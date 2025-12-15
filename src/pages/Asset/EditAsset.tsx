import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Settings, MapPin, Package, Calendar, FileText, Shield, Plus, X, Loader2 } from "lucide-react";
import FormSection from "../../components/ui/FormSection";
import FormInput from "../../components/ui/FormInput";
import FormGrid from "../../components/ui/FormGrid";
import FormToggle from "../../components/ui/FormToggle";
import Button from "@/components/ui/Button";
import PageTitle from "../../components/ui/PageTitle";
import { getItemInLocalStorage } from "../../utils/localStorage";
import { assetService } from "../../services/asset.service";
import {
  getAssetGroups,
  getAssetSubGroups,
  getFloors,
  getParentAsset,
  getUnits,
  getVendors,
  editSiteAsset,
  getSiteAssetDetails,
} from "../../api";

const EditAsset: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const storedBuildings = getItemInLocalStorage("Building");
  const buildings = Array.isArray(storedBuildings) ? storedBuildings : [];
  const themeColor = useSelector((state: any) => state.theme.color);

  const [loading, setLoading] = useState(true);
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [assetGroups, setAssetGroup] = useState<any[]>([]);
  const [assetSubGoups, setAssetSubGroups] = useState<any[]>([]);
  const [parentAsset, setParentAsset] = useState<any[]>([]);
  const [consumptionData, setConsumptionData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    site_id: getItemInLocalStorage("SITEID") || "",
    building_id: "",
    floor_id: "",
    unit_id: "",
    name: "",
    oem_name: "",
    latitude: "",
    longitude: "",
    asset_number: "",
    equipment_id: "",
    serial_number: "",
    model_number: "",
    purchased_on: "",
    purchase_cost: "",
    comprehensive: "",
    asset_group_id: "",
    asset_sub_group_id: "",
    parent_asset_id: "",
    installation: "",
    warranty_expiry: "",
    warranty_start: "",
    critical: false,
    capacity: "",
    breakdown: false,
    is_meter: false,
    asset_type: "",
    vendor_id: "",
    unit: "",
    invoice: [] as File[],
    insurance: [] as File[],
    manuals: [] as File[],
    others: [] as File[],
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [vendorResp, assetGroupResp] = await Promise.all([
          getVendors(),
          getAssetGroups()
        ]);
        setVendors(vendorResp.data || []);
        setAssetGroup(assetGroupResp.data || []);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchAssetDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getSiteAssetDetails(id);
        const data = res.data;
        
        // Fetch related data based on the asset
        if (data.building_id) {
          const floorResp = await getFloors(Number(data.building_id));
          setFloors(floorResp.data?.map((item: any) => ({ name: item.name, id: item.id })) || []);
        }
        if (data.floor_id) {
          const unitResp = await getUnits(Number(data.floor_id));
          setUnits(unitResp.data?.map((item: any) => ({ name: item.name, id: item.id })) || []);
        }
        if (data.asset_group_id) {
          const [subGroupResp, parentAssetResp] = await Promise.all([
            getAssetSubGroups(Number(data.asset_group_id)),
            getParentAsset(Number(data.asset_group_id))
          ]);
          setAssetSubGroups(subGroupResp?.map((item: any) => ({ name: item.name, id: item.id })) || []);
          setParentAsset(parentAssetResp.data?.site_assets || []);
        }

        // Format dates for input fields
        const formatDateForInput = (dateStr: string) => {
          if (!dateStr) return "";
          const date = new Date(dateStr);
          return date.toISOString().split('T')[0];
        };

        setFormData({
          site_id: data.site_id || getItemInLocalStorage("SITEID") || "",
          building_id: String(data.building_id || ""),
          floor_id: String(data.floor_id || ""),
          unit_id: String(data.unit_id || ""),
          name: data.name || "",
          oem_name: data.oem_name || "",
          latitude: data.latitude || "",
          longitude: data.longitude || "",
          asset_number: data.asset_number || "",
          equipment_id: data.equipment_id || data.equipemnt_id || "",
          serial_number: data.serial_number || "",
          model_number: data.model_number || "",
          purchased_on: formatDateForInput(data.purchased_on || data.purchase_date),
          purchase_cost: String(data.purchase_cost || ""),
          comprehensive: data.comprehensive || "",
          asset_group_id: String(data.asset_group_id || ""),
          asset_sub_group_id: String(data.asset_sub_group_id || ""),
          parent_asset_id: String(data.parent_asset_id || ""),
          installation: formatDateForInput(data.installation),
          warranty_expiry: formatDateForInput(data.warranty_expiry),
          warranty_start: formatDateForInput(data.warranty_start),
          critical: data.critical || false,
          capacity: data.capacity || "",
          breakdown: data.breakdown || false,
          is_meter: data.is_meter || false,
          asset_type: data.asset_type || "",
          vendor_id: String(data.vendor_id || ""),
          unit: data.uom || "",
          invoice: [],
          insurance: [],
          manuals: [],
          others: [],
        });

        // Load existing consumption data (asset_params)
        if (data.asset_params && Array.isArray(data.asset_params)) {
          setConsumptionData(data.asset_params.map((param: any) => ({
            id: param.id,
            name: param.name || "",
            order: param.order || "",
            unit_type: param.unit_type || "",
            digit: param.digit || "",
            alert_below: param.alert_below || "",
            alert_above: param.alert_above || "",
            min_val: param.min_val || "",
            max_val: param.max_val || "",
            multiplier_factor: param.multiplier_factor || "",
            dashboard_view: param.dashboard_view || false,
            consumption_view: param.consumption_view || false,
            check_prev: param.check_prev || false,
          })));
        }
      } catch (error) {
        console.error("Error fetching asset details:", error);
        toast.error("Failed to load asset details");
        navigate('/asset');
      } finally {
        setLoading(false);
      }
    };
    fetchAssetDetails();
  }, [id, navigate]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "building_id") {
      const BuildID = Number(value);
      try {
        const build = await getFloors(BuildID);
        setFloors(build.data?.map((item: any) => ({ name: item.name, id: item.id })) || []);
      } catch (e) {
        console.log(e);
      }
      setFormData(prev => ({ ...prev, building_id: value, floor_id: "", unit_id: "" }));
    } else if (name === "floor_id") {
      const floorId = Number(value);
      try {
        const unit = await getUnits(floorId);
        setUnits(unit.data?.map((item: any) => ({ name: item.name, id: item.id })) || []);
      } catch (error) {
        console.log(error);
      }
      setFormData(prev => ({ ...prev, floor_id: value, unit_id: "" }));
    } else if (name === "asset_group_id") {
      const groupId = Number(value);
      try {
        const [subGroupResp, parentAssetResp] = await Promise.all([
          getAssetSubGroups(groupId),
          getParentAsset(groupId)
        ]);
        setAssetSubGroups(subGroupResp?.map((item: any) => ({ name: item.name, id: item.id })) || []);
        setParentAsset(parentAssetResp.data?.site_assets || []);
      } catch (error) {
        console.log(error);
      }
      setFormData(prev => ({ ...prev, asset_group_id: value, asset_sub_group_id: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleChange = (field: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (files: FileList | null, fieldName: string) => {
    if (files) {
      setFormData(prev => ({ ...prev, [fieldName]: Array.from(files) }));
    }
  };

  const handleAddConsumption = () => {
    setConsumptionData(prev => [
      ...prev,
      {
        name: "",
        order: "",
        unit_type: "",
        digit: "",
        alert_below: "",
        alert_above: "",
        min_val: "",
        max_val: "",
        multiplier_factor: "",
        dashboard_view: false,
        consumption_view: false,
        check_prev: false,
      },
    ]);
  };

  const handleRemoveConsumption = (index: number) => {
    setConsumptionData(prev => prev.filter((_, i) => i !== index));
  };

  const handleConsumptionChange = (index: number, field: string, value: any) => {
    setConsumptionData(prev =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async () => {
    // Validations
    if (!formData.building_id) return toast.error("Please Select Building Name");
    if (!formData.name) return toast.error("Please Enter Asset Name");
    if (!formData.oem_name) return toast.error("Please Enter OEM Name");
    if (!formData.asset_number) return toast.error("Please Enter Asset Number");
    if (!formData.equipment_id) return toast.error("Please Enter Equipment ID");
    if (!formData.purchase_cost) return toast.error("Please Enter Purchase Cost");
    if (!formData.asset_group_id) return toast.error("Please Select Group");
    if (!formData.asset_sub_group_id) return toast.error("Please Select Sub Group");

    if (formData.warranty_start && formData.warranty_expiry && formData.warranty_start >= formData.warranty_expiry) {
      return toast.error("Warranty Start Date must be before Expiry Date.");
    }

    if (formData.warranty_start && formData.purchased_on && formData.warranty_start < formData.purchased_on) {
      return toast.error("Warranty Start Date must be after or equal to Purchase Date.");
    }

    if (formData.installation && formData.purchased_on && formData.installation < formData.purchased_on) {
      return toast.error("Installation Date must be after or equal to Purchase Date.");
    }

    setIsSubmitting(true);
    try {
      toast.loading("Updating Asset Please Wait!");
      const formDataSend = new FormData();

      // Append all form fields
      formDataSend.append("site_asset[site_id]", formData.site_id);
      formDataSend.append("site_asset[building_id]", formData.building_id);
      formDataSend.append("site_asset[floor_id]", formData.floor_id);
      formDataSend.append("site_asset[unit_id]", formData.unit_id);
      formDataSend.append("site_asset[name]", formData.name);
      formDataSend.append("site_asset[oem_name]", formData.oem_name);
      formDataSend.append("site_asset[latitude]", formData.latitude);
      formDataSend.append("site_asset[longitude]", formData.longitude);
      formDataSend.append("site_asset[asset_number]", formData.asset_number);
      formDataSend.append("site_asset[equipemnt_id]", formData.equipment_id);
      formDataSend.append("site_asset[serial_number]", formData.serial_number);
      formDataSend.append("site_asset[model_number]", formData.model_number);
      formDataSend.append("site_asset[purchased_on]", formData.purchased_on);
      formDataSend.append("site_asset[purchase_cost]", formData.purchase_cost);
      formDataSend.append("site_asset[comprehensive]", formData.comprehensive);
      formDataSend.append("site_asset[asset_group_id]", formData.asset_group_id);
      formDataSend.append("site_asset[asset_sub_group_id]", formData.asset_sub_group_id);
      formDataSend.append("site_asset[parent_asset_id]", formData.parent_asset_id);
      formDataSend.append("site_asset[installation]", formData.installation);
      formDataSend.append("site_asset[warranty_expiry]", formData.warranty_expiry);
      formDataSend.append("site_asset[warranty_start]", formData.warranty_start);
      formDataSend.append("site_asset[critical]", String(formData.critical));
      formDataSend.append("site_asset[capacity]", formData.capacity);
      formDataSend.append("site_asset[breakdown]", String(formData.breakdown));
      formDataSend.append("site_asset[is_meter]", String(formData.is_meter));
      formDataSend.append("site_asset[asset_type]", formData.asset_type);
      formDataSend.append("site_asset[vendor_id]", formData.vendor_id);
      formDataSend.append("site_asset[uom]", formData.unit);

      // Consumption data
      consumptionData.forEach((item) => {
        if (item.id) {
          formDataSend.append("asset_params[][id]", item.id);
        }
        formDataSend.append("asset_params[][name]", item.name);
        formDataSend.append("asset_params[][order]", item.order);
        formDataSend.append("asset_params[][unit_type]", item.unit_type);
        formDataSend.append("asset_params[][digit]", item.digit);
        formDataSend.append("asset_params[][alert_below]", item.alert_below);
        formDataSend.append("asset_params[][alert_above]", item.alert_above);
        formDataSend.append("asset_params[][min_val]", item.min_val);
        formDataSend.append("asset_params[][max_val]", item.max_val);
        formDataSend.append("asset_params[][multiplier_factor]", item.multiplier_factor);
        formDataSend.append("asset_params[][dashboard_view]", String(item.dashboard_view));
        formDataSend.append("asset_params[][consumption_view]", String(item.consumption_view));
        formDataSend.append("asset_params[][check_prev]", String(item.check_prev));
      });

      // Files
      formData.invoice.forEach((file) => formDataSend.append("purchase_invoices[]", file));
      formData.insurance.forEach((file) => formDataSend.append("insurances[]", file));
      formData.manuals.forEach((file) => formDataSend.append("manuals[]", file));
      formData.others.forEach((file) => formDataSend.append("other_files[]", file));

      await editSiteAsset(id!, formDataSend);
      toast.dismiss();
      toast.success("Asset Updated Successfully");
      navigate(`/asset/${id}`);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to update asset");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildingOptions = buildings.map((b: any) => ({ value: String(b.id), label: b.name }));
  const floorOptions = floors.map((f: any) => ({ value: String(f.id), label: f.name }));
  const unitOptions = units.map((u: any) => ({ value: String(u.id), label: u.name }));
  const groupOptions = assetGroups.map((g: any) => ({ value: String(g.id), label: g.name }));
  const subGroupOptions = assetSubGoups.map((s: any) => ({ value: String(s.id), label: s.name }));
  const parentOptions = parentAsset.map((p: any) => ({ value: String(p.id), label: p.name }));
  const vendorOptions = vendors.map((v: any) => ({ value: String(v.id), label: v.name || v.vendor_name }));

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading asset details...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageTitle 
        title="Edit Asset" 
        breadcrumbs={[
          { label: 'Asset', path: '/asset' }, 
          { label: formData.name || `Asset #${id}`, path: `/asset/${id}` },
          { label: 'Edit' }
        ]} 
      />
      
      <div className="space-y-6">
        {/* Location Details */}
        <FormSection title="Location Details" icon={MapPin}>
          <FormGrid columns={3}>
            <FormInput
              label="Building"
              name="building_id"
              type="select"
              value={formData.building_id}
              onChange={handleChange}
              options={buildingOptions}
              required
              placeholder="Select Building"
            />
            <FormInput
              label="Floor"
              name="floor_id"
              type="select"
              value={formData.floor_id}
              onChange={handleChange}
              options={floorOptions}
              placeholder="Select Floor"
            />
            <FormInput
              label="Unit"
              name="unit_id"
              type="select"
              value={formData.unit_id}
              onChange={handleChange}
              options={unitOptions}
              placeholder="Select Unit"
            />
            <FormInput
              label="Latitude"
              name="latitude"
              type="number"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="Enter Latitude"
            />
            <FormInput
              label="Longitude"
              name="longitude"
              type="number"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="Enter Longitude"
            />
          </FormGrid>
        </FormSection>

        {/* Asset Details */}
        <FormSection title="Asset Details" icon={Package}>
          <FormGrid columns={3}>
            <FormInput
              label="Asset Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter Asset Name"
            />
            <FormInput
              label="OEM Name"
              name="oem_name"
              value={formData.oem_name}
              onChange={handleChange}
              required
              placeholder="Enter OEM Name"
            />
            <FormInput
              label="Asset Number"
              name="asset_number"
              value={formData.asset_number}
              onChange={handleChange}
              required
              placeholder="Enter Asset Number"
            />
            <FormInput
              label="Equipment ID"
              name="equipment_id"
              value={formData.equipment_id}
              onChange={handleChange}
              required
              placeholder="Enter Equipment ID"
            />
            <FormInput
              label="Serial Number"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              placeholder="Enter Serial Number"
            />
            <FormInput
              label="Model Number"
              name="model_number"
              value={formData.model_number}
              onChange={handleChange}
              placeholder="Enter Model Number"
            />
            <FormInput
              label="Group"
              name="asset_group_id"
              type="select"
              value={formData.asset_group_id}
              onChange={handleChange}
              options={groupOptions}
              required
              placeholder="Select Group"
            />
            <FormInput
              label="Sub Group"
              name="asset_sub_group_id"
              type="select"
              value={formData.asset_sub_group_id}
              onChange={handleChange}
              options={subGroupOptions}
              required
              placeholder="Select Sub Group"
            />
            <FormInput
              label="Parent Asset"
              name="parent_asset_id"
              type="select"
              value={formData.parent_asset_id}
              onChange={handleChange}
              options={parentOptions}
              placeholder="Select Parent Asset"
            />
            <FormInput
              label="Asset Type"
              name="asset_type"
              type="select"
              value={formData.asset_type}
              onChange={handleChange}
              options={[
                { value: "fixed", label: "Fixed" },
                { value: "movable", label: "Movable" },
              ]}
              placeholder="Select Asset Type"
            />
            <FormInput
              label="Vendor"
              name="vendor_id"
              type="select"
              value={formData.vendor_id}
              onChange={handleChange}
              options={vendorOptions}
              placeholder="Select Vendor"
            />
            <FormInput
              label="Capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Enter Capacity"
            />
            <FormInput
              label="Unit of Measurement"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="Enter UOM"
            />
          </FormGrid>
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-border">
            <FormToggle label="Critical Asset" checked={formData.critical} onChange={(v) => handleToggleChange("critical", v)} />
            <FormToggle label="Breakdown" checked={formData.breakdown} onChange={(v) => handleToggleChange("breakdown", v)} />
            <FormToggle label="Is Meter" checked={formData.is_meter} onChange={(v) => handleToggleChange("is_meter", v)} />
          </div>
        </FormSection>

        {/* Purchase & Warranty Details */}
        <FormSection title="Purchase & Warranty Details" icon={Calendar}>
          <FormGrid columns={3}>
            <FormInput
              label="Purchase Date"
              name="purchased_on"
              type="date"
              value={formData.purchased_on}
              onChange={handleChange}
            />
            <FormInput
              label="Purchase Cost"
              name="purchase_cost"
              type="number"
              value={formData.purchase_cost}
              onChange={handleChange}
              required
              placeholder="Enter Purchase Cost"
            />
            <FormInput
              label="Installation Date"
              name="installation"
              type="date"
              value={formData.installation}
              onChange={handleChange}
            />
            <FormInput
              label="Warranty Start"
              name="warranty_start"
              type="date"
              value={formData.warranty_start}
              onChange={handleChange}
            />
            <FormInput
              label="Warranty Expiry"
              name="warranty_expiry"
              type="date"
              value={formData.warranty_expiry}
              onChange={handleChange}
            />
            <FormInput
              label="Comprehensive"
              name="comprehensive"
              value={formData.comprehensive}
              onChange={handleChange}
              placeholder="Enter Comprehensive Details"
            />
          </FormGrid>
        </FormSection>

        {/* Meter Configuration */}
        {formData.is_meter && (
          <FormSection title="Meter Parameters" icon={Settings}>
            <div className="space-y-4">
              {consumptionData.map((item, index) => (
                <div key={index} className="relative bg-muted/50 p-4 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => handleRemoveConsumption(index)}
                    className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <FormGrid columns={4}>
                    <FormInput
                      label="Parameter Name"
                      name={`consumption_${index}_name`}
                      value={item.name}
                      onChange={(e) => handleConsumptionChange(index, 'name', e.target.value)}
                      placeholder="Name"
                    />
                    <FormInput
                      label="Unit Type"
                      name={`consumption_${index}_unit_type`}
                      value={item.unit_type}
                      onChange={(e) => handleConsumptionChange(index, 'unit_type', e.target.value)}
                      placeholder="Unit Type"
                    />
                    <FormInput
                      label="Min Value"
                      name={`consumption_${index}_min_val`}
                      type="number"
                      value={item.min_val}
                      onChange={(e) => handleConsumptionChange(index, 'min_val', e.target.value)}
                      placeholder="Min"
                    />
                    <FormInput
                      label="Max Value"
                      name={`consumption_${index}_max_val`}
                      type="number"
                      value={item.max_val}
                      onChange={(e) => handleConsumptionChange(index, 'max_val', e.target.value)}
                      placeholder="Max"
                    />
                  </FormGrid>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddConsumption}
                className="flex items-center gap-2 px-4 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Parameter
              </button>
            </div>
          </FormSection>
        )}

        {/* Attachments */}
        <FormSection title="Attachments" icon={FileText}>
          <FormGrid columns={2}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Purchase Invoice</label>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileChange(e.target.files, 'invoice')}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Insurance Documents</label>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileChange(e.target.files, 'insurance')}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Manuals</label>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileChange(e.target.files, 'manuals')}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Other Files</label>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileChange(e.target.files, 'others')}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          </FormGrid>
        </FormSection>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => navigate(`/asset/${id}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Asset'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditAsset;
