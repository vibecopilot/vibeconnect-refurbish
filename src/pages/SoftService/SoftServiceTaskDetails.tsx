import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Clock,
  User,
  FileText,
  ClipboardCheck,
  MapPin,
  Timer,
} from "lucide-react";
import Breadcrumb from "../../components/ui/Breadcrumb";
import StatusBadge, { StatusType } from "../../components/ui/StatusBadge";
import axiosInstance from "../../api/axiosInstance";
import { getItemInLocalStorage } from "../../utils/localStorage";
import { dateTimeFormat } from "../../utils/dateUtils";

interface TaskSubmission {
  id?: number;
  question?: { id?: number; name?: string };
  value?: string;
  updated_at?: string;
  question_attachments?: Array<{ document?: string }>;
}

interface TaskActivity {
  id: number;
  checklist?: { name?: string; frequency?: string };
  checklist_name?: string;
  checklist_frequency?: string;
  priority_level?: string;
  category_id?: string | number;
  start_time?: string;
  end_time?: string;
  status?: string;
  assigned_name?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  soft_service_name?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  groups?: Array<{
    group_id?: number;
    group?: string | null;
    questions?: Array<{
      id?: number;
      name?: string;
      qtype?: string;
      option1?: string;
      option2?: string;
      option3?: string;
      option4?: string;
    }>;
  }>;
  activity_log?: { submissions?: TaskSubmission[] };
  comment?: string;
}

