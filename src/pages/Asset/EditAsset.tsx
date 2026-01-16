import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Settings, MapPin, Package, Calendar, FileText, Shield, Plus, X, Loader2, UserPlus } from "lucide-react";
import FormSection from "../../components/ui/FormSection";
import FormInput from "../../components/ui/FormInput";
import FormGrid from "../../components/ui/FormGrid";
import Button from "@/components/ui/Button";
import PageTitle from "../../components/ui/PageTitle";
import { getItemInLocalStorage } from "../../utils/localStorage";
import {
  getAssetGroups,
  getAssetSubGroups,
  getFloors,
  getParentAsset,
  getUnits,
  getVendors,
  EditSiteAsset,
  getSiteAssetDetails,
} from "../../api";
import AddSuppliers from "../../containers/modals/AddSuppliersModal";

const EditAsset: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const storedBuildings = getItemInLocalStorage("Building");
  const buildings = Array.isArray(storedBuildings) ? storedBuildings : [];
  const themeColor = useSelector((state: any) => state.theme.color);

  const [loading, setLoading] = useState(true);
  // Track buildings locally so we can inject the current asset's building even if it's missing from localStorage.
  const [buildingList, setBuildingList] = useState<any[]>(buildings);
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [assetGroups, setAssetGroup] = useState<any[]>([]);
  const [assetSubGoups, setAssetSubGroups] = useState<any[]>([]);
  const [parentAsset, setParentAsset] = useState<any[]>([]);
  const [consumptionData, setConsumptionData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [meterType, setMeterType] = useState("");
  const [consumptionType, setConsumptionType] = useState("");
  const [attachments, setAttachments] = useState({
    invoice: [] as any[],
    insurance: [] as any[],
    manuals: [] as any[],
    others: [] as any[],
  });

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
    warranty: false,
    complianceApplicable: false,
    compliance_start: "",
    compliance_end: "",
    critical: false,
    capacity: "",
    breakdown: false,
    is_meter: false,
    asset_type: "",
    vendor_id: "",
    unit: "",
    remarks: "",
    description: "",
    invoice: [] as File[],
    insurance: [] as File[],
    manuals: [] as File[],
    others: [] as File[],



  
  });




  const fetchVendors = async () => {
    try {
      const vendorResp = await getVendors();
      setVendors(vendorResp.data || []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const handleAddSupplierSuccess = () => {
    fetchVendors();
    setShowAddSupplierModal(false);
  };

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

        console.log("prefill", {
  lat: data.latitude,
  lng: data.longitude,
  sub: data.sub_group_id,
  parent: data.parent_asset_id,
});
        
        // Fetch related data based on the asset
        if (data.building_id) {
          const floorResp = await getFloors(Number(data.building_id));
          setFloors(floorResp.data?.map((item: any) => ({ name: item.name, id: item.id })) || []);
          // Ensure the building select has an option for the current asset even if it's not in localStorage.
          setBuildingList(prev => {
            if (prev.some((b) => String(b.id) === String(data.building_id))) return prev;
            return [...prev, { id: data.building_id, name: data.building_name || `Building #${data.building_id}` }];
          });
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
          const subGroupList = Array.isArray(subGroupResp)
            ? subGroupResp
            : Array.isArray(subGroupResp?.data)
              ? subGroupResp.data
              : Array.isArray(subGroupResp?.sub_groups)
                ? subGroupResp.sub_groups
                : [];
const mappedSubGroups = (subGroupList || []).map((item: any) => ({
  name: item.name,
  id: item.id ?? item.sub_group_id ?? item.subGroupId,
}));

// ✅ If current asset sub group is not coming in list, inject it
const currentSubId = data.sub_group_id ?? data.asset_sub_group_id;
if (currentSubId && !mappedSubGroups.some((s: any) => String(s.id) === String(currentSubId))) {
  mappedSubGroups.push({
    id: currentSubId,
    name: data.sub_group_name || `Sub Group #${currentSubId}`,
  });
}

setAssetSubGroups(mappedSubGroups);

          setParentAsset(parentAssetResp.data?.site_assets || parentAssetResp?.site_assets || []);
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
         latitude: data.latitude ?? "",
longitude: data.longitude ?? "",

          asset_number: data.asset_number || "",
          equipment_id: data.equipment_id || data.equipemnt_id || "",
          serial_number: data.serial_number || "",
          model_number: data.model_number || "",
          purchased_on: formatDateForInput(data.purchased_on || data.purchase_date),
          purchase_cost: String(data.purchase_cost || ""),
          comprehensive: data.comprehensive === true ? "true" : data.comprehensive === false ? "false" : "",
          asset_group_id: String(data.asset_group_id || ""),
          asset_sub_group_id: String(data.asset_sub_group_id ?? data.sub_group_id ?? data.subGroupId ?? ""),

          parent_asset_id:
  data.parent_asset_id && data.parent_asset_id !== 0
    ? String(data.parent_asset_id)
    : "",

          installation: formatDateForInput(data.installation),
          warranty_expiry: formatDateForInput(data.warranty_expiry),
          warranty_start: formatDateForInput(data.warranty_start),
          warranty: Boolean(data.warranty_start || data.warranty_expiry),
          complianceApplicable: data.complianceApplicable ?? data.compliance_applicable ?? false,
          compliance_start: formatDateForInput(data.compliance_start || data.complianceStart),
          compliance_end: formatDateForInput(data.compliance_end || data.complianceEnd),
          critical: Boolean(data.critical),
          capacity: data.capacity || "",
          breakdown: Boolean(data.breakdown),
          is_meter: Boolean(data.is_meter),
          asset_type: data.asset_type || "",
          vendor_id: String(data.vendor_id || ""),
          unit: data.uom || "",
          remarks: data.remarks || "",
          description: data.description || "",
          invoice: [],
          insurance: [],
          manuals: [],
          others: [],
        });

        if (data.is_meter) {
          setMeterType(data.asset_type || "");
        } else {
          setMeterType("");
        }
        if (data.is_meter && data.asset_params && data.asset_params.length > 0) {
          setConsumptionType("ConsumptionAssetMeasureType");
        } else {
          setConsumptionType("");
        }

        setAttachments({
          invoice: data.purchase_invoices || [],
          insurance: data.insurances || [],
          manuals: data.manuals || [],
          others: data.other_files || [],
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
        const subGroupList = Array.isArray(subGroupResp)
          ? subGroupResp
          : Array.isArray(subGroupResp?.data)
            ? subGroupResp.data
            : Array.isArray(subGroupResp?.sub_groups)
              ? subGroupResp.sub_groups
              : [];
        setAssetSubGroups(
  (subGroupList || []).map((item: any) => ({
    name: item.name,
    id: item.id ?? item.sub_group_id ?? item.subGroupId,
  }))
);

        setParentAsset(parentAssetResp.data?.site_assets || parentAssetResp?.site_assets || []);
      } catch (error) {
        console.log(error);
      }
      setFormData(prev => ({ ...prev, asset_group_id: value, asset_sub_group_id: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (files: FileList | null, fieldName: string) => {
    if (files) {
      setFormData(prev => ({ ...prev, [fieldName]: Array.from(files) }));
    }
  };

  const getFileName = (file: any, fallback: string) => {
    const raw = file?.document || file?.url || file?.name || "";
    if (!raw) return fallback;
    const parts = raw.split("/");
    return parts[parts.length - 1] || fallback;
  };

  const renderExistingFiles = (files: any[], label: string) => {
    if (!files || files.length === 0) return null;
    return (
      <div className="mt-2 text-sm">
        <p className="text-muted-foreground mb-1">Existing {label}:</p>
        <ul className="space-y-1">
          {files.map((file, idx) => {
            const href = file?.document || file?.url;
            const text = getFileName(file, `${label} ${idx + 1}`);
            return (
              <li key={`${label}-${file?.id || idx}`}>
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {text}
                  </a>
                ) : (
                  <span>{text}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
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

      await EditSiteAsset(formDataSend, id!);
      toast.dismiss();
      toast.success("Asset Updated Successfully");
      navigate(`/assets/asset-details/${id}`);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to update asset");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildingOptions = buildingList.map((b: any) => ({ value: String(b.id), label: b.name }));
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

  // Determine breadcrumb path based on location state or asset type
  const getBreadcrumbPath = () => {
    if (location.state?.from === 'overview') {
      return { label: 'Overview', path: '/asset/overview' };
    }
    if (formData.is_meter) {
      return { label: 'Meter', path: '/asset/meter' };
    }
    return { label: 'Asset', path: '/asset' };
  };

  return (
    <div className="p-6">
      <PageTitle
        title="Edit Asset"
        breadcrumbs={[
          getBreadcrumbPath(),
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
            <FormInput
              label="Comprehensive"
              name="comprehensive"
              type="select"
              value={formData.comprehensive}
              onChange={handleChange}
              options={[
                { value: "true", label: "Comprehensive" },
                { value: "false", label: "Non-Comprehensive" },
              ]}
              placeholder="Select Asset Type"
            />
          </FormGrid>

          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-4">
              <label className="font-medium text-sm">Critical:</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.critical === true}
                    onChange={() => setFormData(prev => ({ ...prev, critical: true }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.critical === false}
                    onChange={() => setFormData(prev => ({ ...prev, critical: false }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Status:</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Breakdown</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!formData.breakdown}
                    onChange={() => setFormData(prev => ({ ...prev, breakdown: !prev.breakdown }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className="text-sm text-muted-foreground">In Use</span>
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_meter}
                onChange={() => setFormData(prev => ({ ...prev, is_meter: !prev.is_meter }))}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Meter Applicable</span>
            </label>
          </div>

          {formData.is_meter && (
            <div className="mt-4 pt-4 border-t border-border space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium text-sm">Meter Type:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={meterType === "parent"}
                      onChange={() => {
                        setMeterType("parent");
                        setFormData(prev => ({ ...prev, asset_type: "parent", parent_asset_id: "" }));
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Parent</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={meterType === "sub"}
                      onChange={() => {
                        setMeterType("sub");
                        setFormData(prev => ({ ...prev, asset_type: "sub" }));
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Sub</span>
                  </label>
                </div>
              </div>

              {meterType === "sub" && (
                <FormInput
                  label="Parent Meter"
                  name="parent_asset_id"
                  type="select"
                  value={formData.parent_asset_id}
                  onChange={handleChange}
                  options={parentOptions}
                  placeholder="Select Parent Meter"
                />
              )}
            </div>
          )}
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
          </FormGrid>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-4 mb-4">
              <label className="font-medium text-sm">Under Warranty:</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.warranty === true}
                    onChange={() => setFormData(prev => ({ ...prev, warranty: true }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.warranty === false}
                    onChange={() => setFormData(prev => ({ ...prev, warranty: false }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>

            {formData.warranty && (
              <FormGrid columns={3}>
                <FormInput
                  label="Warranty Start Date"
                  name="warranty_start"
                  type="date"
                  value={formData.warranty_start}
                  onChange={handleChange}
                />
                <FormInput
                  label="Warranty Expiry Date"
                  name="warranty_expiry"
                  type="date"
                  value={formData.warranty_expiry}
                  onChange={handleChange}
                />
                <FormInput
                  label="Commissioning Date"
                  name="installation"
                  type="date"
                  value={formData.installation}
                  onChange={handleChange}
                />
              </FormGrid>
            )}
          </div>
        </FormSection>

        {/* Compliance Details */}
        <FormSection title="Compliance Details" icon={Shield}>
          <div className="flex items-center gap-4 mb-4">
            <label className="font-medium text-sm">Compliance Applicable:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.complianceApplicable === true}
                  onChange={() => setFormData(prev => ({ ...prev, complianceApplicable: true }))}
                  className="w-4 h-4"
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.complianceApplicable === false}
                  onChange={() => setFormData(prev => ({ ...prev, complianceApplicable: false }))}
                  className="w-4 h-4"
                />
                <span className="text-sm">No</span>
              </label>
            </div>
          </div>

          {formData.complianceApplicable && (
            <FormGrid columns={2}>
              <FormInput
                label="Start Date"
                name="compliance_start"
                type="date"
                value={formData.compliance_start}
                onChange={handleChange}
              />
              <FormInput
                label="End Date"
                name="compliance_end"
                type="date"
                value={formData.compliance_end}
                onChange={handleChange}
              />
            </FormGrid>
          )}
        </FormSection>

        {/* Supplier Details */}
        <FormSection title="Supplier Contact Details" icon={UserPlus}>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <FormInput
                label="Select Supplier"
                name="vendor_id"
                type="select"
                value={formData.vendor_id}
                onChange={handleChange}
                options={vendorOptions}
                placeholder="Select Supplier"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddSupplierModal(true)}
              className="mt-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </div>
        </FormSection>

        {/* Comments and Description */}
        <FormSection title="Additional Information" icon={FileText}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Comments</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Enter Comments"
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter Description"
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </FormSection>

        {/* Consumption Asset Measure */}
        {formData.is_meter && (
          <FormSection title="Consumption Asset Measure" icon={Settings}>
            <div className="mb-4">
              <FormInput
                label="Select Consumption Asset Measure Type"
                name="consumption_type"
                type="select"
                value={consumptionType}
                onChange={(e) => setConsumptionType(e.target.value)}
                options={[
                  { value: "ConsumptionAssetMeasureType", label: "Consumption Asset Measure Type" },
                  { value: "nonConsumption", label: "Non Consumption Asset Measure Type" },
                ]}
                placeholder="Select Type"
              />
            </div>

            {(consumptionType === "ConsumptionAssetMeasureType" || consumptionType === "nonConsumption") && (
              <div className="space-y-4">
                {consumptionData.map((item, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleRemoveConsumption(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <FormGrid columns={4}>
                      <FormInput
                        label="Name"
                        name="name"
                        value={item.name}
                        onChange={(e) => handleConsumptionChange(index, "name", e.target.value)}
                        placeholder="Name"
                      />
                      <FormInput
                        label="Sequence"
                        name="order"
                        type="number"
                        value={item.order}
                        onChange={(e) => handleConsumptionChange(index, "order", e.target.value)}
                        placeholder="Sequence"
                      />
                      <FormInput
                        label="Unit Type"
                        name="unit_type"
                        value={item.unit_type}
                        onChange={(e) => handleConsumptionChange(index, "unit_type", e.target.value)}
                        placeholder="Unit Type"
                      />
                      <FormInput
                        label="Input Character Limit"
                        name="digit"
                        type="number"
                        value={item.digit}
                        onChange={(e) => handleConsumptionChange(index, "digit", e.target.value)}
                        placeholder="Digit"
                      />
                      <FormInput
                        label="Min Value"
                        name="min_val"
                        type="number"
                        value={item.min_val}
                        onChange={(e) => handleConsumptionChange(index, "min_val", e.target.value)}
                        placeholder="Min Value"
                      />
                      <FormInput
                        label="Max Value"
                        name="max_val"
                        type="number"
                        value={item.max_val}
                        onChange={(e) => handleConsumptionChange(index, "max_val", e.target.value)}
                        placeholder="Max Value"
                      />
                      <FormInput
                        label="Alert Below"
                        name="alert_below"
                        type="number"
                        value={item.alert_below}
                        onChange={(e) => handleConsumptionChange(index, "alert_below", e.target.value)}
                        placeholder="Alert Below"
                      />
                      <FormInput
                        label="Alert Above"
                        name="alert_above"
                        type="number"
                        value={item.alert_above}
                        onChange={(e) => handleConsumptionChange(index, "alert_above", e.target.value)}
                        placeholder="Alert Above"
                      />
                      <FormInput
                        label="Multiplier Factor"
                        name="multiplier_factor"
                        type="number"
                        value={item.multiplier_factor}
                        onChange={(e) => handleConsumptionChange(index, "multiplier_factor", e.target.value)}
                        placeholder="Multiplier Factor"
                      />
                    </FormGrid>
                    <div className="flex gap-4 mt-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.dashboard_view}
                          onChange={(e) => handleConsumptionChange(index, "dashboard_view", e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Dashboard View</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.consumption_view}
                          onChange={(e) => handleConsumptionChange(index, "consumption_view", e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Consumption View</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.check_prev}
                          onChange={(e) => handleConsumptionChange(index, "check_prev", e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Check Previous Reading</span>
                      </label>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddConsumption}>
                  <Plus className="w-4 h-4 mr-2" /> Add Parameter
                </Button>
              </div>
            )}
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
              {renderExistingFiles(attachments.invoice, "Purchase Invoice")}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Insurance Documents</label>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileChange(e.target.files, 'insurance')}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {renderExistingFiles(attachments.insurance, "Insurance")}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Manuals</label>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileChange(e.target.files, 'manuals')}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {renderExistingFiles(attachments.manuals, "Manual")}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Other Files</label>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileChange(e.target.files, 'others')}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {renderExistingFiles(attachments.others, "Other File")}
            </div>
          </FormGrid>
        </FormSection>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => navigate(`/assets/asset-details/${id}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Save & Show Details'}
          </Button>
        </div>
      </div>

      {showAddSupplierModal && (
        <AddSuppliers
          onclose={() => setShowAddSupplierModal(false)}
          fetchVendors={handleAddSupplierSuccess}
        />
      )}
    </div>
  );
};

export default EditAsset;
