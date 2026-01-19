import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";
import PageTitle from "../../../components/ui/PageTitle";
import ChecklistCreateForm from "../../../components/forms/ChecklistCreateForm";
import { getChecklistDetails } from "../../../api";

const MasterChecklistEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [checklistData, setChecklistData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChecklist = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await getChecklistDetails(id);
        setChecklistData(resp.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch checklist");
      } finally {
        setLoading(false);
      }
    };
    fetchChecklist();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading checklist details...</p>
      </div>
    );
  }

  if (error || !checklistData) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Checklist</h3>
        <p className="text-muted-foreground mb-4">{error || "Checklist not found"}</p>
        <button
          onClick={() => navigate("/asset/master-checklist")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageTitle
        title="Edit Checklist"
        breadcrumbs={[
          { label: "Asset", path: "/asset" },
          { label: "Master Checklist", path: "/asset/master-checklist" },
          { label: checklistData.name || "Edit Checklist" },
        ]}
      />

      <ChecklistCreateForm
        checklistType={checklistData.ctype || "routine"}
        isEditMode
        existingData={checklistData}
        checklistId={id}
      />
    </div>
  );
};

export default MasterChecklistEdit;