const SoftServiceTaskDetails: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const serviceIdFromState = (location.state as any)?.serviceId;
  const serviceNameFromState = (location.state as any)?.serviceName;

  const [task, setTask] = useState<TaskActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      setLoading(true);
      setError(null);
      try {
        const token = getItemInLocalStorage("TOKEN");
        const directResp = await axiosInstance.get(`/activities/${taskId}.json`, {
          params: { token },
        });
        const direct = directResp.data?.activity || directResp.data;
        if (!direct) {
          setError("Task not found");
          setTask(null);
        } else {
          setTask({
            ...direct,
            checklist_name: direct.checklist?.name || direct.checklist_name,
            checklist_frequency: direct.checklist?.frequency || direct.checklist_frequency,
            assigned_name: direct.assigned_name || direct.assigned_to_name || direct.assigned_to,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load task");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  const getStatus = (): StatusType => {
    const status = task?.status?.toLowerCase();
    if (status === "completed" || status === "done") return "checked-out";
    if (status === "in_progress" || status === "pending") return "pending";
    if (status === "overdue") return "breakdown";
    return "available";
  };

  const formatDateTime = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading task...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] bg-background">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Unable to load task</h3>
        <p className="text-muted-foreground mb-4">{error || "Task not found"}</p>
        <button
          onClick={() => navigate("/soft-services")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Back to List
        </button>
      </div>
    );
  }

  const submissions = task.activity_log?.submissions || [];
  const answerByQuestionId = new Map<number | undefined, TaskSubmission>();
  submissions.forEach((sub, idx) => {
    const qid = sub.question?.id;
    if (qid !== undefined) {
      answerByQuestionId.set(qid, sub);
    } else {
      answerByQuestionId.set(undefined, sub); // fallback for index-based pairing
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="p-6 pb-0">
        <Breadcrumb
          items={[
            { label: "FM Module" },
            { label: "Soft Services", path: "/soft-services" },
            serviceIdFromState
              ? { label: serviceNameFromState || "Service", path: `/soft-services/${serviceIdFromState}` }
              : { label: "Task", path: "/soft-services/task" },
            { label: task.checklist?.name || task.checklist_name || `Task #${task.id}` },
          ]}
        />
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                navigate(serviceIdFromState ? `/soft-services/${serviceIdFromState}` : "/soft-services/task")
              }
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="h-8 w-px bg-border" />
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {task.checklist?.name || task.checklist_name || `Task #${task.id}`}
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <StatusBadge status={getStatus()} />
                <span>{task.assigned_name || task.assigned_to || "Unassigned"}</span>
                {task.soft_service_name && <span className="text-muted-foreground">• {task.soft_service_name}</span>}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Highlight cards */}
      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-xs text-muted-foreground">Status</p>
          <div className="flex items-center gap-2">
            <StatusBadge status={getStatus()} />
            <span className="text-sm text-muted-foreground">{task.status || "-"}</span>
          </div>
          <p className="text-xs text-muted-foreground">Frequency</p>
          <p className="text-sm font-medium">{task.checklist_frequency || task.checklist?.frequency || "-"}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-xs text-muted-foreground">Assigned To</p>
          <p className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            {task.assigned_name || task.assigned_to_name || task.assigned_to || "-"}
          </p>
          <p className="text-xs text-muted-foreground">Location</p>
          <p className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {task.location || "-"}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-xs text-muted-foreground">Start / End</p>
          <p className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            {formatDateTime(task.start_time)}
          </p>
          <p className="text-sm font-medium flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            {formatDateTime(task.end_time)}
          </p>
        </div>
      </div>

      <div className="px-6 pb-10 space-y-6">
        {/* Top Row: Details & Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Details */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Task Details</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem label="Checklist" value={task.checklist?.name || task.checklist_name || "-"} />
              <InfoItem label="Status" value={task.status || "-"} />
              <InfoItem label="Assigned To" value={task.assigned_name || task.assigned_to_name || task.assigned_to || "-"} />
              <InfoItem label="Service" value={task.soft_service_name || "-"} />
              <InfoItem label="Building" value={task.building_name || "-"} />
              <InfoItem label="Floor" value={task.floor_name || "-"} />
              <InfoItem label="Unit" value={task.unit_name || "-"} />
              <InfoItem label="Location" value={task.location || "-"} />
              <InfoItem label="Created On" value={formatDateTime(task.created_at)} />
              <InfoItem label="Updated On" value={formatDateTime(task.updated_at)} />
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Schedule</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem label="Start Time" value={formatDateTime(task.start_time)} />
              <InfoItem label="End Time" value={formatDateTime(task.end_time)} />
              <InfoItem label="Checklist Frequency" value={task.checklist_frequency || task.checklist?.frequency || "-"} />
              <InfoItem
                label="Last Update"
                value={dateTimeFormat(task?.activity_log?.submissions?.[0]?.updated_at) || "-"}
              />
            </div>
          </div>
        </div>

        {/* Groups / Questions */}
        {task.groups && task.groups.length > 0 && (
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Checklist Questions & Answers</h2>
            </div>
            <div className="p-6 space-y-5">
              {task.groups.map((group, gIdx) => (
                <div key={group.group_id || gIdx} className="border border-border rounded-xl p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      {group.group || group.group_id ? group.group || `Group ${group.group_id}` : `Group ${gIdx + 1}`}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {group.questions?.length || 0} questions
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {group.questions?.map((q, qIdx) => {
                      const sub =
                        answerByQuestionId.get(q.id) ||
                        (qIdx < submissions.length ? submissions[qIdx] : undefined);
                      return (
                        <div
                          key={q.id || qIdx}
                          className="bg-background border border-border rounded-lg p-4 w-full"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">{q.name || `Question ${qIdx + 1}`}</p>
                            <span className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground uppercase border border-border">
                              {q.qtype || "-"}
                            </span>
                          </div>
                          {q.qtype === "multiple" && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {[q.option1, q.option2, q.option3, q.option4]
                                .filter(Boolean)
                                .map((opt, optIdx) => (
                                  <span
                                    key={optIdx}
                                    className="px-2 py-1 text-xs rounded-full bg-muted border border-border text-foreground"
                                  >
                                    {opt}
                                  </span>
                                ))}
                            </div>
                          )}
                          <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/20 p-3">
                            <p className="text-xs text-muted-foreground mb-1">Answer</p>
                            <p className="text-sm font-medium text-foreground">{sub?.value || "—"}</p>
                            {sub?.question_attachments && sub.question_attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                <p className="text-[11px] text-muted-foreground">Attachments</p>
                                <div className="flex flex-wrap gap-2">
                                  {sub.question_attachments.map((att, attIdx) => (
                                    <a
                                      key={attIdx}
                                      href={att.document}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary text-[11px] underline"
                                    >
                                      Attachment {attIdx + 1}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submissions */}
        {submissions.length > 0 && (
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Submissions ({submissions.length})</h2>
            </div>
            <div className="p-6 space-y-4">
              {submissions.map((submission, idx) => (
                <div key={submission.id || idx} className="bg-muted/20 border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Question {idx + 1}</p>
                      <p className="font-semibold text-foreground">{submission.question?.name || "-"}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {dateTimeFormat(submission.updated_at) || "-"}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">Answer: {submission.value || "-"}</p>
                  {submission.question_attachments && submission.question_attachments.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Attachments</p>
                      <div className="flex flex-wrap gap-2">
                        {submission.question_attachments.map((att, attIdx) => (
                          <a
                            key={attIdx}
                            href={att.document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-xs underline"
                          >
                            Attachment {attIdx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium text-foreground">{value}</p>
  </div>
);

export default SoftServiceTaskDetails;
