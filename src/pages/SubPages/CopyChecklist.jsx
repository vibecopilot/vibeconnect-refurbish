import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import PageTitle from "../../components/ui/PageTitle";
import ChecklistCreateForm from "../../components/forms/ChecklistCreateForm";
import { getChecklistDetails } from "../../api";

const CopyChecklist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prefillData, setPrefillData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) {
        setError("Checklist not found");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const resp = await getChecklistDetails(id);
        setPrefillData(resp.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch checklist details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading checklist details...</p>
      </div>
    );
  }

  if (error || !prefillData) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Checklist</h3>
        <p className="text-muted-foreground mb-4">{error || "Checklist not found"}</p>
        <button
          onClick={() => navigate("/asset/checklist")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageTitle
        title="Copy Checklist"
        breadcrumbs={[
          { label: "FM Module" },
          { label: "Asset", path: "/asset" },
          { label: "Checklist", path: "/asset/checklist" },
          { label: "Copy Checklist" },
        ]}
      />

      <ChecklistCreateForm checklistType="routine" prefillData={prefillData} prefillMode="copy" />
    </div>
  );
};

export default CopyChecklist;
