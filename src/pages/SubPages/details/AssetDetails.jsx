import React, { useEffect, useState } from "react";
import {
  AMCDetails,
  ActivityFeed,
  Assetinfo,
  History,
  PPM,
  Readings,
} from "./assetSubDetails";
import { getSiteAssetDetails } from "../../../api";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import AssetDetailsLogs from "./assetSubDetails/AssetDetailsLogs";
import CostOfOwnership from "./assetSubDetails/CostOfOwnership";
import AssetsDetailsAssociated from "./assetSubDetails/AssetsDetailsAssociated";
import {
  Loader2,
  AlertTriangle,
  Info,
  FileCheck,
  Gauge,
  Wrench
} from "lucide-react";

const AssetDetails = () => {
  const [page, setPage] = useState("assetInfo");
  const [asset, setAsset] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getDetails = async () => {
      setLoading(true);
      try {
        const details = await getSiteAssetDetails(id);
        setAsset(details.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching site asset details:", error);
        setError(error.message || "Failed to fetch asset details");
      } finally {
        setLoading(false);
      }
    };

    getDetails();
  }, [id]);

  console.log("asset", asset);

  const tabs = [
    { id: "assetInfo", label: "Asset Info", icon: Info },
    { id: "AMCDetails", label: "AMC Details", icon: FileCheck },
    { id: "readings", label: "Readings", icon: Gauge },
    { id: "ppm", label: "PPM", icon: Wrench },
  ];

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading asset details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Asset</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => navigate('/asset')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Assets
        </button>
      </div>
    );
  }

  // Determine breadcrumb path based on location state or asset type
  const getBreadcrumbPath = () => {
    if (location.state?.from === 'overview') {
      return { label: 'Overview', path: '/asset/overview' };
    }
    if (asset.is_meter) {
      return { label: 'Meter', path: '/asset/meter' };
    }
    return { label: 'Assets', path: '/asset' };
  };

  return (
    <section className="p-6">
      <Breadcrumb
        items={[
          { label: "FM Module", path: "/asset" },
          getBreadcrumbPath(),
          { label: asset.name || `Asset #${id}` },
        ]}
      />

      <div className="mt-6">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex flex-wrap gap-2 p-2 bg-muted rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200
                    ${
                      page === tab.id
                        ? "bg-card text-primary shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                    }
                  `}
                  onClick={() => setPage(tab.id)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {page === "assetInfo" && (
            <div>
              <Assetinfo assetData={asset} />
            </div>
          )}
          {page === "AMCDetails" && (
            <div>
              <AMCDetails />
            </div>
          )}
          {page === "readings" && (
            <div>
              <Readings />
            </div>
          )}
          {page === "ppm" && (
            <div>
              <PPM />
            </div>
          )}
          {page === "activityFeed" && (
            <div>
              <ActivityFeed />
            </div>
          )}
          {page === "logs" && (
            <div>
              <AssetDetailsLogs />
            </div>
          )}
          {page === "history" && (
            <div>
              <History />
            </div>
          )}
          {page === "costOfOwnership" && (
            <div>
              <CostOfOwnership />
            </div>
          )}
          {page === "associated" && (
            <div>
              <AssetsDetailsAssociated />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AssetDetails;