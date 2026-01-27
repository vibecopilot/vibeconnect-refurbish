import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from 'react-hot-toast';

import {
  Eye,
  Search,
  Columns3,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  User as UserIcon,
  Home,
  Loader2,
  Ticket as TicketIcon,
  FileText,
  MessageSquare,
  ArrowLeft,
  Building,
  Tag,
  AlertTriangle,
  ExternalLink,
  X,
  Car,
  Users,
  Clock,
} from "lucide-react";
import {
  fetchUserComplaintsById,
  getAmenitiesBookedByUserId,
  getAmenityBookingById,
  getBroadCastCreatedByUserId,
  getEventsCreatedByUserId,
  getUsersByID
} from "../../../api";
import { vmsService, getAllVisitorsByUserId } from "../../../services/vms.service";

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
  hosts?: string;
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
  userType: string;
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
  notice_discription?: string;
  document?: string;
}

// Helper for Pagination State
interface PaginationState {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

interface ColumnConfig {
  key: string;
  label: string;
  width?: string;
}

const domainPrefix = "https://admin.vibecopilot.ai";

// --- Helper Component for Status Badge ---
const StatusBadge: React.FC<{ status: any }> = ({ status }) => {
  let statusStr = '';
  if (typeof status === 'string') {
    statusStr = status;
  } else if (status && typeof status === 'object' && status.name) {
    statusStr = status.name;
  } else if (status) {
    statusStr = String(status);
  } else {
    statusStr = 'Unknown';
  }

  const s = statusStr.toLowerCase();
  let colorClass = "bg-gray-100 text-gray-700";

  if (s?.includes("active") || s?.includes("resolved") || s?.includes("completed") || s?.includes("paid") || s?.includes("checked-in")) {
    colorClass = "bg-green-100 text-green-700";
  } else if (s?.includes("pending") || s?.includes("progress") || s?.includes("maintenance")) {
    colorClass = "bg-yellow-100 text-yellow-700";
  } else if (s?.includes("cancelled") || s?.includes("rejected") || s?.includes("closed")) {
    colorClass = "bg-red-100 text-red-700";
  } else if (s?.includes("open")) {
    colorClass = "bg-blue-100 text-blue-700";
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {statusStr || 'Unknown'}
    </span>
  );
};

// --- Reusable Pagination Component ---
const PaginationFooter: React.FC<{
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  totalItems: number;
  isClientSide?: boolean;
}> = ({ pagination, setPagination, totalItems, isClientSide = false }) => {

  const start = (pagination.page - 1) * pagination.perPage + 1;
  const end = Math.min(pagination.page * pagination.perPage, isClientSide ? totalItems : pagination.total);

  const totalPages = isClientSide ? Math.ceil(totalItems / pagination.perPage) : pagination.totalPages;

  return (
    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-sm text-slate-500">
        Showing {totalItems > 0 ? start : 0} to {end} of {isClientSide ? totalItems : pagination.total} entries
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPagination(p => ({ ...p, page: 1 }))}
          disabled={pagination.page === 1}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
        >
          «
        </button>
        <button
          onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
          disabled={pagination.page === 1}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
        >
          Previous
        </button>

        <button className="px-3 py-1.5 text-sm font-medium text-white bg-purple-700 rounded-lg cursor-default">
          {pagination.page}
        </button>

        <button
          onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
          disabled={pagination.page >= totalPages}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
        >
          Next
        </button>
        <button
          onClick={() => setPagination(p => ({ ...p, page: totalPages }))}
          disabled={pagination.page >= totalPages}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
        >
          »
        </button>

        <select
          value={pagination.perPage}
          onChange={(e) => setPagination(p => ({ ...p, perPage: Number(e.target.value), page: 1 }))}
          className="ml-2 pl-2 pr-8 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
};

// --- Helper for Debounce ---
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number | undefined }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <div className="text-muted-foreground mt-0.5">{icon}</div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value ?? '-'}</p>
    </div>
  </div>
);

