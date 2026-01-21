import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Loader2, AlertTriangle } from "lucide-react";
import { getSiteAssetDetails } from "../../../../api";
import Breadcrumb from "../../../../components/ui/Breadcrumb";

const AssetDetailsFullScreen = () => {
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

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading asset details...</p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Asset</h3>
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
          { label: "Asset Details" },
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
              <Package className="h-6 w-6 text-primary" />
              Asset Details
            </h1>
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Asset Number</p>
              <p className="font-semibold text-lg">{asset.asset_number || "-"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Serial Number</p>
              <p className="font-semibold text-lg">{asset.serial_number || "-"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Asset Name</p>
              <p className="font-semibold text-lg">{asset.name || "-"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Group</p>
              <p className="font-semibold text-lg">{asset.group_name || "-"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Model Number</p>
              <p className="font-semibold text-lg">{asset.model_number || "-"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Department</p>
              <p className="font-semibold text-lg">{asset.unit_name || "-"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Building</p>
              <p className="font-semibold text-lg">{asset.building_name || "-"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Floor</p>
              <p className="font-semibold text-lg">{asset.floor_name || "-"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Manufacturer</p>
              <p className="font-semibold text-lg">{asset.manufacturer || "-"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Purchase Cost</p>
              <p className="font-semibold text-lg text-primary">
                ₹{asset.purchase_cost ? parseFloat(asset.purchase_cost).toLocaleString() : "0"}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Purchase Date</p>
              <p className="font-semibold text-lg">{asset.purchased_on || "-"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Status</p>
              <p className="font-semibold text-lg">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  asset.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}>
                  {asset.active ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailsFullScreen;