import React, { useEffect, useMemo, useState } from "react";
import { ColorPicker } from "antd";
import toast from "react-hot-toast";
import DataTable, { TableColumn } from "../../../../components/ui/DataTable";
import FormGrid from "../../../../components/ui/FormGrid";
import FormInput from "../../../../components/ui/FormInput";
import FormSection from "../../../../components/ui/FormSection";
import {
  getHelpDeskStatusSetup,
  postHelpDeskStatusSetup,
} from "../../../../api";
import { getItemInLocalStorage } from "../../../../utils/localStorage";
import EditStatusModal from "../../TicketSetup/EditStatusModal";

interface StatusRow {
  id: number;
  position?: number;
  name?: string;
  fixed_state?: string;
  color_code?: string;
}

const TicketStatus: React.FC = () => {
  const [statuses, setStatuses] = useState<StatusRow[]>([]);
  const [statusAdded, setStatusAdded] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    status: "",
    fixedState: "",
    color: "",
    order: "",
  });

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const statusResp = await getHelpDeskStatusSetup();
        const statusArray = Object.values(statusResp.data || {});
        setStatuses(statusArray as StatusRow[]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStatuses();
  }, [statusAdded]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStatus = async () => {
    if (!formData.status || !formData.order) {
      toast.error("Please Add Status Name & Order");
      return;
    }

    const siteId = getItemInLocalStorage("SITEID");
    const postStatus = new FormData();
    postStatus.append("complaint_status[of_phase]", "pms");
    postStatus.append("complaint_status[society_id]", siteId);
    postStatus.append("complaint_status[name]", formData.status);
    postStatus.append("complaint_status[fixed_state]", formData.fixedState);
    postStatus.append("complaint_status[color_code]", formData.color);
    postStatus.append("complaint_status[position]", formData.order);

    try {
      await postHelpDeskStatusSetup(postStatus);
      toast.success("Status Added Successfully");
      setStatusAdded(true);
      setFormData({ status: "", fixedState: "", color: "", order: "" });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Failed to add status");
    } finally {
      setTimeout(() => setStatusAdded(false), 500);
    }
  };

  const statusColumns: TableColumn<StatusRow>[] = useMemo(
    () => [
      { key: "position", header: "Order", render: (val) => val ?? "-" },
      { key: "name", header: "Status", render: (val) => val || "-" },
      {
        key: "fixed_state",
        header: "Fixed State",
        render: (val) => val || "-",
      },
      {
        key: "color",
        header: "Color",
        render: (_val, row) => (
          <span
            className="inline-flex h-4 w-4 rounded-sm border border-border"
            style={{ background: row.color_code || "transparent" }}
          />
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (_val, row) => (
          <button
            className="text-primary text-sm"
            onClick={() => {
              setEditId(row.id);
              setShowEditModal(true);
            }}
          >
            Edit
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <FormSection title="Status Setup">
        <FormGrid columns={4}>
          <FormInput
            label="Status Name"
            name="status"
            value={formData.status}
            onChange={handleChange}
            placeholder="Enter status"
          />
          <FormInput
            label="Fixed State"
            name="fixedState"
            type="select"
            value={formData.fixedState}
            onChange={handleChange}
            options={[
              { value: "closed", label: "Closed" },
              { value: "open", label: "Open" },
              { value: "complete", label: "Complete" },
            ]}
            placeholder="Select Fixed State"
          />
          <div className="flex flex-col">
            <label className="text-sm text-muted-foreground mb-1.5">
              Color Code
            </label>
            <ColorPicker
              value={formData.color}
              onChange={(color) =>
                setFormData((prev) => ({ ...prev, color: color.toHexString() }))
              }
              size="large"
            />
          </div>
          <FormInput
            label="Order"
            name="order"
            type="number"
            value={formData.order}
            onChange={handleChange}
            placeholder="Enter order"
          />
        </FormGrid>

        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg"
            onClick={handleAddStatus}
          >
            Add
          </button>
        </div>
      </FormSection>

      <DataTable columns={statusColumns} data={statuses} />

      {showEditModal && editId && (
        <EditStatusModal
          onClose={() => setShowEditModal(false)}
          id={editId}
          setStatusAdded={setStatusAdded}
        />
      )}
    </div>
  );
};

export default TicketStatus;
