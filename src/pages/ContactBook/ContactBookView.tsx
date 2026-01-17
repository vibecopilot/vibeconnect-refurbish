import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    Loader2, Edit, Building, User, Phone, Mail, Globe,
    FileText, Calendar, ArrowLeft, ExternalLink
} from "lucide-react";
import Breadcrumb from "../../components/ui/Breadcrumb";

const API_URL = "https://admin.vibecopilot.ai/contact_books";
const DOMAIN = "https://admin.vibecopilot.ai";

interface FileItem {
    id: number;
    document: string;
}

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
    const [contact, setContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchContact = async () => {
            try {
                const res = await fetch(`${API_URL}/${id}.json?token=${localStorage.getItem("TOKEN")}`);
                const data = await res.json();
                setContact(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchContact();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading contact details...</p>
            </div>
        );
    }

    if (!contact) {
        return <div className="p-6">Contact not found</div>;
    }

    const formatDate = (date?: string) =>
        date ? new Date(date).toLocaleString() : "-";

    return (
        <div className="p-6">
            <Breadcrumb items={[
                { label: "Contact Book", path: "/contact-book" },
                { label: contact.company_name }
            ]} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/contact-book")}
                        className="p-2 hover:bg-muted rounded-lg"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>

                    <div className="space-y-1">
                        {/* Company Name */}
                        <h1 className="text-2xl font-bold">
                            {contact.company_name}
                        </h1>

                        {/* ID + Status */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                                # {contact.id}
                            </span>

                            <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium
            ${contact.status
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }
          `}
                            >
                                {contact.status ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </div>

                <Link
                    to={`/contact-book/edit/${id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                    <Edit className="w-4 h-4" />
                    Edit Contact
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* MAIN CONTENT */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Contact Information" icon={<Building />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Info label="Company" value={contact.company_name} icon={<Building />} />
                            <Info label="Contact Person" value={contact.contact_person_name} icon={<User />} />
                            <Info label="Mobile" value={contact.mobile} icon={<Phone />} />
                            <Info label="Landline" value={contact.landline_no || "-"} icon={<Phone />} />
                            <Info label="Primary Email" value={contact.primary_email} icon={<Mail />} />
                            <Info label="Secondary Email" value={contact.secondary_email || "-"} icon={<Mail />} />
                            <Info label="Category" value={contact.generic_info_name || "-"} icon={<Mail />} />
                            <Info label="Sub Category" value={contact.generic_sub_info_name || "-"} icon={<Mail />} />
                            <Info label="Website" value={contact.website || "-"} icon={<Globe />} />
                        </div>
                    </Card>



                    {/* Description */}
                    {(contact.description || contact.profile) && (
                        <Card title="Description" icon={<FileText />}>
                            {contact.profile && <p className="mb-3">{contact.profile}</p>}
                            {contact.description && <p>{contact.description}</p>}
                        </Card>
                    )}

                    {/* Attachments */}
                    {contact.contact_books_attachment?.length ? (
                        <Card title={`Attachments (${contact.contact_books_attachment.length})`}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {contact.contact_books_attachment.map((file) => (
                                    <a
                                        key={file.id}
                                        href={DOMAIN + file.document}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative aspect-square rounded-lg overflow-hidden border"
                                    >
                                        <img
                                            src={DOMAIN + file.document}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                            <ExternalLink className="w-6 h-6 text-white" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </Card>
                    ) : null}
                </div>

                {/* SIDEBAR */}
                <div className="space-y-6">
                    {/* Logo */}
                    <Card title="Company Logo">
                        {contact.logo?.length ? (
                            <img
                                src={DOMAIN + contact.logo[0].document}
                                className="w-32 h-32 rounded-full object-cover mx-auto"
                            />
                        ) : (
                            <p className="text-center text-muted-foreground">No logo</p>
                        )}
                    </Card>

                    {/* Timeline */}
                    <Card title="Timeline" icon={<Calendar />}>
                        <Timeline label="Created At" value={formatDate(contact.created_at)} />
                        <Timeline label="Updated At" value={formatDate(contact.updated_at)} />
                    </Card>
                </div>
            </div>
        </div>
    );
};

/* ---------- REUSABLE UI ---------- */

const Card = ({ title, icon, children }: any) => (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-border flex items-center gap-2">
            {icon}
            <h2 className="font-semibold">{title}</h2>
        </div>
        <div className="p-6">{children}</div>
    </div>
);


const Info = ({ label, value, icon }: any) => (
    <div className="flex items-start gap-3">
        <div className="text-muted-foreground mt-0.5">
            {icon}
        </div>
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground break-words">
                {value}
            </p>
        </div>
    </div>
);


const Timeline = ({ label, value }: any) => (
    <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
    </div>
);

export default ContactBookView;
