import React, { useEffect, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { FaCheck, FaTrash } from "react-icons/fa";
import { PiPlusCircle } from "react-icons/pi";
import { MdClose } from "react-icons/md";
import Table from "../../../components/table/Table";
import { getItemInLocalStorage } from "../../../utils/localStorage";
import toast from "react-hot-toast";
// TODO: Import API functions when available
// import { getDocumentTypes, postDocumentType, deleteDocumentType, updateDocumentType } from "../../../api";

interface DocumentType {
  id: number;
  name: string;
  description?: string;
  category: string; // Certificates, Licenses, Reports, etc.
  expiry_tracking: boolean;
  expiry_reminder_days?: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

const DocumentTypesSetup: React.FC = () => {
  const [addDocumentType, setAddDocumentType] = useState(false);
  const [editDocumentType, setEditDocumentType] = useState<DocumentType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    expiry_tracking: false,
    expiry_reminder_days: 30,
  });
  const companyId = getItemInLocalStorage("COMPANYID");
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(false);

  const documentCategories = [
    "Certificates",
    "Licenses",
    "Reports",
    "Permits",
    "Insurance",
    "Contracts",
    "Other",
  ];

  const fetchDocumentTypes = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const res = await getDocumentTypes();
      // setDocumentTypes(res.data);
      
      // Static placeholder - remove when API is ready
      setDocumentTypes([]);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch document types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const handleAddDocumentType = async () => {
    if (!formData.name.trim()) {
      toast.error("Document type name is required");
      return;
    }
    if (!formData.category) {
      toast.error("Category is required");
      return;
    }
    if (formData.expiry_tracking && (!formData.expiry_reminder_days || formData.expiry_reminder_days < 0)) {
      toast.error("Expiry reminder days must be a positive number");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      category: formData.category,
      expiry_tracking: formData.expiry_tracking,
      expiry_reminder_days: formData.expiry_tracking ? formData.expiry_reminder_days : null,
      active: true,
      resource_id: companyId,
      resource_type: "Pms::CompanySetup",
    };

    try {
      // TODO: Replace with actual API call
      // if (editDocumentType) {
      //   await updateDocumentType(editDocumentType.id, payload);
      //   toast.success("Document type updated successfully!");
      // } else {
      //   await postDocumentType(payload);
      //   toast.success("Document type created successfully!");
      // }
      
      // Static placeholder - add to local state
      if (editDocumentType) {
        setDocumentTypes(documentTypes.map(type => 
          type.id === editDocumentType.id 
            ? { ...type, ...formData }
            : type
        ));
        toast.success("Document type updated successfully!");
      } else {
        const newDocumentType: DocumentType = {
          id: documentTypes.length + 1,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category,
          expiry_tracking: formData.expiry_tracking,
          expiry_reminder_days: formData.expiry_tracking ? formData.expiry_reminder_days : undefined,
          active: true,
        };
        setDocumentTypes([...documentTypes, newDocumentType]);
        toast.success("Document type created successfully!");
      }
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        expiry_tracking: false,
        expiry_reminder_days: 30,
      });
      setAddDocumentType(false);
      setEditDocumentType(null);
    } catch (error) {
      console.log(error);
      toast.error(editDocumentType ? "Failed to update document type" : "Failed to create document type");
    }
  };

  const handleDeleteDocumentType = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this document type?")) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await deleteDocumentType(id);
      // toast.success("Document type deleted successfully");
      // fetchDocumentTypes();
      
      // Static placeholder - remove from local state
      setDocumentTypes(documentTypes.filter(type => type.id !== id));
      toast.success("Document type deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete document type");
    }
  };

  const handleEditDocumentType = (type: DocumentType) => {
    setEditDocumentType(type);
    setFormData({
      name: type.name,
      description: type.description || "",
      category: type.category,
      expiry_tracking: type.expiry_tracking,
      expiry_reminder_days: type.expiry_reminder_days || 30,
    });
    setAddDocumentType(true);
  };

  const handleCancel = () => {
    setAddDocumentType(false);
    setEditDocumentType(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      expiry_tracking: false,
      expiry_reminder_days: 30,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : 
              type === "number" ? Number(value) : value
    }));
  };

  const columns = [
    { 
      name: "Document Type", 
      selector: (row: DocumentType) => row.name, 
      sortable: true 
    },
    { 
      name: "Category", 
      selector: (row: DocumentType) => row.category, 
      sortable: true 
    },
    { 
      name: "Expiry Tracking", 
      selector: (row: DocumentType) => row.expiry_tracking ? "Yes" : "No", 
      sortable: true 
    },
    { 
      name: "Reminder Days", 
      selector: (row: DocumentType) => row.expiry_tracking ? `${row.expiry_reminder_days || 0} days` : "-", 
      sortable: true 
    },
    { 
      name: "Status", 
      selector: (row: DocumentType) => row.active ? "Active" : "Inactive", 
      sortable: true 
    },
    {
      name: "Action",
      cell: (row: DocumentType) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleEditDocumentType(row)} 
            className="text-blue-500 hover:text-blue-700"
          >
            <BiEdit size={15} />
          </button>
          <button 
            onClick={() => handleDeleteDocumentType(row.id)} 
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
          {addDocumentType && (
            <div className="flex flex-col gap-3 w-full border border-border rounded-lg p-4 bg-card">
              <h3 className="text-lg font-semibold text-foreground">
                {editDocumentType ? "Edit Document Type" : "Add Document Type"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Document Type Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g., Fire Safety Certificate, Building License"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <select
                    name="category"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Select Category</option>
                    {documentCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="expiry_tracking"
                    id="expiry_tracking"
                    className="w-4 h-4"
                    checked={formData.expiry_tracking}
                    onChange={handleChange}
                  />
                  <label htmlFor="expiry_tracking" className="text-sm text-foreground">
                    Enable Expiry Tracking
                  </label>
                </div>

                {formData.expiry_tracking && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Expiry Reminder (Days)
                    </label>
                    <input
                      type="number"
                      name="expiry_reminder_days"
                      min="1"
                      placeholder="30"
                      className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                      value={formData.expiry_reminder_days}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Enter description (optional)"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    rows={3}
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
                  onClick={handleAddDocumentType}
                >
                  <FaCheck /> {editDocumentType ? "Update" : "Submit"}
                </button>
              </div>
            </div>
          )}
          {!addDocumentType && (
            <button
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2"
              onClick={() => setAddDocumentType(true)}
            >
              <PiPlusCircle /> Add Document Type
            </button>
          )}
        </div>
        <div>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table columns={columns} data={documentTypes} isPagination={true} />
          )}
        </div>
      </div>
    </section>
  );
};

export default DocumentTypesSetup;
