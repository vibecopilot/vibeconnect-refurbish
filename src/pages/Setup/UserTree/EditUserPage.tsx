import React, { useEffect, useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RiDeleteBinLine } from "react-icons/ri";
import {
  editSetupUsers,
  getAllUnits,
  getFilterUsers,
  getSetupUsers, // Though not used directly, kept for consistency
  getAllFloors,
  getSites,
  getFloors,
  getUnits,
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
  const [units, setUnits] = useState<Unit[]>([]);
  const siteId = getItemInLocalStorage("SITEID");
  const [sites, setSites] = useState<Site[]>([]);
  const [usersites, setUserSites] = useState<Site[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  
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
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);
  const [vendorList, setVendorList] = useState<Vendor[]>([]);
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);
  const [hydratedSite, setHydratedSite] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  console.log("id", id);

  const convertToISODate = (dateString: string): string => {
    if (!dateString) return "";
    // Check if already in ISO format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    // Convert DD/MM/YYYY to YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month}-${day}`;
    }
    return dateString;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true); // Start loading
      const [userResp, sitesResp] = await Promise.all([
        getFilterUsers(id),
        getSites(),
      ]);
      
      const userData = userResp?.data || {};
      // Convert date formats for HTML5 date inputs
      const formattedData: FormData = {
        ...userData,
        moving_date: convertToISODate(userData.moving_date),
        lease_expiry: convertToISODate(userData.lease_expiry),
        birth_date: convertToISODate(userData.birth_date),
      };
      
      setFormData(formattedData);
      setOriginalData(formattedData);
      setUserSites(sitesResp.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!hydratedSite && Array.isArray(formData.user_sites) && formData.user_sites.length > 0)
    {
      const site = formData.user_sites[0];
       setSelectedUnit(String(site.unit_id ?? ""));
       setSelectedBuilding(String(site.build_id ?? ""));
       setSelectedFloorId(String(site.floor_id ?? ""));
      setHydratedSite(true); // prevent rehydration
    }
  }, [formData.user_sites, hydratedSite]);

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
            build_id: selectedBuilding ? parseInt(selectedBuilding, 10) : null,
            floor_id: selectedFloorId ? parseInt(selectedFloorId, 10) : null,
            unit_id: selectedUnit ? parseInt(selectedUnit, 10) : null,
          };
        }
        // Sync occupancy_type from ownership if available
        const occupancy = updatedSites[0]?.ownership ?? "";
        return { ...prev, user_sites: updatedSites, occupancy_type: occupancy };
      });
    }
  }, [selectedBuilding, selectedFloorId, selectedUnit]);

  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sitesResp , buildResp] = await Promise.all([
          getSites(),
          getBuildings(),
        ]);
        setSites(
          sitesResp.data.map((site: Site) => ({
            value: site.id,
            label: site.name,
          }))
        );
        setFilteredBuildings(buildResp.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const [hasHydratedUserData, setHasHydratedUserData] = useState<boolean>(false);

  useEffect(() => {
    if (!hasHydratedUserData && formData.firstname) {
      const hydratedMembers = Array.isArray(formData.user_members) && formData.user_members.length > 0
        ? formData.user_members.map((m: any) => ({
            id: m.id ?? null,
            member_type: m.member_type ?? "",
            member_name: m.member_name ?? "",
            contact_no: m.contact_no ?? "",
            relation: m.relation ?? "",
          }))
        : [];

      setMembers(hydratedMembers);

      const hydratedVendors = Array.isArray(formData.user_vendor) && formData.user_vendor.length > 0
        ? formData.user_vendor.map((v: any) => ({
            id: v.id ?? null,
            service_type: v.service_type ?? "",
            name: v.name ?? "",
            contact_no: v.contact_no ?? "",
          }))
        : [];

      setVendorList(hydratedVendors);

      // Hydrate vehicles
      const hydratedVehicles = Array.isArray(formData.vehicle_details) && formData.vehicle_details.length > 0
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

  useEffect(() => {
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
          const unitResp = await getAllUnits(selectedFloorId); // Note: Code used getAllUnits here, getUnits exists too. Sticking to source code.
          setUnits(unitResp.data);
        } catch (error) {
          console.error("Error fetching units:", error);
          setUnits([]);
        }
      }
    };

    if (hydratedSite) {
      fetchFloorsAndUnits();
    }
  }, [hydratedSite, selectedBuilding, selectedFloorId]);
  
  const handleUnitChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUnit(e.target.value);
    console.log("Selected unit ID:", e.target.value);
  };

  const handleAddMember = () => {
    setMembers((prev) => [
      ...prev,
      {
        id: null,
        member_type: "",
        member_name: "",
        contact_no: "",
        relation: "",
      },
    ]);
  };

  const handleDeleteMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const handleAddVendor = () => {
    setVendorList((prev) => [
      ...prev,
      { id: null, service_type: "", name: "", contact: "" },
    ]);
  };

  const handleDeleteVendor = (index: number) => {
    setVendorList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVendorChange = (index: number, field: string, value: string) => {
    setVendorList((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const handleAddVehicle = () => {
    setVehicleList((prev) => [
      ...prev,
      { id: null, vehicle_type: "", vehicle_no: "", parking_slot_no: "" },
    ]);
  };

  const handleDeleteVehicle = (index: number) => {
    setVehicleList((prev) => prev.filter((_, i) => i !== index));
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

  const validateMobileInput = (input: string): string => {
    return input.replace(/\D/g, "").slice(0, 10);
  };

  const handleInputChange = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddUser = async () => {
    // Validate required fields
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

    // Conditional check for lease expiry
    if (formData.occupancy_type === "tenant" && !formData.lease_expiry) {
      return toast.error("Lease expiry date is required for tenants");
    }

    // Validate mobile number format (Indian 10-digit starting with 6-9)
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
        vehicle_details_attributes: (formData.vehicle_details || vehicleList || []).map((v) => ({
          id: v.id ?? undefined,
          vehicle_type: v.vehicle_type,
          vehicle_no: v.vehicle_no,
          parking_slot_no: v.parking_slot_no,
        })),
      },
    };

    try {
      console.log("Sending update data:", postData);
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


  const handleUtilityChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  }

  return (
    <section className="flex flex-col items-center p-2 bg-gray-700">
      <div className="flex mx-1 bg-white rounded-md flex-col gap-1 overflow-hidden my-1">
        <h2
          className="text-center text-xl font-bold p-2 mx-2 rounded-full text-grey-600"
        >
          Update User Details
        </h2>
        <div className="md:mx-10 my-2 md:mb-5 sm:border border-gray-400 p-10  rounded-lg">
          {/* User Details */}
          <div className="grid md:grid-cols-2 gap-4">
            {["First Name", "Last Name", "Email", "Mobile", "Password"].map(
              (field, idx) => {
                const isDisabled = field === "Email" || field === "Password";
                const isRequired = ["First Name", "Last Name", "Email", "Mobile"].includes(field);
                return (
                  <div key={idx} className="flex flex-col gap-1">
                    <label className="font-semibold">
                      {field}:{isRequired && <span style={{ color: "red" }}> *</span>}
                    </label>
                    <input
                      type="text"
                      name={field.toLowerCase().replace(" ", "")}
                      value={formData[field.toLowerCase().replace(" ", "") as keyof FormData] as string}
                      onChange={handleChange}
                      placeholder={`Enter ${field}`}
                      disabled={isDisabled}
                      className={`border p-2 px-4 border-gray-300 rounded-md placeholder:text-sm
              ${
                isDisabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
              }
            `}
                    />
                  </div>
                );
              }
            )}
          </div>

          <div className="mt-10 space-y-4">
            <div className="grid mt-10 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <label className="font-semibold">
                  Tower: <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  className="border p-2 px-4 border-gray-300 rounded-md placeholder:text-sm"
                  value={selectedBuilding}
                  onChange={async (e: ChangeEvent<HTMLSelectElement>) => {
                    const buildingId = e.target.value;
                    setSelectedBuilding(buildingId);
                    if (buildingId) {
                      try {
                        const response = await getFloors(buildingId);
                        setFloors(response.data);
                      } catch (error) {
                        console.error("Error fetching floors:", error);
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
                <label className="font-semibold">
                  Floor: <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  className="border p-2 px-4 border-gray-300 rounded-md placeholder:text-sm"
                  value={selectedFloorId}
                  onChange={async (e: ChangeEvent<HTMLSelectElement>) => {
                    const floorId = e.target.value;
                    setSelectedFloorId(floorId);

                    if (floorId) {
                      try {
                        const response = await getAllUnits(floorId);
                        setUnits(response.data);
                      } catch (error) {
                        console.error("Error fetching units:", error);
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
                <label className="font-semibold">
                  Units: <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  className="border p-2 px-4 border-gray-300 rounded-md placeholder:text-sm"
                  value={selectedUnit}
                  onChange={handleUnitChange}
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
          </div>

          <div className="mt-10 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Moving Date */}
              <div className="flex flex-col gap-2">
                <label htmlFor="moving_date" className="font-semibold">
                  Moving Date: <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="date"
                  id="moving_date"
                  name="moving_date"
                  className="border p-2 rounded border-gray-300"
                  value={formData?.moving_date || ""}
                  onChange={(e) => handleInputChange("moving_date", e.target.value)}
                />
              </div>

              {/* Owner/Tenant Dropdown */}
              <div className="flex flex-col gap-2">
                <label htmlFor="occupancy_type" className="font-semibold">
                  Occupancy Type: <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  id="occupancy_type"
                  name="occupancy_type"
                  className="border p-2 rounded border-gray-300"
                  value={formData.occupancy_type}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange("occupancy_type", value);

                    //Clear lease_expiry if switching to owner
                    if (value !== "tenant") {
                      handleInputChange("lease_expiry", "");
                    }
                  }}
                >
                  <option value="">-- Select --</option>
                  <option value="owner">Owner</option>
                  <option value="tenant">Tenant</option>
                </select>
              </div>
              {/* Lease Expiry Date (only if Tenant) */}
              {formData.occupancy_type === "tenant" && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="lease_expiry" className="font-semibold">
                    Lease Expiry Date: <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="date"
                    id="lease_expiry"
                    name="lease_expiry"
                    className="border p-2 rounded border-gray-300 w-40"
                    value={formData.lease_expiry}
                    onChange={(e) => handleInputChange("lease_expiry", e.target.value)}
                  />
                </div>
              )}

              {/* Pets */}
              <div className="flex flex-col gap-2">
                <label htmlFor="profession" className="font-semibold">
                  Pets(if any):
                </label>
                <input
                  type="number"
                  min={0}
                  id="no_of_pets"
                  name="no_of_pets"
                  className="border p-2 rounded border-gray-300"
                  placeholder="Number of pets"
                  value={formData.no_of_pets || ""}
                  onChange={(e) => handleInputChange("no_of_pets", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Blood Group */}
              <div className="flex flex-col gap-2">
                <label htmlFor="blood_group" className="font-semibold">
                  Blood Group:
                </label>
                <input
                  type="text"
                  id="blood_group"
                  name="blood_group"
                  maxLength={3}
                  className="border p-2 rounded border-gray-300"
                  placeholder="e.g. A+, B-"
                  value={formData.blood_group || ""}
                  onChange={(e) => handleInputChange("blood_group", e.target.value.toUpperCase())}
                />
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col gap-2">
                <label htmlFor="birth_date" className="font-semibold">
                  Date of Birth:
                </label>
                <input
                  type="date"
                  id="birth_date"
                  name="birth_date"
                  className="border p-2 rounded border-gray-300"
                  value={formData.birth_date || ""}
                  onChange={(e) => handleInputChange("birth_date", e.target.value)}
                />
              </div>

              {/* Profession */}
              <div className="flex flex-col gap-2">
                <label htmlFor="profession" className="font-semibold">
                  Profession:
                </label>
                <input
                  type="text"
                  id="profession"
                  name="profession"
                  className="border p-2 rounded border-gray-300"
                  placeholder="Enter profession"
                  value={formData.profession || ""}
                  onChange={(e) => handleInputChange("profession", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            {/* Add Button */}
            <button
              type="button"
              className="bg-purple-800 text-white px-4 py-2 rounded hover:bg-purple-700"
              onClick={handleAddMember}
            >
              Add Family Member
            </button>

            {/* Member Rows */}
            {members.map((member, index) => {
              return (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
                >
                  {/* Member Type Dropdown */}
                  <div className="flex flex-col mt-2 gap-2">
                    <label className="font-semibold">Member Type:</label>
                    <select
                      className="border p-2 rounded border-gray-300"
                      value={member.member_type ?? ""}
                      onChange={(e) => handleMemberChange(index, "member_type", e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      <option value="Primary">Primary</option>
                      <option value="Secondary">Secondary</option>
                    </select>
                  </div>

                  {/* Name */}
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold">Member's Name:</label>
                    <input
                      type="text"
                      className="border p-2 rounded border-gray-300"
                      value={member.member_name ?? ""}
                      onChange={(e) => {
                        const validated = e.target.value.replace(/[^a-zA-Z ]/g, "");
                        handleMemberChange(index, "member_name", validated);
                      }}
                    />
                  </div>

                  {/* Contact */}
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold">Contact Details:</label>
                    <input
                      type="tel"
                      className="border p-2 rounded border-gray-300"
                      value={member.contact_no ?? ""}
                      onChange={(e) => {
                        const input = e.target.value;
                        const digitsOnly = input.replace(/\D/g, "");
                        if (digitsOnly.length <= 10) {
                          handleMemberChange(index, "contact_no", digitsOnly);
                        }
                      }}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                    />
                  </div>

                  {/* Relation */}
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold">Relation:</label>
                    <input
                      type="text"
                      className="border p-2 rounded border-gray-300"
                      value={member.relation ?? ""}
                      onChange={(e) => handleMemberChange(index, "relation", e.target.value)}
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="inline-block">
                    <button
                      type="button"
                      className="px-2 py-1 rounded hover:bg-red-100"
                      onClick={() => handleDeleteMember(index)}
                    >
                      <RiDeleteBinLine className="text-red-600 w-7 h-7" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section Header */}
          <div className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-5">
              Utility & Services Information
            </h2>
            <hr className="border-t border-gray-300 mb-6" />

            {/* Input Container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* MGL Customer Number */}
              <div className="flex flex-col mt-5">
                <label
                  htmlFor="mgl_number"
                  className="text-sm font-semibold text-gray-700 mb-1"
                >
                  MGL Customer Number
                </label>
                <input
                  type="text"
                  id="mgl_customer_number"
                  name="mgl_customer_number"
                  className="border border-gray-300 rounded-md p-2"
                  value={formData.mgl_customer_number || ""}
                  onChange={(e) => handleInputChange("mgl_customer_number", e.target.value)}
                />
              </div>

              {/* Adani Electricity Account Number */}
              <div className="flex flex-col mt-5">
                <label
                  htmlFor="adani_electricity_account_no"
                  className="text-sm font-medium text-gray-700 mb-1"
                >
                  Adani Electricity Account Number
                </label>
                <input
                  type="text"
                  id="adani_electricity_account_no"
                  name="adani_electricity_account_no"
                  className="border border-gray-300 rounded-md p-2"
                  value={formData.adani_electricity_account_no || ""}
                  onChange={(e) => handleInputChange("adani_electricity_account_no", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                {/* Internet Provider Name */}
                <div className="flex flex-col">
                  <label
                    htmlFor="net_provider_name"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Internet Provider Name
                  </label>
                  <input
                    type="text"
                    id="net_provider_name"
                    name="net_provider_name"
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData.net_provider_name || ""}
                    onChange={(e) => handleInputChange("net_provider_name", e.target.value)}
                  />
                </div>

                {/* Internet ID */}
                <div className="flex flex-col">
                  <label
                    htmlFor="net_provider_id"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Internet ID
                  </label>
                  <input
                    type="text"
                    id="net_provider_id"
                    name="net_provider_id"
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData.net_provider_id || ""}
                    onChange={(e) => handleInputChange("net_provider_id", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Header */}
          <div className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">
              Resident Services / Vendor Details
            </h2>
            <hr className="border-t border-gray-300 mb-6" />

            <div className="mt-5 space-y-4" style={{ marginTop: "30px" }}>
              {/* Add Button */}
              <button
                type="button"
                className="bg-purple-800 text-white px-4 py-2 rounded hover:bg-purple-700"
                onClick={handleAddVendor}
              >
                Add Vendor Service
              </button>

              {/* Vendor Entries */}
              {vendorList.map((vendor, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4"
                >
                  {/* Dropdown */}
                  <div className="flex flex-col mt-3">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Service Type
                    </label>
                    <select
                      className="border p-2 rounded border-gray-300"
                      value={vendor.service_type ?? ""}
                      onChange={(e) => handleVendorChange(index, "service_type", e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      <option value="Maid">Cook / Maid</option>
                      <option value="Driver">Driver (if any)</option>
                      <option value="Laundry">Laundry / Ironing</option>
                      <option value="Newspaper">Newspaper</option>
                      <option value="Milk">Milk Vendor</option>
                    </select>
                  </div>

                  {/* Name */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="border p-2 rounded border-gray-300"
                      value={vendor.name ?? ""}
                      onChange={(e) => handleVendorChange(index, "name", e.target.value)}
                    />
                  </div>

                  {/* Contact */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Contact Details
                    </label>
                    <input
                      type="tel"
                      className="border p-2 rounded border-gray-300"
                      value={vendor.contact_no ?? ""}
                      onChange={(e) => handleVendorChange(index, "contact_no", validateMobileInput(e.target.value))}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="inline-block">
                    <button
                      type="button"
                      className="px-2 py-1 rounded hover:bg-red-100"
                      onClick={() => handleDeleteVendor(index)}
                      aria-label="Delete vendor"
                    >
                      <RiDeleteBinLine className="text-red-600 w-7 h-7" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Details Section */}
          <div className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">
              Vehicle Details
            </h2>
            <hr className="border-t border-gray-300 mb-6" />

            <div className="mt-5 space-y-4">
              <button
                type="button"
                className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                onClick={handleAddVehicle}
              >
                Add Vehicle
              </button>

              {vehicleList.map((vehicle, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {/* Type */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Vehicle Type
                    </label>
                    <select
                      className="border p-2 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                      value={vehicle.vehicle_type ?? ""}
                      onChange={(e) => handleVehicleChange(index, "vehicle_type", e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      <option value="Car">Car</option>
                      <option value="Bike">Bike</option>
                      <option value="Scooter">Scooter</option>
                      <option value="SUV">SUV</option>
                      <option value="Truck">Truck</option>
                    </select>
                  </div>

                  {/* Vehicle Number */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Vehicle Number
                    </label>
                    <input
                      type="text"
                      className="border p-2 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 uppercase"
                      value={vehicle.vehicle_no ?? ""}
                      onChange={(e) => handleVehicleChange(index, "vehicle_no", e.target.value)}
                      placeholder="e.g. MH01AB1234"
                      maxLength={15}
                    />
                  </div>

                  {/* Parking Slot */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Parking Slot No.
                    </label>
                    <input
                      type="text"
                      className="border p-2 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 uppercase"
                      value={vehicle.parking_slot_no ?? ""}
                      onChange={(e) => handleVehicleChange(index, "parking_slot_no", e.target.value)}
                      placeholder="e.g. P-101"
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="inline-block">
                    <button
                      type="button"
                      className="px-2 py-1 rounded hover:bg-red-100 transition-colors"
                      onClick={() => handleDeleteVehicle(index)}
                      aria-label="Delete vehicle"
                    >
                      <RiDeleteBinLine className="text-red-600 w-7 h-7" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center my-5">
            <button
              onClick={handleAddUser}
              disabled={isUpdating}
              className={`text-white bg-purple-700 p-2 px-6 rounded-md font-medium ${
                isUpdating
                  ? "bg-purple-700 cursor-not-allowed"
                  : "bg-purple hover:bg-purple-800"
              }`}
            >
              {isUpdating ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditUserPage;