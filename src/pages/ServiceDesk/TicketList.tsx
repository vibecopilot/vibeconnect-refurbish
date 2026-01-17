import * as XLSX from 'xlsx';
import React, { useState, useEffect, useCallback } from "react";
import toast from 'react-hot-toast'; // Add this import
import { useNavigate, Link } from "react-router-dom";
import Breadcrumb from "../../components/ui/Breadcrumb";

import ListToolbar from "../../components/ui/ListToolbar";
import DataCard from "../../components/ui/DataCard";
import DataTable, { TableColumn } from "../../components/ui/DataTable";
import StatusBadge, { StatusType } from "../../components/ui/StatusBadge";
import { serviceDeskService, Ticket } from "../../services/serviceDesk.service";
import {
  Loader2,
  Ticket as TicketIcon,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Eye,
  EyeOff,
  Edit, Clock, CheckCircle, XCircle, RefreshCcw, HelpCircle, MessageCircle, FileText, MessageSquare,
  FileCheck,
} from "lucide-react";
import { classNames } from '@react-pdf-viewer/core';

const TicketList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchValue, setSearchValue] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]); // For client-side search
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);

  // Quick filter state
  const [quickFilter, setQuickFilter] = useState<"All" | "Open" | "Closed" | "Pending" | "Completed">("All");

  // Dashboard card filter state (for server-side filtering)
  const [selectedDashboardStatus, setSelectedDashboardStatus] = useState<string | null>(null);

  const [filters, setFilters] = useState<{
    building_name?: string;
    floor_name?: string;
    unit_name?: string;
    status?: string;
    priority?: string;
    category?: string;
    assigned_to?: string;
    date_start?: string;
    date_end?: string;
    search?: string; // Add search to filters for server-side search
  }>({});

  const colorOptions = [
    { key: "Pending", bg: "bg-blue-100", border: "border-blue-200", text: "text-blue-700" },
    { key: "Closed", bg: "bg-red-100", border: "border-red-200", text: "text-red-700" },
    { key: "Complete", bg: "bg-green-100", border: "border-green-200", text: "text-green-700" },
    { key: "Work Completed", bg: "bg-green-200", border: "border-green-300", text: "text-green-700" },
    { key: "Reopened", bg: "bg-orange-100", border: "border-orange-200", text: "text-orange-700" },
    { key: "Approved", bg: "bg-teal-100", border: "border-teal-200", text: "text-teal-700" },
    { key: "Work In Process", bg: "bg-indigo-100", border: "border-indigo-200", text: "text-indigo-700" },
    { key: "Approval Pending", bg: "bg-yellow-100", border: "border-yellow-200", text: "text-yellow-700" },
  ];

  const typeColorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    "Complaint": { bg: "bg-red-100", border: "border-red-200", text: "text-red-700", icon: "text-red-500" },
    "Request": { bg: "bg-purple-100", border: "border-purple-200", text: "text-purple-700", icon: "text-purple-500" },
    "Suggestion": { bg: "bg-pink-100", border: "border-pink-200", text: "text-pink-700", icon: "text-pink-500" },
    "Req": { bg: "bg-slate-100", border: "border-slate-200", text: "text-slate-700", icon: "text-slate-500" },
  };


  const getTypeCardColor = (label: string) => {
    return (
      typeColorMap[label] || {
        bg: "bg-purple-200",
        border: "border-purple-100",
        text: "text-purple-600",
        icon: "text-gray-500",
      }
    );
  };

  const getCardColor = (label: string) => {
    return (
      colorOptions.find((c) => c.key === label) || {
        bg: "bg-purple-500",
        border: "border-purple-500",
        text: "text-purple-600",
      }
    );
  };

  const [lookups, setLookups] = useState<{
    buildings: string[];
    floors: string[];
    units: string[];
    categories: string[];
    statuses: string[];
    priorities: string[];
    assignees: string[];
  }>({
    buildings: [],
    floors: [],
    units: [],
    categories: [],
    statuses: [],
    priorities: [],
    assignees: [],
  });
  // Status Icons
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-5 h-5" />;
      case "Closed":
        return <XCircle className="w-5 h-5" />;
      case "Complete":
      case "Work Completed":
        return <CheckCircle className="w-5 h-5" />;
      case "Reopened":
        return <RefreshCcw className="w-5 h-5" />;
      default:
        return <FileCheck className="w-5 h-5" />;
    }
  };

  // Type Icons
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Complaint":
        return <AlertCircle className="w-5 h-5" />;
      case "Request":
        return <HelpCircle className="w-5 h-5" />;
      case "Req":
        return <HelpCircle className="w-5 h-5" />;
      case "Suggestion":
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  // Hidden columns state
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  // Records per page: 12 for grid, 10 for table
  const getPerPage = (mode: "grid" | "table") => (mode === "grid" ? 12 : 10);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: getPerPage("table"),
    total: 0,
    totalPages: 0,
  });

  // Update perPage when viewMode changes
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      perPage: getPerPage(viewMode),
      page: 1,
    }));
  }, [viewMode]);

  // Fetch paginated tickets for display
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Merge dashboard status filter with other filters
      const apiFilters = { ...filters };
      if (selectedDashboardStatus) {
        apiFilters.status = selectedDashboardStatus;
      }

      const response = await serviceDeskService.getTickets(
        pagination.page,
        pagination.perPage,
        apiFilters
      );
      const data = response.data;
      const ticketList = Array.isArray(data)
        ? data
        : data?.complaints || data?.data || [];
      setTickets(ticketList);
      setPagination((prev) => ({
        ...prev,
        total: data.count || data.total || data.total_count || ticketList.length,
        totalPages:
          data.total_pages ||
          Math.ceil((data.count || data.total || ticketList.length) / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, filters, selectedDashboardStatus]);

  // Fetch ALL tickets for client-side search (like existing project)
  const fetchAllTickets = useCallback(async () => {
    try {
      const response = await serviceDeskService.getAllTickets();
      const data = response.data;
      const ticketList = Array.isArray(data)
        ? data
        : data?.complaints || data?.data || [];
      setAllTickets(ticketList);
    } catch (err) {
      console.error("Failed to fetch all tickets:", err);
    }
  }, []);

  // Debounced search effect - update filters.search after user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchValue.trim() || undefined,
      }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    fetchAllTickets();
  }, [fetchAllTickets]);

  // CLIENT-SIDE FILTERING (excluding search - now handled server-side)
  useEffect(() => {
    let filtered = [...allTickets];

    // Apply dashboard status filter first
    if (selectedDashboardStatus) {
      filtered = filtered.filter((item) => {
        const status = (item.status || (item as any).issue_status || "").toLowerCase();
        return status === selectedDashboardStatus.toLowerCase();
      });
    }

    // Apply quick filter
    if (quickFilter !== "All") {
      filtered = filtered.filter((item) => {
        const status = (item.status || (item as any).issue_status || "").toLowerCase();

        if (quickFilter === "Open") {
          return status === "pending" || status === "open";
        } else if (quickFilter === "Closed") {
          return status === "closed";
        } else if (quickFilter === "Pending") {
          return status === "pending";
        } else if (quickFilter === "Completed") {
          return status === "complete" || status === "completed" || status === "work completed";
        }
        return true;
      });
    }

    // Apply advanced filters
    if (filters.building_name) {
      filtered = filtered.filter(
        (item) => item.building_name === filters.building_name
      );
    }
    if (filters.floor_name) {
      filtered = filtered.filter(
        (item) => item.floor_name === filters.floor_name
      );
    }
    if (filters.unit_name) {
      filtered = filtered.filter(
        (item) => ((item as any).unit || item.unit_name) === filters.unit_name
      );
    }
    if (filters.category) {
      filtered = filtered.filter(
        (item) => ((item as any).category_type || item.category) === filters.category
      );
    }
    if (filters.status) {
      filtered = filtered.filter(
        (item) => (item.status || (item as any).issue_status) === filters.status
      );
    }
    if (filters.priority) {
      filtered = filtered.filter(
        (item) => item.priority === filters.priority
      );
    }
    if (filters.assigned_to) {
      filtered = filtered.filter(
        (item) => item.assigned_to === filters.assigned_to
      );
    }
    if (filters.date_start) {
      filtered = filtered.filter(
        (item) => new Date(item.created_at || "") >= new Date(filters.date_start!)
      );
    }
    if (filters.date_end) {
      filtered = filtered.filter(
        (item) => new Date(item.created_at || "") <= new Date(filters.date_end!)
      );
    }

    // Update displayed tickets with pagination
    const startIndex = (pagination.page - 1) * pagination.perPage;
    const endIndex = startIndex + pagination.perPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    setTickets(paginatedData);
    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.perPage),
    }));
  }, [quickFilter, filters, allTickets, pagination.page, pagination.perPage, selectedDashboardStatus]);

  const getTicketStatus = (ticket: Ticket): StatusType => {
    const status =
      ticket.status?.toLowerCase() ||
      ticket.complaint_status?.name?.toLowerCase() ||
      (ticket as any).issue_status?.toLowerCase();
    if (status?.includes("open") || status?.includes("new") || status?.includes("pending")) return "pending";
    if (status?.includes("progress") || status?.includes("assigned") || status?.includes("process"))
      return "maintenance";
    if (status?.includes("resolved") || status?.includes("closed") || status?.includes("complete"))
      return "checked-out";
    return "pending";
  };

  const getPriorityType = (priority?: string): StatusType => {
    if (
      priority?.toLowerCase() === "high" ||
      priority?.toLowerCase() === "critical" ||
      priority === "P1"
    )
      return "breakdown";
    if (priority?.toLowerCase() === "medium" || priority === "P2") return "maintenance";
    return "in-store";
  };

  const getStatusCount = (label: string) => dashboard?.by_status?.[label] ?? 0;

  const getTypeCount = (label: string) => dashboard?.by_type?.[label] ?? 0;

  const fetchDashboard = useCallback(async () => {
    try {
      const resp = await serviceDeskService.getDashboard();
      setDashboard(resp.data);
    } catch (e) {
      console.error("Failed to load dashboard", e);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (!allTickets.length) return;

    const buildings = new Set<string>();
    const floors = new Set<string>();
    const units = new Set<string>();
    const categories = new Set<string>();
    const statuses = new Set<string>();
    const priorities = new Set<string>();
    const assignees = new Set<string>();

    allTickets.forEach((t) => {
      if (t.building_name) buildings.add(t.building_name);
      if (t.floor_name) floors.add(t.floor_name);
      if ((t as any).unit_name || (t as any).unit) {
        units.add((t as any).unit_name || (t as any).unit);
      }
      if ((t as any).category_type || t.category) {
        categories.add((t as any).category_type || (t.category as string));
      }
      const st =
        t.status || (t as any).issue_status || t.complaint_status?.name;
      if (st) statuses.add(st);

      if (t.priority) priorities.add(t.priority);
      if (t.assigned_to) assignees.add(t.assigned_to);
    });

    setLookups({
      buildings: Array.from(buildings),
      floors: Array.from(floors),
      units: Array.from(units),
      categories: Array.from(categories),
      statuses: Array.from(statuses),
      priorities: Array.from(priorities),
      assignees: Array.from(assignees),
    });
  }, [allTickets]);

  // Define all columns
  const allColumns: Array<TableColumn<Ticket> & { id: string; label: string }> = [
    // Action column
    {
      id: 'action',
      label: 'Action',
      key: 'action',
      header: 'Action',
      width: '100px',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Link to={`/service-desk/${row.id}`} className="text-primary hover:text-primary/80">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/service-desk/${row.id}/edit`} className="text-primary hover:text-primary/80">
            <Edit className="w-4 h-4" />
          </Link>
        </div>
      )
    },
    {
      id: "ticket_number",
      label: "Ticket Number",
      key: "ticket_number",
      header: "Ticket Number",
      render: (v, row) => row.ticket_number || "-",
    },
    {
      id: "building_name",
      label: "Building Name",
      key: "building_name",
      header: "Building Name",
      render: (v, row) => row.building_name || "-",
    },
    {
      id: "floor_name",
      label: "Floor Name",
      key: "floor_name",
      header: "Floor Name",
      render: (v, row) => row.floor_name || "-",
    },
    {
      id: "unit_name",
      label: "Unit Name",
      key: "unit_name",
      header: "Unit Name",
      render: (v, row) => row.unit_name || (row as any).unit || "-",
    },
    {
      id: "reporter_name",
      label: "Customer Name",
      key: "reporter_name",
      header: "Customer Name",
      render: (v, row) => row.reporter_name || (row as any).created_by || "-",
    },
    {
      id: "category",
      label: "Category",
      key: "category",
      header: "Category",
      render: (v, row) =>
        row.helpdesk_category?.name ||
        (row as any).category_type ||
        row.category ||
        "-",
    },
    {
      id: "sub_category",
      label: "Sub Category",
      key: "sub_category",
      header: "Sub Category",
      render: (v, row) => (row as any).sub_category || row.sub_category || "-",
    },
    {
      id: "title",
      label: "Title",
      key: "title",
      header: "Title",
      sortable: true,
      render: (v, row) =>
        row.title || (row as any).heading || (row as any).text || "-",
    },
    {
      id: "status",
      label: "Status",
      key: "status",
      header: "Status",
      render: (v, row) => {
        const status =
          row.status ||
          (row as any).issue_status ||
          row.complaint_status?.name ||
          "";
        return <StatusBadge status={getTicketStatus({ ...row, status })} />;
      },
    },
    {
      id: "priority",
      label: "Priority",
      key: "priority",
      header: "Priority",
      render: (v, row) =>
        row.priority ? (
          <StatusBadge status={getPriorityType(row.priority)} />
        ) : (
          "-"
        ),
    },
    {
      id: "assigned_to",
      label: "Assigned To",
      key: "assigned_to",
      header: "Assigned To",
      render: (v, row) => row.assigned_to || "Unassigned",
    },
    {
      id: "issue_type",
      label: "Ticket Type",
      key: "issue_type",
      header: "Ticket Type",
      render: (v, row) => (row as any).issue_type || "-",
    },
    {
      id: "total_time",
      label: "Total Time",
      key: "total_time",
      header: "Total Time",
      render: (v, row) => {
        if (!row.created_at) return "-";
        const created = new Date(row.created_at);
        const diffMs = Date.now() - created.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return "Today";
        if (diffDays === 1) return "1 day ago";
        return `${diffDays} days ago`;
      },
    },
  ];

  // Export excel function
  const exportToExcel = async () => {
    try {
      toast.loading('Preparing export...');

      // Fetch all tickets for export
      const response = await serviceDeskService.getAllTickets();
      const data = response.data;
      const allTicketsData = Array.isArray(data)
        ? data
        : data?.complaints || data?.data || [];

      if (allTicketsData.length === 0) {
        toast.dismiss();
        toast.error('No tickets to export');
        return;
      }

      // Format the data for Excel (matching existing project format)
      const formattedData = allTicketsData.map((ticket: any) => {
        // Format complaint logs as a single string
        const complaintLogs = (ticket.complaint_logs || [])
          .map((log: any) => {
            return `Log By: ${log.log_by || 'N/A'}, Status: ${log.log_status || 'N/A'}, Date: ${log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'
              }`;
          })
          .join(' | ');

        return {
          'Site Name': ticket.site_name || '-',
          'Ticket No.': ticket.ticket_number || '-',
          'Related To': ticket.issue_type_id || '-',
          'Title': ticket.heading || ticket.title || '-',
          'Description': ticket.text || ticket.description || '-',
          'Building': ticket.building_name || '-',
          'Floor': ticket.floor_name || '-',
          'Unit': ticket.unit || ticket.unit_name || '-',
          'Category': ticket.category_type || ticket.category || '-',
          'Sub Category': ticket.sub_category || '-',
          'Status': ticket.issue_status || ticket.status || '-',
          'Type': ticket.issue_type || '-',
          'Priority': ticket.priority || '-',
          'Assigned To': ticket.assigned_to || '-',
          'Created By': ticket.created_by || '-',
          'Created On': ticket.created_at
            ? new Date(ticket.created_at).toLocaleString()
            : '-',
          'Updated On': ticket.updated_at
            ? new Date(ticket.updated_at).toLocaleString()
            : '-',
          'Updated By': ticket.updated_by || '-',
          'Resolution Breached': ticket.resolution_breached ? 'Yes' : 'No',
          'Response Breached': ticket.response_breached ? 'Yes' : 'No',
          'Complaint Logs': complaintLogs || '-',
        };
      });

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(formattedData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tickets');

      // Generate filename with current date
      const fileName = `helpdesk_tickets_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download file
      XLSX.writeFile(wb, fileName);

      toast.dismiss();
      toast.success('Tickets exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.dismiss();
      toast.error('Failed to export tickets');
    }
  };
  // Filter visible columns
  const visibleColumns = allColumns.filter(col => !hiddenColumns.has(col.id));

  const toggleColumnVisibility = (columnId: string) => {
    setHiddenColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  if (loading && allTickets.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error && allTickets.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Tickets</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => {
              fetchTickets();
              fetchAllTickets();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Service Desk', path: '/service-desk' }, { label: 'Service' }]} />

      {/* Dashboard Statistics */}
      {dashboard && (
        <div className="mb-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mt-8">

            {/* Status stats */}
            {[
              "Pending",
              "Closed",
              "Complete",
              "Work Completed",
              "Reopened",
              "Approved",
              "Work In Process",
              "Approval Pending",
            ].map((label) => {
              const isActive = selectedDashboardStatus === label;
              const color = getCardColor(label);

              return (
                <div
                  key={label}
                  onClick={() => {
                    setSelectedDashboardStatus(isActive ? null : label);
                    setQuickFilter("All");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className={`rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer
  transition-all duration-200 hover:shadow-md
  ${isActive
                      ? `bg-transparent ${color.text} ${color.border}`
                      : `${color.bg} ${color.text} ${color.border} `
                    }
`}

                >
                  <span className="text-xl mb-2 mt-1">
                    {getStatusIcon(label)}
                  </span>

                  <span className="text-[14px] font-medium">{label}</span>

                  <span className={`mt-1 text-[15px] font-bold mt-1 ${isActive ? "text-black" : "text-foreground"}`}>
                    {getStatusCount(label)}
                  </span>
                </div>
              );
            })}


            {/* Type stats */}
            {["Complaint", "Request", "Suggestion", "Req"].map((label) => {
              const isActive =
                filters.category === (label === "Req" ? "Request" : label);
              const color = getTypeCardColor(label);

              return (
                <div
                  key={label}
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      category: label === "Req" ? "Request" : label,
                    }));
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className={`rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer
        transition-all duration-200 hover:shadow-md
        ${isActive
                      ? `bg-transparent ${color.text} ${color.border}`
                      : `${color.bg} ${color.text} ${color.border}`
                    }
      `}
                >
                  {/* ICON */}
                  <span className={`text-xl mb-2 mt-1 ${color.icon}`}>
                    {getTypeIcon(label)}
                  </span>

                  {/* LABEL */}
                  <span className="text-[14px] font-medium">
                    {label === "Req" ? "Request" : label}
                  </span>

                  {/* COUNT */}
                  <span className="mt-1 text-[15px] font-bold text-foreground">
                    {getTypeCount(label)}
                  </span>
                </div>
              );
            })}



          </div>
        </div>
      )}

      {/* Combined Filters and Toolbar */}
      <div className="mb-4 flex items-center justify-between gap-4">
        {/* Left side - Quick Filters Radio Buttons */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {["All", "Open", "Closed", "Pending", "Completed"].map((filter) => (
            <label key={filter} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="quickFilter"
                value={filter}
                checked={quickFilter === filter}
                onChange={(e) => {
                  setQuickFilter(e.target.value as typeof quickFilter);
                  // Clear dashboard filter when using quick filters
                  setSelectedDashboardStatus(null);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm font-medium">{filter}</span>
            </label>
          ))}
        </div>

        {/* Right side - Toolbar */}
        <ListToolbar
          searchPlaceholder="Search by Title, Ticket number, Category, Ticket type, Priority or Unit"
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onFilter={() => setIsFilterOpen(true)}
          onExport={exportToExcel}
          onAdd={() => navigate("/service-desk/create")}
          addLabel="Create Ticket"
          additionalButtons={
            <div className="relative">
              <button
                onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent"
              >
                Hide Columns
                <ChevronDown className="w-4 h-4" />
              </button>

              {isColumnMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsColumnMenuOpen(false)}
                  />

                  <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-40 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
                        Toggle Column Visibility
                      </div>
                      {allColumns.map((col) => (
                        <label
                          key={col.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={!hiddenColumns.has(col.id)}
                            onChange={() => toggleColumnVisibility(col.id)}
                            className="w-4 h-4"
                          />
                          <span className="flex items-center gap-2 text-sm">
                            {hiddenColumns.has(col.id) ? (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Eye className="w-4 h-4 text-primary" />
                            )}
                            {col.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          }
        />
      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-4xl rounded-xl bg-card shadow-xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold">Filter By</h2>
              <button
                className="text-xl leading-none"
                onClick={() => setIsFilterOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Building Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Building Name
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.building_name || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        building_name: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">Select Building</option>
                    {lookups.buildings.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Floor Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Floor Name
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.floor_name || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        floor_name: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">Select Floor</option>
                    {lookups.floors.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Unit Name
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.unit_name || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        unit_name: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">Select Unit</option>
                    {lookups.units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Start */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date Start
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.date_start || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        date_start: e.target.value || undefined,
                      }))
                    }
                  />
                </div>

                {/* Date End */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date End
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.date_end || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        date_end: e.target.value || undefined,
                      }))
                    }
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.category || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        category: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">Select Category</option>
                    {lookups.categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.status || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">Select Status</option>
                    {lookups.statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Level */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Priority Level
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.priority || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priority: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">Select Priority Level</option>
                    {lookups.priorities.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Assigned To
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.assigned_to || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        assigned_to: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">Select Assign To</option>
                    {lookups.assignees.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
              <button
                className="rounded-md border border-border px-4 py-2 text-sm"
                onClick={() => {
                  setFilters({});
                  setPagination((prev) => ({ ...prev, page: 1 }));
                  setIsFilterOpen(false);
                }}
              >
                Reset
              </button>
              <button
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
                onClick={() => {
                  setPagination((prev) => ({ ...prev, page: 1 }));
                  setIsFilterOpen(false);
                }}
              >
                Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && tickets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <TicketIcon className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Tickets Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchValue || Object.keys(filters).length > 0
              ? "No tickets match your search criteria"
              : "No support tickets have been created yet"}
          </p>
          <Link
            to="/service-desk/create"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
          >
            + Create Ticket
          </Link>
        </div>
      )}

      {viewMode === "grid" && tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tickets.map((ticket) => (
            <DataCard
              key={ticket.id}
              title={ticket.title || (ticket as any).heading || `Ticket #${ticket.ticket_number}`}
              subtitle={ticket.ticket_number || "-"}
              status={getTicketStatus(ticket)}
              fields={[
                {
                  label: "Category",
                  value:
                    ticket.helpdesk_category?.name || (ticket as any).category_type || ticket.category || "-",
                },
                { label: "Priority", value: ticket.priority || "-" },
                {
                  label: "Assigned",
                  value: ticket.assigned_to || "Unassigned",
                },
                {
                  label: "Created",
                  value: ticket.created_at
                    ? new Date(ticket.created_at).toLocaleDateString()
                    : "-",
                },
              ]}
              viewPath={`/service-desk/${ticket.id}`}
              editPath={`/service-desk/${ticket.id}/edit`}
            />
          ))}
        </div>
      ) : (
        tickets.length > 0 && (
          <DataTable
            columns={visibleColumns}
            data={tickets}
            selectable
            selectedRows={selectedRows}
            onSelectRow={(id) =>
              setSelectedRows((prev) =>
                prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
              )
            }
            onSelectAll={() =>
              setSelectedRows(
                selectedRows.length === tickets.length
                  ? []
                  : tickets.map((t) => String(t.id))
              )
            }
            viewPath={(row) => `/service-desk/${row.id}`}
          />
        )
      )}

      {tickets.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.perPage + 1} to{" "}
            {Math.min(pagination.page * pagination.perPage, pagination.total)}{" "}
            of {pagination.total} records
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              «
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              ‹ Prev
            </button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">
              {pagination.page}
            </span>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              Next ›
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.totalPages }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              »
            </button>
          </div>
          <select
            value={pagination.perPage}
            onChange={(e) =>
              setPagination((prev) => ({
                ...prev,
                perPage: Number(e.target.value),
                page: 1,
              }))
            }
            className="px-2 py-1.5 text-sm border border-border rounded-md bg-background"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      )}
    </div>
  );
};
export default TicketList;