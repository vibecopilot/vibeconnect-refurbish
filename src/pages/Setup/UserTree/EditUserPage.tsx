import React, { useEffect, useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Loader2,
  Save,
  ArrowLeft,
  AlertTriangle,
  Trash2,
  Plus,
  User,
  Building2,
  MapPin,
  Calendar,
  FileText,
  Car,
  Wrench,
  Home,
} from "lucide-react";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import FormInput from "../../../components/ui/FormInput";
import {
  editSetupUsers,
  getAllUnits,
  getFilterUsers,
  getSites,
  getFloors,
  getBuildings,
} from "../../../api";
import { getItemInLocalStorage } from "../../../utils/localStorage";
import toast from "react-hot-toast";

// --- Interfaces ---

interface Unit {
  id: number;
  name: string;
  building_name?: string;
  floor_name?: string;
}

interface Floor {
  id: number;
  name: string;
}

interface Building {
  id: number;
  name: string;
}

interface Site {
  id: number;
  name: string;
  value: number;
  label: string;
}

interface Member {
  id?: number | null;
  member_type: string;
  member_name: string;
  contact_no: string;
  relation: string;
}

interface Vendor {
  id?: number | null;
  service_type: string;
  name: string;
  contact_no: string;
}

interface Vehicle {
  id?: number | null;
  vehicle_type: string;
  vehicle_no: string;
  parking_slot_no: string;
}

interface UserSite {
  id?: number;
  unit_id?: number | null;
  build_id?: number | null;
  floor_id?: number | null;
  ownership?: string;
  ownership_type?: string;
  is_approved?: boolean;
  lives_here?: string;
}

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  mobile: string;
  userType: string;
  site_ids: any[];
  moving_date: string;
  building_id: string;
  lease_expiry: string;
  lives_here: string;
  profession: string;
  mgl_customer_number: string;
  adani_electricity_account_no: string;
  net_provider_name: string;
  net_provider_id: string;
  blood_group: string;
  no_of_pets: string;
  birth_date: string;
  occupancy_type: string;
  user_sites: UserSite[];
  user_members: Member[];
  user_vendor: Vendor[];
  vehicle_details: Vehicle[];
}

