import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

// Assuming this service exists in your project path
import { vmsService, getAllVisitorsByUserId, } from "../../../services/vms.service";

// --- Icons ---
import {
  Eye,
  Edit,
  Search,
  Columns3,
  ChevronDown,
  Filter,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  User as UserIcon,
  Home,
  Loader2,
  Ticket as TicketIcon,
  AlertCircle,
  RefreshCw,
  EyeOff,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCcw,
  HelpCircle,
  MessageCircle,
  FileText,
  MessageSquare,
  FileCheck,
  Users,
  Wrench,
  Car,
} from "lucide-react";
import { fetchUserComplaintsById, getAmenitiesBookedByUserId, getBroadCastCreatedByUserId, getEventsCreatedByUserId, getUsersByID } from "../../../api";

// --- Types ---
interface VisitorRow {
  id: number;
  type: string;
  name: string;
  contact: string;
  purpose: string;
  comingFrom: string;
  expectedDate?: string;
  expected?: string;
  vehicleNo?: string;
  startPass: string;
  endPass: string;
  inOut?: string;
  host: string;
}

interface VisitorApiResponse {
  total_pages: number;
  current_page: number;
  total_count: number;
  visitors: any[];
}

interface UserProfile {
  id: string;
  name: string;
  isVerified: boolean;
  status: "Active" | "Inactive";
  personalInfo: {
    contact: string;
    email: string;
    dob: string;
  };
  propertyDetails: string | null;
  familyMembers: any[];
  vendorServices: any[];
  vehicleDetails: any[];
}

type CommunicationTab = "Events" | "Broadcast";

interface EventItem {
  id: number;
  event_name: string;
  venue?: string;
  start_date_time: string;
  end_date_time: string;
  status: string;
}

interface BroadcastItem {
  id: number;
  notice_title: string;
  status: string;
  expiry_date: string;
  created_by: string;
}


