import React, { useEffect, useState } from "react";
import { getAMCDetails, getVendors, postAMC } from "../../../../api";
import FileInputBox from "../../../../containers/Inputs/FileInputBox";
import { Link, useParams } from "react-router-dom";
import Table from "../../../../components/table/Table";
import toast from "react-hot-toast";
import { BsEye } from "react-icons/bs";
import { BiEdit } from "react-icons/bi";
import { FileText, Plus } from "lucide-react";

const AMCDetails = () => {
  const today = new Date().toISOString().split("T")[0];
  const toDay = new Date();
  const year = toDay.getFullYear();
  const month = String(toDay.getMonth() + 1).padStart(2, "0");
  const day = String(toDay.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  const { id } = useParams();
  const [vendors, setVendors] = useState([]);
  const [amcDetails, setAmcDetails] = useState([]);
  const [update, setUpdate] = useState(false);
  const initialFormData = {
    vendor_id: "",
    asset_id: id,
    start_date: formattedDate,
    end_date: formattedDate,
    frequency: "",
    terms: [],
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const fetchVendors = async () => {
      const vendorResp = await getVendors();
      setVendors(vendorResp.data);
    };
    const fetchAMCDetails = async () => {
      const amcResponse = await getAMCDetails(id);
      // Ensure amcDetails is always an array
      const data = amcResponse.data;
      setAmcDetails(Array.isArray(data) ? data : data?.asset_amcs || []);
      console.log(amcResponse);
    };
    fetchVendors();
    fetchAMCDetails();
    console.log(amcDetails.asset_name);
  }, [update]);

  const handlePostAMC = async () => {
    if (formData.start_date >= formData.end_date) {
      toast.error(" Start Date must be before End Date.");
      return;
    }

    if (!formData.vendor_id) {
      return toast.error("Please select supplier");
    }
    if (!formData.start_date || !formData.end_date) {
      return toast.error("Please select start and end date");
    }

    try {
      const dataToSend = new FormData();
      dataToSend.append("asset_amc[vendor_id]", formData.vendor_id);
      dataToSend.append("asset_amc[asset_id]", formData.asset_id);
      dataToSend.append("asset_amc[start_date]", formData.start_date);
      dataToSend.append("asset_amc[end_date]", formData.end_date);
      dataToSend.append("asset_amc[frequency]", formData.frequency);
      formData.terms.forEach((file) => dataToSend.append("terms[]", file));
      const res = await postAMC(dataToSend);
      console.log(res);
      setFormData(initialFormData);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setUpdate(true);
      toast.success("New AMC Added");
    } catch (error) {
      console.log(error);
    }
  };
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (files, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: files,
    });
    console.log(fieldName);
  };
  const columns = [
    {
      name: "View",
      cell: (row) => (
        <div className="flex items-center gap-4">
          <Link to={`/asset/asset-amc/${row.id}`}>
            <BsEye size={15} />
          </Link>
          <Link to={`/assets/edit-amc/${row.id}`}>
            <BiEdit size={15} />
          </Link>
        </div>
      ),
    },
    {
      name: "Vendor ",
      selector: (row) => row.vendor_name,
      sortable: true,
    },
    {
      name: "Start Date",
      selector: (row) => row.start_date,
      sortable: true,
    },
    {
      name: "End Date",
      selector: (row) => row.end_date,
      sortable: true,
    },
    {
      name: "Frequency",
      selector: (row) => row.frequency,
      sortable: true,
    },
  ];

  return (
    <section className="space-y-6">
      {/* AMC Details Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            AMC Details
          </h2>
        </div>
        <div className="p-6">
          <Table columns={columns} data={amcDetails} />
        </div>
      </div>

      {/* Add AMC Form */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add AMC
          </h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label htmlFor="vendor" className="text-sm font-medium text-foreground mb-1">
                Vendor <span className="text-red-500">*</span>
              </label>
              <select
                name="vendor_id"
                id="vendor"
                value={formData.vendor_id}
                onChange={handleChange}
                className="border border-border p-2 rounded-md bg-card text-foreground"
              >
                <option value="">Select Vendor</option>
                {vendors.map((vendor) => (
                  <option value={vendor.id} key={vendor.id}>
                    {vendor.company_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="start_date" className="text-sm font-medium text-foreground mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                id="start_date"
                className="border border-border p-2 rounded-md bg-card text-foreground"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="end_date" className="text-sm font-medium text-foreground mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                id="end_date"
                className="border border-border p-2 rounded-md bg-card text-foreground"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="frequency" className="text-sm font-medium text-foreground mb-1">
                Frequency
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                id="frequency"
                className="border border-border p-2 rounded-md bg-card text-foreground"
              >
                <option value="">Select Frequency</option>
                <option value="one Time">One Time</option>
                <option value="Hourly">Hourly</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half yearly">Half yearly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-foreground mb-3">Upload AMC Terms</h3>
            <FileInputBox
              handleChange={(event) => handleFileChange(event, "terms")}
            />
          </div>

          <div className="flex justify-center mt-6">
            <button
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
              onClick={handlePostAMC}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AMCDetails;