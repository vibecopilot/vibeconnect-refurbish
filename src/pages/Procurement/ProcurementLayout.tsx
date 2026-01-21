import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';

const tabs = [
  { id: 'material-pr', label: 'Material PR', path: '/finance/procurement/material-pr' },
  { id: 'service-pr', label: 'Service PR', path: '/finance/procurement/service-pr' },
  { id: 'po', label: 'PO', path: '/finance/procurement/po' },
  { id: 'wo', label: 'WO', path: '/finance/procurement/wo' },
  { id: 'grn-srn', label: 'GRN/SRN', path: '/finance/procurement/grn-srn' },
  { id: 'auto-saved-pr', label: 'Auto Saved PR', path: '/finance/procurement/auto-saved-pr' },
  { id: 'pending-approvals', label: 'Pending Approvals', path: '/finance/procurement/pending-approvals' },
  { id: 'deletion-requests', label: 'Deletion Requests', path: '/finance/procurement/deletion-requests' },
  { id: 'deleted-prs', label: 'Deleted PRs', path: '/finance/procurement/deleted-prs' },
];

const ProcurementLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentTab = tabs.find(tab => location.pathname.startsWith(tab.path));
  const breadcrumbItems = [
    { label: 'Finance', path: '/finance/procurement' },
    { label: 'Procurement' },
    ...(currentTab ? [{ label: currentTab.label }] : []),
  ];

  // Default to first tab if on base route
  React.useEffect(() => {
    if (location.pathname === '/finance/procurement' || location.pathname === '/finance/procurement/') {
      navigate(tabs[0].path, { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="p-6">
      <Breadcrumb items={breadcrumbItems} />
      
      {/* Tab Navigation */}
      <div className="border-b border-border mb-6 mt-4">
        <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                location.pathname.startsWith(tab.path)
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Content Area */}
      <div className="bg-card border border-border rounded-lg p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default ProcurementLayout;