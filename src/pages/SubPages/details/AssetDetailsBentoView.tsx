import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Settings, QrCode, Edit,
  Info, FileText, Wrench, Paperclip, Clock,
  Ticket, Link2, DollarSign, BarChart3, Calendar, AlertCircle,
  CheckCircle, ChevronDown, Download, Upload, Eye, Maximize2,
  PieChart, Loader2, AlertTriangle, Package, MapPin, Shield, X,
  Lock, TrendingDown
} from "lucide-react";
import { getSiteAssetDetails, domainPrefix } from "../../../api";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import ModalWrapper from "../../../containers/modals/ModalWrapper";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// cn utility function
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 }
};

const COLORS = [
  'hsl(267, 62%, 49%)',  // Primary purple
  'hsl(142, 76%, 36%)',  // Success green
  'hsl(38, 92%, 50%)',   // Warning orange
  'hsl(199, 89%, 48%)'   // Info blue
];

const AssetDetailsBentoView = () => {
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [ticketsOpen, setTicketsOpen] = useState(false);
  const [qrCodeOpen, setQrCodeOpen] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssetDetails = async () => {
      setLoading(true);
      try {
        const details = await getSiteAssetDetails(id);
        setAsset(details.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching asset details:", error);
        setError(error.message || "Failed to fetch asset details");
      } finally {
        setLoading(false);
      }
    };

    fetchAssetDetails();
  }, [id]);

  const dateFormat = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getFileName = (filePath: string) => {
    return filePath.split("/").pop()?.split("?")[0] || "";
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading asset details...</p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Asset</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => navigate('/asset')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Assets
        </button>
      </div>
    );
  }

  // Prepare data
  const allAttachments = [
    ...(asset.manuals?.map((f: any) => ({ ...f, category: "Manuals" })) || []),
    ...(asset.insurances?.map((f: any) => ({ ...f, category: "Insurance" })) || []),
    ...(asset.purchase_invoices?.map((f: any) => ({ ...f, category: "Purchase Invoice" })) || []),
    ...(asset.other_files?.map((f: any) => ({ ...f, category: "Other" })) || []),
  ];

  // Mock data for demonstration
  const mockAnalytics = {
    openTickets: 5,
    ppmCompletion: 85,
    nextPPMDue: "15 Jan 2026",
    upcomingAMC: "30 Jan 2026",
    lastPPMConducted: "10 Dec 2025"
  };

  const mockPPM = {
    scheduled: 12,
    open: 3,
    inProgress: 2,
    closed: 45,
    overdue: 1
  };

  const mockCostBreakdown = [
    { category: "Purchase", amount: 50000, percentage: 50 },
    { category: "AMC", amount: 20000, percentage: 20 },
    { category: "Maintenance", amount: 20000, percentage: 20 },
    { category: "Others", amount: 10000, percentage: 10 }
  ];

  const pieData = mockCostBreakdown.map((item) => ({
    name: item.category,
    value: item.amount,
  }));

  // Mock timeline data
  const timelineEvents = [
    { event: "Installed", date: "07/05/2025", status: "completed" },
    { event: "Assigned", date: "08/05/2025", status: "completed" },
    { event: "In Use", date: "08/05/2025", status: "active" },
    { event: "Request Maint.", date: "01/11/2025", status: "completed" },
    { event: "Under Maint.", date: "01/11/2025", status: "completed" },
    { event: "Complete Maint.", date: "02/11/2025", status: "completed" },
    { event: "Back to Service", date: "02/11/2025", status: "completed" }
  ];

  // Mock asset associations
  const mockAssociations = {
    children: [
      { id: "CHLD-001", name: "Child Asset 1", status: "active" },
      { id: "CHLD-002", name: "Child Asset 2", status: "maintenance" },
      { id: "CHLD-003", name: "Child Asset 3", status: "active" }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="p-6 pb-0">
        <Breadcrumb
          items={[
            { label: "FM Module", path: "/asset" },
            { label: "Assets", path: "/asset" },
            { label: asset.name || `Asset #${id}` },
          ]}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/asset')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Settings className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">{asset.asset_number || asset.id}</h1>
                    <span className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded-full",
                      asset.active
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    )}>
                      {asset.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{asset.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQrCodeOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <QrCode className="h-4 w-4" />
                <span className="text-sm">QR Code</span>
              </button>
              <button
                onClick={() => navigate(`/asset/${id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span className="text-sm">Edit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Bento Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full px-6 pb-6 grid grid-cols-12 gap-4 auto-rows-[minmax(120px,auto)]"
      >
        {/* Analytics Widgets - 5 cards */}
        <motion.div variants={item} className="col-span-12 lg:col-span-3 row-span-1 bg-gradient-to-br from-primary/10 to-transparent rounded-xl border p-4 shadow-sm relative group">
          <button
            onClick={() => navigate(`/asset/${id}/tickets`)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-primary/10 rounded"
          >
            <Maximize2 className="h-4 w-4 text-primary" />
          </button>
          <Ticket className="h-8 w-8 text-primary mb-2" />
          <p className="text-3xl font-bold">{mockAnalytics.openTickets}</p>
          <p className="text-sm text-muted-foreground">Open Tickets</p>
        </motion.div>

        <motion.div variants={item} className="col-span-12 lg:col-span-2 row-span-1 bg-gradient-to-br from-green-500/10 to-transparent rounded-xl border p-4 shadow-sm relative group">
          <button
            onClick={() => navigate(`/asset/${id}/ppm`)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-green-500/10 rounded"
          >
            <Maximize2 className="h-4 w-4 text-green-600" />
          </button>
          <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
          <p className="text-3xl font-bold">{mockAnalytics.ppmCompletion}%</p>
          <p className="text-sm text-muted-foreground">PPM Complete</p>
        </motion.div>

        <motion.div variants={item} className="col-span-12 lg:col-span-2 row-span-1 bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl border p-4 shadow-sm relative group">
          <button
            onClick={() => navigate(`/asset/${id}/ppm`)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-orange-500/10 rounded"
          >
            <Maximize2 className="h-4 w-4 text-orange-600" />
          </button>
          <Calendar className="h-8 w-8 text-orange-600 mb-2" />
          <p className="text-lg font-bold">{mockAnalytics.nextPPMDue}</p>
          <p className="text-sm text-muted-foreground">Next PPM Due</p>
        </motion.div>

        <motion.div variants={item} className="col-span-12 lg:col-span-2 row-span-1 bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl border p-4 shadow-sm relative group">
          <button
            onClick={() => navigate(`/asset/${id}/amc`)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-500/10 rounded"
          >
            <Maximize2 className="h-4 w-4 text-blue-600" />
          </button>
          <FileText className="h-8 w-8 text-blue-600 mb-2" />
          <p className="text-lg font-bold">{mockAnalytics.upcomingAMC}</p>
          <p className="text-sm text-muted-foreground">Upcoming AMC</p>
        </motion.div>

        <motion.div variants={item} className={cn(
          "col-span-12 lg:col-span-3 row-span-1 rounded-xl p-4 shadow-sm relative group",
          asset.active
            ? "bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-200"
            : "bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-200"
        )}>
          <button
            onClick={() => navigate(`/asset/${id}/status`)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
          >
            <Maximize2 className={cn("h-4 w-4", asset.active ? "text-green-600" : "text-red-600")} />
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Status</p>
              <p className={cn("text-2xl font-bold mt-1", asset.active ? "text-green-600" : "text-red-600")}>
                {asset.active ? "Active" : "Inactive"}
              </p>
            </div>
            <div className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center",
              asset.active ? "bg-green-500/20" : "bg-red-500/20"
            )}>
              <CheckCircle className={cn("h-6 w-6", asset.active ? "text-green-600" : "text-red-600")} />
            </div>
          </div>
        </motion.div>

        {/* Asset Lifecycle Timeline */}
        <motion.div variants={item} className="col-span-12 row-span-2 bg-card rounded-2xl border p-6 shadow-sm overflow-hidden relative group">
          <button
            onClick={() => navigate(`/asset/${id}/timeline`)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg z-10"
          >
            <Maximize2 className="h-4 w-4 text-primary" />
          </button>
          <h2 className="font-semibold mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Asset Lifecycle Timeline
          </h2>

          <div className="relative">
            <div className="absolute top-6 left-0 right-0 h-1 bg-border rounded-full" />
            <div className="flex justify-between relative">
              {timelineEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / timelineEvents.length}%` }}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-full border-4 border-background flex items-center justify-center z-10",
                    event.status === "active" ? "bg-primary" :
                    event.status === "highlight" ? "bg-destructive" : "bg-green-500"
                  )}>
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="mt-3 text-center">
                    <p className="font-semibold text-xs text-foreground">{event.event}</p>
                    <p className="text-xs text-muted-foreground mt-1">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Asset Details */}
        <motion.div variants={item} className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm overflow-hidden relative group">
          <button
            onClick={() => navigate(`/asset/${id}/details`)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg z-10"
          >
            <Maximize2 className="h-4 w-4 text-primary" />
          </button>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Asset Details
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Asset No</p>
              <p className="font-medium text-sm">{asset.asset_number || "-"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Serial No</p>
              <p className="font-medium text-sm">{asset.serial_number || "-"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Group</p>
              <p className="font-medium text-sm">{asset.group_name || "-"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Model No</p>
              <p className="font-medium text-sm">{asset.model_number || "-"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="font-medium text-sm">{asset.unit_name || "-"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Building</p>
              <p className="font-medium text-sm">{asset.building_name || "-"}</p>
            </div>
          </div>
        </motion.div>

        {/* Location */}
        <motion.div variants={item} className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group">
          <button
            onClick={() => navigate(`/asset/${id}/location`)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg z-10"
          >
            <Maximize2 className="h-4 w-4 text-primary" />
          </button>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location Details
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Building</span>
              <span className="font-medium">{asset.building_name || "-"}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Floor</span>
              <span className="font-medium">{asset.floor_name || "-"}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Unit</span>
              <span className="font-medium">{asset.unit_name || "-"}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
              <span className="text-sm text-muted-foreground">Coordinates</span>
              <span className="font-medium text-primary text-xs">
                {asset.latitude && asset.longitude
                  ? `${asset.latitude}, ${asset.longitude}`
                  : "-"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Asset Associations */}
        <motion.div variants={item} className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group">
          <button
            onClick={() => navigate(`/asset/${id}/associations`)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg z-10"
          >
            <Maximize2 className="h-4 w-4 text-primary" />
          </button>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Asset Associations
            </h2>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
              {mockAssociations.children.length} linked
            </span>
          </div>
          <div className="flex flex-col items-center py-4">
            <div className="bg-foreground text-background rounded-xl p-4 text-center">
              <p className="font-bold">{asset.asset_number || asset.id}</p>
              <p className="text-sm opacity-80">{asset.name}</p>
            </div>
            <div className="w-0.5 h-6 bg-border" />
            <div className="flex gap-4 flex-wrap justify-center">
              {mockAssociations.children.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-0.5 h-4 bg-border" />
                  <div className={cn(
                    "rounded-lg p-3 text-center border",
                    child.status === "maintenance" ? "bg-warning/10 border-warning/20" : "bg-muted"
                  )}>
                    <p className="font-medium text-sm">{child.id}</p>
                    <p className="text-xs text-muted-foreground">{child.name}</p>
                    <span className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded-full mt-1 inline-block",
                      child.status === "active" ? "bg-green-100 text-green-700 border border-green-200" : "bg-orange-100 text-orange-700 border border-orange-200"
                    )}>
                      {child.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* PPM Overview */}
        <motion.div variants={item} className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group">
          <button
            onClick={() => navigate(`/asset/${id}/ppm`)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg z-10"
          >
            <Maximize2 className="h-4 w-4 text-primary" />
          </button>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Preventive Maintenance
            </h2>
            <button className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
              View All
            </button>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Scheduled", value: mockPPM.scheduled, color: "bg-muted" },
              { label: "Open", value: mockPPM.open, color: "bg-orange-50 text-orange-700 border border-orange-200" },
              { label: "In Progress", value: mockPPM.inProgress, color: "bg-purple-50 text-primary border border-primary/20" },
              { label: "Closed", value: mockPPM.closed, color: "bg-green-50 text-green-700 border border-green-200" },
              { label: "Overdue", value: mockPPM.overdue, color: "bg-red-50 text-red-700 border border-red-200" },
            ].map((stat) => (
              <div key={stat.label} className={cn("rounded-xl p-4 text-center", stat.color)}>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Financial Overview */}
        <motion.div variants={item} className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group">
          <button
            onClick={() => navigate(`/asset/${id}/financial`)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg z-10"
          >
            <Maximize2 className="h-4 w-4 text-primary" />
          </button>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Financial Overview
          </h2>
          <div className="space-y-3">
            {mockCostBreakdown.map((item) => (
              <div key={item.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.category}</span>
                  <span className="font-medium">₹{item.amount.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between">
                <span className="font-medium">Purchase Cost</span>
                <span className="font-bold text-primary text-lg">
                  ₹{asset.purchase_cost ? parseFloat(asset.purchase_cost).toLocaleString() : "0"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Warranty Details */}
        <motion.div variants={item} className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group">
          <button
            onClick={() => navigate(`/asset/${id}/warranty`)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg z-10"
          >
            <Maximize2 className="h-4 w-4 text-primary" />
          </button>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Warranty Details
            </h2>
          </div>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Warranty Start</p>
              <p className="font-medium">{asset.warranty_start || "-"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Warranty Expiry</p>
              <p className="font-medium">{asset.warranty_expiry || "-"}</p>
            </div>
            {asset.purchased_on && (
              <div className="bg-primary/10 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Purchased On</p>
                <p className="font-medium text-primary">{asset.purchased_on}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* AMC Details Card */}
        <motion.div variants={item} className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group">
          <button
            onClick={() => navigate(`/asset/${id}/amc-details`)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg z-10"
          >
            <Maximize2 className="h-4 w-4 text-primary" />
          </button>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              AMC Details
            </h2>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              Active
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Vendor</span>
              <span className="font-medium">TechServ Solutions</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Contract No</span>
              <span className="font-medium">AMC-2025-001</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
              <span className="text-sm text-muted-foreground">Annual Cost</span>
              <span className="font-bold text-primary">₹25,000</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Start Date</span>
              <span className="font-medium">01 Jan 2025</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">End Date</span>
              <span className="font-medium">31 Dec 2025</span>
            </div>
          </div>
        </motion.div>

        {/* Attachments Card with Categories */}
        <motion.div variants={item} className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group">
          <button
            onClick={() => navigate(`/asset/${id}/attachments`)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg z-10"
          >
            <Maximize2 className="h-4 w-4 text-primary" />
          </button>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Paperclip className="h-5 w-5 text-primary" />
            Attachments
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <p className="text-sm font-medium mb-1">Manuals Upload</p>
              <p className="text-2xl font-bold text-primary">0 Files</p>
            </div>
            <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <p className="text-sm font-medium mb-1">Insurance Details</p>
              <p className="text-2xl font-bold text-primary">0 Files</p>
            </div>
            <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <p className="text-sm font-medium mb-1">Purchase Invoice</p>
              <p className="text-2xl font-bold text-primary">0 Files</p>
            </div>
            <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <p className="text-sm font-medium mb-1">Other Uploads</p>
              <p className="text-2xl font-bold text-primary">0 Files</p>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            No files available
          </div>
        </motion.div>

        {/* Depreciation Card */}
        <motion.div variants={item} className="col-span-12 row-span-3 bg-card rounded-2xl border p-6 shadow-sm relative group">
          <button
            onClick={() => navigate(`/asset/${id}/depreciation`)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg z-10"
          >
            <Maximize2 className="h-4 w-4 text-primary" />
          </button>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            Depreciation
          </h2>

          {/* Depreciation Rule */}
          <div className="bg-muted/30 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              DEPRECIATION RULE
            </h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Method Name</p>
                <p className="font-medium">-</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Useful Life</p>
                <p className="font-medium">-</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Salvage Value</p>
                <p className="font-medium">-</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Depreciation Rate</p>
                <p className="font-medium">-</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Depreciation Table */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-3">DEPRECIATION TABLE</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2">Year</th>
                      <th className="text-left py-2">Book Value (Beginning)</th>
                      <th className="text-left py-2">Depreciation</th>
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Book Value (End)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted-foreground">
                        No depreciation data available
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actual Cost Calculator */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-3">ACTUAL COST CALCULATOR</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Month</label>
                    <select className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm">
                      <option>November</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Year</label>
                    <select className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm">
                      <option>2025</option>
                    </select>
                  </div>
                </div>
                <div className="border border-border rounded-lg p-3 h-32 flex items-center justify-center text-muted-foreground text-sm">
                  Calendar View
                </div>
                <div className="text-xs text-muted-foreground">
                  Actual Cost Calculator is used to calculate the projected amount you would get for a particular date selected
                </div>
                <div className="bg-muted rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm font-medium">ACTUAL COST</span>
                  <span className="font-bold">INR 0.00</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tickets Detail Card */}
        <motion.div variants={item} className="col-span-12 row-span-3 bg-card rounded-2xl border p-6 shadow-sm relative group">
          <button
            onClick={() => navigate(`/asset/${id}/tickets-detail`)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg z-10"
          >
            <Maximize2 className="h-4 w-4 text-primary" />
          </button>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Tickets
          </h2>

          {/* Ticket Stats */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            <div className="border border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-center mb-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">00</p>
              <p className="text-xs text-muted-foreground">Open</p>
            </div>
            <div className="border border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold">00</p>
              <p className="text-xs text-muted-foreground">Closed</p>
            </div>
            <div className="border border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors bg-red-50">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">01</p>
              <p className="text-xs text-muted-foreground">Complaints</p>
            </div>
            <div className="border border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold">00</p>
              <p className="text-xs text-muted-foreground">Suggestion</p>
            </div>
            <div className="border border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-center mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">00</p>
              <p className="text-xs text-muted-foreground">Requests</p>
            </div>
          </div>

          {/* Ticket Filter and Table */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <select className="px-3 py-2 border border-border rounded-lg text-sm">
                <option>Open</option>
                <option>Closed</option>
                <option>All</option>
              </select>
              <input
                type="text"
                placeholder="Search tickets..."
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm"
              />
            </div>
            <div className="bg-muted/30 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Updated By</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No tickets found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Owner Cost Card */}
        <motion.div variants={item} className="col-span-12 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group">
          <button
            onClick={() => navigate(`/asset/${id}/owner-cost`)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg z-10"
          >
            <Maximize2 className="h-4 w-4 text-primary" />
          </button>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Owner Cost Details
            </h2>
            <span className="px-3 py-1 rounded-lg text-sm font-medium bg-muted border border-border">
              IN USE
            </span>
          </div>
          <button className="mb-4 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            + Cost
          </button>
          <div className="bg-muted/30 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Sr.no</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Repaired</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Cost</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Warranty</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Warranty Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Payment Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Asset Name</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-muted">
                  <td className="px-4 py-3 text-sm">1</td>
                  <td className="px-4 py-3 text-sm">01/11/2025</td>
                  <td className="px-4 py-3 text-sm">Replaced</td>
                  <td className="px-4 py-3 text-sm font-medium">INR</td>
                  <td className="px-4 py-3 text-sm">months</td>
                  <td className="px-4 py-3 text-sm">N/A</td>
                  <td className="px-4 py-3 text-sm">N/A</td>
                  <td className="px-4 py-3 text-sm">33444</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 bg-muted rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium">Total Cost:</span>
            <span className="font-bold text-lg">INR 0</span>
          </div>
        </motion.div>

        {/* Quick Info */}
        <motion.div variants={item} className="col-span-12 lg:col-span-4 row-span-1 bg-card rounded-2xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{dateFormat(asset.updated_at)}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>


      {/* Attachments Modal */}
      {attachmentsOpen && (
        <ModalWrapper onclose={() => setAttachmentsOpen(false)}>
          <div className="bg-card rounded-xl p-6 max-w-2xl mx-auto max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <Paperclip className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Attachments ({allAttachments.length} files)</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                  <Upload className="h-4 w-4" />
                  Upload New
                </button>
              </div>
              <div className="divide-y">
                {allAttachments.length > 0 ? (
                  allAttachments.map((file: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{getFileName(file.document)}</p>
                          <p className="text-xs text-muted-foreground">{file.category}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(domainPrefix + file.document, "_blank")}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No attachments found</p>
                )}
              </div>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Activity Modal */}
      {activityOpen && (
        <ModalWrapper onclose={() => setActivityOpen(false)}>
          <div className="bg-card rounded-xl p-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Activity Logs</h2>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              No activity logs available
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Tickets Modal */}
      {ticketsOpen && (
        <ModalWrapper onclose={() => setTicketsOpen(false)}>
          <div className="bg-card rounded-xl p-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Tickets</h2>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              No tickets found
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* QR Code Modal */}
      {qrCodeOpen && (
        <ModalWrapper onclose={() => setQrCodeOpen(false)}>
          <div className="bg-card rounded-xl p-6 max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Asset QR Code</h2>
            </div>
            <div className="flex flex-col items-center py-6">
              {asset.qr_code_image_url ? (
                <img
                  src={domainPrefix + asset.qr_code_image_url}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              ) : (
                <p className="text-muted-foreground">No QR code available</p>
              )}
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

export default AssetDetailsBentoView;