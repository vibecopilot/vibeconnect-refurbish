import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  ClipboardList,
  AlertCircle,
  RefreshCw,
  Edit2,
  ArrowLeft,
  Clock,
  MapPin,
  Layers,
} from "lucide-react";
import Breadcrumb from "../../components/ui/Breadcrumb";
import { getChecklistDetails } from "../../api";

interface Question {
  id: number;
  name: string;
  type: string;
  group?: string;
  question_mandatory?: boolean;
  reading?: boolean;
  help_text?: string;
}

interface ChecklistDetails {
  id: number;
  name: string;
  frequency?: string;
  start_date?: string;
  end_date?: string;
  priority?: string;
  submit_hours?: number;
  submit_minutes?: number;
  extension_days?: number;
  extension_hours?: number;
  extension_minutes?: number;
  lock_overdue_task?: boolean;
  cron_day?: string;
  cron_hour?: string;
  cron_minute?: string;
  supervisors?: any[];
  supplier?: any;
  questions?: Question[];
  created_at?: string;
  updated_at?: string;
}

const ViewChecklist: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<ChecklistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChecklistDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getChecklistDetails(id);
      setChecklist(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch checklist details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklistDetails();
  }, [id]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDayLabel = (day?: string) => {
    const days: Record<string, string> = {
      "*": "Every day",
      "0": "Sunday",
      "1": "Monday",
      "2": "Tuesday",
      "3": "Wednesday",
      "4": "Thursday",
      "5": "Friday",
      "6": "Saturday",
    };
    return days[day || "*"] || day;
  };

  const groupedQuestions =
    checklist?.questions?.reduce((acc, q) => {
      const group = q.group || "Default";
      if (!acc[group]) acc[group] = [];
      acc[group].push(q);
      return acc;
    }, {} as Record<string, Question[]>) || {};

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <Breadcrumb
            items={[
              { label: "FM Module" },
              { label: "Soft Services", path: "/soft-services" },
              { label: "Checklist", path: "/soft-services/checklist" },
              { label: "View" },
            ]}
          />
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading checklist details...</p>
        </div>
      </div>
    );
  }

  if (error || !checklist) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <Breadcrumb
            items={[
              { label: "FM Module" },
              { label: "Soft Services", path: "/soft-services" },
              { label: "Checklist", path: "/soft-services/checklist" },
              { label: "View" },
            ]}
          />
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Checklist</h3>
          <p className="text-muted-foreground mb-4">{error || "Checklist not found"}</p>
          <button
            onClick={fetchChecklistDetails}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 pb-0">
        <Breadcrumb
          items={[
            { label: "FM Module" },
            { label: "Soft Services", path: "/soft-services" },
            { label: "Checklist", path: "/soft-services/checklist" },
            { label: checklist.name },
          ]}
        />
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/soft-services/checklist")}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="h-8 w-px bg-border" />
            <div>
              <h1 className="text-lg font-bold text-foreground">{checklist.name}</h1>
              <p className="text-xs text-muted-foreground">Checklist details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/soft-services/checklist/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>
      </header>

      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Highlight cards */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-xs text-muted-foreground">Frequency</p>
          <p className="text-sm font-semibold capitalize">{checklist.frequency || "-"}</p>
          <p className="text-xs text-muted-foreground">Priority</p>
          <p className="text-sm font-semibold capitalize">{checklist.priority || "-"}</p>
        </div>
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-xs text-muted-foreground">Start Date</p>
          <p className="text-sm font-semibold">{formatDate(checklist.start_date)}</p>
          <p className="text-xs text-muted-foreground">End Date</p>
          <p className="text-sm font-semibold">{formatDate(checklist.end_date)}</p>
        </div>
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-xs text-muted-foreground">Lock Overdue Task</p>
          <p className="text-sm font-semibold">{checklist.lock_overdue_task ? "Yes" : "No"}</p>
          <p className="text-xs text-muted-foreground">Supplier</p>
          <p className="text-sm font-semibold">
            {checklist.supplier?.name || checklist.supplier?.vendor_name || "-"}
          </p>
        </div>
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-xs text-muted-foreground">Supervisors</p>
          <div className="flex flex-wrap gap-2">
            {checklist.supervisors && checklist.supervisors.length > 0 ? (
              checklist.supervisors.map((s, idx) => (
                <span key={idx} className="px-2 py-1 bg-muted rounded-md text-xs border border-border">
                  {s.firstname} {s.lastname}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Schedule Settings */}
        <div className="lg:col-span-6 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Schedule Settings</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow
              label="Allowed Submit Time"
              value={`${checklist.submit_hours || 0}h ${checklist.submit_minutes || 0}m`}
            />
            <InfoRow
              label="Extension Time"
              value={`${checklist.extension_days || 0}d ${checklist.extension_hours || 0}h ${checklist.extension_minutes || 0}m`}
            />
            <InfoRow
              label="Cron Setting"
              value={`${getDayLabel(checklist.cron_day)} • ${checklist.cron_hour || "0"}:${checklist.cron_minute || "0"}`}
            />
          </div>
        </div>

        {/* Checklist meta */}
        <div className="lg:col-span-6 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Metadata</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Created On" value={formatDate(checklist.created_at)} />
            <InfoRow label="Updated On" value={formatDate(checklist.updated_at)} />
          </div>
        </div>

        {/* Questions */}
        {Object.keys(groupedQuestions).length > 0 && (
          <div className="lg:col-span-12 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Questions</h2>
            </div>
            <div className="p-6 space-y-6">
              {Object.entries(groupedQuestions).map(([group, questions]) => (
                <div key={group} className="space-y-3 border border-border rounded-xl p-4 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">{group}</h4>
                    <span className="text-xs text-muted-foreground">{questions.length} questions</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {questions.map((q, idx) => (
                      <div key={q.id || idx} className="bg-background border border-border rounded-lg p-4 space-y-2">
                        <p className="text-sm font-medium text-foreground">{q.name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                          <span className="px-2 py-1 rounded-full bg-muted border border-border uppercase">
                            {q.type}
                          </span>
                          {q.question_mandatory && (
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/40">
                              Mandatory
                            </span>
                          )}
                          {q.reading && (
                            <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-200">
                              Reading
                            </span>
                          )}
                        </div>
                        {q.help_text && (
                          <p className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2">{q.help_text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium text-foreground">{value}</p>
  </div>
);

export default ViewChecklist;
