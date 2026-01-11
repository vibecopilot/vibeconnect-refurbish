import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, ChevronRight } from "lucide-react";

/* ---------- API BASE URL ---------- */
const API_URL = "https://admin.vibecopilot.ai/contact_books";
const FILE_BASE_URL = "https://admin.vibecopilot.ai";


interface FileItem {
    id: number;
    document: string;
}

/* ---------- TYPES ---------- */

interface Contact {
    id: number;
    company_name: string;
    contact_person_name: string;
    mobile: string;
    landline_no?: string;
    primary_email: string;
    secondary_email?: string;
    website?: string;
    key_offering?: string;
    address?: string;
    description?: string;
    profile?: string;
    logo?: FileItem[];
    contact_books_attachment?: FileItem[];
    status: boolean;
    generic_info_name?: string;
    generic_sub_info_name?: string;
    created_at?: string;
    updated_at?: string;
}

const ContactBookView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const res = await fetch(
                    `${API_URL}/${id}.json?token=efe990d24b0379af8b5ba3d0a986ac802796bc2e0db15552`
                );
                if (!res.ok) throw new Error("Failed to fetch contact");
                const json = await res.json();
                setData(json);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchContact();
    }, [id]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (!data) return <div className="p-6">No data found</div>;

    const Field = ({ label, value }: any) => (
        <div className="flex gap-2 text-sm">
            <span className="font-semibold min-w-[130px]">{label} :</span>
            <span className="text-gray-700 break-words">{value || "-"}</span>
        </div>
    );
    const isImage = (url: string) =>
        /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

    const getFileName = (url: string) =>
        decodeURIComponent(url.split("/").pop() || "Attachment");




    return (
        <div className="min-h-screen bg-gray-50">
            {/* HEADER */}
            <div className="w-full bg-white px-6 py-3 mx-4 mt-4 rounded-lg shadow-sm">
                <nav className="flex items-center text-xs text-gray-500">
                    <span
                        className="cursor-pointer hover:text-purple-600"
                        onClick={() => navigate("/contact-book")}
                    >
                        Contact Book
                    </span>
                    <ChevronRight size={12} className="mx-2" />
                    <span className="text-gray-700 font-medium">View</span>
                </nav>
                <div className="text-black font-semibold text-xl mt-2">
                    Contact Details
                </div>

                <div className="p-6">
                    {/* edit button */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => navigate(`/contact-book/edit/${id}`)}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-2 py-2 rounded-md text-sm font-semibold"
                        >
                            <Pencil size={16} /> Edit Contact
                        </button>
                    </div>

                    {/* LOGO */}
                    <div className="flex justify-center mb-6">
                        {data.logo && data.logo.length > 0 ? (
                            <img
                                src={`${FILE_BASE_URL}${data.logo[0].document}`}
                                alt="Company Logo"
                                className="w-24 h-24 rounded-full object-cover border"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full border flex items-center justify-center text-gray-400 text-xs">
                                No Logo
                            </div>
                        )}
                    </div>

                </div>

                {/* DETAILS */}
                <div className="bg-white rounded-lg shadow p-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <Field label="Company Name" value={data.company_name || "-"} />
                        <Field label="Contact Person" value={data.contact_person_name || "-"} />
                        <Field label="Mobile" value={data.mobile} />
                        <Field label="Landline" value={data.landline_no || "-"} />
                        <Field label="Primary Email" value={data.primary_email || "-"} />
                        <Field label="Secondary Email" value={data.secondary_email || "-"} />
                        <Field label="Website" value={data.website || "-"} />
                        <Field label="Category" value={data.generic_info_name || "-"} />
                        <Field label="Sub Category" value={data.generic_sub_info_name || "-"} />
                        <Field label="Key Offerings" value={data.key_offering || "-"} />
                        <Field label="Address" value={data.address || "-"} />
                        <Field label="Description" value={data.description || "-"} />
                        <Field label="Profile" value={data.profile || "-"} />
                        <Field label="Status" value={data.status ? "Active" : "Inactive"} />
                        <Field label="Created At" value={data.created_at || "-"} />
                        <Field label="Updated At" value={data.updated_at || "-"} />
                    </div>

                    {/* contact_books_attachment */}
                    <div className="mt-8">
                        <h4 className="font-semibold text-sm mb-2">Attachment</h4>

                        <div className="border rounded-md p-3 min-w-[200px] min-h-[140px] flex items-center justify-center bg-gray-50">
                            {data.contact_books_attachment &&
                                data.contact_books_attachment.length > 0 ? (
                                (() => {
                                    const file = data.contact_books_attachment[0];
                                    const fileUrl = `${FILE_BASE_URL}${file.document}`;

                                    return isImage(fileUrl) ? (
                                        <img
                                            src={fileUrl}
                                            alt="Attachment"
                                            className="w-32 h-32 rounded object-cover border"
                                        />
                                    ) : (
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-600 text-sm underline"
                                        >
                                            {getFileName(file.document)}
                                        </a>
                                    );
                                })()
                            ) : (
                                <span className="text-sm text-gray-400">
                                    No attachment uploaded
                                </span>
                            )}
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

/* ---------- FIELD COMPONENT ---------- */
const Field = ({ label, value }: any) => (
    <div>
        <label className="font-semibold">{label} :</label>
        <div className="text-gray-700 mt-1">{value}</div>
    </div>
);

export default ContactBookView;
