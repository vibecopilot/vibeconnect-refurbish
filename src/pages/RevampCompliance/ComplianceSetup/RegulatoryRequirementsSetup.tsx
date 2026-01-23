import React, { useEffect, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { FaCheck, FaTrash } from "react-icons/fa";
import { PiPlusCircle } from "react-icons/pi";
import { MdClose } from "react-icons/md";
import Table from "../../../components/table/Table";
import { getItemInLocalStorage } from "../../../utils/localStorage";
import toast from "react-hot-toast";
// TODO: Import API functions when available
// import { getRegulatoryRequirements, postRegulatoryRequirement, deleteRegulatoryRequirement, updateRegulatoryRequirement, getComplianceCategories } from "../../../api";

interface RegulatoryRequirement {
  id: number;
  name: string;
  description?: string;
  regulation_number?: string;
  category_id: number;
  category_name?: string;
  effective_date?: string;
  expiry_date?: string;
  version?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

const RegulatoryRequirementsSetup: React.FC = () => {
  const [addRequirement, setAddRequirement] = useState(false);
  const [editRequirement, setEditRequirement] = useState<RegulatoryRequirement | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    regulation_number: "",
    category_id: "",
    effective_date: "",
    expiry_date: "",
    version: "",
  });
  const companyId = getItemInLocalStorage("COMPANYID");
  const [requirements, setRequirements] = useState<RegulatoryRequirement[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      // TODO: Replace with actual API call
      // const res = await getComplianceCategories();
      // setCategories(res.data);
      
      // Static placeholder - remove when API is ready
      setCategories([]);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const res = await getRegulatoryRequirements();
      // setRequirements(res.data);
      
      // Static placeholder - remove when API is ready
      setRequirements([]);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch regulatory requirements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchRequirements();
  }, []);

  const handleAddRequirement = async () => {
    if (!formData.name.trim()) {
      toast.error("Regulatory requirement name is required");
      return;
    }
    if (!formData.category_id) {
      toast.error("Category is required");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      regulation_number: formData.regulation_number.trim() || null,
      category_id: Number(formData.category_id),
      effective_date: formData.effective_date || null,
      expiry_date: formData.expiry_date || null,
      version: formData.version.trim() || null,
      active: true,
      resource_id: companyId,
      resource_type: "Pms::CompanySetup",
    };

    try {
      // TODO: Replace with actual API call
      // if (editRequirement) {
      //   await updateRegulatoryRequirement(editRequirement.id, payload);
      //   toast.success("Regulatory requirement updated successfully!");
      // } else {
      //   await postRegulatoryRequirement(payload);
      //   toast.success("Regulatory requirement created successfully!");
      // }
      
      // Static placeholder - add to local state
      const selectedCategory = categories.find(cat => cat.id === Number(formData.category_id));
      if (editRequirement) {
        setRequirements(requirements.map(req => 
          req.id === editRequirement.id 
            ? { ...req, ...formData, category_name: selectedCategory?.name }
            : req
        ));
        toast.success("Regulatory requirement updated successfully!");
      } else {
        const newRequirement: RegulatoryRequirement = {
          id: requirements.length + 1,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          regulation_number: formData.regulation_number.trim() || undefined,
          category_id: Number(formData.category_id),
          category_name: selectedCategory?.name,
          effective_date: formData.effective_date || undefined,
          expiry_date: formData.expiry_date || undefined,
          version: formData.version.trim() || undefined,
          active: true,
        };
        setRequirements([...requirements, newRequirement]);
        toast.success("Regulatory requirement created successfully!");
      }
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        regulation_number: "",
        category_id: "",
        effective_date: "",
        expiry_date: "",
        version: "",
      });
      setAddRequirement(false);
      setEditRequirement(null);
    } catch (error) {
      console.log(error);
      toast.error(editRequirement ? "Failed to update regulatory requirement" : "Failed to create regulatory requirement");
    }
  };

  const handleDeleteRequirement = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this regulatory requirement?")) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await deleteRegulatoryRequirement(id);
      // toast.success("Regulatory requirement deleted successfully");
      // fetchRequirements();
      
      // Static placeholder - remove from local state
      setRequirements(requirements.filter(req => req.id !== id));
      toast.success("Regulatory requirement deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete regulatory requirement");
    }
  };

  const handleEditRequirement = (requirement: RegulatoryRequirement) => {
    setEditRequirement(requirement);
    setFormData({
      name: requirement.name,
      description: requirement.description || "",
      regulation_number: requirement.regulation_number || "",
      category_id: String(requirement.category_id),
      effective_date: requirement.effective_date || "",
      expiry_date: requirement.expiry_date || "",
      version: requirement.version || "",
    });
    setAddRequirement(true);
  };

  const handleCancel = () => {
    setAddRequirement(false);
    setEditRequirement(null);
    setFormData({
      name: "",
      description: "",
      regulation_number: "",
      category_id: "",
      effective_date: "",
      expiry_date: "",
      version: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const columns = [
    { 
      name: "Name", 
      selector: (row: RegulatoryRequirement) => row.name, 
      sortable: true 
    },
    { 
      name: "Regulation Number", 
      selector: (row: RegulatoryRequirement) => row.regulation_number || "-", 
      sortable: true 
    },
    { 
      name: "Category", 
      selector: (row: RegulatoryRequirement) => row.category_name || "-", 
      sortable: true 
    },
    { 
      name: "Version", 
      selector: (row: RegulatoryRequirement) => row.version || "-", 
      sortable: true 
    },
    { 
      name: "Effective Date", 
      selector: (row: RegulatoryRequirement) => row.effective_date ? new Date(row.effective_date).toLocaleDateString() : "-", 
      sortable: true 
    },
    { 
      name: "Status", 
      selector: (row: RegulatoryRequirement) => row.active ? "Active" : "Inactive", 
      sortable: true 
    },
    {
      name: "Action",
      cell: (row: RegulatoryRequirement) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleEditRequirement(row)} 
            className="text-blue-500 hover:text-blue-700"
          >
            <BiEdit size={15} />
          </button>
          <button 
            onClick={() => handleDeleteRequirement(row.id)} 
            className="text-muted-foreground hover:text-destructive"
          >
            <FaTrash size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="mx-2">
      <div className="w-full flex flex-col gap-2 overflow-hidden">
        <div className="flex justify-end">
          {addRequirement && (
            <div className="flex flex-col gap-3 w-full border border-border rounded-lg p-4 bg-card">
              <h3 className="text-lg font-semibold text-foreground">
                {editRequirement ? "Edit Regulatory Requirement" : "Add Regulatory Requirement"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Requirement Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter requirement name"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Regulation Number
                  </label>
                  <input
                    type="text"
                    name="regulation_number"
                    placeholder="e.g., Act 2020, Section 5"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={formData.regulation_number}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <select
                    name="category_id"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={formData.category_id}
                    onChange={handleChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    name="version"
                    placeholder="e.g., v1.0, 2020"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={formData.version}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    name="effective_date"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={formData.effective_date}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiry_date"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={formData.expiry_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Enter description (optional)"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  className="px-4 py-2 text-sm border border-border rounded-lg text-foreground hover:bg-muted inline-flex items-center gap-2"
                  onClick={handleCancel}
                >
                  <MdClose /> Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2"
                  onClick={handleAddRequirement}
                >
                  <FaCheck /> {editRequirement ? "Update" : "Submit"}
                </button>
              </div>
            </div>
          )}
          {!addRequirement && (
            <button
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2"
              onClick={() => setAddRequirement(true)}
            >
              <PiPlusCircle /> Add Regulatory Requirement
            </button>
          )}
        </div>
        <div>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table columns={columns} data={requirements} isPagination={true} />
          )}
        </div>
      </div>
    </section>
  );
};

export default RegulatoryRequirementsSetup;
