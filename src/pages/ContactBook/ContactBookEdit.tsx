import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/ui/Breadcrumb";
import { Loader2, Save, X, Upload, ArrowLeft, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { getItemInLocalStorage } from "../../utils/localStorage";
import { domainPrefix, editContactBook, getContactBookDetails, getGenericCategory, getGenericSubCategory } from "../../api";

/* ---------- API CONFIG ---------- */
const API_BASE = domainPrefix;
const API_TOKEN = getItemInLocalStorage("TOKEN");

/* ---------- TYPES ---------- */
interface GenericInfo {
    id: number;
    name: string;
    site_id?: number;
    generic_sub_infos?: GenericSubInfo[];
}

interface GenericSubInfo {
    id: number;
    name: string;
}

interface Attachment {
    id: number;
    document: string;
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
    status: boolean;
}

/* ---------- COMPONENT ---------- */
const ContactBookEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<GenericInfo[]>([]);
    const [subCategories, setSubCategories] = useState<GenericSubInfo[]>([]);

    // Existing attachments from server
    const [existingLogos, setExistingLogos] = useState<Attachment[]>([]);
    const [existingDocuments, setExistingDocuments] = useState<Attachment[]>([]);

    // New files to upload
    const [newLogos, setNewLogos] = useState<File[]>([]);
    const [newDocuments, setNewDocuments] = useState<File[]>([]);

    // IDs to remove
    const [removedLogoIds, setRemovedLogoIds] = useState<number[]>([]);
    const [removedDocumentIds, setRemovedDocumentIds] = useState<number[]>([]);

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

    /* ---------- FETCH INITIAL DATA ---------- */
    useEffect(() => {
        const init = async () => {
            const categoryData = await fetchCategories();
            if (id) fetchContact(categoryData);
        };
        init();
    }, [id]);

    const fetchCategories = async () => {
        const res = await getGenericCategory();
        console.log("respo", res.data);
        const data = res?.data || [];
        setCategories(data);
        return data; // Return for immediate use
    };

    const fetchSubCategories = (categoryId: string, categoryList?: GenericInfo[]) => {
        const list = categoryList || categories;
        const selectedCategory = list.find(c => c.id.toString() === categoryId);
        if (selectedCategory && selectedCategory.generic_sub_infos) {
            setSubCategories(selectedCategory.generic_sub_infos);
        } else {
            setSubCategories([]);
        }
    };

    const fetchContact = async (categoryList?: GenericInfo[]) => {
        try {
            // const res = await fetch(`${API_BASE}/contact_books/${id}.json?token=${API_TOKEN}`);
            const res = await getContactBookDetails(id)
            const data = res?.data;

            setFormData({
                company_name: data.company_name || "",
                contact_person_name: data.contact_person_name || "",
                mobile: String(data.mobile ?? ""),
                landline_no: String(data.landline_no ?? ""),
                primary_email: data.primary_email || "",
                secondary_email: data.secondary_email || "",
                website: data.website || "",
                address: data.address || "",
                key_offering: data.key_offering || "",
                description: data.description || "",
                profile: data.profile || "",
                generic_info_id: data.generic_info_id?.toString() || "",
                generic_sub_info_id: data.generic_sub_info_id?.toString() || "",
                status: data.status ?? true,
            });

            // Use the passed categoryList to fetch sub-categories
            if (data.generic_info_id && categoryList) {
                fetchSubCategories(data.generic_info_id.toString(), categoryList);
            }

            // Set existing logos
            if (data.logo?.length) {
                setExistingLogos(data.logo.map((l: any) => ({ id: l.id, document: l.document })));
            }
            
            // Set existing documents
            if (data.contact_books_attachment?.length) {
                setExistingDocuments(
                    data.contact_books_attachment
                        .filter((d: any) => d.document)
                        .map((d: any) => ({
                            id: d.id,
                            document: d.document
                        }))
                );
            }

        } catch {
            toast.error("Failed to load contact");
        } finally {
            setLoading(false);
        }
    };

    /* ---------- HANDLERS ---------- */
    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;

        if (name === "mobile" || name === "landline_no") {
            if (!/^\d*$/.test(value)) return;

            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
            return;
        }


        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === "generic_info_id" ? { generic_sub_info_id: "" } : {}),
        }));

        if (name === "generic_info_id") fetchSubCategories(value);
    };

    /* ---------- REMOVE HANDLERS ---------- */
    const handleRemoveLogo = (logoId: number) => {
        setRemovedLogoIds(prev => [...prev, logoId]);
        setExistingLogos(prev => prev.filter(l => l.id !== logoId));
    };

    const handleRemoveDocument = (docId: number) => {
        setRemovedDocumentIds(prev => [...prev, docId]);
        setExistingDocuments(prev => prev.filter(d => d.id !== docId));
    };

    const handleRemoveNewLogo = (index: number) => {
        setNewLogos(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveNewDocument = (index: number) => {
        setNewDocuments(prev => prev.filter((_, i) => i !== index));
    };

    /* ---------- SAVE ---------- */
    const handleSave = async () => {

        if (!formData.company_name) return toast.error("Company name required");
        const mobile = String(formData.mobile).replace(/\D/g, "");

        if (mobile.length !== 10) {
            return toast.error("Mobile No must be exactly 10 digits");
        }

        try {
            setSaving(true);
            const fd = new FormData();

            Object.entries(formData).forEach(([k, v]) =>
                fd.append(`contact_book[${k}]`, v as string)
            );

            // Add removed logo IDs
            removedLogoIds.forEach(id => {
                fd.append("removed_logo_ids[]", id.toString());
            });

            // Add removed document IDs
            removedDocumentIds.forEach(id => {
                fd.append("removed_document_ids[]", id.toString());
            });

            // Add new logos
            newLogos.forEach(file => {
                fd.append("logo[]", file);
            });

            // Add new documents
            newDocuments.forEach(file => {
                fd.append("attachfiles[]", file);
            });

            await editContactBook(id!, fd);

            toast.success("Contact Book Updated");
            navigate("/contact-book");
        } catch {
            toast.error("Update failed");
        } finally {
            setSaving(false);
        }
    };

    /* ---------- LOADING ---------- */
    if (loading) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading contact...</p>
            </div>
        );
    }

    /* ---------- RENDER ---------- */
    return (
        <div className="p-6">
            <Breadcrumb
                items={[
                    { label: "Contact Book", path: "/contact-book" },
                    { label: "Edit" },
                ]}
            />

            {/* Header */}
            <div className="flex items-center gap-4 mt-4 mb-6">
                <button
                    onClick={() => navigate("/contact-book")}
                    className="p-2 hover:bg-muted rounded-lg"
                >
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Edit Contact</h1>
                    <p className="text-sm text-muted-foreground">
                        Update company and contact details
                    </p>
                </div>
            </div>

            {/* Company Logo */}
            <div className="mt-4 mb-6">
                <label className="text-xs font-semibold mb-2 block">
                    Company Logo
                </label>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Existing Logos */}
                    {existingLogos.map((logo) => (
                        <div key={logo.id} className="relative group">
                            <div className="w-24 h-24 border border-border rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                                <img
                                    src={`${API_BASE}${logo.document}`}
                                    alt="Existing logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveLogo(logo.id)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {/* New Logos Preview */}
                    {newLogos.map((file, index) => (
                        <div key={index} className="relative group">
                            <div className="w-24 h-24 border border-border rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="New logo preview"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveNewLogo(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {/* Upload Button */}
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            id="companyLogo"
                            hidden
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setNewLogos(prev => [...prev, file]);
                                }
                                e.target.value = ''; // Reset input
                            }}
                        />
                        <label
                            htmlFor="companyLogo"
                            className="w-24 h-24 border-2 border-dashed border-border rounded-lg cursor-pointer text-sm hover:bg-accent flex flex-col items-center justify-center gap-1"
                        >
                            <Upload className="w-5 h-5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Add Logo</span>
                        </label>
                    </div>
                </div>
            </div>


            <div className="bg-card border border-border rounded-xl shadow-sm">
                <div className="p-6 space-y-8">

                    {/* SECTION 1 */}
                    <Section title="Basic Information" index={1}>
                        <Grid>
                            <Input label="Company Name" name="company_name" value={formData.company_name} onChange={handleChange} />
                            <Input label="Contact Person" name="contact_person_name" value={formData.contact_person_name} onChange={handleChange} />
                            <Input label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} />
                            <Input label="Landline" name="landline_no" value={formData.landline_no} onChange={handleChange} />
                        </Grid>
                    </Section>

                    {/* SECTION 2 */}
                    <Section title="Contact Details" index={2}>
                        <Grid>
                            <Input label="Primary Email" name="primary_email" value={formData.primary_email} onChange={handleChange} />
                            <Input label="Secondary Email" name="secondary_email" value={formData.secondary_email} onChange={handleChange} />
                            <Input label="Website" name="website" value={formData.website} onChange={handleChange} />
                        </Grid>
                    </Section>

                    {/* SECTION 3 */}
                    <Section title="Category" index={3}>
                        <Grid>
                            <Select label="Category" name="generic_info_id" value={formData.generic_info_id} onChange={handleChange}
                                options={categories.map(c => ({ value: c.id, label: c.name }))} />
                            <Select label="Sub Category" name="generic_sub_info_id" value={formData.generic_sub_info_id} onChange={handleChange}
                                options={subCategories.map(s => ({ value: s.id, label: s.name }))} />
                        </Grid>
                    </Section>
                    {/* SECTION 4 */}
                    <Section title="Status" index={4}>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() =>
                                    setFormData(prev => ({ ...prev, status: true }))
                                }
                                className={`px-6 py-2 rounded-lg border text-sm font-medium
        ${formData.status
                                        ? "bg-green-100 border-green-300 text-green-700"
                                        : "bg-muted border-border text-muted-foreground"
                                    }
      `}
                            >
                                Active
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setFormData(prev => ({ ...prev, status: false }))
                                }
                                className={`px-6 py-2 rounded-lg border text-sm font-medium
        ${!formData.status
                                        ? "bg-red-100 border-red-300 text-red-700"
                                        : "bg-muted border-border text-muted-foreground"
                                    }
      `}
                            >
                                Inactive
                            </button>
                        </div>
                    </Section>


                    {/* SECTION 5 */}
                    <Section title="Description & Attachments" index={5}>
                        <TextArea label="Address" name="address" value={formData.address} onChange={handleChange} />
                        <TextArea label="Profile" name="profile" value={formData.profile} onChange={handleChange} />
                        <TextArea label="Description" name="description" value={formData.description} onChange={handleChange} />

                        {/* Existing Documents */}
                        {/* Existing Attachments */}
                        {existingDocuments.length > 0 && (
                            <div className="mt-4">
                                <label className="text-xs font-semibold mb-2 block">
                                    Existing Attachments
                                </label>

                                <div className="flex flex-wrap gap-4">
                                    {existingDocuments.map((doc) => {
                                        const fileName = doc.document.split("/").pop() || "Document";
                                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.document);

                                        return (
                                            <div key={doc.id} className="relative group">
                                                <div className="w-24 h-24 border border-border rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                                                    {isImage ? (
                                                        <img
                                                            src={`${API_BASE}${doc.document}`}
                                                            alt={fileName}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center p-2">
                                                            <FileText className="w-8 h-8 text-muted-foreground" />
                                                            <span className="text-xs text-muted-foreground truncate w-full text-center mt-1">
                                                                {fileName}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* DELETE BUTTON */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDocument(doc.id)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center
                                       opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}


                        {/* New Documents Preview */}
                        {newDocuments.length > 0 && (
                            <div className="mt-4">
                                <label className="text-xs font-semibold mb-2 block">New Attachments</label>
                                <div className="flex flex-wrap gap-3">
                                    {newDocuments.map((file, index) => {
                                        const isImage = file.type.startsWith('image/');
                                        return (
                                            <div key={index} className="relative group">
                                                <div className="w-24 h-24 border border-border rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                                                    {isImage ? (
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={file.name}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center p-2">
                                                            <FileText className="w-8 h-8 text-muted-foreground" />
                                                            <span className="text-xs text-muted-foreground truncate w-full text-center mt-1">{file.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveNewDocument(index)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Upload New Documents */}
                        <div className="mt-4">
                            <input
                                type="file"
                                hidden
                                id="uploadDoc"
                                multiple
                                onChange={(e) => {
                                    const files = e.target.files ? Array.from(e.target.files) : [];
                                    if (files.length) {
                                        setNewDocuments(prev => [...prev, ...files]);
                                    }
                                    e.target.value = "";
                                }}
                            />

                            {/* ENTIRE BOX IS CLICKABLE */}
                            <label
                                htmlFor="uploadDoc"
                                className="block border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer
                                 hover:bg-purple transition"
                            >
                                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm font-bold text-white bg-purple-600 inline-block px-3 py-2 rounded-lg">
                                    Click  to upload attachments
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Images, PDFs, DOC files supported
                                </p>
                            </label>
                        </div>

                    </Section>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-border">
                        <button
                            onClick={() => navigate("/contact-book")}
                            className="px-6 py-2.5 bg-muted rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

/* ---------- UI HELPERS ---------- */

const Section = ({ title, index, children }: any) => (
    <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                {index}
            </span>
            {title}
        </h2>
        {children}
    </div>
);

const Grid = ({ children }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>
);

const Input = ({ label, ...props }: any) => (
    <div>
        <label className="text-xs font-semibold mb-1 block">{label}</label>
        <input {...props} className="w-full border rounded-lg px-3 py-2 text-sm" />
    </div>
);

const Select = ({ label, options, ...props }: any) => (
    <div>
        <label className="text-xs font-semibold mb-1 block">{label}</label>
        <select {...props} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="">Select {label}</option>
            {options.map((o: any) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    </div>
);

const TextArea = ({ label, ...props }: any) => (
    <div>
        <label className="text-xs font-semibold mb-1 block">{label}</label>
        <textarea {...props} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" />
    </div>
);

export default ContactBookEdit;
