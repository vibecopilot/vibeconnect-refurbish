import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', path: '/training/module/dashboard' },
  { id: 'training-programs', label: 'Training Programs', path: '/training/module/training-programs' },
  { id: 'training-sessions', label: 'Training Sessions', path: '/training/module/training-sessions' },
  { id: 'training-materials', label: 'Training Materials', path: '/training/module/training-materials' },
];

const TrainingLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentTab = tabs.find(tab => location.pathname.startsWith(tab.path));
  const breadcrumbItems = [
    { label: 'Training', path: '/training/module' },
    { label: 'Training Module' },
    ...(currentTab ? [{ label: currentTab.label }] : []),
  ];

  // Default to dashboard if on base route
  React.useEffect(() => {
    if (location.pathname === '/training/module' || location.pathname === '/training/module/') {
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

export default TrainingLayout;
