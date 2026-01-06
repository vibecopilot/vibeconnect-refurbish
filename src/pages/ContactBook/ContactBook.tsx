import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/* ---------- API URL ---------- */
const API_URL =
  "https://admin.vibecopilot.ai/contact_books.json?token=efe990d24b0379af8b5ba3d0a986ac802796bc2e0db15552";

/* ---------- TYPES (based on API response) ---------- */
interface Contact {
  id: number;
  company_name: string;
  category: string;
  sub_category: string;
  contact_person: string;
  mobile: string;
  landline?: string;
  email: string;
  key_offerings?: string;
  logo?: string;
  status: boolean;
}

const ContactBookList: React.FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Contact[]>([]);
  const [allRows, setAllRows] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------- FETCH CONTACT BOOKS ---------- */
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);

      if (!res.ok) {
        throw new Error("API failed");
      }

      const data = await res.json();

// If the API returns an object with a nested array
setRows(data.contact_books || []); // or whatever the array key is
setAllRows(data.contact_books || []);
    } catch (error) {
      console.error("Failed to fetch contacts", error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    fetchContacts();
  }, []);

  /* ---------- SEARCH (CLIENT SIDE) ---------- */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (!value) {
      setRows(allRows);
      return;
    }

    const filtered = allRows.filter((row) =>
      row.company_name.toLowerCase().includes(value.toLowerCase())
    );

    setRows(filtered);
  };

  /* ---------- STATUS TOGGLE (UI ONLY) ---------- */
  const toggleStatus = (id: number) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: !r.status } : r
      )
    );
  };

  return (
    <div className="p-5 font-sans">
      {/* 🔹 BREADCRUMB */}
      <nav className="flex items-center text-xs text-gray-500 mx-1">
        <span
          className="cursor-pointer hover:text-purple-600"
          onClick={() => navigate("/service-desk")}
        >
          FM Module
        </span>
        <ChevronRight size={12} className="mx-2" />
        <span className="font-medium">Contact Book</span>
      </nav>

      {/* SEARCH + CREATE */}
      <div className="flex items-center justify-between gap-4 mb-4 mt-4">
        <input
          placeholder="Search by Company name"
          value={search}
          onChange={handleSearch}
          className="w-[600px] max-w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          onClick={() => navigate("/contact-book/create")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md text-sm font-semibold"
        >
          + Create Contact
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full border-collapse">
          <thead className="text-gray-400 text-[10px] bg-gray-100 uppercase">
            <tr>
              {[
                "Actions",
                "Logo",
                "Company Name",
                "Category",
                "Sub Category",
                "Contact Person",
                "Mobile",
                "Landline",
                "Primary Email",
                "Key Offerings",
                "Status",
              ].map((h) => (
                <th key={h} className="px-3 py-3 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-sm">
            {rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td
                  className="px-3 py-2 cursor-pointer text-purple-600 text-xs"
                  onClick={() =>
                    navigate(`/contact-book/view/${row.id}`)
                  }
                >
                  👁
                </td>

                <td className="px-3 py-2">
                  {row.logo ? "🖼" : "-"}
                </td>

                <td className="px-3 py-2 font-medium">
                  {row.company_name}
                </td>

                <td className="px-3 py-2">{row.category}</td>

                <td className="px-3 py-2">
                  {row.sub_category || "-"}
                </td>

                <td className="px-3 py-2">
                  {row.contact_person}
                </td>

                <td className="px-3 py-2">{row.mobile}</td>

                <td className="px-3 py-2">
                  {row.landline || "-"}
                </td>

                <td className="px-3 py-2 truncate max-w-[160px]">
                  {row.email}
                </td>

                <td className="px-3 py-2">
                  {row.key_offerings || "-"}
                </td>

                <td className="px-3 py-2">
                  <button
                    onClick={() => toggleStatus(row.id)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition ${
                      row.status ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                        row.status ? "translate-x-4" : ""
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center py-6 text-gray-400">
                  No records found
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={11} className="text-center py-6 text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION (UI ONLY) */}
      <div className="mt-3 text-right text-xs text-gray-600">
        Rows per page: 10 &nbsp; | &nbsp; 1–{rows.length} of {rows.length}
      </div>
    </div>
  );
};

export default ContactBookList;
