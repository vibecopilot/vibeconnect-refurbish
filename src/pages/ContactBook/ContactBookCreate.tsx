import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ChevronRight } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ---------- CATEGORY OPTIONS ---------- */
const CATEGORY_OPTIONS = [
  "Security Manager",
  "Emergency Services",
  "Maintenance",
  "IT Services",
];

/* ---------- SUB CATEGORY OPTIONS ---------- */
const SUB_CATEGORY_OPTIONS: Record<string, string[]> = {
  "Security Manager": ["Guard", "Supervisor", "CCTV Operator"],
  "Emergency Services": ["Hospital", "Police", "Fire Brigade"],
  Maintenance: ["Electrician", "Plumber", "Carpenter"],
  "IT Services": ["Network", "Hardware", "Software"],
};

/* ---------- INITIAL FORM STATE ---------- */
const initialFormState = {
  companyName: "",
  contactPerson: "",
  mobile: "",
  landline: "",
  primaryEmail: "",
  secondaryEmail: "",
  website: "",
  category: "",
  subCategory: "",
  keyOfferings: "",
  address: "",
  description: "",
  profile: "",
};

const ContactBookCreate: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialFormState);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);

  /* ---------- HANDLERS ---------- */
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setCompanyLogo(e.target.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setAttachment(e.target.files[0]);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if ((name === "mobile" || name === "landline") && !/^\d*$/.test(value)) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { subCategory: "" } : {}),
    }));
  };

  /* ---------- VALIDATION (REFERENCE STYLE) ---------- */
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!form.companyName) return toast.error("Please Enter Company Name");
  if (!form.contactPerson) return toast.error("Please Enter Contact Person Name");

  // MOBILE
  if (!form.mobile) return toast.error("Please Enter Mobile Number");
  if (!/^\d{10}$/.test(form.mobile)) {
    return toast.error("Mobile Number must be exactly 10 digits");
  }

  // EMAIL
  if (!form.primaryEmail) return toast.error("Please Enter Primary Email");
  if (!emailRegex.test(form.primaryEmail)) {
    return toast.error("Please Enter Valid Primary Email");
  }

  if (!form.secondaryEmail) return toast.error("Please Enter Secondary Email");
  if (!emailRegex.test(form.secondaryEmail)) {
    return toast.error("Please Enter Valid Secondary Email");
  }

  if (!form.landline) return toast.error("Please Enter Landline Number");
  if (!form.website) return toast.error("Please Enter Website");
  if (!form.category) return toast.error("Please Select Category");
  if (!form.subCategory) return toast.error("Please Select Sub Category");
  if (!form.keyOfferings) return toast.error("Please Enter Key Offerings");
  if (!form.address) return toast.error("Please Enter Address");
  if (!form.description) return toast.error("Please Enter Description");
  if (!form.profile) return toast.error("Please Enter Profile");

  if (!companyLogo) return toast.error("Please Upload Company Logo");
  if (!attachment) return toast.error("Please Upload Attachment");
  const formData = new FormData();
  formData.append("company_name", form.companyName);
  formData.append("contact_person", form.contactPerson);
  formData.append("mobile", form.mobile);
  formData.append("landline", form.landline);
  formData.append("primary_email", form.primaryEmail);
  formData.append("secondary_email", form.secondaryEmail);
  formData.append("website", form.website);
  formData.append("category", form.category);
  formData.append("sub_category", form.subCategory);
  formData.append("key_offerings", form.keyOfferings);
  formData.append("address", form.address);
  formData.append("description", form.description);
  formData.append("profile", form.profile);

  if (companyLogo) formData.append("logo", companyLogo);
  if (attachment) formData.append("attachment", attachment);

  try {
    const res = await fetch(`https://admin.vibecopilot.ai/contact_books.json?token=efe990d24b0379af8b5ba3d0a986ac802796bc2e0db15552`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to create contact book");

    const data = await res.json();
    toast.success("Contact Book Created Successfully");
    console.log("Created Contact Book:", data);
    navigate("/contact-book");
  } catch (error) {
    console.error(error);
    toast.error("Failed to create Contact Book");
  }

  toast.success("Contact Book Created Successfully");

  console.log("FORM DATA:", form);
  navigate("/dashboard");
};


  const handleCancel = () => {
    navigate("/contact-book");
  };

  /* ---------- JSX ---------- */
  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />

      {/* HEADER */}
      <div className="w-full bg-white px-6 py-3 mx-4 mt-4 rounded-lg shadow-sm">
        <nav className="flex items-center text-xs text-gray-500">
          <span
            className="cursor-pointer hover:text-purple-600 text-sm-100"
            onClick={() => navigate("/contact-book")}
          >
            Contact Book
          </span>
          <ChevronRight size={12} className="mx-2" />
          <span className="text-gray-700 font-medium text-sm-100">
            Create Contact
          </span>
        </nav>

        <div className="text-black font-semibold text-xl mt-2">
          Add Contact Book
        </div>

        {/* LOGO */}
        <div className="flex flex-col items-center my-6">
          <label className="flex items-center justify-center w-20 h-20 rounded-full border-2 border-black cursor-pointer">
            <input type="file" hidden accept=".jpg,.jpeg,.png" onChange={handleLogoChange} />
            {companyLogo ? (
              <img
                src={URL.createObjectURL(companyLogo)}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <Upload className="w-6 h-6 text-gray-500" />
            )}
          </label>
          <span className="text-xs mt-1">Company Logo</span>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white mx-4 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} />
          <Input label="Contact Person Name" name="contactPerson" value={form.contactPerson} onChange={handleChange} />
          <Input label="Mobile Number" name="mobile" maxLength={10} value={form.mobile} onChange={handleChange}
          />

          <Input label="Landline" name="landline" value={form.landline} onChange={handleChange} />
          <Input label="Primary Email" name="primaryEmail" value={form.primaryEmail} onChange={handleChange} />
          <Input label="Secondary Email" name="secondaryEmail" value={form.secondaryEmail} onChange={handleChange} />
          <Input label="Website" name="website" value={form.website} onChange={handleChange} />

          <Select label="Category" name="category" value={form.category} onChange={handleChange} options={CATEGORY_OPTIONS} />
          <Select label="Sub Category" name="subCategory" value={form.subCategory} onChange={handleChange} options={SUB_CATEGORY_OPTIONS[form.category] || []} disabled={!form.category} />
          <Input label="Key Offerings" name="keyOfferings" value={form.keyOfferings} onChange={handleChange} />
        </div>

        <TextArea label="Address" name="address" value={form.address} onChange={handleChange} />
        <TextArea label="Description" name="description" value={form.description} onChange={handleChange} />
        <TextArea label="Profile" name="profile" value={form.profile} onChange={handleChange} />

     {/* ATTACHMENTS */}
