import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FormSection from '../../components/ui/FormSection';
import FormGrid from '../../components/ui/FormGrid';
import { getSoftServicesDetails, getSoftServiceSchedule, getSoftserviceActivityDetails, softServiceDownloadQrCode } from '../../api';
import { Loader2, Wrench, AlertCircle, RefreshCw, Edit2, ArrowLeft, Paperclip, QrCode, Eye, ChevronLeft, ChevronRight, FileText, Calendar, Printer, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Table from '../../components/table/Table';
import { dateTimeFormat } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

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
      <div className="p-6">
        <Breadcrumb items={[
          { label: 'FM Module' },
          { label: 'Soft Services', path: '/soft-services' },
          { label: 'Service' },
        ]} />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="p-6">
        <Breadcrumb items={[
          { label: 'FM Module' },
          { label: 'Soft Services', path: '/soft-services' },
          { label: 'Service' },
        ]} />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Service</h3>
          <p className="text-muted-foreground mb-4">{error || 'Service not found'}</p>
          <button onClick={fetchServiceDetails} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'FM Module' },
        { label: 'Soft Services', path: '/soft-services' },
        { label: 'Service', path: '/soft-services' },
        { label: service.name },
      ]} />

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 mt-6 mb-4">
        <button
          onClick={() => navigate(fromOverview ? '/soft-services/overview' : '/soft-services')}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <QrCode className="w-4 h-4" />
            QR Code
          </button>
          <Link
            to={`/soft-services/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <FormSection title="Service Details" icon={Wrench}>
          <FormGrid columns={3}>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Service Name</label>
              <p className="text-foreground font-medium">{service.name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Building</label>
              <p className="text-foreground font-medium">{service.building_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Floor</label>
              <p className="text-foreground font-medium">{service.floor_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Unit</label>
              <p className="text-foreground font-medium">{service.unit_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Service Group</label>
              <p className="text-foreground font-medium">{service.group_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Service SubGroup</label>
              <p className="text-foreground font-medium">{service.sub_group_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Latitude</label>
              <p className="text-foreground font-medium">{service.latitude || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Longitude</label>
              <p className="text-foreground font-medium">{service.longitude || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Created By</label>
              <p className="text-foreground font-medium">{service.created_by || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Created On</label>
              <p className="text-foreground font-medium">{formatDate(service.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Updated On</label>
              <p className="text-foreground font-medium">{formatDate(service.updated_at)}</p>
            </div>
          </FormGrid>
        </FormSection>

        <FormSection title="Cron Setting" icon={Wrench}>
          <div className="flex items-center gap-2 text-foreground">
            <span>Every</span>
            <span className="px-3 py-1 bg-accent rounded-md font-medium">{getDayLabel(service.cron_day)}</span>
            <span>at</span>
            <span className="px-3 py-1 bg-accent rounded-md font-medium">{service.cron_hour || '0'}</span>
            <span>:</span>
            <span className="px-3 py-1 bg-accent rounded-md font-medium">{service.cron_minute || '0'}</span>
          </div>
        </FormSection>

        {service.attachments && service.attachments.length > 0 && (
          <FormSection title="Attachments" icon={Paperclip}>
            <div className="flex flex-wrap gap-2">
              {service.attachments.map((att, idx) => (
                <a
                  key={idx}
                  href={att.url || att.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
                >
                  <span className="text-sm text-primary">{att.name || att.filename || `Attachment ${idx + 1}`}</span>
                </a>
              ))}
            </div>
          </FormSection>
        )}

        {/* Schedule & Logs Tabs */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center gap-6 border-b border-border mb-6">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'schedule'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'logs'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Logs
            </button>
          </div>

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={searchText}
                  onChange={handleSearch}
                  placeholder="Search by assigned to"
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    setStartDate(update[0]);
                    setEndDate(update[1]);
                    setFilteredScheduleData(filterByDateRange(scheduleData));
                  }}
                  isClearable
                  placeholderText="Search by Date range"
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64"
                />
              </div>
              <Table columns={scheduleColumns} data={filteredScheduleData} />
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
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
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                  <div className="text-center py-12 text-muted-foreground">
                    No logs found for {dateFormat(selectedDate)}
                  </div>
                ) : (
                  logsDetails.map((task) => {
                    const hasSubmissions = task.activity_log?.submissions?.length > 0;
                    return (
                      hasSubmissions && (
                        <div key={task.id} className="bg-muted/30 border border-border rounded-lg p-5 space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Checklist Name</p>
                            <p className="font-medium">{task.checklist?.name || 'No Checklist Name'}</p>
                          </div>

                          {task.activity_log.submissions.map((submission: any, subIndex: number) =>
                            submission && (
                              <div key={submission.id} className="space-y-3">
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
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && service.qr_code_image_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowQrModal(false)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewService;
