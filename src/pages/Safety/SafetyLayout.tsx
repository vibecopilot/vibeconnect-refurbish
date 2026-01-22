import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', path: '/safety/module/dashboard' },
  { id: 'safety-measures', label: 'Safety Measures', path: '/safety/module/safety-measures' },
  { id: 'safety-checklists', label: 'Safety Checklists', path: '/safety/module/safety-checklists' },
  { id: 'safety-inspections', label: 'Safety Inspections', path: '/safety/module/safety-inspections' },
];

const SafetyLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentTab = tabs.find(tab => location.pathname.startsWith(tab.path));
  const breadcrumbItems = [
    { label: 'Safety', path: '/safety/module' },
    { label: 'Safety Module' },
    ...(currentTab ? [{ label: currentTab.label }] : []),
  ];

  // Default to dashboard if on base route
  React.useEffect(() => {
    if (location.pathname === '/safety/module' || location.pathname === '/safety/module/') {
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

export default SafetyLayout;