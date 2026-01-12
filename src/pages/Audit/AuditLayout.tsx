import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Breadcrumb from "../../components/ui/Breadcrumb";

const AuditLayout: React.FC = () => {
  const location = useLocation();

  const isOperational = location.pathname.includes("/audit/operational");
  const isVendor = location.pathname.includes("/audit/vendor");
  const currentAuditType = isOperational ? "Operational" : isVendor ? "Vendor" : "";
  
  // Determine current sub-tab from path
  const pathParts = location.pathname.split('/');
  const currentSubTab = pathParts[3] ? pathParts[3].charAt(0).toUpperCase() + pathParts[3].slice(1) : "";

  const breadcrumbItems = [
    { label: "FM Module", path: "/audit" },
    { label: "Audit" },
    ...(currentAuditType ? [{ label: currentAuditType }] : []),
    ...(currentSubTab ? [{ label: currentSubTab }] : []),
  ];

  return (
    <div className="p-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* Content Area */}
      <div className="bg-card border border-border rounded-lg p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AuditLayout;
