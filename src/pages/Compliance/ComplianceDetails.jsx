import React, { useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck, FileText, LayoutList, Timer } from "lucide-react";
import { IoDocumentAttach } from "react-icons/io5";
import { LuStamp } from "react-icons/lu";
import { MdOutlinePendingActions } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ComplianceAudit from "./ComplianceAudit";
import Breadcrumb from "../../components/ui/Breadcrumb";
import { domainPrefix, getComplianceConfigurationDetails } from "../../api";
import { dateFormatSTD, dateTimeFormat } from "../../utils/dateUtils";
import { getItemInLocalStorage } from "../../utils/localStorage";

const ComplianceDetails = () => {
  useSelector((state) => state.theme.color); // keeps theme subscription if needed
  const navigate = useNavigate();
  const { id } = useParams();
  const userId = getItemInLocalStorage("UserId");

  const [modal, setModal] = useState(false);
  const [details, setDetails] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [complianceTrackerId, setComplianceTrackerId] = useState("");
  const [complianceTagId, setComplianceTagId] = useState("");
  const [complianceTagTaskId, setComplianceTagTaskId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComplianceDetails = async () => {
      try {
        const res = await getComplianceConfigurationDetails(id);
        setDetails(res?.data || {});
        setAssignments(res?.data?.compliance_trackers || []);
        setError(null);
      } catch (err) {
        setError("Failed to fetch compliance details");
      } finally {
        setLoading(false);
      }
    };
    fetchComplianceDetails();
  }, [id, userId]);

  const isImage = (filePath) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg"];
    const extension = filePath.split(".").pop().split("?")[0].toLowerCase();
    return imageExtensions.includes(extension);
  };

  const getFileName = (filePath) => {
    return filePath.split("/").pop().split("?")[0];
  };

  const handleComplianceAuditModal = (trackerId, TagId, TagTaskId) => {
    setModal(true);
    setComplianceTrackerId(trackerId);
    setComplianceTagId(TagId);
    setComplianceTagTaskId(TagTaskId);
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading compliance details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-muted-foreground mb-3">{error}</p>
        <button
          onClick={() => navigate("/compliance")}
          className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          Back to Compliance
        </button>
      </div>
    );
  }

  const statusChip =
    assignments?.[0]?.status || details?.status || "-";

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur pb-2">
          <Breadcrumb
            items={[
              { label: "FM Module" },
              { label: "Compliance", path: "/compliance" },
              { label: "Compliance Details" },
            ]}
          />
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => navigate("/compliance")}
              className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
              aria-label="Back to Compliance"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold text-foreground">
                {details?.name || "Compliance"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {details?.site_name || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Basic Details" icon={<LayoutList className="h-5 w-5 text-primary" />}>
            <InfoRow label="Auditor" value={details?.reviewer_name} />
            <InfoRow label="Vendor" value={details?.assign_to_name} />
            <InfoRow label="Frequency" value={details?.frequency} />
            <InfoRow label="Priority" value={details?.priority} />
            <InfoRow label="Target Days" value={details?.due_in_days ? `${details?.due_in_days} days` : "-"} />
            <InfoRow label="Status" value={statusChip} />
          </Card>

          <Card title="Schedule" icon={<Timer className="h-5 w-5 text-primary" />}>
            <InfoRow label="Start Date" value={dateFormatSTD(details?.start_date) || "-"} />
            <InfoRow label="End Date" value={dateFormatSTD(details?.end_date) || "-"} />
          </Card>

          <Card title="Overview" icon={<BadgeCheck className="h-5 w-5 text-primary" />}>
            <InfoRow label="Site" value={details?.site_name} />
            <InfoRow label="Configuration ID" value={details?.id} />
          </Card>
        </div>

        <Card title="Compliance For" icon={<FileText className="h-5 w-5 text-primary" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {details?.compliance_config_tags?.length ? (
              details.compliance_config_tags.map((category, index) => (
                <div
                  key={category.id || index}
                  className="rounded-xl border border-border bg-muted/40 px-4 py-3"
                >
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="text-foreground font-medium">
                    {category.compliance_tag_name}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No categories available.</p>
            )}
          </div>
        </Card>

        <div className="bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
            <span className="text-xs text-muted-foreground">
              {assignments?.length || 0} assignments
            </span>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {assignments?.length ? (
              assignments.map((assignment, idx) =>
                assignment?.compliance_tracker_tags_by_category?.map((category) =>
                  category?.compliance_tracker_tags?.map((tags) => (
                    <div
                      className="rounded-xl border border-border bg-muted/30 p-4 shadow-sm"
                      key={`${category?.id || category?.name}-${tags?.compliance_tag_task_id}-${idx}`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 border-b border-border pb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Category</p>
                          <h3 className="font-semibold text-foreground">
                            {category?.name || "-"}
                          </h3>
                        </div>
                        <p className="text-foreground">
                          Weightage: {tags?.task?.weightage || 0}%
                        </p>
                        <p className="text-foreground">
                          Mandatory: {tags?.task?.mandatory ? "Yes" : "No"}
                        </p>
                        <div className="flex items-center justify-end gap-3">
                          <span
                            className={`flex items-center gap-2 text-sm font-medium ${
                              assignment?.status === "pending" ? "text-amber-600" : "text-emerald-600"
                            }`}
                          >
                            {assignment?.status === "pending" ? (
                              <MdOutlinePendingActions />
                            ) : (
                              <BadgeCheck className="h-4 w-4" />
                            )}
                            {assignment?.status
                              ? assignment?.status.charAt(0).toUpperCase() +
                                assignment?.status.slice(1)
                              : "-"}
                          </span>
                          <button
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                            onClick={() =>
                              handleComplianceAuditModal(
                                tags.compliance_tracker_id,
                                tags.compliance_tag_id,
                                tags.compliance_tag_task_id
                              )
                            }
                          >
                            <LuStamp /> Verify
                          </button>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-card border border-border">
                        <h4 className="font-medium mb-2 text-foreground">Answer</h4>
                        <p className="bg-muted/60 p-3 rounded-md text-foreground mb-4">
                          Remark: {tags?.comment || "No remarks provided"}
                        </p>
                        <div className="flex flex-wrap gap-4 mb-4">
                          {tags?.attachments?.map((other, index) => (
                            <div key={other.id || index} className="flex flex-col items-center">
                              {isImage(domainPrefix + other.image_url) ? (
                                <img
                                  src={domainPrefix + other.image_url}
                                  alt={`Attachment ${index + 1}`}
                                  className="w-40 h-28 object-cover rounded-md border border-border cursor-pointer"
                                  onClick={() =>
                                    window.open(domainPrefix + other.image_url, "_blank")
                                  }
                                />
                              ) : (
                                <a
                                  href={domainPrefix + other.image_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-primary transition-colors text-center flex flex-col items-center"
                                >
                                  <IoDocumentAttach size={40} className="text-yellow-500" />
                                  <span className="text-sm mt-1">
                                    {getFileName(other.image_url)}
                                  </span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-border">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              Submitted by:
                            </span>
                            <span className="text-foreground">
                              {tags?.submitted_by_name || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              Submitted on:
                            </span>
                            <span className="text-foreground">
                              {dateTimeFormat(tags?.submitted_on) || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )
            ) : (
              <p className="text-sm text-muted-foreground">No tasks available.</p>
            )}
          </div>
        </div>

        {modal && (
          <ComplianceAudit
            onClose={() => setModal(false)}
            tagId={complianceTagId}
            taskId={complianceTagTaskId}
            trackerId={complianceTrackerId}
          />
        )}
      </div>
    </div>
  );
};

const Card = ({ title, icon, children }) => (
  <div className="rounded-2xl border border-border bg-card shadow-sm">
    <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/30">
      {icon}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
    <div className="p-5 space-y-3">{children}</div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 py-1">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground text-right">{value || "-"}</span>
  </div>
);

export default ComplianceDetails;
