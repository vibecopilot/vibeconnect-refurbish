import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';

const mainTabs = [
  { id: 'operational', label: 'Operational', path: '/audit/operational' },
  { id: 'vendor', label: 'Vendor', path: '/audit/vendor' },
];

const operationalSubTabs = [
  { id: 'scheduled', label: 'Scheduled', path: '/audit/operational/scheduled' },
  { id: 'conducted', label: 'Conducted', path: '/audit/operational/conducted' },
  { id: 'checklists', label: 'Checklists', path: '/audit/operational/checklists' },
];

const vendorSubTabs = [
  { id: 'scheduled', label: 'Scheduled', path: '/audit/vendor/scheduled' },
  { id: 'conducted', label: 'Conducted', path: '/audit/vendor/conducted' },
];

const AuditLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isOperational = location.pathname.includes('/audit/operational');
  const isVendor = location.pathname.includes('/audit/vendor');
  const currentMainTab = mainTabs.find(tab => location.pathname.startsWith(tab.path));
  const subTabs = isOperational ? operationalSubTabs : isVendor ? vendorSubTabs : [];
  const currentSubTab = subTabs.find(tab => location.pathname.startsWith(tab.path));

  const breadcrumbItems = [
    { label: 'FM Module', path: '/audit' },
    { label: 'Audit' },
    ...(currentMainTab ? [{ label: currentMainTab.label }] : []),
    ...(currentSubTab ? [{ label: currentSubTab.label }] : []),
  ];

  return (
    <div className="p-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* Sub-Tab Navigation (Scheduled / Conducted / Checklists) */}
      {/* Sub-Tab Navigation (Scheduled / Conducted / Checklists) */}
{subTabs.length > 0 && (
  <div className="mb-6">
    <nav className="flex gap-2 overflow-x-auto scrollbar-hide">
      {subTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => navigate(tab.path)}
          className={`px-4 py-2.5 text-sm whitespace-nowrap transition-colors relative uppercase
            ${location.pathname === tab.path
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          {tab.label}
          {location.pathname === tab.path && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all" />
          )}
        </button>
      ))}
    </nav>
  </div>
)}

      
      {/* Content Area */}
      <div className="bg-card border border-border rounded-lg p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AuditLayout;