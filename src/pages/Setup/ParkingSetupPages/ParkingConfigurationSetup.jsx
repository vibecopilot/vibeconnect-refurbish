import React, { useMemo, useState, useEffect } from "react";
import { BiEdit } from "react-icons/bi";
import { Link } from "react-router-dom";
import { PiPlusCircle } from "react-icons/pi";
import {
  editParkingConfiguration,
  getFloors,
  getParkingConfiguration,
  getParkingConfigurationDetails,
} from "../../../api";
import { FaTimes } from "react-icons/fa";
import { getItemInLocalStorage } from "../../../utils/localStorage";
import toast from "react-hot-toast";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import FormGrid from "../../../components/ui/FormGrid";
import FormInput from "../../../components/ui/FormInput";

const ParkingConfigurationSetup = () => {
  const [data, setData] = useState([]); // Store the original data here
  const [filteredData, setFilteredData] = useState([]); // For displaying filtered data
  const [editid, setEditId] = useState(null);
  const [parkname, setparkname] = useState(null);
  const [update, setupdate] = useState(false);
  const [location, setLocation] = useState(null);
  const [floor, setFloor] = useState(null);
  const [floors, setFloors] = useState([]);
  const userId = getItemInLocalStorage("UserId");
  const buildings = getItemInLocalStorage("Building");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const openModal = (categoryId) => {
    setEditId(categoryId);
    fetchCategoryDetails(categoryId);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchPantry = async () => {
      try {
        const invResp = await getParkingConfiguration();
        const sortedInvData = invResp.data.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        setData(sortedInvData); // Save original data
        setFilteredData(sortedInvData); // Initialize filteredData with all data
        setupdate(false);
        console.log(invResp);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPantry();
  }, [update]);

  const fetchCategoryDetails = async (categoryId) => {
    try {
      const categoryDetails = await getParkingConfigurationDetails(categoryId);
      setLocation(categoryDetails.data.building_id);
      setFloor(categoryDetails.data.floor_id);
      setparkname(categoryDetails.data.name);
    } catch (error) {
      console.error("Error fetching category details:", error);
    }
  };

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        if (location) {
          const floorsResp = await getFloors(location);
          setFloors(floorsResp.data);
          console.log("Floors:", floorsResp.data);
        }
      } catch (error) {
        console.error("Error fetching floors:", error);
      }
    };
    fetchFloors();
  }, [location]);

  const columns = useMemo(
    () => [
    {
      key: "actions",
      header: "Actions",
      render: (_val, row) => (
        <div className="flex items-center gap-4">
          <button onClick={() => openModal(row.id)}>
            <BiEdit size={15} />
          </button>
        </div>
      ),
    },
    { key: "name", header: "Name", sortable: true },
    {
      key: "building_name",
      header: "Location",
      sortable: true,
      render: (val) => val || "-",
    },
    { key: "floor_name", header: "Floor", sortable: true },
    {
      key: "vehicle_type",
      header: "Parking Type",
      sortable: true,
      render: (val) => val || "-",
    },
  ],
    []
  );

  // Updated handleSearch function
  const handleSearch = (event) => {
    const searchValue = event.target.value;
    setSearchText(searchValue);
    const filteredResults = data.filter(
      (item) =>
        item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.building_name.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredData(filteredResults);
  };

  // Edit function remains the same
  const handleEdit = async () => {
    const sendData = new FormData();
    sendData.append("parking_configuration[building_id]", location);
    sendData.append("parking_configuration[floor_id]", floor);
    sendData.append("parking_configuration[name]", parkname);

    try {
      const resp = await editParkingConfiguration(editid, sendData);
      setupdate(true);
      setIsModalOpen(false);
      toast.success("Parking configuration Update Successfully");

      // Reset any form fields if necessary
      console.log(resp);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="space-y-4">
      <FormGrid columns={2}>
        <FormInput
          label="Search"
          name="search"
          placeholder="Search by building name"
          value={searchText}
          onChange={handleSearch}
        />
        <div className="flex items-end justify-end">
          <Link to="/admin/add-parking-config">
            <Button leftIcon={<PiPlusCircle className="w-4 h-4" />}>Add</Button>
          </Link>
        </div>
      </FormGrid>

      <DataTable columns={columns} data={filteredData} />

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={closeModal}
          ></div>
          <div className="bg-card w-[420px] rounded-lg shadow-lg p-6 relative z-10 border border-border">
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              onClick={closeModal}
            >
              <FaTimes />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              Edit Parking Configuration
            </h2>
            <div className="space-y-4">
              <FormInput
                label="Location"
                name="building_id"
                type="select"
                value={location || ""}
                onChange={(e) => setLocation(e.target.value)}
                options={
                  buildings?.map((building) => ({
                    value: building.id,
                    label: building.name,
                  })) || []
                }
                placeholder="Select a location"
              />
              <FormInput
                label="Floor"
                name="floor_id"
                type="select"
                value={floor || ""}
                onChange={(e) => setFloor(e.target.value)}
                options={
                  floors?.map((floorItem) => ({
                    value: floorItem.id,
                    label: floorItem.name,
                  })) || []
                }
                placeholder="Select floor"
              />
              <FormInput
                label="Parking Name"
                name="parking_name"
                value={parkname || ""}
                onChange={(e) => setparkname(e.target.value)}
                placeholder="Enter parking name"
              />
              <div className="flex justify-end">
                <Button onClick={handleEdit}>Update</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingConfigurationSetup;