const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for dropdowns
  const [units, setUnits] = useState<Unit[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [usersites, setUserSites] = useState<Site[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);

  // State for dynamic lists
  const [members, setMembers] = useState<Member[]>([]);
  const [vendorList, setVendorList] = useState<Vendor[]>([]);
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);

  const siteId = getItemInLocalStorage("SITEID");

  // Form State
  const initialFormData: FormData = {
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    mobile: "",
    userType: "unit_resident",
    site_ids: [],
    moving_date: "",
    building_id: "",
    lease_expiry: "",
    lives_here: "",
    profession: "",
    mgl_customer_number: "",
    adani_electricity_account_no: "",
    net_provider_name: "",
    net_provider_id: "",
    blood_group: "",
    no_of_pets: "",
    birth_date: "",
    occupancy_type: "",
    user_sites: [],
    user_members: [],
    user_vendor: [],
    vehicle_details: [],
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [originalData, setOriginalData] = useState<FormData | null>(null);

  // Selection State
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");

  // Hydration flags
  const [hydratedSite, setHydratedSite] = useState<boolean>(false);
  const [hasHydratedUserData, setHasHydratedUserData] = useState<boolean>(false);

  const convertToISODate = (dateString: string): string => {
    if (!dateString) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month}-${day}`;
    }
    return dateString;
  };

  // --- Fetch Data ---

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [userResp, sitesResp] = await Promise.all([
        getFilterUsers(id),
        getSites(),
      ]);

      const userData = userResp?.data || {};
      const formattedData: FormData = {
        ...userData,
        moving_date: convertToISODate(userData.moving_date),
        lease_expiry: convertToISODate(userData.lease_expiry),
        birth_date: convertToISODate(userData.birth_date),
      };

      setFormData(formattedData);
      setOriginalData(formattedData);
      setUserSites(sitesResp.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Initial fetch for buildings
    getBuildings().then((res) => setFilteredBuildings(res.data));
  }, []);

  // --- Hydration Effects ---

  // Hydrate Unit Selection
  useEffect(() => {
    if (
      !hydratedSite &&
      Array.isArray(formData.user_sites) &&
      formData.user_sites.length > 0
    ) {
      const site = formData.user_sites[0];
      setSelectedUnit(String(site.unit_id ?? ""));
      setSelectedBuilding(String(site.build_id ?? ""));
      setSelectedFloorId(String(site.floor_id ?? ""));
      setHydratedSite(true);
    }
  }, [formData.user_sites, hydratedSite]);

  // Sync Unit Selection to Form Data
  useEffect(() => {
    const currentSite = formData.user_sites?.[0] || {};
    const needsUpdate =
      currentSite.build_id !== selectedBuilding ||
      currentSite.floor_id !== selectedFloorId ||
      currentSite.unit_id !== selectedUnit;

    if (needsUpdate) {
      setFormData((prev) => {
        const updatedSites = [...prev.user_sites];
        if (updatedSites.length > 0) {
          updatedSites[0] = {
            ...updatedSites[0],
            build_id: selectedBuilding
              ? parseInt(selectedBuilding, 10)
              : null,
            floor_id: selectedFloorId ? parseInt(selectedFloorId, 10) : null,
            unit_id: selectedUnit ? parseInt(selectedUnit, 10) : null,
          };
        }
        const occupancy = updatedSites[0]?.ownership ?? "";
        return {
          ...prev,
          user_sites: updatedSites,
          occupancy_type: occupancy,
        };
      });
    }
  }, [selectedBuilding, selectedFloorId, selectedUnit]);

  // Fetch Floors/Units on selection change
  useEffect(() => {
    if (hydratedSite) {
      const fetchFloorsAndUnits = async () => {
        if (selectedBuilding) {
          try {
            const floorResp = await getFloors(selectedBuilding);
            setFloors(floorResp.data);
          } catch (error) {
            console.error("Error fetching floors:", error);
            setFloors([]);
          }
        }
        if (selectedFloorId) {
          try {
            const unitResp = await getAllUnits(selectedFloorId);
            setUnits(unitResp.data);
          } catch (error) {
            console.error("Error fetching units:", error);
            setUnits([]);
          }
        }
      };
      fetchFloorsAndUnits();
    }
  }, [hydratedSite, selectedBuilding, selectedFloorId]);

  // Hydrate Dynamic Lists (Members, Vendors, Vehicles)
  useEffect(() => {
    if (!hasHydratedUserData && formData.firstname) {
      const hydratedMembers =
        Array.isArray(formData.user_members) &&
          formData.user_members.length > 0
          ? formData.user_members.map((m: any) => ({
            id: m.id ?? null,
            member_type: m.member_type ?? "",
            member_name: m.member_name ?? "",
            contact_no: m.contact_no ?? "",
            relation: m.relation ?? "",
          }))
          : [];
      setMembers(hydratedMembers);

      const hydratedVendors =
        Array.isArray(formData.user_vendor) && formData.user_vendor.length > 0
          ? formData.user_vendor.map((v: any) => ({
            id: v.id ?? null,
            service_type: v.service_type ?? "",
            name: v.name ?? "",
            contact_no: v.contact_no ?? "",
          }))
          : [];
      setVendorList(hydratedVendors);

      const hydratedVehicles =
        Array.isArray(formData.vehicle_details) &&
          formData.vehicle_details.length > 0
          ? formData.vehicle_details.map((v: any) => ({
            id: v.id ?? null,
            vehicle_type: v.vehicle_type ?? "",
            vehicle_no: v.vehicle_no ?? "",
            parking_slot_no: v.parking_slot_no ?? "",
          }))
          : [];
      setVehicleList(hydratedVehicles);

      setHasHydratedUserData(true);
    }
  }, [formData.firstname, hasHydratedUserData]);

  // Sync Dynamic Lists to Form Data
  useEffect(() => {
    if (!hasHydratedUserData) return;

    const syncedMembers = members.map((m) => ({
      id: m.id ?? undefined,
      member_type: m.member_type,
      member_name: m.member_name,
      contact_no: m.contact_no,
      relation: m.relation,
    }));

    const syncedVendors = vendorList.map((v) => ({
      id: v.id ?? undefined,
      service_type: v.service_type,
      name: v.name,
      contact_no: v.contact_no,
    }));

    const syncedVehicles = vehicleList?.map((v) => ({
      id: v.id ?? undefined,
      vehicle_type: v.vehicle_type,
      vehicle_no: v.vehicle_no,
      parking_slot_no: v.parking_slot_no,
    }));

    setFormData((prev) => ({
      ...prev,
      user_members: syncedMembers,
      user_vendor: syncedVendors,
      vehicle_details: syncedVehicles,
    }));
  }, [members, vendorList, vehicleList, hasHydratedUserData]);

  // --- Handlers ---

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Dynamic List Handlers
  const handleMemberChange = (index: number, field: string, value: string) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleVendorChange = (index: number, field: string, value: string) => {
    setVendorList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleVehicleChange = (index: number, field: string, value: string) => {
    setVehicleList((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === "vehicle_type" ? value : value.toUpperCase(),
      };
      return updated;
    });
  };

  // --- Submission ---

  const handleAddUser = async () => {
    if (
      !formData.firstname ||
      !formData.lastname ||
      !formData.email ||
      !formData.mobile ||
      !formData.moving_date ||
      !formData.occupancy_type ||
      !selectedBuilding ||
      !selectedFloorId ||
      !selectedUnit
    ) {
      return toast.error("Please fill all mandatory fields marked with *");
    }

    if (formData.occupancy_type === "tenant" && !formData.lease_expiry) {
      return toast.error("Lease expiry date is required for tenants");
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile)) {
      return toast.error("Please enter a valid 10-digit mobile number");
    }

    setIsUpdating(true);

    const postData = {
      user: {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        mobile: formData.mobile,
        moving_date: formData.moving_date,
        lease_expiry: formData.lease_expiry,
        lives_here: formData.lives_here,
        profession: formData.profession,
        mgl_customer_number: formData.mgl_customer_number,
        adani_electricity_account_no: formData.adani_electricity_account_no,
        net_provider_name: formData.net_provider_name,
        net_provider_id: formData.net_provider_id,
        blood_group: formData.blood_group,
        no_of_pets: formData.no_of_pets,
        birth_date: formData.birth_date,
        user_sites_attributes: [
          {
            id: formData.user_sites?.[0]?.id,
            unit_id: parseInt(selectedUnit, 10),
            build_id: parseInt(selectedBuilding, 10),
            floor_id: parseInt(selectedFloorId, 10),
            ownership: formData.occupancy_type,
            ownership_type: "primary",
            is_approved: true,
            lives_here: formData.lives_here,
          },
        ],
        user_members_attributes: formData.user_members.map((m) => ({
          id: m.id ?? undefined,
          member_type: m.member_type,
          member_name: m.member_name,
          contact_no: m.contact_no,
          relation: m.relation,
        })),
        user_vendor_attributes: formData.user_vendor.map((v) => ({
          id: v.id ?? undefined,
          service_type: v.service_type,
          name: v.name,
          contact_no: v.contact_no,
        })),
        vehicle_details_attributes: (
          formData.vehicle_details || vehicleList || []
        ).map((v) => ({
          id: v.id ?? undefined,
          vehicle_type: v.vehicle_type,
          vehicle_no: v.vehicle_no,
          parking_slot_no: v.parking_slot_no,
        })),
      },
    };

    try {
      await editSetupUsers(id, postData);
      toast.success("User Updated successfully!");
      navigate("/setup/general/users");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user.");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Constants for Options ---
  const occupancyOptions = [
    { value: "owner", label: "Owner" },
    { value: "tenant", label: "Tenant" },
  ];

  const memberTypeOptions = [
    { value: "Primary", label: "Primary" },
    { value: "Secondary", label: "Secondary" },
  ];

  const serviceTypeOptions = [
    { value: "Maid", label: "Cook / Maid" },
    { value: "Driver", label: "Driver (if any)" },
    { value: "Laundry", label: "Laundry / Ironing" },
    { value: "Newspaper", label: "Newspaper" },
    { value: "Milk", label: "Milk Vendor" },
  ];

  const vehicleTypeOptions = [
    { value: "Car", label: "Car" },
    { value: "Bike", label: "Bike" },
    { value: "Scooter", label: "Scooter" },
    { value: "SUV", label: "SUV" },
    { value: "Truck", label: "Truck" },
  ];

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading user details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load User</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => navigate("/setup/general/users")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <Breadcrumb
        items={[
          { label: "Setup", path: "/setup/general/users" },
          { label: "Users", path: "/setup/general/users" },
          { label: "Edit User" },
        ]}
      />

      <div className="flex items-center gap-4 mt-4 mb-6">
        <button
          onClick={() => navigate(-1)} // Using navigate(-1) for generic back, or specific path
          className="p-2 hover:bg-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit User</h1>

          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span>
              # {formData.id}
            </span>

            <span className="px-3 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
              {formData.user_type}
            </span>
          </div>
        </div>

      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm max-w-5xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddUser();
          }}
          className="p-6"
        >
          {/* Section 1: Personal Info */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormInput
                label="First Name"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
              <FormInput
                label="Last Name"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                placeholder="Enter last name"
                required
              />
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                disabled
                className="bg-muted"
              />
              <FormInput
                label="Mobile"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                required
              />
              <FormInput
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          {/* Section 2: Unit Assignment */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              Unit Assignment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Tower <span className="text-destructive">*</span>
                </label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedBuilding}
                  onChange={async (e) => {
                    const buildingId = e.target.value;
                    setSelectedBuilding(buildingId);
                    if (buildingId) {
                      try {
                        const response = await getFloors(buildingId);
                        setFloors(response.data);
                      } catch (error) {
                        setFloors([]);
                      }
                    } else {
                      setFloors([]);
                    }
                  }}
                >
                  <option value="">-- Choose Building --</option>
                  {filteredBuildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Floor <span className="text-destructive">*</span>
                </label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedFloorId}
                  onChange={async (e) => {
                    const floorId = e.target.value;
                    setSelectedFloorId(floorId);
                    if (floorId) {
                      try {
                        const response = await getAllUnits(floorId);
                        setUnits(response.data);
                      } catch (error) {
                        setUnits([]);
                      }
                    } else {
                      setUnits([]);
                    }
                  }}
                >
                  <option value="">-- Choose Floor --</option>
                  {floors.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Unit <span className="text-destructive">*</span>
                </label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                >
                  <option value="">-- Choose Unit --</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <FormInput
                label="Moving Date"
                name="moving_date"
                type="date"
                value={formData.moving_date}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Occupancy Type"
                name="occupancy_type"
                type="select"
                value={formData.occupancy_type}
                onChange={(e) => {
                  handleInputChange("occupancy_type", e.target.value);
                  if (e.target.value !== "tenant") {
                    handleInputChange("lease_expiry", "");
                  }
                }}
                options={occupancyOptions}
                required
              />
              {formData.occupancy_type === "tenant" && (
                <FormInput
                  label="Lease Expiry Date"
                  name="lease_expiry"
                  type="date"
                  value={formData.lease_expiry}
                  onChange={handleChange}
                  required={formData.occupancy_type === "tenant"}
                />
              )}
              <FormInput
                label="Profession"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                placeholder="e.g. Engineer"
              />
            </div>
          </div>

          {/* Section 3: Additional Details */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              Additional Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Date of Birth"
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
              />
              <FormInput
                label="Blood Group"
                name="blood_group"
                value={formData.blood_group}
                onChange={(e) =>
                  handleInputChange("blood_group", e.target.value.toUpperCase())
                }
                placeholder="e.g. A+"
                maxLength={3}
              />
              <FormInput
                label="No. of Pets"
                name="no_of_pets"
                type="number"
                min={0}
                value={formData.no_of_pets}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

          {/* Section 4: Family Members */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Family Members
            </h2>
            {members.map((member, index) => (
              <div
                key={index}
                className="bg-muted/30 p-4 rounded-lg border border-border mb-4"
              >
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setMembers((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="p-2 hover:bg-destructive/10 rounded-md text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Member Type</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={member.member_type ?? ""}
                      onChange={(e) =>
                        handleMemberChange(index, "member_type", e.target.value)
                      }
                    >
                      <option value="">-- Select --</option>
                      {memberTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium"> Member's Name</label>
                    <input
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={member.member_name ?? ""}
                      onChange={(e) =>
                        handleMemberChange(
                          index,
                          "member_name",
                          e.target.value.replace(/[^a-zA-Z ]/g, "")
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Contact Details</label>
                    <input
                      type="tel"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={member.contact_no ?? ""}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, "");
                        if (digitsOnly.length <= 10)
                          handleMemberChange(index, "contact_no", digitsOnly);
                      }}
                      maxLength={10}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Relation</label>
                    <input
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={member.relation ?? ""}
                      onChange={(e) =>
                        handleMemberChange(index, "relation", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              onClick={() =>
                setMembers((prev) => [
                  ...prev,
                  {
                    id: null,
                    member_type: "",
                    member_name: "",
                    contact_no: "",
                    relation: "",
                  },
                ])
              }
            >
              <Plus className="w-4 h-4" /> Add Family Member
            </button>
          </div>

          {/* Section 5: Utilities */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Utility & Services Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormInput
                label="MGL Customer Number"
                name="mgl_customer_number"
                value={formData.mgl_customer_number}
                onChange={handleChange}
              />
              <FormInput
                label="Adani Electricity Acc No"
                name="adani_electricity_account_no"
                value={formData.adani_electricity_account_no}
                onChange={handleChange}
              />
              <FormInput
                label="Internet Provider Name"
                name="net_provider_name"
                value={formData.net_provider_name}
                onChange={handleChange}
              />
              <FormInput
                label="Internet ID"
                name="net_provider_id"
                value={formData.net_provider_id}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section 6: Vendors */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Vendors / Services
            </h2>
            {vendorList.map((vendor, index) => (
              <div
                key={index}
                className="bg-muted/30 p-4 rounded-lg border border-border mb-4"
              >
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setVendorList((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="p-2 hover:bg-destructive/10 rounded-md text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Service Type</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={vendor.service_type ?? ""}
                      onChange={(e) =>
                        handleVendorChange(index, "service_type", e.target.value)
                      }
                    >
                      <option value="">-- Select --</option>
                      {serviceTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Name</label>
                    <input
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={vendor.name ?? ""}
                      onChange={(e) =>
                        handleVendorChange(index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Contact</label>
                    <input
                      type="tel"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={vendor.contact_no ?? ""}
                      onChange={(e) => {
                        const digitsOnly = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        handleVendorChange(index, "contact_no", digitsOnly);
                      }}
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              onClick={() =>
                setVendorList((prev) => [
                  ...prev,
                  { id: null, service_type: "", name: "", contact_no: "" },
                ])
              }
            >
              <Plus className="w-4 h-4" /> Add Vendor
            </button>
          </div>

          {/* Section 7: Vehicles */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Car className="w-5 h-5" />
              Vehicle Details
            </h2>
            {vehicleList.map((vehicle, index) => (
              <div
                key={index}
                className="bg-muted/30 p-4 rounded-lg border border-border mb-4"
              >
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setVehicleList((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="p-2 hover:bg-destructive/10 rounded-md text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Vehicle Type</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={vehicle.vehicle_type ?? ""}
                      onChange={(e) =>
                        handleVehicleChange(index, "vehicle_type", e.target.value)
                      }
                    >
                      <option value="">-- Select --</option>
                      {vehicleTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Vehicle Number</label>
                    <input
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase"
                      value={vehicle.vehicle_no ?? ""}
                      onChange={(e) =>
                        handleVehicleChange(index, "vehicle_no", e.target.value)
                      }
                      maxLength={15}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Parking Slot</label>
                    <input
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={vehicle.parking_slot_no ?? ""}
                      onChange={(e) =>
                        handleVehicleChange(
                          index,
                          "parking_slot_no",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              onClick={() =>
                setVehicleList((prev) => [
                  ...prev,
                  {
                    id: null,
                    vehicle_type: "",
                    vehicle_no: "",
                    parking_slot_no: "",
                  },
                ])
              }
            >
              <Plus className="w-4 h-4" /> Add Vehicle
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserPage;