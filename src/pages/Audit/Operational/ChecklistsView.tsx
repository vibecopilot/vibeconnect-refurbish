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
import { getChecklist } from "../../../api";

interface AuditTask {
  id: number;
  group: string;
  sub_group: string;
  task: string;
  input_type: string;
  mandatory: boolean;
  reading: boolean;
  help_text?: boolean;
}

interface ChecklistData {
  id: number;
  activity_name: string;
  name: string;
  description: string;
  checklist_type: string;
  for_type?: string;
  allow_observations: boolean;
  created_at: string;
  updated_at: string;
  status: string;
  audit_tasks?: AuditTask[];
  asset_name?: string | null;
  service_name?: string | null;
  vendor_name?: string | null;
}

/* ================= COMPONENT ================= */

const ChecklistView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [checklist, setChecklist] = useState<ChecklistData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchChecklist();
  }, [id]);

  const fetchChecklist = async () => {
    try {
      setLoading(true);
      const res = await getChecklist(1, 10, { id });
      // Handle the response based on your API structure
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setChecklist(data);
    } catch (error) {
      console.error("Error fetching checklist:", error);
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

  if (!checklist) {
    return <div className="text-center p-6">Checklist not found</div>;
  }

  /* ================= RENDER ================= */

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: "FM Module", path: "/audit" },
          { label: "Audit", path: "/audit" },
          { label: "Operational", path: "/audit" },
          { label: "Checklists", path: "/audit/operational/checklists" },
          { label: "View" },
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
            <h1 className="text-2xl font-bold">{checklist.activity_name}</h1>
            <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
              <span># {checklist.id}</span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {checklist.checklist_type}
              </span>
            </div>
          </div>
        </div>
        <Link
          to={`/audit/operational/checklists/${checklist.id}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
        >
          <Edit className="w-4 h-4" />
          Edit Checklist
        </Link>
      </div>

      {/* ===== CONTENT GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== MAIN CONTENT ===== */}
        <div className="lg:col-span-2 space-y-6">

          {/* Checklist Info */}
          <Card title="Checklist Information" icon={<FileText className="w-5 h-5" />}>
            <InfoGrid>
              <Info label="Activity Name" value={checklist.activity_name} />
              <Info label="Asset/Service Name" value={checklist.name || "-"} />
              <Info label="Checklist Type" value={checklist.checklist_type} />
              <Info label="For Type" value={checklist.for_type || "-"} />
              <Info label="Status" value={checklist.status || "-"} />
              <Info label="Observations" value={checklist.allow_observations ? "Allowed" : "Not Allowed"} />
            </InfoGrid>
          </Card>

          {/* Description */}
          <Card title="Description" icon={<ClipboardList className="w-5 h-5" />}>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {checklist.description || "No description provided."}
            </p>
          </Card>

          {/* Tasks */}
          <Card
            title={`Tasks (${checklist.audit_tasks?.length || 0})`}
            icon={<Layers className="w-5 h-5" />}
          >
            {checklist.audit_tasks && checklist.audit_tasks.length > 0 ? (
              <div className="space-y-4">
                {checklist.audit_tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="border rounded-lg p-4 bg-muted/50"
                  >
                    <p className="font-medium">
                      {index + 1}. {task.task}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      {task.group && <span>Group: {task.group}</span>}
                      {task.sub_group && <span>SubGroup: {task.sub_group}</span>}
                      <span>Input: {task.input_type}</span>
                      {task.mandatory && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" /> Mandatory
                        </span>
                      )}
                      {task.reading && (
                        <span className="text-blue-600">Reading</span>
                      )}
                      {task.help_text && (
                        <span className="text-orange-600">Help Text</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No tasks added yet.</p>
            )}
          </Card>
        </div>

        {/* ===== SIDEBAR ===== */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card title="Quick Info" icon={<Flag className="w-5 h-5" />}>
            <div className="space-y-3">
              <SidebarItem label="Checklist Type" value={checklist.checklist_type} />
              <SidebarItem label="For Type" value={checklist.for_type || "-"} />
              <SidebarItem label="Status" value={checklist.status || "-"} />
              <SidebarItem
                label="Observations"
                value={checklist.allow_observations ? "Allowed" : "Not Allowed"}
              />
              <SidebarItem label="Total Tasks" value={checklist.audit_tasks?.length.toString() || "0"} />
            </div>
          </Card>

          {/* Timeline */}
          <Card title="Timeline" icon={<Calendar className="w-5 h-5" />}>
            <div className="space-y-3">
              <TimelineItem label="Created at" value={checklist.created_at} />
              <TimelineItem label="Updated at" value={checklist.updated_at} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChecklistView;

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