const UserTreeViewPage: React.FC = () => {
  const navigate = useNavigate();

  // --- GLOBAL STATE (Tabs) ---
  const [activeTab, setActiveTab] = useState("Open Profile");

  // --- USER PROFILE STATE ---
  const { id } = useParams<{ id: string }>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // --- VISITORS STATE ---
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchVisitorQuery, setSearchVisitorQuery] = useState("");
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [hiddenVisitorColumns, setHiddenVisitorColumns] = useState<Set<string>>(new Set());
  const [visitors, setVisitors] = useState<VisitorRow[]>([]);
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [visitorError, setVisitorError] = useState<string | null>(null);
  //---Aminities State;

  const [amenities, setAmenities] = useState<any[]>([]);
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  const [amenitiesError, setAmenitiesError] = useState<string | null>(null);

  //--communication
  // ================= NEW STATE =================
  const [subTab, setSubTab] = useState<"Events" | "Broadcast">("Events");


  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);


  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loadingBroadcasts, setLoadingBroadcasts] = useState(false);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);


  // Pagination State
  const [visitorPagination, setVisitorPagination] = useState({
    page: 1, perPage: 10, total: 0, totalPages: 1,
  });

  // --- SERVICE DESK STATE (
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [hiddenSdColumns, setHiddenSdColumns] = useState<Set<string>>(new Set());
  const [sdPagination, setSdPagination] = useState({
    page: 1, perPage: 10, total: 0, totalPages: 0,
  });
  const [ticketError, setTicketError] = useState<string | null>(null);

  // --- VISITORS COLUMNS ---
  const allVisitorColumns = [
    { key: "action", label: "Action", width: "w-24" },
    { key: "type", label: "Visitor Type", width: "w-32" },
    { key: "name", label: "Name", width: "w-40" },
    { key: "contact", label: "Contact No.", width: "w-32" },
    { key: "purpose", label: "Purpose", width: "w-32" },
    { key: "comingFrom", label: "Coming From", width: "w-32" },
    { key: "vehicleNo", label: "Vehicle No.", width: "w-32" },
    { key: "expectedDate", label: "Expected Date", width: "w-32" },
    { key: "expected", label: "Expected", width: "w-32" },
    { key: "passStart", label: "Pass Start", width: "w-32" },
    { key: "passEnd", label: "Pass End", width: "w-32" },
    { key: "inOut", label: "In/Out", width: "w-24" },
    { key: "host", label: "Host", width: "w-32" },
  ];

  // ---- FETCH PROFILE BY ID ----
  const fetchUserProfile = async (id: number) => {
    setLoadingProfile(true);
    setProfileError(null);

    try {
      const res = await getUsersByID(id);
      const apiData = Array.isArray(res.data) ? res.data[0] : res.data;

      const mappedProfile: UserProfile = {
        id: String(apiData.id),
        name: `${apiData.firstname || ""} ${apiData.lastname || ""}`.trim(),
        isVerified: Boolean(apiData.face_added),
        status: apiData.active ? "Active" : "Inactive",
        personalInfo: {
          contact: apiData.mobile || "-",
          email: apiData.email || "-",
          dob: apiData.birth_date || "Not provided",
        },
        propertyDetails: apiData.full_unit_name || null,
        familyMembers: apiData.user_member || [],
        vendorServices: apiData.user_vendor || [],
        vehicleDetails: apiData.vehicle_details || [],
      };

      setUserProfile(mappedProfile);
    } catch (err) {
      console.error(err);
      setProfileError("Failed to load user profile");
    } finally {
      setLoadingProfile(false);
    }
  };


  const fetchServiceDeskTickets = async () => {
    if (!id) return;

    setLoadingTickets(true);
    setTicketError(null);

    try {
      const res = await fetchUserComplaintsById(Number(id), sdPagination.page);
      const data = res.data;

      const mappedTickets = data.complaints.map((item: any) => ({
        id: item.id,
        ticketNumber: item.ticket_number,
        title: item.heading,
        status: item.issue_status,
        priority: item.priority,
        category: item.category_type,
        assignedTo: item.assigned_to,
        createdAt: item.created_at,
      }));

      setTickets(mappedTickets);
      setSdPagination(prev => ({
        ...prev,
        totalPages: data.total_pages,
        total: data.count,
      }));
    } catch (err) {
      console.error(err);
      setTicketError("Failed to load Service Desk tickets");
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  // --- FETCH VISITORS LOGIC ---
  const fetchVisitors = async () => {
    setLoadingVisitors(true);
    setVisitorError(null);
    try {
      // Call API with pagination params
      const response = await getAllVisitorsByUserId(Number(id));
      const data: VisitorApiResponse = response.data;

      // Map API Keys to UI Keys
      const transformed = data.visitors.map((item: any) => ({
        id: item.id || "-",
        type: item.visit_type ? item.visit_type.charAt(0).toUpperCase() + item.visit_type.slice(1) : "-",
        name: item.name || "-",
        contact: item.contact_no || "-",
        purpose: item.purpose || "-",
        comingFrom: item.coming_from || "-",
        vehicleNo: item.vehicle_number || "-",
        expectedDate: item.expected_date || "-",
        expected: item.expected_time || "-",
        passStart: item.start_pass || "-",
        passEnd: item.end_pass || "-",
        inOut: item.visitor_in_out ? item.visitor_in_out.charAt(0).toUpperCase() + item.visitor_in_out.slice(1) : "-",
        host: item.host?.user ? `${item.host.user.full_name || ""}`.trim() : "-",
      }));

      setVisitors(transformed);
      setVisitorPagination(prev => ({
        ...prev,
        total: data.total_count,
        totalPages: data.total_pages,
      }));

    } catch (error) {
      console.error("Error fetching visitors:", error);
      setVisitorError("Failed to load visitors");
      setVisitors([]);
    } finally {
      setLoadingVisitors(false);
    }
  };
  const fetchAmenitiesBookings = async () => {
    setLoadingAmenities(true);
    setAmenitiesError(null);

    try {
      const res = await getAmenitiesBookedByUserId(id);
      setAmenities(res.data?.amenity_bookings || []);
    } catch (err) {
      console.error(err);
      setAmenitiesError("Failed to load amenities bookings");
      setAmenities([]);
    } finally {
      setLoadingAmenities(false);
    }
  };
  const fetchEvents = async () => {
    if (!id) return;
    setLoadingEvents(true);
    setEventsError(null);
    try {
      const res = await getEventsCreatedByUserId(Number(id));
      setEvents(res.data || []);
    } catch (e) {
      setEventsError("Failed to load events");
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };



  const fetchBroadcasts = async () => {
    if (!id) return;
    setLoadingBroadcasts(true);
    setBroadcastError(null);
    try {
      const res = await getBroadCastCreatedByUserId(Number(id));
      setBroadcasts(res.data || []);
    } catch (e) {
      setBroadcastError("Failed to load broadcasts");
      setBroadcasts([]);
    } finally {
      setLoadingBroadcasts(false);
    }
  };

  // Open Profile
  useEffect(() => {
    if (activeTab === "Open Profile" && id) {
      fetchUserProfile(Number(id));
    }
  }, [activeTab, id]);

  // Visitors
  useEffect(() => {
    if (activeTab === "Visitors" && id) {
      fetchVisitors();
    }
  }, [activeTab, id, visitorPagination.page]);

  // Service Desk
  useEffect(() => {
    if (activeTab === "ServiceDesk" && id) {
      fetchServiceDeskTickets();
    }
  }, [activeTab, id, sdPagination.page]);

  // Amenities Bookings
  useEffect(() => {
    if (activeTab === "Amenities Bookings") {
      fetchAmenitiesBookings();
    }
  }, [activeTab]);
  //communication
  useEffect(() => {
    if (activeTab === "Communication") {
      subTab === "Events" ? fetchEvents() : fetchBroadcasts();
    }
  }, [activeTab, subTab, id]);


  // Client-side filter for search
  const filteredVisitors = visitors.filter(row =>
    row.name.toLowerCase().includes(searchVisitorQuery.toLowerCase()) ||
    row.contact.includes(searchVisitorQuery) ||
    row.purpose.toLowerCase().includes(searchVisitorQuery.toLowerCase())
  );

  // Pagination Logic for display
  const visitorTotalPages = Math.ceil(filteredVisitors.length / visitorPagination.perPage);
  const vStartIndex = (visitorPagination.page - 1) * visitorPagination.perPage;
  const paginatedVisitors = filteredVisitors.slice(vStartIndex, vStartIndex + visitorPagination.perPage);

  // Toggle Column
  const toggleColumn = (key: string) => {
    setHiddenVisitorColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  // Helper to render "No Info" cards
  const EmptyCard = ({ title, Icon }: { title: string, Icon: any }) => (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-500" />
        <h3 className="font-semibold text-slate-700">{title}</h3>
      </div>
      <div className="p-4 text-center text-slate-400 text-sm py-8">
        No information available
      </div>
    </div>
  );

  return (
    <div className="p-6 min-h-screen bg-slate-50 font-sans">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">

        {/* --- HEADER TABS --- */}
        <div className="px-6 border-b border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar justify-center mt-6 mb-4">
            {["Open Profile", "ServiceDesk", "Visitors", "Amenities Bookings", "Communication"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                  ${activeTab === tab ? "bg-purple-700 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"}
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* --- CONTENT: OPEN PROFILE (Dynamic) --- */}
        {activeTab === "Open Profile" && (
          <div className="p-8 max-w-5xl mx-auto">
            {loadingProfile ? (
              <div className="flex flex-col items-center text-slate-400 py-20">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="mt-2">Loading Profile...</span>
              </div>
            ) : profileError ? (
              <div className="text-red-500 text-center">{profileError}</div>
            ) : userProfile && (
              <>
                {/* HEADER */}
                <div className="flex gap-6 mb-8 items-center">
                  <div className="w-24 h-24 rounded-full bg-purple-600 text-white flex items-center justify-center text-3xl font-bold">
                    {userProfile.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                    <p className="text-sm text-slate-500">
                      Status: {userProfile.status}
                    </p>
                  </div>
                  <button className="flex gap-2 items-center border px-4 py-2 rounded-lg">
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                </div>

                {/* DETAILS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userProfile.propertyDetails && (
                    <div className="border rounded-lg p-4 flex gap-2">
                      <Home /> {userProfile.propertyDetails}
                    </div>
                  )}

                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex gap-2"><Phone /> {userProfile.personalInfo.contact}</div>
                    <div className="flex gap-2"><Mail /> {userProfile.personalInfo.email}</div>
                    <div className="flex gap-2"><Calendar /> {userProfile.personalInfo.dob}</div>
                  </div>

                  <div className="border rounded-lg p-4"><Users /> Family Members</div>
                  <div className="border rounded-lg p-4"><Wrench /> Vendor Services</div>
                  <div className="border rounded-lg p-4"><Car /> Vehicle Details</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* --- CONTENT: SERVICE DESK --- */}
        {activeTab === "ServiceDesk" && (
          <div className="p-6 animate-in fade-in">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search tickets..." className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                </div>
              </div>
            </div>
            <div className="min-h-[400px]">
              {loadingTickets ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400"><Loader2 className="w-8 h-8 animate-spin" /><span className="mt-2">Loading...</span></div>
              ) : tickets.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 whitespace-nowrap uppercase text-xs tracking-wider w-24">Action</th>
                      <th className="px-6 py-3 whitespace-nowrap uppercase text-xs tracking-wider w-32">Title</th>
                      <th className="px-6 py-3 whitespace-nowrap uppercase text-xs tracking-wider w-32">Status</th>
                      <th className="px-6 py-3 whitespace-nowrap uppercase text-xs tracking-wider w-32">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tickets.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3">
                          <Eye className="w-4 h-4 cursor-pointer text-purple-600" />
                        </td>
                        <td className="px-6 py-3">{row.title}</td>
                        <td className="px-6 py-3">{row.status}</td>
                        <td className="px-6 py-3">{row.priority}</td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 border border-dashed border-slate-300 rounded-lg bg-slate-50/50">
                  <TicketIcon className="w-12 h-12 mb-3 opacity-20" />
                  <p className="font-medium text-slate-500">No Tickets Found</p>
                  {/* <button onClick={() => navigate("/service-desk/create")} className="mt-4 px-4 py-2 bg-purple-700 text-white rounded-lg text-sm font-medium hover:bg-purple-800">+ Create Ticket</button> */}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-500">Showing {sdPagination.page} of {sdPagination.totalPages} pages</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSdPagination(p => ({ ...p, page: 1 }))} disabled={sdPagination.page === 1} className="px-3 py-1.5 text-sm border rounded bg-white text-slate-500 disabled:opacity-50">«</button>
                <button onClick={() => setSdPagination(p => ({ ...p, page: p.page - 1 }))} disabled={sdPagination.page === 1} className="px-3 py-1.5 text-sm border rounded bg-white text-slate-500 disabled:opacity-50">Previous</button>
                <button className="px-3 py-1.5 text-sm border rounded bg-purple-700 text-white">{sdPagination.page}</button>
                <button onClick={() => setSdPagination(p => ({ ...p, page: p.page + 1 }))} disabled={sdPagination.page >= sdPagination.totalPages} className="px-3 py-1.5 text-sm border rounded bg-white text-slate-500 disabled:opacity-50">Next</button>
                <button onClick={() => setSdPagination(p => ({ ...p, page: p.totalPages }))} disabled={sdPagination.page >= sdPagination.totalPages} className="px-3 py-1.5 text-sm border rounded bg-white text-slate-500 disabled:opacity-50">»</button>
              </div>
            </div>
          </div>
        )}

        {/* --- CONTENT: VISITORS --- */}
        {activeTab === "Visitors" && (
          <>
            {/* Search Bar */}
            {isSearchVisible && (
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 animate-in fade-in slide-down-from-top-2">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search visitors..."
                    value={searchVisitorQuery}
                    onChange={(e) => setSearchVisitorQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="px-6 py-3 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSearchVisible(!isSearchVisible)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${isSearchVisible ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <Search className="w-4 h-4" /> {isSearchVisible ? "Hide Search" : "Show Search"}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Columns3 className="w-4 h-4" /> Column Visibility <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {isColumnMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
                      {allVisitorColumns.map((col) => (
                        <label key={col.key} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                          <input type="checkbox" checked={!hiddenVisitorColumns.has(col.key)} onChange={() => toggleColumn(col.key)} className="w-4 h-4" />
                          <span className="text-sm">{col.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>


            {/* Table Section */}
            <div className="overflow-x-auto min-h-[400px]">
              {loadingVisitors ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400"><Loader2 className="w-8 h-8 animate-spin" /><span className="mt-2">Loading...</span></div>
              ) : paginatedVisitors.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      {allVisitorColumns.filter(c => !hiddenVisitorColumns.has(c.key)).map((col) => (
                        <th key={col.key} className={`px-6 py-3 whitespace-nowrap uppercase text-xs tracking-wider ${col.width || ''}`}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedVisitors.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        {allVisitorColumns.filter(c => !hiddenVisitorColumns.has(c.key)).map((col) => (
                          <td key={`${row.id}-${col.key}`} className="px-6 py-3 whitespace-nowrap text-slate-600">
                            {col.key === "action" ? (
                              <div className="flex items-center gap-2">
                                <button className="p-1.5 text-slate-400 hover:text-purple-600 rounded-md"><Eye className="w-4 h-4" /></button>
                                <button className="p-1.5 text-slate-400 hover:text-purple-600 rounded-md"><Edit className="w-4 h-4" /></button>
                              </div>
                            ) : (
                              row[col.key as keyof VisitorRow]
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                  <Filter className="w-12 h-12 mb-3 opacity-20" />
                  <p className="font-medium text-slate-500">No visitors found</p>
                  <p className="text-sm">Try adjusting your search or column filters.</p>
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-slate-500">
                Showing {vStartIndex + 1} to {Math.min(vStartIndex + visitorPagination.perPage, filteredVisitors.length)} of {filteredVisitors.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVisitorPagination(p => ({ ...p, page: 1 }))}
                  disabled={visitorPagination.page === 1}
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">First</span>
                  <span className="text-lg">«</span>
                </button>
                <button
                  onClick={() => setVisitorPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={visitorPagination.page === 1}
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setVisitorPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={visitorPagination.page >= visitorTotalPages}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-purple-700 rounded-lg shadow-sm border border-purple-700"
                >
                  {visitorPagination.page}
                </button>
                <button
                  onClick={() => setVisitorPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={visitorPagination.page >= visitorTotalPages}
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => setVisitorPagination(p => ({ ...p, page: visitorTotalPages }))}
                  disabled={visitorPagination.page >= visitorTotalPages}
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Last</span>
                  <span className="text-lg">»</span>
                </button>
                <select
                  value={visitorPagination.perPage}
                  onChange={(e) => setVisitorPagination(p => ({ ...p, perPage: Number(e.target.value), page: 1 }))}
                  className="ml-2 pl-2 pr-8 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* --- CONTENT: AMENITIES BOOKINGS --- */}
        {activeTab === "Amenities Bookings" && (
          <div className="p-6 animate-in fade-in">
            {loadingAmenities ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="mt-2">Loading...</span>
              </div>
            ) : amenitiesError ? (
              <div className="text-red-500 text-center">{amenitiesError}</div>
            ) : amenities.length > 0 ? (
              <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 uppercase text-xs tracking-wider">Facility Name</th>
                      <th className="px-6 py-3 uppercase text-xs tracking-wider">Facility Type</th>
                      <th className="px-6 py-3 uppercase text-xs tracking-wider">Total Amount</th>
                      <th className="px-6 py-3 uppercase text-xs tracking-wider">Payment Status</th>
                      <th className="px-6 py-3 uppercase text-xs tracking-wider">Payment Method</th>
                      <th className="px-6 py-3 uppercase text-xs tracking-wider">Booked By</th>
                      <th className="px-6 py-3 uppercase text-xs tracking-wider">Booked On</th>
                      <th className="px-6 py-3 uppercase text-xs tracking-wider">Scheduled On</th>
                      <th className="px-6 py-3 uppercase text-xs tracking-wider">Scheduled Time</th>
                      <th className="px-6 py-3 uppercase text-xs tracking-wider">Description</th>
                      <th className="px-6 py-3 uppercase text-xs tracking-wider">Terms</th>
                      <th className="px-6 py-3 uppercase text-xs tracking-wider">Booking Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {amenities.map((a: any) => (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 font-medium text-slate-700">
                          {a.amenity?.fac_name || "-"}
                        </td>

                        <td className="px-6 py-3 text-slate-600">
                          {a.amenity?.fac_type || "-"}
                        </td>

                        <td className="px-6 py-3 text-slate-600">
                          {a.amount ?? "-"}
                        </td>

                        <td className="px-6 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.payment_status === "paid"
                              ? "bg-green-100 text-green-700"
                              : a.payment_status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-600"
                              }`}
                          >
                            {a.amenity?.status || "-"}
                          </span>
                        </td>

                        <td className="px-6 py-3 text-slate-600">
                          {a.payment_mode || "N/A"}
                        </td>

                        <td className="px-6 py-3 text-slate-600">
                          {a.booking_date || "-"}
                        </td>

                        <td className="px-6 py-3 text-slate-600">
                          {a.updated_at || "-"}
                        </td>

                        <td className="px-6 py-3 text-slate-600">
                          {a.booking_date || "-"}
                        </td>

                        <td className="px-6 py-3 text-slate-600">
                          {a.slot?.twelve_hr_slot || "N/A"}
                        </td>

                        <td className="px-6 py-3 text-slate-600">
                          {a.amenity?.description || "N/A"}
                        </td>

                        <td className="px-6 py-3 text-slate-600">
                          {a.amenity?.terms || "N/A"}
                        </td>

                        <td className="px-6 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : a.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-600"
                              }`}
                          >
                            {a.status || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                <Filter className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium text-slate-500">No amenities bookings found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "Communication" && (
          <div className="animate-in fade-in">

            {/* SUB TABS */}
            <div className="px-8 py-4 border-t border-slate-200 bg-slate-20">
              {(["Events", "Broadcast"] as CommunicationTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setSubTab(t)}
                  className={`px-7 py-2 mx-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                  ${subTab === t ? "bg-purple-700 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"}
                 `}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* TABLE WRAPPER */}
            <div className="overflow-x-auto min-h-[400px]">

              {/* LOADER */}
              {(subTab === "Events" ? loadingEvents : loadingBroadcasts) ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="mt-2">Loading...</span>
                </div>
              ) : subTab === "Events" ? (

                /* ================= EVENTS TABLE ================= */
                events.length > 0 ? (
                  <table className="w-full text-sm text-left bg-white rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-2 uppercase text-xs w-24">Action</th>
                        <th className="px-6 py-3 uppercase text-xs w-24">Venue</th>
                        <th className="px-6 py-2 uppercase text-xs w-24">Created By</th>
                        <th className="px-6 py-2 uppercase text-xs ">Start Date</th>
                        <th className="px-6 py-2 uppercase text-xs">End Date</th>
                        <th className="px-6 py-2 uppercase text-xs">Status</th>
                        <th className="px-6 py-2 uppercase text-xs">Event Name</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {events.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => navigate(`/setup/user-tree/view/${e.id}`)}
                                className="p-1.5 text-slate-400 hover:text-purple-600"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-slate-400 hover:text-purple-600">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-3">{e.event_name || '-'}</td>
                          <td className="px-6 py-3">{e.venue || "-"}</td>
                          <td className="px-6 py-3">{e.created_by || '-'}</td>
                          <td className="px-6 py-3">
                            {new Date(e.start_date_time).toLocaleString() || '-'}
                          </td>
                          <td className="px-6 py-3">
                            {new Date(e.end_date_time).toLocaleString() || '-'}
                          </td>
                          <td className="px-6 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                              {e.status || '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                    <Filter className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-medium text-slate-500">No events found</p>
                  </div>
                )

              ) : (

                /* ================= BROADCAST TABLE ================= */
                broadcasts.length > 0 ? (
                  <table className="w-full text-sm text-left bg-white rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 uppercase text-xs w-24">Action</th>
                        <th className="px-6 py-3 uppercase text-xs w-34">Title</th>
                        <th className="px-6 py-3 uppercase text-xs">Status</th>
                        <th className="px-6 py-3 uppercase text-xs">Expiry Date</th>
                        <th className="px-6 py-3 uppercase text-xs">Created By</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {broadcasts.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <button className="p-1.5 text-slate-400 hover:text-purple-600">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-slate-400 hover:text-purple-600">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-3">{b.notice_title || '-'}</td>
                          <td className="px-6 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                             ${b.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-600"}
                                `}>
                              {b.status || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            {new Date(b.expiry_date).toLocaleDateString() || '-'}
                          </td>
                          <td className="px-6 py-3">{b.created_by || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                    <Filter className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-medium text-slate-500">No broadcasts found</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* --- OTHER TABS PLACEHOLDER --- */}
        {activeTab !== "Open Profile" &&
          activeTab !== "ServiceDesk" &&
          activeTab !== "Visitors" &&
          activeTab !== "Amenities Bookings" &&
          activeTab !== "Communication" && (
            <div className="flex flex-col items-center justify-center h-[500px] text-slate-400 animate-in fade-in">
              <div className="p-4 bg-slate-100 rounded-full mb-4"><Columns3 className="w-8 h-8 text-slate-400" /></div>
              <h3 className="text-lg font-medium text-slate-600">Module Under Construction</h3>
              <p className="text-sm mt-2">The {activeTab} feature is coming soon.</p>
            </div>
          )}

      </div>
    </div>
  );
};

export default UserTreeViewPage;