import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Loader2, AlertTriangle, ArrowLeft, Clock, User, FileText, ClipboardCheck } from "lucide-react";
import Breadcrumb from "../../components/ui/Breadcrumb";
import StatusBadge, { StatusType } from "../../components/ui/StatusBadge";
import { getSoftserviceActivityDetails } from "../../api";
import { dateTimeFormat } from "../../utils/dateUtils";
import axiosInstance from "../../api/axiosInstance";
import { getItemInLocalStorage } from "../../utils/localStorage";

interface TaskSubmission {
  id?: number;
  question?: { name?: string };
  value?: string;
  updated_at?: string;
  question_attachments?: Array<{ document?: string }>;
}

interface TaskActivity {
  id: number;
  checklist?: { name?: string; frequency?: string };
  checklist_name?: string;
  checklist_frequency?: string;
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
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading task...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
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

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: "FM Module", path: "/soft-services" },
          { label: "Soft Services", path: "/soft-services" },
          serviceIdFromState
            ? { label: serviceNameFromState || "Service", path: `/soft-services/${serviceIdFromState}` }
            : { label: "Task", path: "/soft-services/task" },
          { label: task.checklist?.name || task.checklist_name || `Task #${task.id}` },
        ]}
      />

      <div className="flex items-center gap-4 mt-4 mb-6">
        <button
          onClick={() => navigate(serviceIdFromState ? `/soft-services/${serviceIdFromState}` : "/soft-services/task")}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {task.checklist?.name || task.checklist_name || `Task #${task.id}`}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge status={getStatus()} />
            <span className="text-sm text-muted-foreground">
              {task.assigned_name || task.assigned_to || "Unassigned"}
            </span>
            {task.soft_service_name && (
              <span className="text-sm text-muted-foreground">• Service: {task.soft_service_name}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" /> Task Details
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <InfoItem label="Checklist" value={task.checklist?.name || task.checklist_name || "-"} />
            <InfoItem label="Status" value={task.status || "-"} />
            <InfoItem label="Assigned To" value={task.assigned_name || task.assigned_to_name || task.assigned_to || "-"} />
            <InfoItem label="Frequency" value={task.checklist_frequency || task.checklist?.frequency || "-"} />
            <InfoItem label="Service" value={task.soft_service_name || "-"} />
            <InfoItem label="Location" value={task.location || "-"} />
            <InfoItem label="Created On" value={formatDateTime(task.created_at)} />
            <InfoItem label="Updated On" value={formatDateTime(task.updated_at)} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Schedule
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <InfoItem label="Start Time" value={formatDateTime(task.start_time)} />
            <InfoItem label="End Time" value={formatDateTime(task.end_time)} />
            <InfoItem label="Updated" value={dateTimeFormat(task?.activity_log?.submissions?.[0]?.updated_at) || "-"} />
          </div>
        </div>

        {/* Groups / Questions */}
        {task.groups && task.groups.length > 0 && (
          <div className="md:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Checklist Questions
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {task.groups.map((group, gIdx) => (
                <div key={group.group_id || gIdx} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      {group.group || group.group_id ? group.group || `Group ${group.group_id}` : `Group ${gIdx + 1}`}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {group.questions?.length || 0} questions
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.questions?.map((q, qIdx) => (
                      <div key={q.id || qIdx} className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">{q.name || `Question ${qIdx + 1}`}</p>
                          <span className="text-xs text-muted-foreground uppercase">{q.qtype || '-'}</span>
                        </div>
                        {q.qtype === "multiple" && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {[q.option1, q.option2, q.option3, q.option4]
                              .filter(Boolean)
                              .map((opt, optIdx) => (
                                <span key={optIdx} className="px-2 py-1 text-xs rounded-full bg-background border border-border">
                                  {opt}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {submissions.length > 0 && (
          <div className="md:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Submissions ({submissions.length})
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {submissions.map((submission, idx) => (
                <div key={submission.id || idx} className="bg-muted/30 border border-border rounded-lg p-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Question {idx + 1}</p>
                  <p className="font-semibold text-foreground">{submission.question?.name || "-"}</p>
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
                  <p className="text-xs text-muted-foreground">
                    Updated at: {dateTimeFormat(submission.updated_at) || "-"}
                  </p>
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
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);

export default SoftServiceTaskDetails;
