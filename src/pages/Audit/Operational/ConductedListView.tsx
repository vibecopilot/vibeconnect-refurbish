import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import {
  ArrowLeft,
  Edit,
  FileText,
  ClipboardList,
  Calendar,
  Flag,
  Layers,
  Clock,
  CheckCircle,
} from "lucide-react";
import { getAuditScheduledById } from "../../../api";

interface AuditTask {
  id: number;
  group: number;
  sub_group: number;
  task: string;
  input_type: string;
  mandatory: boolean;
  reading: boolean;
}

interface ConductedAudit {
  id: number;
  audit_for: string;
  activity_name: string;
  description: string;
  checklist_type: string;
  priority: string | null;
  frequency: string | null;
  scan_type: string | null;
  plan_duration: number | null;
  start_from: string | null;
  end_at: string | null;
  allow_observations: boolean;
  asset_name?: string | null;
  service_name?: string | null;
  vendor_name?: string | null;
  created_at: string;
  updated_at: string;
  audit_tasks: AuditTask[];
}

/* ================= COMPONENT ================= */

const ConductedListView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [audit, setAudit] = useState<ConductedAudit| null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchAudit();
  }, [id]);

  const fetchAudit = async () => {
    try {
      setLoading(true);
      const res = await getAuditScheduledById(id!);
      setAudit(res.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Clock className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!audit) {
    return <div className="text-center p-6">Audit not found</div>;
  }

  /* ================= RENDER ================= */

  return (
    <div className="p-6">
        <Breadcrumb
        items={[
          { label: "FM Module", path: "/audit" },
          { label: "Audit", path: "/audit" },
          { label: "Operational", path: "/audit" },
          { label: "Scheduled", path: "/audit/operational/scheduled" },
          { label: "Edit" },
        ]}
      />

      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-2xl font-bold">{audit.activity_name}</h1>
            <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
              <span># {audit.id}</span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {audit.audit_for}
              </span>
            </div>
          </div>
        </div>

        <Link
          to={`/audit/operational/scheduled/edit/${audit.id}`}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
        >
          <Edit className="w-4 h-4" />
          Edit Audit
        </Link>
      </div>

      {/* ===== CONTENT GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== MAIN CONTENT ===== */}
        <div className="lg:col-span-2 space-y-6">

          {/* Audit Info */}
          <Card title="Audit Information" icon={<FileText className="w-5 h-5" />}>
            <InfoGrid>
              <Info label="Checklist Type" value={audit.checklist_type} />
              <Info label="Priority" value={audit.priority || "-"} />
              <Info label="Frequency" value={audit.frequency || "-"} />
              <Info label="Scan Type" value={audit.scan_type || "-"} />
              <Info label="Plan Duration" value={audit.plan_duration ? `${audit.plan_duration} mins` : "-"} />
              <Info label="Start Date" value={audit.start_from?.split("T")[0] || "-"} />
              <Info label="End Date" value={audit.end_at?.split("T")[0] || "-"} />
            </InfoGrid>
          </Card>

          {/* Description */}
          <Card title="Description" icon={<ClipboardList className="w-5 h-5" />}>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {audit.description || "No description provided."}
            </p>
          </Card>

          {/* Tasks */}
          <Card
            title={`Tasks (${audit.audit_tasks.length})`}
            icon={<Layers className="w-5 h-5" />}
          >
            <div className="space-y-4">
              {audit.audit_tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-4 bg-muted/50"
                >
                  <p className="font-medium">
                    {index + 1}. {task.task}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Input: {task.input_type}</span>
                    {task.mandatory && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" /> Mandatory
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ===== SIDEBAR ===== */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card title="Quick Info" icon={<Flag className="w-5 h-5" />}>
            <div className="space-y-3">
              <SidebarItem label="Audit For" value={audit.audit_for} />
              <SidebarItem label="Priority" value={audit.priority || "-"} />
              <SidebarItem
                label="Observations"
                value={audit.allow_observations ? "Allowed" : "Not Allowed"}
              />
            </div>
          </Card>


          {/* Timeline */}
          <Card title="Timeline" icon={<Calendar className="w-5 h-5" />}>
            <div className="space-y-3">
              <TimelineItem label="Created at" value={audit.created_at} />
              <TimelineItem label="Updated at" value={audit.updated_at} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConductedListView;

/* ================= UI HELPERS ================= */

const Card = ({ title, icon, children }: any) => (
  <div className="bg-card border border-border rounded-xl overflow-hidden">
    <div className="px-6 py-4 border-b flex items-center gap-2 font-semibold">
      {icon}
      {title}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const InfoGrid = ({ children }: any) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{children}</div>
);

const Info = ({ label, value }: any) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);

const SidebarItem = ({ label, value }: any) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const TimelineItem = ({ label, value }: any) => (
  <div className="text-sm">
    <p className="font-medium">{label}</p>
    <p className="text-muted-foreground">{value || "-"}</p>
  </div>
);
