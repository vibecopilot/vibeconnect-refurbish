import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronRight,
    Eye,
    Pencil,
    Search,
    LayoutGrid,
    List,
    Filter,
    Download,
} from "lucide-react";
import { getItemInLocalStorage } from "../../utils/localStorage";
import { getContactBook } from "../../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from 'xlsx';

/* ---------- API CONFIG ---------- */
const API_BASE = "https://admin.vibecopilot.ai";
const API_TOKEN = getItemInLocalStorage("TOKEN");

/* ---------- CONSTANTS ---------- */
const ITEMS_PER_PAGE = 12;

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
    logo?: any;
    attachment?: string;
    status: boolean;
    generic_info_name?: string;
    generic_sub_info_name?: string;
}

const ContactBookList: React.FC = () => {
    const navigate = useNavigate();

    const [rows, setRows] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [view, setView] = useState<"grid" | "table">("grid");
    const [category, setCategory] = useState("");
    const [exporting, setExporting] = useState(false);

    // Records per page: 12 for grid, 10 for table
    const getPerPage = (mode: "grid" | "table") => (mode === "grid" ? 12 : 10);
    const [pagination, setPagination] = useState({
        page: 1,
        perPage: getPerPage("grid"),
        total: 0,
        totalPages: 0,
    });

    /* ---------- REFETCH FUNCTION ---------- */
    const fetchContacts = useCallback(async (refetch?: boolean) => {
        try {
            setLoading(true);
            const res = await getContactBook(pagination.page, pagination.perPage, search);

            const data = res.data;
            const list = data?.contact_books ?? data ?? [];

            setRows(list);
            // setAllRows(list);

            // Update pagination info from API response
            if (data?.total_count !== undefined) {
                setPagination((prev) => ({
                    ...prev,
                    total: data.total_count,
                    totalPages: data.total_pages,
                    page: data.current_page || prev.page,
                }));
            }

            // Reset pagination when refetching
            if (refetch) {
                setPagination((prev) => ({ ...prev, page: 1 }));
            }

            setLoading(false);
        } catch (e) {
            console.error("Fetch error:", e);
            setLoading(false);
        }
    }, [pagination.page, pagination.perPage, search]);

    /* ---------- PAGINATION EFFECT ---------- */
    useEffect(() => {
        fetchContacts();
    }, [pagination.page, pagination.perPage, search]);


    /* ---------- SEARCH EFFECT - Only reset pagination when search changes ---------- */
    useEffect(() => {
        // When search changes, reset to page 1 but don't filter client-side
        // The API will handle filtering on the server
        if (search.length > 0) {
            setPagination((prev) => ({ ...prev, page: 1 }));
        }
    }, [search]);

    /* ---------- UPDATE PERPAGE WHEN VIEW MODE CHANGES ---------- */
    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            perPage: getPerPage(view),
            page: 1,
        }));
    }, [view]);

    /* ---------- PAGINATION ---------- */
    const paginatedRows = useMemo(() => {
        // Since the API already returns paginated data, we use rows directly
        return rows;
    }, [rows]);

    // Expose refetch function for parent components
    const refetchContacts = () => fetchContacts(true);

    /* ---------- EXPORT TO EXCEL FUNCTION ---------- */
    const exportToExcel = async () => {

        try {
            setExporting(true);
            toast.loading('Preparing export...');

            // Format the current page data for Excel
            const formattedData = paginatedRows.map((contact) => ({
                'Company Name': contact.company_name || '-',
                'Contact Person': contact.contact_person_name || '-',
                'Mobile': contact.mobile || '-',
                'Landline': contact.landline_no || '-',
                'Primary Email': contact.primary_email || '-',
                'Secondary Email': contact.secondary_email || '-',
                'Website': contact.website || '-',
                'Category': contact.generic_info_name || '-',
                'Sub Category': contact.generic_sub_info_name || '-',
                'Key Offering': contact.key_offering || '-',
                'Address': contact.address || '-',
                'Description': contact.description || '-',
                'Profile': contact.profile || '-',
                'Status': contact.status ? 'Active' : 'Inactive',
            }));

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(formattedData);

            // Style the header row
            const headerStyle = {
                font: { bold: true, color: { rgb: 'FFFFFF' } },
                fill: { fgColor: { rgb: '7C3AED' } }, // Purple background
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' },
                },
            };

            // Apply header styles
            for (let i = 0; i < formattedData.length + 1; i++) {
                for (let j = 0; j < Object.keys(formattedData[0] || {}).length; j++) {
                    const cell = ws[XLSX.utils.encode_cell({ r: i, c: j })];
                    if (i === 0 && cell) {
                        cell.s = headerStyle;
                    }
                }
            }

            // Freeze the header row
            ws['!freeze'] = { xSplit: 0, ySplit: 1 };

            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Contact Book');

            // Generate filename with current date
            const fileName = `contact_book_page_${pagination.page}_${new Date().toISOString().split('T')[0]}.xlsx`;

            // Download file
            XLSX.writeFile(wb, fileName);

            toast.dismiss();
            toast.success(`Exported ${paginatedRows.length} contacts successfully!`);
            setExporting(false);
        } catch (error) {
            console.error('Export error:', error);
            toast.dismiss();
            toast.error('Failed to export contacts');
            setExporting(false);
        }
    };
    return (
        <div className="p-6 bg-gray-50 min-h-screen">

            <ToastContainer position="top-right" />
            {/* ---------- BREADCRUMB ---------- */}
            <nav className="flex items-center text-xs text-gray-500 mb-4">
                <span
                    className="cursor-pointer hover:text-purple-600"
                    onClick={() => navigate("/service-desk")}
                >
                    FM Module
                </span>
                <ChevronRight size={12} className="mx-2" />
                <span className="font-medium text-gray-700">Contact Book</span>
            </nav>

            {/* ---------- TOOLBAR ---------- */}
            <div className="flex items-center gap-4 mb-5">
                {/* LEFT: Search */}
                <div className="relative flex-1 max-w-[600px]">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"
                    />
                    <input
                        placeholder="Search By Company Name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-purple-600"
                    />
                </div>

                {/* RIGHT: Export + View + Add */}
                <div className="flex items-center gap-2 ml-auto">
                    <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        <button
                            onClick={() => setView("grid")}
                            className={`p-2 border rounded-md ${view === "grid" ? "bg-purple-600 text-white" : "hover:bg-gray-50"
                                }`}
                        >
                            <LayoutGrid size={16} />
                        </button>

                        <button
                            onClick={() => setView("table")}
                            className={`p-2 border rounded-md ${view === "table" ? "bg-purple-600 text-white" : "hover:bg-gray-50"
                                }`}
                        >
                            <List size={16} />
                        </button>

                        <button
                            onClick={() => navigate("/contact-book/create")}
                            className="border border-purple-900 text-purple-900 px-4 py-2 rounded-md text-sm font- hover:bg-purple-700 hover:text-white"
                        >
                            + Add Contact
                        </button>
                    </div>
                    {/* Export */}
                    <button
                        onClick={exportToExcel}
                        disabled={exporting || rows.length === 0}
                        className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-semibold ${exporting || rows.length === 0
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-purple-600 text-white hover:bg-purple-700"
                            }`}
                    >
                        <Download size={16} />
                        {exporting ? "Exporting..." : "Export"}
                    </button>
                </div>
            </div>

            {/* ---------- LOADING ---------- */}
            {loading && (
                <div className="text-center text-gray-400 py-10 bg-white rounded-lg border">
                    <div className="inline-block">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <p className="mt-2">Loading contacts...</p>
                    </div>
                </div>
            )}

            {/* ---------- NO DATA ---------- */}
            {!loading && rows.length === 0 && (
                <div className="text-center text-gray-400 py-10">No contacts found</div>
            )}

            {/* ---------- GRID VIEW ---------- */}
            {!loading && view === "grid" && rows.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {paginatedRows.map((row) => (
                        <div
                            key={row.id}
                            className="bg-white border rounded-xl p-4 relative hover:shadow-md transition-shadow"
                        >
                            <span
                                className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full ${row.status
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-600"
                                    }`}
                            >
                                {row.status ? "Active" : "Inactive"}
                            </span>

                            <h3 className="font-semibold text-md mb-1">{row.company_name}</h3>

                            <div className="text-[13px] space-y-1 mt-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Category</span>
                                    <span className="truncate ml-2">{row.generic_info_name || "-"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Contact Person</span>
                                    <span className="truncate ml-2">{row.contact_person_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Mobile</span>
                                    <span>{row.mobile}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Landline</span>
                                    <span>{row.landline_no || "-"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Primary Email</span>
                                    <span className="truncate ml-2">{row.primary_email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Key Offering</span>
                                    <span className="truncate ml-2">{row.key_offering || "-"}</span>
                                </div>
                            </div>

                            <div className="border-t mt-3 pt-2 flex gap-4 text-purple-600 text-xs">
                                <button
                                    onClick={() => navigate(`/contact-book/view/${row.id}`)}
                                    className="flex items-center gap-1 hover:text-purple-700"
                                >
                                    <Eye size={14} /> View
                                </button>
                                <button
                                    onClick={() => navigate(`/contact-book/edit/${row.id}`)}
                                    className="flex items-center gap-1 hover:text-purple-700"
                                >
                                    <Pencil size={14} /> Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ---------- TABLE VIEW ---------- */}
            {!loading && view === "table" && rows.length > 0 && (
                <div className="border rounded-md bg-white overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-500 uppercase text-[11px]">
                            <tr>
                                {[
                                    "Action",
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
                                    <th key={h} className="px-3 py-3 text-left whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRows.map((r) => (
                                <tr key={r.id} className="border-b hover:bg-gray-50">
                                    <td className="px-3 py-2 text-purple-600">
                                        <div className="flex gap-2">
                                            <Eye
                                                size={14}
                                                className="cursor-pointer hover:text-purple-700"
                                                onClick={() => navigate(`/contact-book/view/${r.id}`)}
                                            />
                                            <Pencil
                                                size={14}
                                                className="cursor-pointer hover:text-purple-700"
                                                onClick={() => navigate(`/contact-book/edit/${r.id}`)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        {typeof r.logo === "string" && r.logo.length > 0 ? (
                                            <img
                                                src={r.logo.startsWith("http") ? r.logo : `${API_BASE}${r.logo}`}
                                                alt="Logo"
                                                className="w-8 h-8 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                                                N/A
                                            </div>
                                        )}

                                    </td>
                                    <td className="px-3 py-2 font-medium">{r.company_name || "-"}</td>
                                    <td className="px-3 py-2 font-medium">{r.generic_info_name || "-"}</td>
                                    <td className="px-3 py-2 max-w-[100px] truncate font-medium">{r.generic_sub_info_name || "-"}</td>
                                    <td className="px-3 py-2">{r.contact_person_name || "-"}</td>
                                    <td className="px-3 py-2">{r.mobile || "-"}</td>
                                    <td className="px-3 py-2">{r.landline_no || "-"}</td>
                                    <td className="px-3 py-2">{r.primary_email || "-"}</td>
                                    <td className="px-3 py-2">{r.key_offering || "-"}</td>
                                    <td className="px-3 py-2">
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${r.status
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-600"
                                                }`}
                                        >
                                            {r.status ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
            }

            {
                !loading && rows.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border rounded-md mt-4">

                        {/* Records info */}
                        <div className="text-sm text-gray-600">
                            Showing {(pagination.page - 1) * pagination.perPage + 1}{" "}
                            to {Math.min(pagination.page * pagination.perPage, pagination.total)}{" "}
                            of {pagination.total} records

                        </div>

                        {/* Pagination buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
                                disabled={pagination.page === 1}
                                className="px-3 py-1 border rounded disabled:opacity-40"
                            >
                                «
                            </button>

                            <button
                                onClick={() =>
                                    setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                                }
                                disabled={pagination.page === 1}
                                className="px-3 py-1 border rounded disabled:opacity-40"
                            >
                                ‹ Prev
                            </button>

                            <span className="px-3 py-1 border rounded bg-purple-600 text-white">
                                {pagination.page}
                            </span>

                            <button
                                onClick={() =>
                                    setPagination((prev) => ({
                                        ...prev,
                                        page: Math.min(pagination.totalPages, prev.page + 1)
                                    }))
                                }
                                disabled={pagination.page >= pagination.totalPages}
                                className="px-3 py-1 border rounded disabled:opacity-40"
                            >
                                Next ›
                            </button>

                            <button
                                onClick={() =>
                                    setPagination((prev) => ({
                                        ...prev,
                                        page: pagination.totalPages
                                    }))
                                }
                                disabled={pagination.page >= pagination.totalPages}
                                className="px-3 py-1 border rounded disabled:opacity-40"
                            >
                                »
                            </button>
                        </div>

                        {/* Items per page */}
                        <select
                            value={pagination.perPage}
                            onChange={(e) => {
                                setPagination((prev) => ({
                                    ...prev,
                                    perPage: Number(e.target.value),
                                    page: 1,
                                }));
                            }}
                            className="px-3 py-1 border rounded"
                        >
                            <option value={10}>10 / page</option>
                            <option value={12}>12 / page</option>
                            <option value={25}>25 / page</option>
                            <option value={50}>50 / page</option>
                        </select>

                    </div>
                )
            }

        </div >

    );
};

export default ContactBookList;
