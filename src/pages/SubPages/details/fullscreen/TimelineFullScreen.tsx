import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { getSiteAssetDetails } from "../../../../api";
import Breadcrumb from "../../../../components/ui/Breadcrumb";

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

const TimelineFullScreen = () => {
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssetDetails = async () => {
      setLoading(true);
      try {
        const details = await getSiteAssetDetails(id);
        setAsset(details.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching asset details:", error);
        setError(error.message || "Failed to fetch asset details");
      } finally {
        setLoading(false);
      }
    };

    fetchAssetDetails();
  }, [id]);

  const timelineEvents = [
    { event: "Installed", date: "07/05/2025", status: "completed", description: "Asset was installed and configured" },
    { event: "Assigned", date: "08/05/2025", status: "completed", description: "Asset assigned to department" },
    { event: "In Use", date: "08/05/2025", status: "active", description: "Currently in active use" },
    { event: "Request Maint.", date: "01/11/2025", status: "completed", description: "Maintenance request submitted" },
    { event: "Under Maint.", date: "01/11/2025", status: "completed", description: "Under maintenance" },
    { event: "Complete Maint.", date: "02/11/2025", status: "completed", description: "Maintenance completed" },
    { event: "Back to Service", date: "02/11/2025", status: "completed", description: "Asset back in service" }
  ];

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading timeline...</p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Timeline</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => navigate(`/asset/${id}`)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Asset
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <Breadcrumb
        items={[
          { label: "FM Module", path: "/asset" },
          { label: "Assets", path: "/asset" },
          { label: asset.name || `Asset #${id}`, path: `/asset/${id}` },
          { label: "Lifecycle Timeline" },
        ]}
      />

      <div className="mt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/asset/${id}`)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              Asset Lifecycle Timeline
            </h1>
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-8 shadow-sm">
          <div className="space-y-6">
            {timelineEvents.map((event, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center",
                    event.status === "active" ? "bg-primary" :
                    event.status === "highlight" ? "bg-destructive" : "bg-green-500"
                  )}>
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  {idx < timelineEvents.length - 1 && (
                    <div className="w-0.5 h-16 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-foreground">{event.event}</h3>
                      <span className="text-sm text-muted-foreground">{event.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineFullScreen;