import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  getAssignedTo,
  getAvailableParkingNumber,
  getFloors,
  getParkingConfiguration,
  getParkingSlots,
  postParking,
} from "../../api";
import { useSelector } from "react-redux";
import { getItemInLocalStorage } from "../../utils/localStorage";
import { useNavigate, Link } from "react-router-dom";
import Breadcrumb from "../../components/ui/Breadcrumb";
import FormSection from "../../components/ui/FormSection";
import FormInput from "../../components/ui/FormInput";
import FormGrid from "../../components/ui/FormGrid";
import { Car, Save, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const AddParking = () => {
  const navigate  = useNavigate()
  const [behalf, setBehalf] = useState("self");
  const [users, setUsers] = useState([]);
  const [floors, setFloors] = useState([]);

  const siteId = getItemInLocalStorage("SITEID");
  const userId = getItemInLocalStorage("UserId");
  const [ParkConfigData, setParkConfigData] = useState([]);
  useEffect(() => {
    const fetchPantry = async () => {
      try {
        const invResp = await getAvailableParkingNumber();
        const sortedInvData = invResp.data.data.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        setParkConfigData(sortedInvData);
        console.log("Available parking number", invResp);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPantry();
  }, []);
  const [filteredData, setFilteredData] = useState([]);
  useEffect(() => {
    const fetchPantry = async () => {
      try {
        const invResp = await getParkingSlots();
        const sortedInvData = invResp.data.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        setFilteredData(sortedInvData);
        console.log(invResp);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPantry();
  }, []);
  const [formData, setFormData] = useState({
    on_behalf: "",
    booking_date: "",
    booking_start_time: "",
    booking_end_time: "",
    slot_id: "",
    parking_id: "",
    building_id: "",
    floor_id: "",
    user_id: "",
    status: "",
  });
  console.log(formData);
  const buildings = getItemInLocalStorage("Building");
  const handleChange = async (e) => {
    async function fetchFloor(floorID) {
      try {
        const build = await getFloors(floorID);
        setFloors(build.data.map((item) => ({ name: item.name, id: item.id })));
      } catch (e) {
        console.log(e);
      }
    }

    if (e.target.type === "select-one" && e.target.name === "building_id") {
      const BuildID = Number(e.target.value);
      await fetchFloor(BuildID);

      setFormData({
        ...formData,
        building_id: BuildID,
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };
  const formatTime = (hour, minute) => {
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for midnight
    const formattedMinute = minute?.toString().padStart(2, "0") || "00"; // Ensure two digits for minutes
    return `${formattedHour}:${formattedMinute} ${period}`;
  };
  useEffect(() => {
    const fetchAssignedTo = async () => {
      try {
        const response = await getAssignedTo();
        const transformedUsers = response.data.map((user) => ({
          value: user.id,
          label: `${user.firstname} ${user.lastname}`,
        }));
        setUsers(transformedUsers);
        // setUsers(response.data);
        console.log(response);
      } catch (error) {
        console.error("Error fetching assigned users:", error);
      }
    };
    fetchAssignedTo();
    console.log(users);
  }, []);
  const userIdToSend = behalf === "self" ? userId : formData.user_id;
  const handleSubmit = async () => {
    const sendData = new FormData();
    sendData.append("booking_parking[booking_date]", formData.booking_date);
    sendData.append("booking_parking[user_id]", userIdToSend);
    sendData.append(
      "booking_parking[booking_start_time]",
      formData.booking_start_time
    );
    sendData.append(
      "booking_parking[booking_end_time]",
      formData.booking_end_time
    );
    sendData.append("booking_parking[slot_id]", formData.slot_id);
    sendData.append("booking_parking[parking_id]", formData.parking_id);
    sendData.append("booking_parking[status]", "Booked");

    sendData.append("booking_parking[site_id]", siteId);

    try {
      const resp = await postParking(sendData);
      navigate("/parking");
      toast.success("Parking Created Successfully");
      console.log(resp);
    } catch (error) {
      console.log(error);
    }
  };
  const themeColor = useSelector((state) => state.theme.color);
  
  const [loading, setLoading] = useState(false);
  
  const handleReset = () => {
    setFormData({
      on_behalf: "",
      booking_date: "",
      booking_start_time: "",
      booking_end_time: "",
      slot_id: "",
      parking_id: "",
      building_id: "",
      floor_id: "",
      user_id: "",
      status: "",
    });
    setBehalf("self");
  };

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Parking', path: '/parking' }, { label: 'Book Parking' }]} />
      
      <div className="bg-card border border-border rounded-xl shadow-sm mt-6">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {/* Basic Information Section */}
          <FormSection title="Basic Information" icon={Car}>
            <div className="space-y-6">
              {/* Self/Others Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">For</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                      behalf === "self" 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-transparent text-foreground border-border hover:bg-accent'
                    }`}
                    onClick={() => setBehalf("self")}
                  >
                    Self
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                      behalf === "others" 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-transparent text-foreground border-border hover:bg-accent'
                    }`}
                    onClick={() => setBehalf("others")}
                  >
                    Others
                  </button>
                </div>
              </div>
              
              {/* Conditional User Selection */}
              {behalf === "others" && (
                <FormGrid columns={3}>
                  <FormInput
                    label="Select User"
                    name="user_id"
                    type="select"
                    value={formData.user_id}
                    onChange={handleChange}
                    options={users.map(u => ({ value: String(u.value), label: u.label }))}
                    placeholder="Select User"
                  />
                </FormGrid>
              )}
              
              <FormGrid columns={3}>
                <FormInput
                  label="Booking Date"
                  name="booking_date"
                  type="date"
                  value={formData.booking_date}
                  onChange={handleChange}
                  required
                />
                
                <FormInput
                  label="Start Time"
                  name="booking_start_time"
                  type="time"
                  value={formData.booking_start_time}
                  onChange={handleChange}
                  required
                />
                
                <FormInput
                  label="End Time"
                  name="booking_end_time"
                  type="time"
                  value={formData.booking_end_time}
                  onChange={handleChange}
                  required
                />
              </FormGrid>
            </div>
          </FormSection>

          {/* Parking Details Section */}
          <FormSection title="Parking Details" icon={Car}>
            <FormGrid columns={3}>
              <FormInput
                label="Parking Number"
                name="parking_id"
                type="select"
                value={formData.parking_id}
                onChange={handleChange}
                options={ParkConfigData.map(p => ({ value: String(p.id), label: p.name }))}
                placeholder="Select Parking Number"
                required
              />
              
              <FormInput
                label="Parking Slot"
                name="slot_id"
                type="select"
                value={formData.slot_id}
                onChange={handleChange}
                options={filteredData.map(s => ({ 
                  value: String(s.id), 
                  label: `${formatTime(s.start_hr, s.start_min)} to ${formatTime(s.end_hr, s.end_min)}` 
                }))}
                placeholder="Select Parking Slot"
                required
              />
            </FormGrid>
          </FormSection>

          {/* Submit Button */}
          <div className="p-6 border-t border-border">
            <div className="flex items-center justify-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
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
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
              <Link
                to="/parking"
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-primary-foreground bg-destructive hover:bg-destructive/90 rounded-lg transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddParking;
