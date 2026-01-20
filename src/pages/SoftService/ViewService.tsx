import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { getSoftServicesDetails, getSoftServiceSchedule, getSoftserviceActivityDetails, softServiceDownloadQrCode } from '../../api';
import { Loader2, Wrench, AlertCircle, RefreshCw, Edit2, ArrowLeft, Paperclip, QrCode, Eye, ChevronLeft, ChevronRight, FileText, Calendar, Printer, X, MapPin, Clock, Settings, Info, CheckCircle, BarChart3, User, Grid3X3, List as ListIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Table from '../../components/table/Table';
import { dateTimeFormat } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

// cn utility function
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Animation variants
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

const usageSummarySample = [
  { date: '2025-11-11', total: 270, extra: 90, usedCount: 3 },
  { date: '2025-11-10', total: 165, extra: 45, usedCount: 2 },
  { date: '2025-11-09', total: 140, extra: 20, usedCount: 2 },
  { date: '2025-11-08', total: 90, extra: 30, usedCount: 1 },
  { date: '2025-11-07', total: 60, extra: 0, usedCount: 1 },
];

interface ServiceDetails {
  id: number;
  name: string;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  units?: Array<{ id: number; name: string }>;
  group_name?: string;
  sub_group_name?: string;
  latitude?: string;
  longitude?: string;
  cron_day?: string;
  cron_hour?: string;
  cron_minute?: string;
  cron_expression?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  attachments?: any[];
  qr_code_image_url?: string;
}

const ViewService: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromOverview = location.state?.from === 'soft-services-overview';
  const [service, setService] = useState<ServiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'schedule' | 'logs'>('schedule');

  // Schedule state
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [filteredScheduleData, setFilteredScheduleData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [scheduleViewMode, setScheduleViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Logs state
  const [logsDetails, setLogsDetails] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // QR Code modal
  const [showQrModal, setShowQrModal] = useState(false);

  const fetchServiceDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getSoftServicesDetails(id);
      setService(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch service details');
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleData = async () => {
    if (!id) return;
    try {
      const response = await getSoftServiceSchedule(id);
      setScheduleData(response.data.activities || []);
      setFilteredScheduleData(response.data.activities || []);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      toast.error('Failed to load schedule data');
    }
  };

  const fetchLogsDetails = async () => {
    if (!id) return;
    try {
      const response = await getSoftserviceActivityDetails(id);
      const filteredData = (response.data.activities || []).filter((activity: any) => {
        const activityDate = formatDateOnly(activity.start_time);
        return (
          activityDate === selectedDate &&
          activity.status !== 'pending' &&
          activity.status !== 'overdue'
        );
      });
      setLogsDetails(filteredData);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load logs');
    }
  };

  useEffect(() => {
    fetchServiceDetails();
    fetchScheduleData();
  }, [id]);

  useEffect(() => {
    fetchLogsDetails();
  }, [id, selectedDate]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDateOnly = (isoString: string) => {
    return isoString.split('T')[0];
  };

  const dateFormat = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDayLabel = (day?: string) => {
    const days: Record<string, string> = {
      '*': 'Every day',
      '0': 'Sunday',
      '1': 'Monday',
      '2': 'Tuesday',
      '3': 'Wednesday',
      '4': 'Thursday',
      '5': 'Friday',
      '6': 'Saturday',
    };
    return days[day || '*'] || day;
  };

  const handlePrevDate = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setSelectedDate(prevDate.toISOString().split('T')[0]);
  };

  const handleNextDate = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setSelectedDate(nextDate.toISOString().split('T')[0]);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchText(searchValue);
    if (searchValue.trim() === '') {
      setFilteredScheduleData(scheduleData);
    } else {
      const filteredResult = scheduleData.filter((item) =>
        item.assigned_name?.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredScheduleData(filteredResult);
    }
    setPage(1);
  };

  const filterByDateRange = (data: any[]) => {
    if (startDate && endDate) {
      return data.filter((item) => {
        const itemDate = new Date(item.start_time).setHours(0, 0, 0, 0);
        const start = startDate.setHours(0, 0, 0, 0);
        const end = endDate.setHours(23, 59, 59, 999);
        return itemDate >= start && itemDate <= end;
      });
    }
    return data;
  };

  const isImage = (filePath: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
    const extension = filePath.split('.').pop()?.split('?')[0].toLowerCase();
    return extension && imageExtensions.includes(extension);
  };

  const getFileName = (filePath: string) => {
    return filePath.split('/').pop()?.split('?')[0] || 'File';
  };

  const domainPrefix = 'https://admin.vibecopilot.ai';

  const handleQrDownload = async () => {
    if (!service?.id) return;
    const toastId = toast.loading('Downloading QR code...');
    try {
      const response = await softServiceDownloadQrCode(service.id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'qr_codes.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('QR code downloaded');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    } finally {
      toast.dismiss(toastId);
    }
  };

  const scheduleColumns = [
    {
      name: 'View',
      cell: (row: any) => (
        <Link to={`/soft-services/${id}/task/${row.id}`} state={{ serviceId: id, serviceName: service?.name }}>
          <Eye className="w-4 h-4" />
        </Link>
      ),
      width: '80px',
    },
    {
      name: 'Checklist',
      selector: (row: any) => row.checklist?.name || '-',
      sortable: true,
    },
    {
      name: 'Start Date',
      selector: (row: any) => dateFormat(row.start_time),
      sortable: true,
    },
    {
      name: 'Status',
      selector: (row: any) => row.status || '-',
      sortable: true,
    },
    {
      name: 'Assigned To',
      selector: (row: any) => row.assigned_name || '-',
      sortable: true,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <Breadcrumb items={[
            { label: 'FM Module' },
            { label: 'Soft Services', path: '/soft-services' },
            { label: 'Service' },
          ]} />
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <Breadcrumb items={[
            { label: 'FM Module' },
            { label: 'Soft Services', path: '/soft-services' },
            { label: 'Service' },
          ]} />
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Service</h3>
          <p className="text-muted-foreground mb-4">{error || 'Service not found'}</p>
          <button onClick={fetchServiceDetails} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="p-6 pb-0">
        <Breadcrumb items={[
          { label: 'FM Module' },
          fromOverview
            ? { label: 'Overview', path: '/soft-services/overview' }
            : { label: 'Soft Services', path: '/soft-services' },
          { label: 'Service', path: fromOverview ? '/soft-services/overview' : '/soft-services' },
          { label: service.name },
        ]} />
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(fromOverview ? '/soft-services/overview' : '/soft-services')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{service.name}</h1>
                  <p className="text-xs text-muted-foreground">{service.group_name || 'Soft Service'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQrModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <QrCode className="h-4 w-4" />
                <span className="text-sm">QR Code</span>
              </button>
              <Link
                to={`/soft-services/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                <span className="text-sm">Edit</span>
              </Link>
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
        {/* Service Details Card */}
        <motion.div variants={item} className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm overflow-hidden relative group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Service Details
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Service Name</p>
              <p className="font-medium text-sm">{service.name || '-'}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Service Group</p>
              <p className="font-medium text-sm">{service.group_name || '-'}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Service SubGroup</p>
              <p className="font-medium text-sm">{service.sub_group_name || '-'}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Unit</p>
              <p className="font-medium text-sm">{service.unit_name || '-'}</p>
            </div>
          </div>
        </motion.div>

        {/* Location Card */}
        <motion.div variants={item} className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location Details
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Building</span>
              <span className="font-medium">{service.building_name || '-'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Floor</span>
              <span className="font-medium">{service.floor_name || '-'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
              <span className="text-sm text-muted-foreground">Coordinates</span>
              <span className="font-medium text-primary text-xs">
                {service.latitude && service.longitude
                  ? `${service.latitude}, ${service.longitude}`
                  : '-'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Metadata Card */}
        <motion.div variants={item} className="col-span-12 lg:col-span-6 row-span-1 bg-card rounded-2xl border p-6 shadow-sm relative group">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Metadata
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Created By</p>
              <p className="font-medium text-sm">{service.created_by || '-'}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Created On</p>
              <p className="font-medium text-sm">{formatDate(service.created_at)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Updated On</p>
              <p className="font-medium text-sm">{formatDate(service.updated_at)}</p>
            </div>
          </div>
        </motion.div>

        {/* Usage Summary Bento */}
        <motion.div variants={item} className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm relative group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Usage Summary (sample)
            </h2>
            <button
              onClick={() => navigate(`/soft-services/${id}/usage`)}
              className="text-sm text-primary font-medium hover:underline"
            >
              Open full view
            </button>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-4 text-xs text-muted-foreground px-3">
              <span>Date</span>
              <span>Total</span>
              <span>Extra</span>
              <span className="text-right">Used</span>
            </div>
            {usageSummarySample.map((row) => (
              <div key={row.date} className="grid grid-cols-4 items-center bg-muted/40 rounded-lg px-3 py-2 text-sm">
                <span className="font-medium">{row.date}</span>
                <span>{row.total} min</span>
                <span className="text-orange-500">{row.extra} min</span>
                <span className="text-right text-muted-foreground">{row.usedCount}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Preview of date-wise asset usage. Click “Open full view” for charts and details.</p>
          </div>
        </motion.div>

        {/* Attachments Card */}
        {service.attachments && service.attachments.length > 0 && (
          <motion.div variants={item} className="col-span-12 lg:col-span-6 row-span-1 bg-card rounded-2xl border p-6 shadow-sm relative group">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-primary" />
              Attachments ({service.attachments.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {service.attachments.map((att, idx) => (
                <a
                  key={idx}
                  href={att.url || att.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors border border-border"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{att.name || att.filename || `Attachment ${idx + 1}`}</span>
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Schedule & Logs Section */}
        <motion.div variants={item} className="col-span-12 row-span-4 bg-card rounded-2xl border p-0 shadow-sm overflow-hidden">
          <div className="px-6 pt-4 flex items-center gap-6 border-b border-border">
            <button
              onClick={() => setActiveTab('schedule')}
              className={cn(
                'pb-3 text-sm font-semibold transition-colors border-b-2',
                activeTab === 'schedule'
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              )}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={cn(
                'pb-3 text-sm font-semibold transition-colors border-b-2',
                activeTab === 'logs'
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              )}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Activity Logs
            </button>
          </div>

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={searchText}
                  onChange={handleSearch}
                  placeholder="Search by assigned to"
                  className="flex-1 max-w-sm px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    setStartDate(update[0]);
                    setEndDate(update[1]);
                    setFilteredScheduleData(filterByDateRange(scheduleData));
                    setPage(1);
                  }}
                  isClearable
                  placeholderText="Search by Date range"
                  className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 w-full md:w-64"
                />
                <div className="flex items-center gap-2 rounded-lg border border-border p-1 bg-muted/40">
                  <button
                    aria-label="List view"
                    className={cn(
                      'p-2 rounded-md',
                      scheduleViewMode === 'list'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent'
                    )}
                    onClick={() => setScheduleViewMode('list')}
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                  <button
                    aria-label="Grid view"
                    className={cn(
                      'p-2 rounded-md',
                      scheduleViewMode === 'grid'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent'
                    )}
                    onClick={() => setScheduleViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Schedule content */}
              {scheduleViewMode === 'list' ? (
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-5 bg-muted/50 text-xs font-semibold text-muted-foreground px-4 py-2">
                  <span>View</span>
                  <span>Checklist</span>
                  <span>Start Date</span>
                  <span>Status</span>
                  <span className="text-right">Assigned To</span>
                </div>
                <div className="divide-y divide-border">
                  {filteredScheduleData.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">No schedule records</div>
                  ) : (
                    filteredScheduleData
                      .slice((page - 1) * perPage, page * perPage)
                      .map((row: any) => (
                      <div key={row.id} className="grid grid-cols-5 px-4 py-3 text-sm items-center">
                        <Link
                          to={`/soft-services/${id}/task/${row.id}`}
                          state={{ serviceId: id, serviceName: service?.name }}
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <span className="truncate">{row.checklist?.name || '-'}</span>
                        <span>{dateFormat(row.start_time)}</span>
                        <span className="capitalize text-muted-foreground">{row.status || '-'}</span>
                        <span className="text-right truncate">{row.assigned_name || row.assigned_to || 'Unassigned'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredScheduleData.length === 0 ? (
                    <div className="col-span-full text-center text-sm text-muted-foreground py-6 border border-border rounded-lg">
                      No schedule records
                    </div>
                  ) : (
                    filteredScheduleData
                      .slice((page - 1) * perPage, page * perPage)
                      .map((row: any) => (
                        <div key={row.id} className="border border-border rounded-lg p-4 bg-muted/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Start</span>
                            <span className="text-xs text-muted-foreground">{dateFormat(row.start_time)}</span>
                          </div>
                          <p className="text-sm font-semibold truncate">{row.checklist?.name || '-'}</p>
                          <p className="text-xs text-muted-foreground capitalize">Status: {row.status || '-'}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            Assigned: {row.assigned_name || row.assigned_to || 'Unassigned'}
                          </p>
                          <Link
                            to={`/soft-services/${id}/task/${row.id}`}
                            state={{ serviceId: id, serviceName: service?.name }}
                            className="inline-flex items-center gap-2 text-primary text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" /> View
                          </Link>
                        </div>
                      ))
                  )}
                </div>
              )}
              {filteredScheduleData.length > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-center gap-3 pt-4">
                  <p className="text-xs text-muted-foreground">
                    Showing {(page - 1) * perPage + 1}-
                    {Math.min(page * perPage, filteredScheduleData.length)} of {filteredScheduleData.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <select
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        setPage(1);
                      }}
                      className="px-3 py-2 border border-border rounded-lg bg-background text-sm text-foreground"
                    >
                      {[5, 10, 20, 50].map((n) => (
                        <option key={n} value={n}>
                          {n} / page
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-sm border border-border rounded-lg disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="text-sm text-muted-foreground">Page {page}</span>
                    <button
                      onClick={() =>
                        setPage((p) =>
                          p * perPage >= filteredScheduleData.length ? p : p + 1
                        )
                      }
                      disabled={page * perPage >= filteredScheduleData.length}
                      className="px-3 py-1 text-sm border border-border rounded-lg disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={handlePrevDate}
                  className="p-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  onClick={handleNextDate}
                  className="p-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {logsDetails.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    No logs found for {dateFormat(selectedDate)}
                  </div>
                ) : (
                  logsDetails.map((task) => {
                    const hasSubmissions = task.activity_log?.submissions?.length > 0;
                    return (
                      hasSubmissions && (
                        <div key={task.id} className="bg-muted/20 border border-border rounded-lg p-5 space-y-4">
                          <div className="bg-primary/10 rounded-lg p-3">
                            <p className="text-sm text-muted-foreground mb-1">Checklist Name</p>
                            <p className="font-medium">{task.checklist?.name || 'No Checklist Name'}</p>
                          </div>

                          {task.activity_log.submissions.map((submission: any, subIndex: number) =>
                            submission && (
                              <div key={submission.id} className="space-y-3 border-l-4 border-primary pl-4">
                                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-900">
                                  <p className="text-sm text-muted-foreground mb-1">Question {subIndex + 1}</p>
                                  <p className="font-medium">{submission.question?.name || 'No Question'}</p>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-900">
                                  <p className="text-sm text-muted-foreground mb-1">Answer</p>
                                  <p className="font-medium">{submission.value || 'No Answer'}</p>
                                </div>

                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">Attachments</p>
                                  <div className="flex flex-wrap gap-3">
                                    {submission.question_attachments?.length > 0 ? (
                                      submission.question_attachments.map((attachment: any, i: number) => (
                                        <img
                                          key={i}
                                          src={domainPrefix + attachment.document}
                                          alt={`Attachment ${i + 1}`}
                                          className="w-32 h-24 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => window.open(domainPrefix + attachment.document, '_blank')}
                                        />
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No Attachments</p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-border text-sm">
                                  <span className="text-muted-foreground">
                                    Performed by: <span className="font-medium text-foreground">{task.assigned_name || 'Unknown'}</span>
                                  </span>
                                  <span className="text-muted-foreground">{dateTimeFormat(submission.updated_at) || '-'}</span>
                                </div>
                              </div>
                            )
                          )}

                          <div className="pt-2 border-t border-border">
                            <p className="text-sm text-muted-foreground">Comment</p>
                            <p className="text-violet-600 dark:text-violet-400 font-medium">{task.comment || 'No Comment'}</p>
                          </div>
                        </div>
                      )
                    );
                  })
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* QR Code Modal */}
      {showQrModal && service.qr_code_image_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowQrModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{service.name} - QR Code</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={domainPrefix + service.qr_code_image_url}
                alt="QR Code"
                className="max-w-full h-auto rounded-lg border border-border"
              />
            </div>
            <button
              onClick={handleQrDownload}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Download QR Code
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ViewService;
