import React, { useMemo, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { BsEye } from "react-icons/bs";
import { RiDeleteBin5Line } from "react-icons/ri";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import FormGrid from "../../../components/ui/FormGrid";
import FormInput from "../../../components/ui/FormInput";

const CAPASetup = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    incidentId: "",
    date: "",
    raisedBy: "",
    department: "",
    issueSummary: "",
    rootCause: "",
    correctiveAction: "",
    preventiveAction: "",
    owner: "",
    status: "",
    dueDate: "",
    isRepetitive: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const data = [
    {
      id: 1,
      incidentNo: "INC-2025-01",
      date: "02-05-25",
      department: "Maintenance",
      raisedBy: "Aniket",
      issueSummary: "Oil spill near pump",
      correctiveAction: "Seal replaced and area cleaned",
      preventiveAction: "Monthly pump check",
      owner: "Neeraj",
      status: "Closed",
    },
    {
      id: 2,
      incidentNo: "INC-2025-02",
      date: "02-05-25",
      department: "Maintenance",
      raisedBy: "Anurag",
      issueSummary: "Gas Leak",
      correctiveAction: "Valve replaced and area secured",
      preventiveAction: "Install Gas Leak Sensors",
      owner: "Ravi",
      status: "Closed",
    },
  ];

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    const needle = searchText.toLowerCase();
    return data.filter((row) => {
      return (
        row.incidentNo.toLowerCase().includes(needle) ||
        row.raisedBy.toLowerCase().includes(needle) ||
        row.department.toLowerCase().includes(needle) ||
        row.issueSummary.toLowerCase().includes(needle)
      );
    });
  }, [data, searchText]);

  const columns = [
    {
      key: "actions",
      header: "Action",
      render: () => (
        <div className="flex items-center gap-3">
          <button className="text-muted-foreground hover:text-foreground">
            <BsEye size={14} />
          </button>
          <button className="text-muted-foreground hover:text-foreground">
            <BiEdit size={14} />
          </button>
          <button className="text-muted-foreground hover:text-foreground">
            <RiDeleteBin5Line size={14} />
          </button>
        </div>
      ),
      width: "120px",
    },
    { key: "incidentNo", header: "Incident No", render: (val) => val || "-" },
    { key: "date", header: "Date", render: (val) => val || "-" },
    { key: "department", header: "Department", render: (val) => val || "-" },
    { key: "raisedBy", header: "Raised By", render: (val) => val || "-" },
    { key: "issueSummary", header: "Issue Summary", render: (val) => val || "-" },
    {
      key: "correctiveAction",
      header: "Corrective Action",
      render: (val) => val || "-",
    },
    {
      key: "preventiveAction",
      header: "Preventive Action",
      render: (val) => val || "-",
    },
    { key: "owner", header: "Owner", render: (val) => val || "-" },
    { key: "status", header: "Status", render: (val) => val || "-" },
  ];

  return (
    <div className="space-y-6">
      <FormGrid columns={2}>
        <FormInput
          label="Search"
          name="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by incident, department, or issue"
        />
        <div className="flex items-end justify-end">
          <Button variant="outline" onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? "Close" : "Add"}
          </Button>
        </div>
      </FormGrid>

      {showForm && (
        <div className="border border-border rounded-lg p-4 bg-card space-y-4">
          <h3 className="text-lg font-semibold">Add CAPA</h3>
          <FormGrid columns={2}>
            <FormInput
              label="Inc Id"
              name="incidentId"
              value={formData.incidentId}
              onChange={handleChange}
              placeholder="INC-2025-03"
            />
            <FormInput
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
            />
            <FormInput
              label="Raised by"
              name="raisedBy"
              type="select"
              value={formData.raisedBy}
              onChange={handleChange}
              options={[
                { value: "", label: "Select User" },
                { value: "Admin", label: "Admin" },
                { value: "Technician", label: "Technician" },
              ]}
            />
            <FormInput
              label="Department"
              name="department"
              type="select"
              value={formData.department}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Department" },
                { value: "Accounts", label: "Accounts" },
                { value: "Human Resources", label: "Human Resources" },
                { value: "Information Technology", label: "Information Technology" },
                { value: "Marketing", label: "Marketing" },
                { value: "Sales", label: "Sales" },
              ]}
            />
            <FormInput
              label="Issue Summary"
              name="issueSummary"
              type="textarea"
              value={formData.issueSummary}
              onChange={handleChange}
              placeholder="Enter Issue Summary"
              rows={3}
              className="md:col-span-2"
            />
            <FormInput
              label="Root Cause"
              name="rootCause"
              value={formData.rootCause}
              onChange={handleChange}
              placeholder="Add Root cause"
            />
            <FormInput
              label="Corrective Action"
              name="correctiveAction"
              value={formData.correctiveAction}
              onChange={handleChange}
              placeholder="Add Corrective Action"
            />
            <FormInput
              label="Preventive Action"
              name="preventiveAction"
              value={formData.preventiveAction}
              onChange={handleChange}
              placeholder="Add Preventive Action"
            />
            <FormInput
              label="Owner"
              name="owner"
              type="select"
              value={formData.owner}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Owner" },
                { value: "Anurag", label: "Anurag" },
                { value: "Aniket", label: "Aniket" },
              ]}
            />
            <FormInput
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
            />
            <FormInput
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Status" },
                { value: "Open", label: "Open" },
                { value: "Closed", label: "Closed" },
                { value: "In Progress", label: "In Progress" },
              ]}
            />
            <div className="flex items-center gap-2">
              <input
                id="isRepetitive"
                name="isRepetitive"
                type="checkbox"
                checked={formData.isRepetitive}
                onChange={handleToggle}
              />
              <label htmlFor="isRepetitive" className="text-sm text-foreground">
                Flag as Repetitive
              </label>
            </div>
          </FormGrid>
          <div className="flex justify-end">
            <Button>Create</Button>
          </div>
        </div>
      )}

      <DataTable columns={columns} data={filteredData} />
    </div>
  );
};

export default CAPASetup;
