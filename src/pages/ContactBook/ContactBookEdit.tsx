import React, { useState } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Pencil } from "lucide-react";

/* ---------- MOCK DATA ---------- */
const CONTACT = {
  id: 1,
  companyName: "vibecopilot",
  contactPerson: "Vinayak Rathod",
  mobile: "9527697180",
  landline: "",
  primaryEmail: "vinayak313@gmail.com",
  secondaryEmail: "",
  website: "",
  category: "Security Manager",
  subCategory: "",
  keyOffering: "",
  createdOn: "02/06/2025, 10:15:30",
  updatedOn: "05/11/2025, 18:35:36",
  address: "",
  description: "",
  profile: "",
  logo:
    "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=300",
  attachment:
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=200",
};

const ContactBookEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isEditMode = searchParams.get("mode") === "edit";

  const [formData, setFormData] = useState(CONTACT);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-500 to-yellow-400 text-white py-3 text-center font-semibold">
        Contact Details
      </div>

      <div className="p-6">
        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-2 mb-4">
          {isEditMode ? (
            <>
              <button
                onClick={() => {
                  console.log("Saved:", formData);
                  navigate(`/contact-book/edit/${id}`);
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Save
              </button>
              <button
                onClick={() => navigate(`/contact-book/edit/${id}`)}
                className="border px-4 py-2 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() =>
                navigate(`/contact-book/details/${id}?mode=details`)
              }
              className="flex items-center gap-2 border px-4 py-2 rounded hover:bg-gray-100"
            >
              <Pencil size={16} /> Edit
            </button>
          )}
        </div>

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <img
            src={formData.logo}
            className="w-24 h-24 rounded-full object-cover border"
          />
        </div>

        {/* DETAILS */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <Field
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              isEdit={isEditMode}
              onChange={handleChange}
            />
            <Field
              label="Contact Person"
              name="contactPerson"
              value={formData.contactPerson}
              isEdit={isEditMode}
              onChange={handleChange}
            />
            <Field
              label="Mobile"
              name="mobile"
              value={formData.mobile}
              isEdit={isEditMode}
              onChange={handleChange}
            />

            <Field
              label="Landline"
              name="landline"
              value={formData.landline}
              isEdit={isEditMode}
              onChange={handleChange}
            />
            <Field
              label="Primary Email"
              name="primaryEmail"
              value={formData.primaryEmail}
              isEdit={isEditMode}
              onChange={handleChange}
            />
            <Field
              label="Secondary Email"
              name="secondaryEmail"
              value={formData.secondaryEmail}
              isEdit={isEditMode}
              onChange={handleChange}
            />

            <Field
              label="Website"
              name="website"
              value={formData.website}
              isEdit={isEditMode}
              onChange={handleChange}
            />
            <Field
              label="Category"
              name="category"
              value={formData.category}
              isEdit={isEditMode}
              onChange={handleChange}
            />
            <Field
              label="Sub Category"
              name="subCategory"
              value={formData.subCategory}
              isEdit={isEditMode}
              onChange={handleChange}
            />

            <Field
              label="Key Offering"
              name="keyOffering"
              value={formData.keyOffering}
              isEdit={isEditMode}
              onChange={handleChange}
            />
            <StaticField label="Created On" value={formData.createdOn} />
            <StaticField label="Updated On" value={formData.updatedOn} />
          </div>

          <TextArea
            title="Address"
            name="address"
            value={formData.address}
            isEdit={isEditMode}
            onChange={handleChange}
          />

          <TextArea
            title="Description"
            name="description"
            value={formData.description}
            isEdit={isEditMode}
            onChange={handleChange}
          />

          <TextArea
            title="Profile"
            name="profile"
            value={formData.profile}
            isEdit={isEditMode}
            onChange={handleChange}
          />

          {/* ATTACHMENT */}
          <div className="mt-6">
            <h4 className="font-semibold text-sm mb-2">Attachments</h4>
            <img
              src={formData.attachment}
              className="w-24 h-24 rounded border object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- SMALL COMPONENTS ---------- */
const Field = ({
  label,
  name,
  value,
  isEdit,
  onChange,
}: any) => (
  <div>
    <label className="font-semibold">{label} :</label>
    {isEdit ? (
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-purple-500"
      />
    ) : (
      <div className="text-gray-700 mt-1">{value || "-"}</div>
    )}
  </div>
);

const StaticField = ({ label, value }: any) => (
  <div>
    <label className="font-semibold">{label} :</label>
    <div className="text-gray-700 mt-1">{value}</div>
  </div>
);

const TextArea = ({
  title,
  name,
  value,
  isEdit,
  onChange,
}: any) => (
  <div className="mt-4">
    <h4 className="font-semibold text-sm mb-1">{title} :</h4>
    {isEdit ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-2 py-2 text-sm focus:ring-1 focus:ring-purple-500"
      />
    ) : (
      <div className="border-b h-10 text-gray-600">
        {value || ""}
      </div>
    )}
  </div>
);

export default ContactBookEdit;
