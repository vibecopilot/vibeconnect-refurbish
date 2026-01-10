import React, { useEffect, useMemo, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { PiPlusCircle } from "react-icons/pi";
import { FaTimes } from "react-icons/fa";
import {
  editParkingSlots,
  getParkingSlotDetails,
  getParkingSlots,
  postParkingSlots,
} from "../../../api";
import toast from "react-hot-toast";
import { getItemInLocalStorage } from "../../../utils/localStorage";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import FormInput from "../../../components/ui/FormInput";

const ParkingSlotSetup = () => {
  const siteID = getItemInLocalStorage("SITEID");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [id, setid] = useState(null);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const closeModal1 = () => setIsModalOpen1(false);
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
    start_hr: "",
    start_min: "",
    end_hr: "",
    end_min: "",
  });

  const fetchParkingSlotDetails = async (slotId) => {
    try {
      const resp = await getParkingSlotDetails(slotId);
      console.log(resp);
      if (resp) {
        setFormData({
          start_hr: resp.data.start_hr || "",
          start_min: resp.data.start_min || "",
          end_hr: resp.data.end_hr || "",
          end_min: resp.data.end_min || "",
        });
      }
    } catch (error) {
      console.log("Error fetching parking slot details:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [hour, minute] = value.split(":");

    if (name === "start_time") {
      setFormData({ ...formData, start_hr: hour, start_min: minute });
    } else if (name === "end_time") {
      setFormData({ ...formData, end_hr: hour, end_min: minute });
    }
  };

  const handleCreateParkingSlot = async () => {
    const sendData = new FormData();
    sendData.append("parking_slot[site_id]", siteID);
    sendData.append("parking_slot[start_hr]", formData.start_hr);
    sendData.append("parking_slot[start_min]", formData.start_min);
    sendData.append("parking_slot[end_hr]", formData.end_hr);
    sendData.append("parking_slot[end_min]", formData.end_min);

    try {
      const resp = await postParkingSlots(sendData);
      console.log(resp);

      toast.success("Slot Created Successfully");
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditParkingSlot = async () => {
    const sendData = new FormData();
    sendData.append("parking_slot[site_id]", siteID);
    sendData.append("parking_slot[start_hr]", formData.start_hr);
    sendData.append("parking_slot[start_min]", formData.start_min);
    sendData.append("parking_slot[end_hr]", formData.end_hr);
    sendData.append("parking_slot[end_min]", formData.end_min);

    try {
      const resp = await editParkingSlots(id, sendData);
      console.log(resp);

      toast.success("Slot Updated Successfully");
      setIsModalOpen1(false);
    } catch (error) {
      console.log(error);
    }
  };

  const formatTime = (hour = 0, minute = 0) => {
    if (minute == null) minute = 0;
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    const formattedMinute = String(minute).padStart(2, "0");

    return `${formattedHour}:${formattedMinute} ${period}`;
  };

  const columns = useMemo(
    () => [
      {
        key: "actions",
        header: "Actions",
        render: (_val, row) => (
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setid(row.id);
                fetchParkingSlotDetails(row.id);
                setIsModalOpen1(true);
              }}
            >
              <BiEdit size={15} />
            </button>
          </div>
        ),
      },
      {
        key: "start_time",
        header: "Start time",
        sortable: true,
        render: (_val, row) => formatTime(row.start_hr, row.start_min),
      },
      {
        key: "end_time",
        header: "End time",
        sortable: true,
        render: (_val, row) => formatTime(row.end_hr, row.end_min),
      },
      {
        key: "created_at",
        header: "Created On",
        sortable: true,
        render: (val) => (val ? new Date(val).toLocaleString() : "-"),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button leftIcon={<PiPlusCircle className="w-4 h-4" />} onClick={openModal}>
          Add
        </Button>
      </div>

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
              <FaTimes size={15} />
            </button>
            <h2 className="text-lg font-semibold mb-4">Create Slot</h2>
            <div className="space-y-4">
              <FormInput
                label="Start Time"
                name="start_time"
                type="time"
                value={
                  formData.start_hr && formData.start_min
                    ? `${String(formData.start_hr).padStart(2, "0")}:${String(
                        formData.start_min
                      ).padStart(2, "0")}`
                    : ""
                }
                onChange={handleChange}
              />
              <FormInput
                label="End Time"
                name="end_time"
                type="time"
                value={
                  formData.end_hr && formData.end_min
                    ? `${String(formData.end_hr).padStart(2, "0")}:${String(
                        formData.end_min
                      ).padStart(2, "0")}`
                    : ""
                }
                onChange={handleChange}
              />
              <div className="flex justify-end">
                <Button onClick={handleCreateParkingSlot}>Create</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen1 && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={closeModal1}
          ></div>
          <div className="bg-card w-[420px] rounded-lg shadow-lg p-6 relative z-10 border border-border">
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              onClick={closeModal1}
            >
              <FaTimes size={15} />
            </button>
            <h2 className="text-lg font-semibold mb-4">Edit Slot</h2>
            <div className="space-y-4">
              <FormInput
                label="Start Time"
                name="start_time"
                type="time"
                value={
                  formData.start_hr && formData.start_min
                    ? `${String(formData.start_hr).padStart(2, "0")}:${String(
                        formData.start_min
                      ).padStart(2, "0")}`
                    : ""
                }
                onChange={handleChange}
              />
              <FormInput
                label="End Time"
                name="end_time"
                type="time"
                value={
                  formData.end_hr && formData.end_min
                    ? `${String(formData.end_hr).padStart(2, "0")}:${String(
                        formData.end_min
                      ).padStart(2, "0")}`
                    : ""
                }
                onChange={handleChange}
              />
              <div className="flex justify-end">
                <Button onClick={handleEditParkingSlot}>Update</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingSlotSetup;
