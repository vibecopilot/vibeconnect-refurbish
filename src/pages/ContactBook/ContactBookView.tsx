import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, ChevronRight } from "lucide-react";

/* ---------- API BASE URL ---------- */
const API_URL =
  "https://admin.vibecopilot.ai/contact_books"; // we'll fetch `${API_URL}/${id}.json?token=...`

/* ---------- TYPES ---------- */
interface Contact {
  id: number;
  company_name: string;
  contact_person: string;
  mobile: string;
  landline?: string;
  primary_email: string;
  secondary_email?: string;
  website?: string;
  category: string;
  sub_category?: string;
  key_offerings?: string;
  address?: string;
  description?: string;
  profile?: string;
  logo?: string;
  attachment?: string;
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
      </div>

      <div className="p-6">
        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <img
            src={data.logo}
            className="w-24 h-24 rounded-full object-cover border"
          />
        </div>

        {/* DETAILS */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <Field label="Company Name" value={data.company_name} />
            <Field label="Contact Person" value={data.contact_person} />
            <Field label="Mobile" value={data.mobile} />
            <Field label="Landline" value={data.landline || "-"} />
            <Field label="Primary Email" value={data.primary_email} />
            <Field label="Secondary Email" value={data.secondary_email || "-"} />
            <Field label="Website" value={data.website || "-"} />
            <Field label="Category" value={data.category} />
            <Field label="Sub Category" value={data.sub_category || "-"} />
            <Field label="Key Offerings" value={data.key_offerings || "-"} />
            <Field label="Address" value={data.address || "-"} />
            <Field label="Description" value={data.description || "-"} />
            <Field label="Profile" value={data.profile || "-"} />
            <Field label="Created At" value={data.created_at || "-"} />
            <Field label="Updated At" value={data.updated_at || "-"} />
          </div>

          {/* ATTACHMENT */}
          {data.attachment && (
            <div className="mt-6">
              <h4 className="font-semibold text-sm mb-2">Attachment</h4>
              <img
                src={data.attachment}
                className="w-24 h-24 rounded border object-cover"
              />
            </div>
          )}
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
