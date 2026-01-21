import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarCheck, LayoutDashboard } from "lucide-react";
import Breadcrumb from "../../components/ui/Breadcrumb";
import TabNavigation from "../../components/ui/TabNavigation";
import OnDemandDashboard from "./OnDemandDashboard";
import OnDemandBookings from "./OnDemandBookings";

interface OnDemandServiceHubProps {
  initialTab?: "dashboard" | "bookings";
}

const OnDemandServiceHub: React.FC<OnDemandServiceHubProps> = ({
  initialTab = "dashboard",
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "bookings", label: "Bookings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  On Demand Service
                </h1>
                <p className="text-xs text-muted-foreground">
                  Manage service bookings and requests
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <Breadcrumb
          items={[
            { label: "Booking Management", path: "/booking" },
            { label: "On Demand Service" },
          ]}
        />

        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) =>
            setActiveTab(tabId as "dashboard" | "bookings")
          }
        />

        {activeTab === "dashboard" && <OnDemandDashboard />}

        {activeTab === "bookings" && <OnDemandBookings />}
      </div>
    </div>
  );
};

export default OnDemandServiceHub;