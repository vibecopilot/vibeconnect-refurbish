import React, { useEffect, useState } from "react";
import { domainPrefix, getRoutineTaskDetails } from "../../../api";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Breadcrumb from "../../../components/ui/Breadcrumb";

const AssetRoutineDetails = () => {
  const { assetId, activityId } = useParams();
  const [taskDetails, setTaskDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      const loadingId = toast.loading("Loading routine task...");
      setError(null);
      try {
        const detailsResp = await getRoutineTaskDetails(assetId, activityId);
        setTaskDetails(detailsResp.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load routine task details.");
      } finally {
        toast.dismiss(loadingId);
        setLoading(false);
      }
    };
    fetchTaskDetails();
  }, [assetId, activityId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-screen p-4">
        <p className="text-muted-foreground">Loading routine task...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen p-4">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!taskDetails.length) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen p-4">
        <p className="text-muted-foreground">No details available.</p>
      </div>
    );
  }

  const { asset_name, checklist_name, created_at, user_name } = taskDetails[0];
  const dateFormat = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="p-4 md:p-6 bg-background min-h-screen">
      <div className="mx-auto max-w-[1200px] space-y-6">
        <Breadcrumb
          items={[
            { label: "FM Module" },
            { label: "Asset", path: "/asset" },
            { label: "Routine Task", path: "/asset/routine-task" },
            { label: "Details" },
          ]}
        />

        <div className="bg-card border border-border rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-foreground">{asset_name || "Asset"}</h1>
              <p className="text-sm text-muted-foreground">{checklist_name || "Routine Checklist"}</p>
            </div>
            <div className="text-sm text-muted-foreground text-right space-y-1">
              <div className="font-medium text-foreground">Updated by: {user_name || "-"}</div>
              <div>{created_at ? dateFormat(created_at) : "-"}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {taskDetails.map((task) => (
            <div key={task.id} className="bg-card border border-border rounded-xl shadow-sm p-4 space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Question</span>
                <p className="text-base font-semibold text-foreground">{task.question_name || "-"}</p>
              </div>

              <div className="bg-accent/60 border border-border rounded-lg p-3">
                <span className="text-xs text-muted-foreground">Answer</span>
                <p className="text-sm font-medium text-foreground">{task.value || "-"}</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-muted-foreground">Attachments</span>
                <div className="flex gap-4 flex-wrap">
                  {task.question_attachments?.length > 0 ? (
                    task.question_attachments.map((attachment, i) => (
                      <img
                        key={i}
                        src={domainPrefix + attachment.document}
                        alt={`Attachment ${i + 1}`}
                        className="w-40 h-28 object-cover rounded-md cursor-pointer border border-border"
                        onClick={() => window.open(domainPrefix + attachment.document, "_blank")}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No Attachments</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetRoutineDetails;