<div className="mt-4">
<label className="block text-xs font-semibold mb-1">Attachments</label>
<label className="flex flex-col items-center justify-center h-24 border border-dashed border-gray-300 rounded-md text-xs cursor-pointer hover:bg-gray-50">
<input
type="file"
hidden
accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
onChange={handleFileChange}
/>
<Upload className="w-5 h-5 text-gray-500 mb-1" />
<span className="text-gray-600">Click to upload</span>
{attachment && (
<span className="text-[10px] mt-1 text-green-600">
{attachment.name}
</span>
)}
</label>
</div>

        {/* BUTTONS */}
        <div className="mt-6 flex justify-center gap-4">
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-6 py-2 rounded-md">
            Submit
          </button>
          <button type="button" onClick={handleCancel} className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-6 py-2 rounded-md">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactBookCreate;

/* ---------- REUSABLE COMPONENTS ---------- */

const Input = ({ label, ...props }: any) => (
  <div>
    <label className="block text-xs font-semibold mb-1">{label}</label>
    <input {...props} className="w-full border rounded px-2 py-1 text-sm" />
  </div>
);

const Select = ({ label, options, ...props }: any) => (
  <div>
    <label className="block text-xs font-semibold mb-1">{label}</label>
    <select {...props} className="w-full border rounded px-2 py-1 text-sm">
      <option value="">Select {label}</option>
      {options.map((o: string) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

const TextArea = ({ label, ...props }: any) => (
  <div className="mt-4">
    <label className="block text-xs font-semibold mb-1">{label}</label>
    <textarea {...props} rows={3} className="w-full border rounded px-2 py-2 text-sm" />
  </div>
);
