import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Copy,
  Users,
  Calendar,
  Clock,
  Loader2,
  ClipboardList,
  ClipboardCheck,
  Sparkles,
  ShieldCheck,
  FileText
} from 'lucide-react';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { getChecklistDetails } from '../../../api';
import toast from 'react-hot-toast';
import { Checklist } from './types';

// Small utility badge
const Pill = ({ children, color }: { children: React.ReactNode; color?: 'purple' | 'blue' | 'gray' }) => {
  const colorClasses =
    color === 'purple'
      ? 'bg-purple-100 text-purple-700 border border-purple-200'
      : color === 'blue'
      ? 'bg-blue-100 text-blue-700 border border-blue-200'
      : 'bg-muted text-foreground border border-border';
  return <span className={`px-3 py-1 rounded-md text-xs font-semibold ${colorClasses}`}>{children}</span>;
};

const MasterChecklistView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        setLoading(true);
        const response = await getChecklistDetails(id);
        setChecklist(response.data);
      } catch (error) {
        console.error('Error fetching checklist:', error);
        toast.error('Failed to load checklist details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChecklist();
    }
  }, [id]);

  const breadcrumbs = [
    { label: 'FM Module' },
    { label: 'Asset', path: '/asset' },
    { label: 'Master Checklist', path: '/asset/master-checklist' },
    { label: checklist?.name || 'View Checklist' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading checklist details...</p>
        </div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <ClipboardList className="w-16 h-16 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">Checklist Not Found</h3>
          <Link to="/asset/master-checklist" className="text-primary hover:underline">
            Back to Master Checklist
          </Link>
        </div>
      </div>
    );
  }

  const isPPM = checklist.ctype === 'ppm';

  const summaryItems = [
    { label: 'Frequency', value: checklist.frequency || '-' },
    { label: 'Start Date', value: checklist.start_date || '-', icon: <Calendar className="h-4 w-4 text-muted-foreground" /> },
    { label: 'End Date', value: checklist.end_date || '-', icon: <Calendar className="h-4 w-4 text-muted-foreground" /> },
    { label: 'Groups', value: checklist.groups?.length || 0 },
  ];

  const scheduleItems = [
    { label: 'Cron', value: checklist.checklist_cron?.expression || 'Not set', icon: <Clock className="h-4 w-4 text-muted-foreground" /> },
    { label: 'Grace Period', value: checklist.grace_period ?? '-', icon: <ShieldCheck className="h-4 w-4 text-muted-foreground" /> },
    { label: 'Grace Unit', value: checklist.grace_period_unit || '-', icon: <ShieldCheck className="h-4 w-4 text-muted-foreground" /> },
  ];

  const metaItems = [
    { label: 'Supplier ID', value: checklist.supplier_id || '—', icon: <FileText className="h-4 w-4 text-muted-foreground" /> },
    { label: 'Created At', value: checklist.created_at ? checklist.created_at.split('T')[0] : '—', icon: <Clock className="h-4 w-4 text-muted-foreground" /> },
    { label: 'Updated At', value: checklist.updated_at ? checklist.updated_at.split('T')[0] : '—', icon: <Clock className="h-4 w-4 text-muted-foreground" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm ${
                  isPPM ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                }`}
              >
                {isPPM ? <ClipboardCheck className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{checklist.name}</h1>
                  <Pill color={isPPM ? 'purple' : 'blue'}>{isPPM ? 'PPM' : 'Routine'}</Pill>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Checklist ID: {id}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/asset/master-checklist/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
            <Link
              to={`/asset/master-checklist/${id}/copy`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Link>
            <Link
              to={`/asset/master-checklist/${id}/associate`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Users className="h-4 w-4" />
              Associate
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        <Breadcrumb items={breadcrumbs} />

        {/* Summary Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryItems.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border bg-muted/40">
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  {item.icon}
                  <span>{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule & Meta */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Schedule</h3>
                <p className="text-xs text-muted-foreground">Timing and grace settings</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scheduleItems.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-border bg-muted/40 flex items-center gap-2">
                  {item.icon}
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-medium text-foreground text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Meta</h3>
                <p className="text-xs text-muted-foreground">Additional details</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {metaItems.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-border bg-muted/40 flex items-center gap-2">
                  {item.icon}
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-medium text-foreground text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Groups/Questions Section */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Questions</h3>
              <p className="text-xs text-muted-foreground">Grouped checklist items</p>
            </div>
          </div>

          {checklist.groups && checklist.groups.length > 0 ? (
            <div className="space-y-4">
              {checklist.groups.map((group, idx) => (
                <div key={idx} className="border border-border rounded-xl p-4 bg-muted/40">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">{group.group || `Group ${idx + 1}`}</h4>
                    <Pill color="gray">{group.questions?.length || 0} Questions</Pill>
                  </div>
                  <div className="space-y-2">
                    {group.questions?.map((q, qIdx) => (
                      <div key={qIdx} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-foreground font-medium">{q.name}</span>
                          {q.required && <Pill color="gray">Required</Pill>}
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{q.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No questions defined</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterChecklistView;
