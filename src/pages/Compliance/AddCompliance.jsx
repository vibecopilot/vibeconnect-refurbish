import React, { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { FaCheck, FaTrash } from "react-icons/fa";
import FileInputBox from "../../containers/Inputs/FileInputBox";
import { Link, useNavigate } from "react-router-dom";
import { PiPlusCircle } from "react-icons/pi";
import {
  getComplianceTags,
  getFilteredUsers,
  postComplianceCategoryConfiguration,
  postComplianceConfiguration,
} from "../../api";
import Select from "react-select";
import { getItemInLocalStorage } from "../../utils/localStorage";
import toast from "react-hot-toast";
import PageTitle from "../../components/ui/PageTitle";
const AddCompliance = () => {
  const [complianceFor, setComplianceFor] = useState([
    {
      category: {},
    },
  ]);
  const [formData, setFormData] = useState({
    complianceName: "",
    startDate: "",
    endDate: "",
    targetDays: "",
    frequency: "",
    riskLevel: "",
    auditorId: "",
    vendorId: "",
    priority: "",
    description: "",
    attachments: [],
  });

  const handleAddComplianceFor = () => {
    setComplianceFor([
      ...complianceFor,
      {
        category: {},
      },
    ]);
  };

  const handleDeleteComplianceFor = (indexToRemove) => {
    setComplianceFor(
      complianceFor.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const siteId = getItemInLocalStorage("SITEID");

  const navigate = useNavigate()
  const handleCreateCompliance = async (e) => {
    e.preventDefault();
    const sendData = new FormData();
    sendData.append("compliance_config[name]", formData.complianceName);
    sendData.append("compliance_config[frequency]", formData.frequency);
    sendData.append("compliance_config[due_in_days]", formData.targetDays);
    sendData.append("compliance_config[priority]", formData.priority);
    sendData.append("compliance_config[description]", formData.description);
    sendData.append("compliance_config[start_date]", formData.startDate);
    sendData.append("compliance_config[end_date]", formData.endDate);
    sendData.append("compliance_config[site_id]", siteId);
    sendData.append("compliance_config[assign_to_id]", selectedVendor.value);
    sendData.append("compliance_config[reviewer_id]", selectedAuditor.value);
    formData.attachments.forEach((file, index) => {
      sendData.append("attachments[]", file);
    });
    try {
      const res = await postComplianceConfiguration(sendData);
      const payload = {
        compliance_config_tags: complianceFor.map((compliance) => ({
          compliance_tag_id: compliance.category,
          compliance_config_id: res?.data.id,
        })),
      };

      try {
        const res = await postComplianceCategoryConfiguration(payload);
      } catch (error) {
        console.log(error);
      }
      toast.success("Compliance configured successfully");
      navigate("/compliance")
    } catch (error) {
      console.log(error);
    }
  };

  const handleCategoryChange = (option, index) => {
    setComplianceFor((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, category: option.value } : item
      )
    );
  };
  const [categories, setCategories] = useState([]);
  const fetchComplianceCat = async () => {
    try {
      const res = await getComplianceTags("complianceCategory");
      const allCategories = res?.data?.map((category) => ({
        value: category.id,
        label: category.name,
      }));
      setCategories(allCategories);
    } catch (error) {
      console.log(error);
    }
  };
  const [vendors, setVendors] = useState([]);
  const [auditors, setAuditors] = useState([]);
  const fetchVendors = async () => {
    try {
      const res = await getFilteredUsers("vendor");
      const filteredUsers = res?.data?.filter(
        (user) => user.user_type === "vendor"
      );
      const allVendors = filteredUsers?.map((vendor) => ({
        label: `${vendor.firstname} ${vendor.lastname}`,
        value: vendor.id,
      }));
      setVendors(allVendors);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchAuditors = async () => {
    try {
      const res = await getFilteredUsers("auditor");
      const filteredUsers = res?.data?.filter(
        (user) => user.user_type === "auditor"
      );
      const allAuditors = filteredUsers?.map((auditor) => ({
        label: `${auditor.firstname} ${auditor.lastname}`,
        value: auditor.id
      }));
      setAuditors(allAuditors);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchVendors();
    fetchAuditors();
    fetchComplianceCat();
  }, []);

  const handleFileChange = (files, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: files,
    });
    console.log(fieldName);
  };
  const [selectedAuditor, setSelectedAuditor] = useState({});
  const [selectedVendor, setSelectedVendor] = useState({});
  const handleAuditorChange = (option) => {
    console.log(option);
    setSelectedAuditor(option);
  };
  const handleVendorChange = (option) => {
    setSelectedVendor(option);
  };
  return (
    <div className="p-6">
      <PageTitle
        title="Add Compliance"
        breadcrumbs={[
          { label: "Compliance", path: "/compliance" },
          { label: "Add Compliance" },
        ]}
      />
      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleCreateCompliance} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">
                Compliance Name
              </label>
              <input
                type="text"
                className="mt-1 w-full border border-border rounded-lg p-2 text-sm bg-background"
                placeholder="Enter name"
                required
                value={formData.complianceName}
                onChange={handleChange}
                name="complianceName"
              />
            </div>

            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-foreground"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="mt-1 border border-border p-2 rounded-md w-full text-sm bg-background"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-foreground"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="mt-1 border border-border p-2 rounded-md w-full text-sm bg-background"
              />
            </div>
            <div>
              <label
                htmlFor="targetDates"
                className="block text-sm font-medium text-foreground"
              >
                Target Days{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (no. of days)
                </span>
              </label>
              <input
                type="text"
                id="targetDates"
                name="targetDays"
                placeholder="1 day"
                value={formData.targetDays}
                onChange={handleChange}
                className="mt-1 border border-border p-2 rounded-md w-full text-sm bg-background"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-foreground">
                Select Frequency
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="mt-1 border p-2 border-border rounded-md w-full text-sm bg-background"
              >
                <option value="">Select Frequency</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half_yearly">Half Yearly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">
                Assigned To Auditor
              </label>
              <Select
                options={auditors}
                onChange={handleAuditorChange}
                noOptionsMessage={() => "No Auditors available"}
                placeholder="Select Auditors"
                maxMenuHeight={300}
                className="z-50 w-full text-black mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Assigned To Vendor
              </label>
              <Select
                options={vendors}
                onChange={handleVendorChange}
                noOptionsMessage={() => "No vendor available"}
                placeholder="Select Vendor"
                maxMenuHeight={200}
                className="z-20 w-full text-black mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Priority
              </label>
              <select
                className="mt-1 w-full border border-border rounded-lg p-2 text-sm bg-background"
                value={formData.priority}
                onChange={handleChange}
                name="priority"
              >
                <option value="">Select Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <h2 className="mt-4 text-sm font-semibold text-foreground border-b border-border pb-2">
            Compliance For
          </h2>
          <div className="border border-border rounded-md p-3 bg-card/40">
            {complianceFor.map((compliance, index) => (
              <div
                className="grid grid-cols-3 gap-2 border-b border-border my-1 p-2"
                key={index}
              >
                <div className="col-span-2 z-10">
                  <Select
                    options={categories}
                    onChange={(option) => handleCategoryChange(option, index)}
                    noOptionsMessage={() => "No Categories available"}
                    placeholder="Select Category"
                    maxMenuHeight={300}
                    className="z-10 w-full text-black"
                  />
                </div>

                <div className="flex items-center justify-end text-destructive">
                  <button
                    type="button"
                    onClick={() => handleDeleteComplianceFor(index)}
                    className="p-2 rounded-md hover:bg-destructive/10"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-2">
              <button
                type="button"
                className="bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm flex items-center gap-2"
                onClick={handleAddComplianceFor}
              >
                <PiPlusCircle /> Add More
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              className="mt-1 w-full border border-border rounded-lg p-2 text-sm bg-background"
              placeholder="Description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              name="description"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="documents"
              className="block text-sm font-medium text-foreground"
            >
              Upload Documents
            </label>
            <FileInputBox
              handleChange={(files) => handleFileChange(files, "attachments")}
              fieldName={"attachments"}
              isMulti={true}
            />
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <Link
              to={"/compliance"}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <MdClose /> Cancel
            </Link>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <FaCheck /> Save Compliance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompliance;