const UserTreeViewPage: React.FC = () => {
  const navigate = useNavigate();

  // --- GLOBAL STATE ---
  const [activeTab, setActiveTab] = useState("Open Profile");

  // --- USER PROFILE STATE ---
  const { id } = useParams<{ id: string }>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // --- VISITORS STATE ---
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchVisitorQuery, setSearchVisitorQuery] = useState("");
  const debouncedVisitorSearch = useDebounce(searchVisitorQuery, 500);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [hiddenVisitorColumns, setHiddenVisitorColumns] = useState<Set<string>>(new Set());
  const [visitors, setVisitors] = useState<VisitorRow[]>([]);
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [visitorPagination, setVisitorPagination] = useState<PaginationState>({
    page: 1, perPage: 10, total: 0, totalPages: 1,
  });

  const allVisitorColumns: ColumnConfig[] = [
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
    { key: "hosts", label: "Host", width: "w-32" },
  ];

  // --- AMENITIES STATE ---
  const [amenities, setAmenities] = useState<any[]>([]);
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  const [amenityPagination, setAmenityPagination] = useState<PaginationState>({
    page: 1, perPage: 10, total: 0, totalPages: 0,
  });
  const [isAmenitySearchVisible, setIsAmenitySearchVisible] = useState(false);
  const [searchAmenityQuery, setSearchAmenityQuery] = useState("");
  const debouncedAmenitySearch = useDebounce(searchAmenityQuery, 500);
  const [hiddenAmenityColumns, setHiddenAmenityColumns] = useState<Set<string>>(new Set());

  const allAmenityColumns: ColumnConfig[] = [
    { key: "action", label: "Action", width: "w-24" },
    { key: "name", label: "Facility Name", width: "w-40" },
    { key: "type", label: "Type", width: "w-32" },
    { key: "amount", label: "Amount", width: "w-32" },
    { key: "payment", label: "Payment", width: "w-32" },
    { key: "status", label: "Status", width: "w-32" },
  ];

  // --- COMMUNICATION STATE ---
  const [subTab, setSubTab] = useState<"Events" | "Broadcast">("Events");
  
  // Events
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventPagination, setEventPagination] = useState<PaginationState>({
    page: 1, perPage: 10, total: 0, totalPages: 0,
  });
  const [isEventSearchVisible, setIsEventSearchVisible] = useState(false);
  const [searchEventQuery, setSearchEventQuery] = useState("");
  const debouncedEventSearch = useDebounce(searchEventQuery, 500);
  const [hiddenEventColumns, setHiddenEventColumns] = useState<Set<string>>(new Set());

  const allEventColumns: ColumnConfig[] = [
    { key: "action", label: "Action", width: "w-24" },
    { key: "name", label: "Event Name", width: "w-40" },
    { key: "venue", label: "Venue", width: "w-32" },
    { key: "start", label: "Start Date", width: "w-32" },
    { key: "end", label: "End Date", width: "w-32" },
    { key: "status", label: "Status", width: "w-32" },
  ];

  // Broadcasts
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loadingBroadcasts, setLoadingBroadcasts] = useState(false);
  const [broadcastPagination, setBroadcastPagination] = useState<PaginationState>({
    page: 1, perPage: 10, total: 0, totalPages: 0,
  });
  const [isBroadcastSearchVisible, setIsBroadcastSearchVisible] = useState(false);
  const [searchBroadcastQuery, setSearchBroadcastQuery] = useState("");
  const debouncedBroadcastSearch = useDebounce(searchBroadcastQuery, 500);
  const [hiddenBroadcastColumns, setHiddenBroadcastColumns] = useState<Set<string>>(new Set());

  const allBroadcastColumns: ColumnConfig[] = [
    { key: "action", label: "Action", width: "w-24" },
    { key: "title", label: "Title", width: "w-40" },
    { key: "status", label: "Status", width: "w-32" },
    { key: "expiry", label: "Expiry Date", width: "w-32" },
    { key: "createdBy", label: "Created By", width: "w-32" },
  ];

  // --- SERVICE DESK STATE ---
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [sdPagination, setSdPagination] = useState<PaginationState>({
    page: 1, perPage: 10, total: 0, totalPages: 0,
  });
  const [isTicketSearchVisible, setIsTicketSearchVisible] = useState(false);
  const [searchTicketQuery, setSearchTicketQuery] = useState("");
  const debouncedTicketSearch = useDebounce(searchTicketQuery, 500);
  const [hiddenTicketColumns, setHiddenTicketColumns] = useState<Set<string>>(new Set());

  const allTicketColumns: ColumnConfig[] = [
    { key: "action", label: "Action", width: "w-24" },
    { key: "ticket_number", label: "Ticket No", width: "w-32" },
    { key: "title", label: "Title", width: "w-40" },
    { key: "status", label: "Status", width: "w-32" },
    { key: "priority", label: "Priority", width: "w-32" },
    { key: "category", label: "Category", width: "w-32" },
  ];

  // --- UNIFIED VIEW MODAL STATE ---
  const [viewType, setViewType] = useState<'visitor' | 'amenity' | 'event' | 'broadcast' | 'ticket' | null>(null);
  const [viewData, setViewData] = useState<any>(null);
  const [loadingViewDetails, setLoadingViewDetails] = useState(false);

  // Fetch Functions (Largely Unchanged, just kept for completeness)
  const fetchUserProfile = async (id: number) => {
    setLoadingProfile(true);
    try {
      const res = await getUsersByID(id);
      const apiData = Array.isArray(res.data) ? res.data[0] : res.data;
      const mappedProfile: UserProfile = {
        id: String(apiData.id),
        name: `${apiData.firstname || ""} ${apiData.lastname || ""}`.trim(),
        isVerified: Boolean(apiData.face_added),
        status: apiData.active ? "Active" : "Inactive",
        userType: apiData.user_type ? apiData.user_type.replace(/_/g, " ").toUpperCase() : "-",
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
      toast.error("Failed to load user profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchServiceDeskTickets = async () => {
    if (!id) return;
    setLoadingTickets(true);
    try {
      const res = await fetchUserComplaintsById(Number(id), sdPagination.page);
      const data = res.data;
      const mappedTickets = data.complaints.map((item: any) => ({
        id: item.id,
        ticket_number: item.ticket_number,
        title: item.heading,
        status: item.issue_status?.name || item.issue_status || 'Unknown',
        priority: item.priority?.name || item.priority || '-',
        category: item.category_type?.name || item.category_type || '-',
        assigned_to: item.assigned_to,
        created_at: item.created_at,
        description: item.text,
        building_name: item.building_name,
        unit_name: item.unit_name,
        reporter_name: item.created_by
      }));
      setTickets(mappedTickets);
      setSdPagination(prev => ({
        ...prev,
        totalPages: data.total_pages,
        total: data.count,
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Service Desk tickets");
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  const fetchVisitors = async () => {
    setLoadingVisitors(true);
    try {
      const response = await getAllVisitorsByUserId(Number(id));
      const data: VisitorApiResponse = response.data;
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
        hosts: item.hosts?.length ? item.hosts.map((h: any) => h.full_name).join(", ") : "-"
      }));
      setVisitors(transformed);
      setVisitorPagination(prev => ({
        ...prev,
        total: data.total_count,
        totalPages: data.total_pages,
      }));
    } catch (error) {
      console.error("Error fetching visitors:", error);
      toast.error("Failed to load visitors");
      setVisitors([]);
    } finally {
      setLoadingVisitors(false);
    }
  };

  const fetchAmenitiesBookings = async () => {
    setLoadingAmenities(true);
    try {
      const res = await getAmenitiesBookedByUserId(id);
      const bookings = res.data?.amenity_bookings || [];
      setAmenities(bookings);
      setAmenityPagination(prev => ({ ...prev, total: bookings.length, totalPages: Math.ceil(bookings.length / prev.perPage) }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load amenities bookings");
      setAmenities([]);
    } finally {
      setLoadingAmenities(false);
    }
  };

  const fetchEvents = async () => {
    if (!id) return;
    setLoadingEvents(true);
    try {
      const res = await getEventsCreatedByUserId(Number(id));
      const evts = res.data || [];
      setEvents(evts);
      setEventPagination(prev => ({ ...prev, total: evts.length, totalPages: Math.ceil(evts.length / prev.perPage) }));
    } catch (e) {
      toast.error("Failed to load events");
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchBroadcasts = async () => {
    if (!id) return;
    setLoadingBroadcasts(true);
    try {
      const res = await getBroadCastCreatedByUserId(Number(id));
      const brds = res.data || [];
      setBroadcasts(brds);
      setBroadcastPagination(prev => ({ ...prev, total: brds.length, totalPages: Math.ceil(brds.length / prev.perPage) }));
    } catch (e) {
      toast.error("Failed to load broadcasts");
      setBroadcasts([]);
    } finally {
      setLoadingBroadcasts(false);
    }
  };

  // Effects
  useEffect(() => {
    if (activeTab === "Open Profile" && id) fetchUserProfile(Number(id));
  }, [activeTab, id]);

  useEffect(() => {
    if (activeTab === "Visitors" && id) fetchVisitors();
  }, [activeTab, id, visitorPagination.page]);

  useEffect(() => {
    if (activeTab === "ServiceDesk") {
      setSdPagination(p => ({ ...p, page: 1 }));
      fetchServiceDeskTickets();
    }
  }, [activeTab, id]);

  useEffect(() => {
    if (activeTab === "ServiceDesk" && sdPagination.page > 1) {
      fetchServiceDeskTickets();
    }
  }, [sdPagination.page, sdPagination.perPage]);

  useEffect(() => {
    if (activeTab === "Amenities Bookings") {
      setAmenityPagination(p => ({ ...p, page: 1 }));
      fetchAmenitiesBookings();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "Communication") {
      setEventPagination(p => ({ ...p, page: 1 }));
      setBroadcastPagination(p => ({ ...p, page: 1 }));
      subTab === "Events" ? fetchEvents() : fetchBroadcasts();
    }
  }, [activeTab, subTab, id]);

  // Reset Page on Search
  useEffect(() => {
    if (activeTab === "Visitors") setVisitorPagination(p => ({ ...p, page: 1 }));
  }, [debouncedVisitorSearch]);

  useEffect(() => {
    if (activeTab === "ServiceDesk") setSdPagination(p => ({ ...p, page: 1 }));
  }, [debouncedTicketSearch]);

  useEffect(() => {
    if (activeTab === "Amenities Bookings") setAmenityPagination(p => ({ ...p, page: 1 }));
  }, [debouncedAmenitySearch]);

  useEffect(() => {
    if (activeTab === "Communication") {
      if (subTab === "Events") setEventPagination(p => ({ ...p, page: 1 }));
      if (subTab === "Broadcast") setBroadcastPagination(p => ({ ...p, page: 1 }));
    }
  }, [debouncedEventSearch, debouncedBroadcastSearch]);

  const handleOpenView = async (type: 'visitor' | 'amenity' | 'event' | 'broadcast' | 'ticket', itemId: any, itemData?: any) => {
    setViewType(type);
    setViewData(itemData || null);
    setLoadingViewDetails(true);

    try {
      if (type === 'visitor') {
        const res = await vmsService.getVisitorById(itemId);
        setViewData(res.data?.visitor || res.data);
      } else if (type === 'amenity') {
        const res = await getAmenityBookingById(itemId);
        setViewData(res.data?.amenity_booking || res.data);
      } else if (type === 'ticket') {
        setViewData(itemData);
      } else {
        setViewData(itemData);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load details");
    } finally {
      setLoadingViewDetails(false);
    }
  };

  const handleCloseView = () => {
    setViewType(null);
    setViewData(null);
  };

  const toggleColumn = (key: string, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    setter(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Filtered Data Logic
  const filteredVisitors = visitors.filter(row =>
    row.name.toLowerCase().includes(debouncedVisitorSearch.toLowerCase()) ||
    row.contact.includes(debouncedVisitorSearch) ||
    row.purpose.toLowerCase().includes(debouncedVisitorSearch.toLowerCase())
  );

  const filteredTickets = tickets.filter(row =>
    row.ticket_number.toLowerCase().includes(debouncedTicketSearch.toLowerCase()) ||
    row.title.toLowerCase().includes(debouncedTicketSearch.toLowerCase())
  );

  const filteredAmenities = amenities.filter(row =>
    (row.amenity?.fac_name || "").toLowerCase().includes(debouncedAmenitySearch.toLowerCase()) ||
    (row.status || "").toLowerCase().includes(debouncedAmenitySearch.toLowerCase())
  );

  const filteredEvents = events.filter(row =>
    (row.event_name || "").toLowerCase().includes(debouncedEventSearch.toLowerCase()) ||
    (row.venue || "").toLowerCase().includes(debouncedEventSearch.toLowerCase())
  );

  const filteredBroadcasts = broadcasts.filter(row =>
    (row.notice_title || "").toLowerCase().includes(debouncedBroadcastSearch.toLowerCase()) ||
    (row.status || "").toLowerCase().includes(debouncedBroadcastSearch.toLowerCase())
  );

  // Pagination Logic
  const vStartIndex = (visitorPagination.page - 1) * visitorPagination.perPage;
  const paginatedVisitors = filteredVisitors.slice(vStartIndex, vStartIndex + visitorPagination.perPage);

  const tStartIndex = (sdPagination.page - 1) * sdPagination.perPage;
  const paginatedTickets = filteredTickets.slice(tStartIndex, tStartIndex + sdPagination.perPage);

  const amStartIndex = (amenityPagination.page - 1) * amenityPagination.perPage;
  const paginatedAmenities = filteredAmenities.slice(amStartIndex, amStartIndex + amenityPagination.perPage);

  const evStartIndex = (eventPagination.page - 1) * eventPagination.perPage;
  const paginatedEvents = filteredEvents.slice(evStartIndex, evStartIndex + eventPagination.perPage);

  const brStartIndex = (broadcastPagination.page - 1) * broadcastPagination.perPage;
  const paginatedBroadcasts = filteredBroadcasts.slice(brStartIndex, brStartIndex + broadcastPagination.perPage);

  return (
    <div className="p-6 min-h-screen bg-slate-50 font-sans">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">

        {/* --- HEADER TABS --- */}
        <div className="px-6 border-b border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar justify-center mt-6 mb-4">
            {["Open Profile", "ServiceDesk", "Visitors", "Amenities Bookings", "Communication"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  if (tab === "Open Profile") {
                    setIsProfileModalOpen(true);
                    if (id) fetchUserProfile(Number(id));
                  } else {
                    setActiveTab(tab);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                  ${activeTab === tab && tab !== "Open Profile"
                    ? "bg-purple-700 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* --- CONTENT: SERVICE DESK --- */}
        {activeTab === "ServiceDesk" && (
          <div className="p-6 animate-in fade-in">
            {/* Controls */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className={`relative w-full md:w-64 transition-all duration-300 ease-in-out overflow-hidden border ${!isTicketSearchVisible ? 'w-0 opacity-0 p-0 border-transparent' : 'md:w-64 w-full opacity-100 border-slate-300'}`}>
                <Search className={`absolute left-3 top-2.5 w-4 h-4 text-slate-400 transition-opacity ${!isTicketSearchVisible ? 'opacity-0' : 'opacity-100'}`} />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTicketQuery}
                  onChange={(e) => setSearchTicketQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTicketSearchVisible(!isTicketSearchVisible)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${isTicketSearchVisible ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <Search className="w-4 h-4" /> {isTicketSearchVisible ? "Hide Search" : "Show Search"}
                </button>
                <div className="relative">
                  <button onClick={() => { /* Toggle Ticket Column Menu logic if needed, simplified for now */ }} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <Columns3 className="w-4 h-4" /> Columns <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {/* Placeholder for Column Menu for Tickets */}
                </div>
              </div>
            </div>

            <div className="min-h-[400px]">
              {loadingTickets ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400"><Loader2 className="w-8 h-8 animate-spin" /><span className="mt-2">Loading...</span></div>
              ) : paginatedTickets.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      {allTicketColumns.filter(c => !hiddenTicketColumns.has(c.key)).map((col) => (
                        <th key={col.key} className={`px-6 py-3 whitespace-nowrap uppercase text-xs tracking-wider ${col.width || ''}`}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedTickets.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        {allTicketColumns.filter(c => !hiddenTicketColumns.has(c.key)).map((col) => (
                          <td key={`${row.id}-${col.key}`} className="px-6 py-3">
                            {col.key === "action" ? (
                              <button onClick={() => handleOpenView('ticket', row.id, row)} className="p-1.5 text-slate-400 hover:text-purple-600 rounded-md"><Eye className="w-4 h-4" /></button>
                            ) : col.key === "status" ? (
                              <StatusBadge status={row[col.key]} />
                            ) : (
                              row[col.key]
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 border border-dashed border-slate-300 rounded-lg bg-slate-50/50">
                  <TicketIcon className="w-12 h-12 mb-3 opacity-20" />
                  <p className="font-medium text-slate-500">No Tickets Found</p>
                </div>
              )}
            </div>

            <PaginationFooter
              pagination={sdPagination}
              setPagination={setSdPagination}
              totalItems={filteredTickets.length}
              isClientSide={true}
            />
          </div>
        )}

        {/* --- CONTENT: VISITORS --- */}
        {activeTab === "Visitors" && (
          <>
             {/* Unified Control Bar for Visitors to match other tabs */}
            <div className="px-6 py-3 flex flex-col md:flex-row justify-between items-center border-b border-slate-100 gap-4">
              <div className={`relative w-full md:w-64 transition-all duration-300 ease-in-out overflow-hidden border ${!isSearchVisible ? 'w-0 opacity-0 p-0 border-transparent' : 'md:w-64 w-full opacity-100 border-slate-300'}`}>
                <Search className={`absolute left-3 top-2.5 w-4 h-4 text-slate-400 transition-opacity ${!isSearchVisible ? 'opacity-0' : 'opacity-100'}`} />
                <input
                  type="text"
                  placeholder="Search visitors..."
                  value={searchVisitorQuery}
                  onChange={(e) => setSearchVisitorQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSearchVisible(!isSearchVisible)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${isSearchVisible
                      ? "bg-purple-50 border-purple-200 text-purple-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <Search className="w-4 h-4" />
                  {isSearchVisible ? "Hide Search" : "Show Search"}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Columns3 className="w-4 h-4" />
                    Column Visibility
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {isColumnMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
                      {allVisitorColumns.map((col) => (
                        <label
                          key={col.key}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={!hiddenVisitorColumns.has(col.key)}
                            onChange={() =>
                              toggleColumn(col.key, setHiddenVisitorColumns)
                            }
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{col.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

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
                                <button onClick={() => handleOpenView('visitor', row.id, row)} className="p-1.5 text-purple-600 hover:text-purple-600 rounded-md"><Eye className="w-4 h-4" /></button>
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
                  <TicketIcon className="w-12 h-12 mb-3 opacity-20" />
                  <p className="font-medium text-slate-500">No visitors found</p>
                </div>
              )}
            </div>

            <PaginationFooter
              pagination={visitorPagination}
              setPagination={setVisitorPagination}
              totalItems={filteredVisitors.length}
              isClientSide={true}
            />
          </>
        )}

        {/* --- CONTENT: AMENITIES BOOKINGS --- */}
        {activeTab === "Amenities Bookings" && (
          <div className="p-6 animate-in fade-in">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div className={`relative w-full md:w-64 transition-all duration-300 ease-in-out overflow-hidden border ${!isAmenitySearchVisible ? 'w-0 opacity-0 p-0 border-transparent' : 'md:w-64 w-full opacity-100 border-slate-300'}`}>
                <Search className={`absolute left-3 top-2.5 w-4 h-4 text-slate-400 transition-opacity ${!isAmenitySearchVisible ? 'opacity-0' : 'opacity-100'}`} />
                <input
                    type="text"
                    placeholder="Search amenities..."
                    value={searchAmenityQuery}
                    onChange={(e) => setSearchAmenityQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAmenitySearchVisible(!isAmenitySearchVisible)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${isAmenitySearchVisible ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <Search className="w-4 h-4" /> {isAmenitySearchVisible ? "Hide Search" : "Show Search"}
                </button>
                 <div className="relative">
                  <button onClick={() => { /* Toggle Column Menu */ }} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <Columns3 className="w-4 h-4" /> Columns <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {/* Placeholder for Column Menu for Amenities */}
                </div>
              </div>
            </div>

            {loadingAmenities ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400"><Loader2 className="w-8 h-8 animate-spin" /><span className="mt-2">Loading...</span></div>
            ) : paginatedAmenities.length > 0 ? (
              <>
                <div className="overflow-x-auto min-h-[400px]">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                         {allAmenityColumns.filter(c => !hiddenAmenityColumns.has(c.key)).map((col) => (
                           <th key={col.key} className={`px-6 py-3 uppercase text-xs tracking-wider ${col.width || ''}`}>{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedAmenities.map((a: any) => (
                        <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                           {allAmenityColumns.filter(c => !hiddenAmenityColumns.has(c.key)).map((col) => (
                             <td key={`${a.id}-${col.key}`} className="px-6 py-3">
                                {col.key === "action" ? (
                                   <button onClick={() => handleOpenView('amenity', a.id, a)} className="p-1.5 text-purple-600 hover:text-purple-600"><Eye className="w-4 h-4" /></button>
                                ) : col.key === "status" ? (
                                  <StatusBadge status={a.status || "-"} />
                                ) : col.key === "name" ? (
                                    a.amenity?.fac_name || "-"
                                ) : col.key === "type" ? (
                                     a.amenity?.fac_type || "-"
                                ) : (
                                    a[col.key]
                                )}
                             </td>
                           ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationFooter
                  pagination={amenityPagination}
                  setPagination={setAmenityPagination}
                  totalItems={filteredAmenities.length}
                  isClientSide={true}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                <TicketIcon className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium text-slate-500">No amenities bookings found</p>
              </div>
            )}
          </div>
        )}

        {/* --- CONTENT: COMMUNICATION --- */}
        {activeTab === "Communication" && (
          <div className="animate-in fade-in">
            <div className="px-8 py-4 border-t border-slate-200 bg-slate-20">
              {(["Events", "Broadcast"] as CommunicationTab[]).map((t) => (
                <button key={t} onClick={() => setSubTab(t)} className={`px-7 py-2 mx-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${subTab === t ? "bg-purple-700 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              {(subTab === "Events" ? loadingEvents : loadingBroadcasts) ? (
                <div className="flex flex-col items-center justify-between h-64 text-slate-400"><Loader2 className="w-8 h-8 animate-spin" /><span className="mt-2">Loading...</span></div>
              ) : subTab === "Events" ? (
                <>
                  {/* Event Controls */}
                  <div className="px-6 py-3 mb-4 flex flex-col md:flex-row justify-between items-center border-b border-slate-100 gap-4">
                    <div className={`relative w-full md:w-64 transition-all duration-300 ease-in-out overflow-hidden border ${!isEventSearchVisible ? 'w-0 opacity-0 p-0 border-transparent' : 'md:w-64 w-full opacity-100 border-slate-300'}`}>
                        <Search className={`absolute left-3 top-2.5 w-4 h-4 text-slate-400 transition-opacity ${!isEventSearchVisible ? 'opacity-0' : 'opacity-100'}`} />
                        <input
                          type="text"
                          placeholder="Search events..."
                          value={searchEventQuery}
                          onChange={(e) => setSearchEventQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsEventSearchVisible(!isEventSearchVisible)}
                          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${isEventSearchVisible ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          <Search className="w-4 h-4" /> {isEventSearchVisible ? "Hide Search" : "Show Search"}
                        </button>
                         <div className="relative">
                            <button onClick={() => { /* Toggle Column Menu */ }} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <Columns3 className="w-4 h-4" /> Columns <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto px-6">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            {allEventColumns.filter(c => !hiddenEventColumns.has(c.key)).map((col) => (
                                <th key={col.key} className={`px-6 py-2 uppercase text-xs tracking-wider ${col.width || ''}`}>{col.label}</th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedEvents.map((e) => (
                          <tr key={e.id} className="hover:bg-slate-50">
                             {allEventColumns.filter(c => !hiddenEventColumns.has(c.key)).map((col) => (
                                 <td key={`${e.id}-${col.key}`} className="px-6 py-3">
                                     {col.key === "action" ? (
                                        <button onClick={() => handleOpenView('event', e.id, e)} className="p-1.5 text-purple-600 hover:text-purple-600"><Eye className="w-4 h-4" /></button>
                                     ) : col.key === "status" ? (
                                         <StatusBadge status={e.status || "-"} />
                                     ) : col.key === "start" ? (
                                         new Date(e.start_date_time).toLocaleDateString()
                                     ) : col.key === "end" ? (
                                         new Date(e.end_date_time).toLocaleDateString()
                                     ) : (
                                         e[col.key]
                                     )}
                                 </td>
                             ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <PaginationFooter
                    pagination={eventPagination}
                    setPagination={setEventPagination}
                    totalItems={filteredEvents.length}
                    isClientSide={true}
                  />
                </>
              ) : (
                <>
                   {/* Broadcast Controls */}
                  <div className="px-6 py-3 mb-4 flex flex-col md:flex-row justify-between items-center border-b border-slate-100 gap-4">
                    <div className={`relative w-full md:w-64 transition-all duration-300 ease-in-out overflow-hidden border ${!isBroadcastSearchVisible ? 'w-0 opacity-0 p-0 border-transparent' : 'md:w-64 w-full opacity-100 border-slate-300'}`}>
                        <Search className={`absolute left-3 top-2.5 w-4 h-4 text-slate-400 transition-opacity ${!isBroadcastSearchVisible ? 'opacity-0' : 'opacity-100'}`} />
                        <input
                          type="text"
                          placeholder="Search broadcasts..."
                          value={searchBroadcastQuery}
                          onChange={(e) => setSearchBroadcastQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsBroadcastSearchVisible(!isBroadcastSearchVisible)}
                          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${isBroadcastSearchVisible ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          <Search className="w-4 h-4" /> {isBroadcastSearchVisible ? "Hide Search" : "Show Search"}
                        </button>
                         <div className="relative">
                            <button onClick={() => { /* Toggle Column Menu */ }} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <Columns3 className="w-4 h-4" /> Columns Visibility <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto px-6">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                             {allBroadcastColumns.filter(c => !hiddenBroadcastColumns.has(c.key)).map((col) => (
                                <th key={col.key} className={`px-6 py-3 uppercase text-xs tracking-wider ${col.width || ''}`}>{col.label}</th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedBroadcasts.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50">
                              {allBroadcastColumns.filter(c => !hiddenBroadcastColumns.has(c.key)).map((col) => (
                                  <td key={`${b.id}-${col.key}`} className="px-6 py-3">
                                      {col.key === "action" ? (
                                          <button onClick={() => handleOpenView('broadcast', b.id, b)} className="p-1.5 text-purple-600 hover:text-purple-600"><Eye className="w-4 h-4" /></button>
                                      ) : col.key === "status" ? (
                                          <StatusBadge status={b.status || '-'} />
                                      ) : col.key === "expiry" ? (
                                          new Date(b.expiry_date).toLocaleDateString()
                                      ) : (
                                          b[col.key]
                                      )}
                                  </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <PaginationFooter
                    pagination={broadcastPagination}
                    setPagination={setBroadcastPagination}
                    totalItems={filteredBroadcasts.length}
                    isClientSide={true}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* --- UNIFIED DETAIL MODAL --- */}
        {viewType && (
          <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
            <div className="min-h-screen px-4 py-6 flex items-start justify-center">
              <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
                <div className="bg-white sticky top-0 z-10 border-b border-slate-200 px-6 py-4 rounded-t-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={handleCloseView} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5 text-slate-600" /></button>
                    <div>
                      <h1 className="text-xl font-bold text-slate-900">
                        {viewType === 'ticket' && (viewData?.heading || viewData?.title || 'Ticket Details')}
                        {viewType === 'visitor' && 'Visitor Details'}
                        {viewType === 'amenity' && 'Amenity Booking Details'}
                        {viewType === 'event' && 'Event Details'}
                        {viewType === 'broadcast' && 'Broadcast Details'}
                      </h1>
                      <div className="flex items-center gap-3 mt-1">
                        {viewType === 'ticket' && <span className="text-sm text-slate-500">#{viewData?.ticket_number}</span>}
                        <StatusBadge status={viewType === 'ticket' ? viewData?.status : viewType === 'visitor' ? viewData?.visitor_in_out : viewData?.status} />
                        {viewType === 'ticket' && viewData?.priority && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${viewData.priority === 'P1' ? 'bg-red-100 text-red-700 border-red-200' :
                            viewData.priority === 'P2' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                              'bg-green-100 text-green-700 border-green-200'
                            }`}>
                            {viewData.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleCloseView} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                  </div>
                </div>

                {loadingViewDetails ? (
                  <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-purple-700" /></div>
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-card border border-slate-200 rounded-xl overflow-hidden">
                          <div className="bg-purple-50 px-6 py-4 border-b border-slate-200">
                            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-purple-700" />
                              {viewType === 'ticket' ? 'Ticket Information' :
                                viewType === 'visitor' ? 'Visitor Information' :
                                  viewType === 'amenity' ? 'Booking Information' :
                                    viewType === 'event' ? 'Event Information' : 'Broadcast Information'}
                            </h2>
                          </div>
                          <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {viewType === 'ticket' && (
                                <>
                                  <InfoItem icon={<Tag className="w-4 h-4" />} label="Category" value={viewData?.category_type || viewData?.helpdesk_category?.name} />
                                  <InfoItem icon={<AlertTriangle className="w-4 h-4" />} label="Issue Type" value={viewData?.issue_type} />
                                  <InfoItem icon={<Building className="w-4 h-4" />} label="Building" value={viewData?.building_name} />
                                  <InfoItem icon={<MapPin className="w-4 h-4" />} label="Unit" value={viewData?.unit_name} />
                                  <InfoItem icon={<UserIcon className="w-4 h-4" />} label="Assigned To" value={viewData?.assigned_to || 'Unassigned'} />
                                </>
                              )}
                              {viewType === 'visitor' && (
                                <>
                                  <InfoItem icon={<UserIcon className="w-4 h-4" />} label="Visitor Name" value={viewData?.name} />
                                  <InfoItem icon={<Tag className="w-4 h-4" />} label="Type" value={viewData?.visit_type} />
                                  <InfoItem icon={<Phone className="w-4 h-4" />} label="Contact" value={viewData?.contact_no} />
                                  <InfoItem icon={<MapPin className="w-4 h-4" />} label="Coming From" value={viewData?.coming_from} />
                                  <InfoItem icon={<Car className="w-4 h-4" />} label="Vehicle No" value={viewData?.vehicle_number} />
                                  <InfoItem
                                    icon={<UserIcon className="w-4 h-4" />}
                                    label="Host"
                                    value={
                                      viewData?.hosts?.length
                                        ? viewData.hosts.map(h => h.full_name).join(", ")
                                        : "-"
                                    }
                                  />
                                </>
                              )}
                              {viewType === 'amenity' && (
                                <>
                                  <InfoItem icon={<Home className="w-4 h-4" />} label="Facility Name" value={viewData?.amenity?.fac_name} />
                                  <InfoItem icon={<Tag className="w-4 h-4" />} label="Facility Type" value={viewData?.amenity?.fac_type} />
                                  <InfoItem icon={<Calendar className="w-4 h-4" />} label="Booking Date" value={viewData?.booking_date} />
                                  <InfoItem icon={<Clock className="w-4 h-4" />} label="Slot" value={viewData?.slot?.twelve_hr_slot} />
                                  <InfoItem icon={<Tag className="w-4 h-4" />} label="Amount" value={viewData?.amount} />
                                  <InfoItem icon={<Eye className="w-4 h-4" />} label="Payment Mode" value={viewData?.payment_mode} />
                                </>
                              )}
                              {viewType === 'event' && (
                                <>
                                  <InfoItem icon={<Calendar className="w-4 h-4" />} label="Start Date" value={formatDate(viewData?.start_date_time)} />
                                  <InfoItem icon={<Calendar className="w-4 h-4" />} label="End Date" value={formatDate(viewData?.end_date_time)} />
                                  <InfoItem icon={<MapPin className="w-4 h-4" />} label="Venue" value={viewData?.venue} />
                                  <InfoItem icon={<UserIcon className="w-4 h-4" />} label="Created By" value={viewData?.created_by} />
                                </>
                              )}
                              {viewType === 'broadcast' && (
                                <>
                                  <InfoItem icon={<UserIcon className="w-4 h-4" />} label="Title" value={viewData?.notice_title} />
                                  <InfoItem icon={<UserIcon className="w-4 h-4" />} label="Shared" value={viewData?.shared} />
                                  <InfoItem icon={<UserIcon className="w-4 h-4" />} label="Created By" value={viewData?.created_by} />
                                  <InfoItem icon={<Calendar className="w-4 h-4" />} label="Created Date" value={formatDate(viewData?.created_at)} />
                                  <InfoItem icon={<Calendar className="w-4 h-4" />} label="Expiry Date" value={formatDate(viewData?.expiry_date)} />
                                  <InfoItem icon={<Tag className="w-4 h-4" />} label="Status" value={viewData?.status} />
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* DESCRIPTION / DETAILS */}
                        {(viewType === 'ticket' && viewData?.text) ||
                          (viewType === 'visitor' && viewData?.purpose) ||
                          (viewType === 'amenity' && viewData?.amenity?.description) ||
                          (viewType === 'event' && viewData?.description) ||
                          (viewType === 'broadcast' && viewData?.notice_discription) ? (
                          <div className="bg-card border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-purple-50 px-6 py-4 border-b border-slate-200">
                              <h2 className="font-semibold text-slate-800 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-700" /> Description</h2>
                            </div>
                            <div className="p-6">
                              <p className="text-slate-900 whitespace-pre-wrap text-sm leading-relaxed">
                                {viewType === 'visitor' ? viewData?.purpose :
                                  viewType === 'amenity' ? viewData?.amenity?.description :
                                    viewType === 'ticket' ? viewData?.text :
                                      viewType === 'broadcast' ? viewData?.notice_discription :
                                        viewData?.description}
                              </p>
                            </div>
                          </div>
                        ) : null}

                        {/* ATTACHMENTS */}
                        {viewType === 'ticket' && viewData?.documents && viewData.documents.length > 0 && (
                          <div className="bg-card border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-purple-50 px-6 py-4 border-b border-slate-200">
                              <h2 className="font-semibold text-slate-800">Attachments</h2>
                            </div>
                            <div className="p-6">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {viewData.documents.map((doc: any, index: number) => (
                                  <a key={index} href={domainPrefix + doc.document} target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-purple-500 transition-colors">
                                    <img src={domainPrefix + doc.document} alt={`Attachment ${index + 1}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <ExternalLink className="w-6 h-6 text-white" />
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* RIGHT COLUMN (SIDEBAR) */}
                      <div className="space-y-6">
                        <div className="bg-card border border-slate-200 rounded-xl overflow-hidden">
                          <div className="bg-purple-50 px-6 py-4 border-b border-slate-200">
                            <h2 className="font-semibold text-slate-800">Quick Info</h2>
                          </div>
                          <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-500">Status</span>
                              <StatusBadge status={viewData?.status || viewData?.visitor_in_out} />
                            </div>
                            {viewType === 'ticket' && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Priority</span>
                                <span className="text-sm font-medium text-slate-900">{viewData?.priority}</span>
                              </div>
                            )}
                            {viewType === 'visitor' && (
                              <>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-500">Expected Date</span>
                                  <span className="text-sm font-medium text-slate-900">{formatDate(viewData?.expected_date)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-500">Pass Duration</span>
                                  <span className="text-sm font-medium text-slate-900">{viewData?.start_pass} - {viewData?.end_pass}</span>
                                </div>
                              </>
                            )}
                            {viewType === 'amenity' && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Payment Status</span>
                                <span className="text-sm font-medium text-slate-900 capitalize">{viewData?.payment_status || '-'}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-card border border-slate-200 rounded-xl overflow-hidden">
                          <div className="bg-purple-50 px-6 py-4 border-b border-slate-200">
                            <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-700" /> Timeline</h2>
                          </div>
                          <div className="p-6 space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2" />
                              <div>
                                <p className="text-sm font-medium text-slate-900">Created</p>
                                <p className="text-xs text-slate-500">{formatDate(viewData?.created_at)}</p>
                              </div>
                            </div>
                            {viewData?.updated_at && (
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                                <div>
                                  <p className="text-sm font-medium text-slate-900">Last Updated</p>
                                  <p className="text-xs text-slate-500">{formatDate(viewData?.updated_at)}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- PROFILE MODAL --- */}
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl relative animate-in fade-in zoom-in">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">User Profile</h2>
                <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-500 hover:text-slate-800">✕</button>
              </div>
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                {loadingProfile ? (
                  <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
                ) : userProfile && (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-xl font-bold">{userProfile.name.charAt(0)}</div>
                      <div>
                        <h3 className="font-semibold">{userProfile.name}</h3>
                        <p className="text-sm text-slate-500">
                          User Type: {userProfile.userType}
                        </p>
                      </div>
                    </div>
                    {userProfile.propertyDetails && (
                      <div className="mb-4 border rounded-lg"><div className="bg-slate-50 px-4 py-2 font-medium flex gap-2"><Home className="w-4 h-4" /> Property Details</div><div className="p-4 text-sm">{userProfile.propertyDetails}</div></div>
                    )}
                    <div className="mb-4 border rounded-lg"><div className="bg-slate-50 px-4 py-2 font-medium">Personal Information</div><div className="p-4 space-y-2 text-sm"><div className="flex gap-2"><Phone className="w-4 h-4" /> {userProfile.personalInfo.contact}</div><div className="flex gap-2"><Mail className="w-4 h-4" /> {userProfile.personalInfo.email}</div><div className="flex gap-2"><Calendar className="w-4 h-4" /> {userProfile.personalInfo.dob}</div></div></div>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 flex gap-2"><Users className="w-4 h-4" /> Family Members</div>
                      <div className="border rounded-lg p-4 flex gap-2"><Tag className="w-4 h-4" /> Vendor Services</div>
                      <div className="border rounded-lg p-4 flex gap-2"><Car className="w-4 h-4" /> Vehicle Details</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserTreeViewPage;