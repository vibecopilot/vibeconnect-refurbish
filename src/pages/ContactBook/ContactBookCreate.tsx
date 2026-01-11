import * as XLSX from 'xlsx';
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Upload, ChevronRight, CheckCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { postContactBook } from "../../@api"; // adjust path if needed
import axios from "axios";
import { postContactBook } from '../../api';


/* ---------- TYPES ---------- */
interface GenericInfo {
  id: number;
  name: string;
  site_id?: number;
}

interface GenericSubInfo {
  id: number;
  name: string;
  generic_info_id: number;
}

/* ---------- INITIAL FORM STATE ---------- */
const initialFormState = {
  companyName: "",
  contactPerson: "",
  mobile: "",
  landline: "",
  primaryEmail: "",
  secondaryEmail: "",
  website: "",
  categoryId: "",
  subCategoryId: "",
  keyOfferings: "",
  address: "",
  description: "",
  profile: "",
  // logo:"",
  // contact_book_attachment:"",
  status: true,
};

const ContactBookCreate: React.FC = () => {
  const navigate = useNavigate();
  // const API_TOKEN = "efe990d24b0379af8b5ba3d0a986ac802796bc2e0db15552";
  const API_BASE = "https://admin.vibecopilot.ai";
  const API_TOKEN = localStorage.getItem("TOKEN");

  const [form, setForm] = useState(initialFormState);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [categories, setCategories] = useState<GenericInfo[]>([]);
  const [subCategories, setSubCategories] = useState<GenericSubInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  useEffect(() => {
    setLoading(false);
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE}/generic_infos.json?token=${API_TOKEN}`
      );
      setCategories(res.data);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };
  // /* ---------- FETCH CATEGORIES ON MOUNT ---------- */
  useEffect(() => {
    fetchCategories();
  }, []);

  /* ---------- API CALLS ---------- */
  const fetchSubCategories = async (categoryId: string) => {
    try {
      const res = await axios.get(
        `${API_BASE}/generic_sub_infos.json?token=${API_TOKEN}&generic_info_id=${categoryId}`
      );
      setSubCategories(res.data);
    } catch (error) {
      toast.error("Failed to load sub categories");
    }
  };

  /* ---------- FETCH SUBCATEGORIES WHEN CATEGORY CHANGES ---------- */
  useEffect(() => {
    if (form.categoryId) {
      fetchSubCategories(form.categoryId);
    } else {
      setSubCategories([]);
    }
  }, [form.categoryId]);


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
      ...(name === "categoryId" ? { subCategoryId: "" } : {}),
    }));
  };

  const handleStatusToggle = () => {
    setForm((prev) => ({ ...prev, status: !prev.status }));
  };

  /* ---------- VALIDATION + SUBMIT ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    /* ---------- VALIDATION (UNCHANGED) ---------- */
    if (!form.companyName) return toast.error("Please Enter Company Name");
    if (!form.contactPerson) return toast.error("Please Enter Contact Person Name");
    if (!form.mobile) return toast.error("Please Enter Mobile Number");
    if (!/^\d{10}$/.test(form.mobile))
      return toast.error("Mobile Number must be exactly 10 digits");
    if (!form.primaryEmail) return toast.error("Please Enter Primary Email");
    if (!emailRegex.test(form.primaryEmail))
      return toast.error("Please Enter Valid Primary Email");
    if (!form.secondaryEmail) return toast.error("Please Enter Secondary Email");
    if (!emailRegex.test(form.secondaryEmail))
      return toast.error("Please Enter Valid Secondary Email");
    if (!form.landline) return toast.error("Please Enter Landline Number");
    if (!form.website) return toast.error("Please Enter Website");
    if (!form.categoryId) return toast.error("Please Select Category");
    if (!form.subCategoryId) return toast.error("Please Select Sub Category");
    if (!form.keyOfferings) return toast.error("Please Enter Key Offerings");
    if (!form.address) return toast.error("Please Enter Address");
    if (!form.description) return toast.error("Please Enter Description");
    if (!form.profile) return toast.error("Please Enter Profile");
    if (!companyLogo) return toast.error("Please Upload Company Logo");
    if (!attachment) return toast.error("Please Upload Attachment");

    /* ---------- FORM DATA ---------- */
    const formData = new FormData();

    const selectedCategory = categories.find(
      (c) => c.id.toString() === form.categoryId
    );

    formData.append("contact_book[company_name]", form.companyName);
    formData.append("contact_book[contact_person_name]", form.contactPerson);
    formData.append("contact_book[mobile]", form.mobile);
    formData.append("contact_book[landline_no]", form.landline);
    formData.append("contact_book[primary_email]", form.primaryEmail);
    formData.append("contact_book[secondary_email]", form.secondaryEmail);
    formData.append("contact_book[website]", form.website);
    formData.append("contact_book[key_offering]", form.keyOfferings);
    formData.append("contact_book[address]", form.address);
    formData.append("contact_book[description]", form.description);
    formData.append("contact_book[profile]", form.profile);
    formData.append("contact_book[status]", form.status.toString());

    if (selectedCategory?.site_id) {
      formData.append(
        "contact_book[site_id]",
        selectedCategory.site_id.toString()
      );
    }

    formData.append("contact_book[generic_info_id]", form.categoryId);
    formData.append("contact_book[generic_sub_info_id]", form.subCategoryId);

    if (companyLogo) {
      formData.append("contact_book[logo][]", companyLogo);
    }
    if (attachment) {
      formData.append("contact_book[attachments][]", attachment);
    }

    /* ---------- API CALL USING AXIOS ---------- */
    try {
      setSubmitLoading(true);

      const response = await postContactBook(formData);

      toast.success("Contact Book Created Successfully!");

      setForm(initialFormState);
      setAttachment(null);
      setCompanyLogo(null);

      setTimeout(() => {
        navigate("/contact-book", {
          state: { refetch: true, newContactId: response.data.id },
        });
      }, 1500);
    } catch (error: any) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        const errors = error.response?.data?.errors;
        if (errors) {
          Object.entries(errors).forEach(([field, messages]: any) => {
            toast.error(`${field}: ${messages.join(", ")}`);
          });
          return;
        }
      }

      toast.error("Failed to create Contact Book");
    } finally {
      setSubmitLoading(false);
    }
  };


  const handleCancel = () => {
    navigate("/contact-book");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />

      {/* HEADER */}
      <div className="w-full bg-white px-6 py-3 mx-4 mt-4 rounded-lg shadow-sm">
        <nav className="flex items-center text-xs text-gray-500">
          <span
            className="cursor-pointer hover:text-purple-600 text-sm"
            onClick={() => navigate("/contact-book")}
          >
            Contact Book
          </span>
          <ChevronRight size={12} className="mx-2" />
          <span className="text-gray-700 font-medium text-sm">
            Add
          </span>
        </nav>

        <div className="flex items-center justify-between">
          <div className="text-black font-semibold text-xl mt-2">
            Add Contact Book
          </div>
        </div>

        {/* LOGO */}
        <div className="flex flex-col items-center my-6">
          <label className="flex items-center justify-center w-20 h-20 rounded-full border-2 border border-gray-500 cursor-pointer hover:border-purple-400">
            <input
              type="file"
              hidden
              accept=".jpg,.jpeg,.png"
              onChange={handleLogoChange}
            />
            {companyLogo ? (
              <img
                src={URL.createObjectURL(companyLogo)}
                alt="Company Logo"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <Upload className="w-6 h-6 text-gray-500" />
            )}
          </label>
          <span className="text-xs mt-1 text-gray-500">Company Logo</span>
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white mx-4 rounded-lg shadow p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Company Name "
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
          />
          <Input
            label="Contact Person Name "
            name="contactPerson"
            value={form.contactPerson}
            onChange={handleChange}
          />
          <Input
            label="Mobile Number "
            name="mobile"
            maxLength={10}
            value={form.mobile}
            onChange={handleChange}
          />

          <Input
            label="Landline "
            name="landline"
            value={form.landline}
            onChange={handleChange}
          />
          <Input
            label="Primary Email "
            name="primaryEmail"
            type="email"
            value={form.primaryEmail}
            onChange={handleChange}
          />
          <Input
            label="Secondary Email "
            name="secondaryEmail"
            type="email"
            value={form.secondaryEmail}
            onChange={handleChange}
          />
          <Input
            label="Website "
            name="website"
            value={form.website}
            onChange={handleChange}
          />

          <Select
            label="Category"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            options={categories.map(c => ({
              value: c.id.toString(),
              label: c.name
            }))}
          />
          <Select
            label="Sub Category"
            name="subCategoryId"
            value={form.subCategoryId}
            onChange={handleChange}
            options={subCategories.map(sc => ({
              value: sc.id.toString(),
              label: sc.name
            }))}
            disabled={!form.categoryId}
          />

          <Input
            label="Key Offerings "
            name="keyOfferings"
            value={form.keyOfferings}
            onChange={handleChange}
          />
          {/* Status Toggle */}
          <div className="flex items-center gap-3">
            <span className="mt-4 text-xs font-bold">Status:</span>
            <button
              type="button"
              onClick={handleStatusToggle}
              className={`relative inline-flex h-6 w-12 items-center rounded-full mt-4 transition-colors ${form.status ? "bg-green-600" : "bg-gray-300"
                }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${form.status ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
            <span
              className={`text-sm font-semibold min-w-[60px] ${form.status ? "text-green-600 mt-4" : "text-gray-500 mt-4"
                }`}
            >
              {form.status ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <TextArea
          label="Address "
          name="address"
          value={form.address}
          onChange={handleChange}
        />
        <TextArea
          label="Description "
          name="description"
          value={form.description}
          onChange={handleChange}
        />
        <TextArea
          label="Profile "
          name="profile"
          value={form.profile}
          onChange={handleChange}
        />

        {/* ATTACHMENTS */}
        <div className="mt-6">
          <label className="block text-xs font-semibold mb-2 text-gray-700">
            Attachments
          </label>
          <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 rounded-lg text-xs cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
            <input
              type="file"
              hidden
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
            />
            <Upload className="w-6 h-6 text-gray-500 mb-2" />
            <span className="text-gray-600 font-medium">Click to upload file</span>
            <span className="text-xs text-gray-400">JPG, PNG, PDF, DOC, XLS</span>
            {attachment && (
              <span className="text-xs mt-2 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                ✓ {attachment.name}
              </span>
            )}
          </label>
        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-xs px-8 py-3 rounded-lg font-medium transition-colors"
            disabled={submitLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-xs px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:cursor-not-allowed"
          >
            {submitLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              "Create Contact"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ---------- REUSABLE COMPONENTS ---------- */
const Input = ({ label, required, ...props }: any) => (
  <div>
    <label className="block text-xs font-semibold mb-1 text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
    />
  </div>
);

const Select = ({ label, options, disabled, required, ...props }: any) => (
  <div>
    <label className="block text-xs font-semibold mb-1 text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      {...props}
      disabled={disabled}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
    >
      <option value="">Select {label}</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const TextArea = ({ label, required, ...props }: any) => (
  <div className="mt-4">
    <label className="block text-xs font-semibold mb-1 text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      {...props}
      rows={3}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical transition-all"
    />
  </div>
);

export default ContactBookCreate;
