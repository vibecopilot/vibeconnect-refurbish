import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Upload, X, Save } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getItemInLocalStorage } from "../../utils/localStorage";

<ToastContainer position="top-right" />

/* ---------- API CONFIG ---------- */
const API_BASE = "https://admin.vibecopilot.ai";
const API_TOKEN = getItemInLocalStorage("TOKEN");

/* ---------- TYPES ---------- */
interface GenericInfo {
    id: number;
    name: string;
    site_id?: number;
}

interface GenericSubInfo {
    id: number;
    name: string;
    generic_info_name: number;
}


interface ContactFormData {
    company_name: string;
    contact_person_name: string;
    mobile: string;
    landline_no: string;
    primary_email: string;
    secondary_email: string;
    website: string;
    address: string;
    key_offering: string;
    description: string;
    profile: string;
    generic_info_id: string;
    generic_sub_info_id: string;
    site_id?: string;
    status: boolean;
}

/* ---------- COMPONENT ---------- */
const ContactBookEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<GenericInfo[]>([]);
    const [subCategories, setSubCategories] = useState<GenericSubInfo[]>([]);
    const [companyLogo, setCompanyLogo] = useState<File | null>(null);
    const [attachment, setAttachment] = useState<File | null>(null);
    const [existingLogo, setExistingLogo] = useState<string | null>(null);
    const [existingAttachment, setExistingAttachment] = useState<string | null>(null);
    const [removeLogo, setRemoveLogo] = useState(false);
    const [removeAttachment, setRemoveAttachment] = useState(false);


    const [formData, setFormData] = useState<ContactFormData>({
        company_name: "",
        contact_person_name: "",
        mobile: "",
        landline_no: "",
        primary_email: "",
        secondary_email: "",
        website: "",
        address: "",
        key_offering: "",
        description: "",
        profile: "",
        generic_info_id: "",
        generic_sub_info_id: "",
        status: true,
    });

    /* ---------- FETCH CATEGORIES ---------- */
    useEffect(() => {
        fetchCategories();
    }, []);

    /* ---------- FETCH DATA FOR EDIT ---------- */
    useEffect(() => {
        if (id) {
            fetchContact();
        }
    }, [id]);

    /* ---------- FETCH SUBCATEGORIES WHEN CATEGORY CHANGES ---------- */
    useEffect(() => {
        if (formData.generic_info_id) {
            fetchSubCategories(formData.generic_info_id);
        } else {
            setSubCategories([]);
        }
    }, [formData.generic_info_id]);

    /* ---------- API CALLS ---------- */
    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_BASE}/generic_infos.json?token=${API_TOKEN}`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            toast.error("Failed to load categories");
        }
    };

    const fetchSubCategories = async (categoryId: string) => {
        try {
            const res = await fetch(
                `${API_BASE}/generic_sub_infos.json?token=${API_TOKEN}&generic_info_name=${categoryId}`
            );
            if (res.ok) {
                const data = await res.json();
                setSubCategories(data);
            }
        } catch (error) {
            console.error("Failed to fetch subcategories:", error);
            toast.error("Failed to load subcategories");
        }
    };

    const fetchContact = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/contact_books/${id}.json?token=${API_TOKEN}`);

            if (!res.ok) throw new Error("Failed to fetch contact");

            const data = await res.json();
            const categoryId = data.generic_info?.id?.toString() || "";
            const subCategoryId = data.generic_sub_info?.id?.toString() || "";

            setFormData({
                company_name: data.company_name || "",
                contact_person_name: data.contact_person_name || "",
                mobile: data.mobile || "",
                landline_no: data.landline_no || "",
                primary_email: data.primary_email || "",
                secondary_email: data.secondary_email || "",
                website: data.website || "",
                address: data.address || "",
                key_offering: data.key_offering || "",
                description: data.description || "",
                profile: data.profile || "",
                generic_info_id: data.generic_info_id?.toString() || "",
                generic_sub_info_id: data.generic_sub_info_id?.toString() || "",
                site_id: data.site_id?.toString() || "",
                status: data.status ?? true,
            });

            const logoUrl =
                data.logo && data.logo.length > 0
                    ? `${API_BASE}${data.logo[0].document}`
                    : null;

            const attachmentUrl =
                data.contact_books_attachment && data.contact_books_attachment.length > 0
                    ? `${API_BASE}${data.contact_books_attachment[0].document}`
                    : null;

            setExistingLogo(logoUrl);
            setExistingAttachment(attachmentUrl);

            if (categoryId) {
                fetchSubCategories(categoryId);
            }
        } catch (err) {
            console.error("Fetch failed", err);
            toast.error("Failed to load contact details");
        } finally {
            setLoading(false);
        }
    };

    /* ---------- HANDLERS ---------- */
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setCompanyLogo(e.target.files[0]);
            setRemoveLogo(true);
        }
    };

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setAttachment(e.target.files[0]);
            setRemoveAttachment(true);
        }
    };


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if ((name === "mobile" || name === "landline_no") && !/^\d*$/.test(value)) {
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "generic_info_id" ? { generic_sub_info_id: "" } : {}),
        }));
    };

    /* ---------- SAVE HANDLER ---------- */
    const handleSave = async () => {
        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.company_name) return toast.error("Please Enter Company Name");
        if (!formData.contact_person_name) return toast.error("Please Enter Contact Person Name");
        if (!formData.mobile) return toast.error("Please Enter Mobile Number");
        if (!/^\d{10}$/.test(formData.mobile)) return toast.error("Mobile Number must be exactly 10 digits");
        if (!formData.primary_email) return toast.error("Please Enter Primary Email");
        if (!emailRegex.test(formData.primary_email)) return toast.error("Please Enter Valid Primary Email");
        // if (formData.secondary_email && !emailRegex.test(formData.secondary_email)) {
        //     return toast.error("Please Enter Valid Secondary Email");
        // }
        if (formData.generic_info_id) {
            fetchSubCategories(formData.generic_info_id);
        }
        if (!formData.generic_sub_info_id) return toast.error("Please Select Sub Category");


        try {
            setLoading(true);

            const selectedCategory = categories.find(
                (c) => c.id.toString() === formData.generic_info_id
            );

            const submitData = new FormData();

            // fields
            submitData.append("contact_book[company_name]", formData.company_name);
            submitData.append("contact_book[contact_person_name]", formData.contact_person_name);
            submitData.append("contact_book[mobile]", formData.mobile);
            submitData.append("contact_book[landline_no]", formData.landline_no);
            submitData.append("contact_book[primary_email]", formData.primary_email);
            submitData.append("contact_book[secondary_email]", formData.secondary_email);
            submitData.append("contact_book[website]", formData.website);
            submitData.append("contact_book[key_offering]", formData.key_offering);
            submitData.append("contact_book[address]", formData.address);
            submitData.append("contact_book[description]", formData.description);
            submitData.append("contact_book[profile]", formData.profile);
            submitData.append("contact_book[generic_info_id]", formData.generic_info_id);
            submitData.append("contact_book[generic_sub_info_id]", formData.generic_sub_info_id);

            if (selectedCategory?.site_id) {
                submitData.append("contact_book[site_id]", selectedCategory.site_id.toString());
            }

            // files (ONLY IF SELECTED)
            if (companyLogo) {
                submitData.append("contact_book[logo][]", companyLogo);
            }

            if (attachment) {
                submitData.append("contact_book[contact_books_attachment][]", attachment);
            }

            if (removeLogo) {
                submitData.append("contact_book[remove_logo]", "true");
            }

            if (removeAttachment) {
                submitData.append("contact_book[remove_contact_books_attachment]", "true");
            }



            const res = await fetch(`${API_BASE}/contact_books/${id}.json?token=${API_TOKEN}`, {
                method: "PUT",
                body: submitData,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error("Error response:", errorData);

                if (errorData.errors) {
                    Object.entries(errorData.errors).forEach(([field, messages]) => {
                        toast.error(`${field}: ${(messages as string[]).join(", ")}`);
                    });
                } else {
                    throw new Error("Failed to update contact");
                }
                return;
            }

            toast.success("Contact updated successfully");
            navigate("/contact-book");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save contact");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.company_name) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ToastContainer position="top-right" />

            {/* ---------- HEADER ---------- */}
            <div className="bg-white px-6 py-4 mx-4 mt-4 rounded-lg shadow-sm">
                <nav className="flex items-center text-xs text-gray-500">
                    <span
                        className="cursor-pointer hover:text-purple-600"
                        onClick={() => navigate("/contact-book")}
                    >
                        Contact Book
                    </span>
                    <ChevronRight size={12} className="mx-2" />
                    <span className="text-gray-700 font-medium">Edit</span>
                </nav>

                <h2 className="text-xl font-semibold mt-2">Edit Contact</h2>

                {/* LOGO */}
                <div className="flex flex-col items-center my-6">
                    <label className="flex items-center justify-center w-20 h-20 rounded-full border-2 border-black cursor-pointer">
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
                        ) : existingLogo ? (
                            <img
                                src={existingLogo}
                                alt="Company Logo"
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <Upload className="w-6 h-6 text-gray-500" />
                        )}
                    </label>
                    <span className="text-xs mt-1">
                        {companyLogo ? "New logo selected" : existingLogo ? "Click to change logo" : "Upload logo"}
                    </span>
                </div>
            </div>

            {/* ---------- FORM ---------- */}
            <div className="p-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <Input
                            label="Company Name"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleChange}
                        />
                        <Input
                            label="Contact Person"
                            name="contact_person_name"
                            value={formData.contact_person_name}
                            onChange={handleChange}
                        />
                        <Input
                            label="Mobile"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            maxLength={10}
                        />
                        <Input
                            label="Landline"
                            name="landline_no"
                            value={formData.landline_no}
                            onChange={handleChange}
                        />
                        <Input
                            label="Primary Email"
                            name="primary_email"
                            value={formData.primary_email}
                            onChange={handleChange}
                        />
                        <Input
                            label="Secondary Email"
                            name="secondary_email"
                            value={formData.secondary_email}
                            onChange={handleChange}
                        />
                        <Input
                            label="Website"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                        />
                        <Select
                            label="Category"
                            name="generic_info_id"
                            value={formData.generic_info_id}
                            onChange={handleChange}
                            options={categories.map(c => ({
                                value: c.id.toString(),
                                label: c.name,
                            }))}
                        />

                        <Select
                            label="Sub Category"
                            name="generic_sub_info_id"
                            value={formData.generic_sub_info_id}
                            onChange={handleChange}
                            options={subCategories.map(sc => ({
                                value: sc.id.toString(),
                                label: sc.name,
                            }))}
                            disabled={!formData.generic_info_id}
                        />

                        <Input
                            label="Key Offering"
                            name="key_offering"
                            value={formData.key_offering}
                            onChange={handleChange}
                        />
                    </div>

                    <TextArea
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                    />
                    <TextArea
                        label="Profile"
                        name="profile"
                        value={formData.profile}
                        onChange={handleChange}
                    />
                    <TextArea
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />

                    {/* ATTACHMENT */}
                    <div className="mt-4">
                        <label className="block text-xs font-semibold mb-1">Attachments</label>
                        <label className="flex flex-col items-center justify-center h-24 border border-dashed border-gray-300 rounded-md text-xs cursor-pointer hover:bg-gray-50">
                            <input
                                type="file"
                                hidden
                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                                onChange={handleAttachmentChange}
                            />
                            <Upload className="w-5 h-5 text-gray-500 mb-1" />
                            <span className="nline-flex items-center gap-2 px-8 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors text-sm font-medium">Click to upload</span>
                            {attachment && (
                                <span className="text-[10px] mt-1 text-green-600">{attachment.name}</span>
                            )}
                            {/* {!attachment && existingAttachment && (
                                <span className="text-[15px] mt-1 text-gray-500">
                                    Current file attached
                                </span>
                            )} */}

                        </label>
                    </div>

                    {/* ---------- BUTTONS ---------- */}
                    <div className="flex gap-4 mt-8 justify-end">
                        {/* Cancel Button */}
                        <button
                            onClick={() => navigate("/contact-book")}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-md
               border border-gray-400 text-gray-900
               bg-white hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-md
               bg-purple-600 text-white hover:bg-purple-700
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-colors"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

/* ---------- REUSABLE COMPONENTS ---------- */
const Input = ({ label, ...props }: any) => (
    <div>
        <label className="block text-xs font-semibold mb-1">{label}</label>
        <input {...props} className="w-full border rounded px-2 py-1 text-sm" />
    </div>
);

const Select = ({ label, options, disabled, ...props }: any) => (
    <div>
        <label className="block text-xs font-semibold mb-1">{label}</label>
        <select
            {...props}
            disabled={disabled}
            className="w-full border rounded px-2 py-1 text-sm disabled:bg-gray-100"
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

const TextArea = ({ label, ...props }: any) => (
    <div className="mt-4">
        <label className="block text-xs font-semibold mb-1">{label}</label>
        <textarea {...props} rows={3} className="w-full border rounded px-2 py-2 text-sm" />
    </div>
);

export default ContactBookEdit;