import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';

const tabs = [
  { id: 'visitors', label: 'Visitor', path: '/vms/visitors' },
  { id: 'registered-vehicles', label: 'Registered Vehicles', path: '/vms/registered-vehicles' },
  { id: 'staff', label: 'Staff', path: '/vms/staff' },
  { id: 'patrolling', label: 'Patrolling', path: '/vms/patrolling' },
  { id: 'goods-in-out', label: 'Goods In/Out', path: '/vms/goods-in-out' },
];

const VMSLayout: React.FC = () => {
  const location = useLocation();
  
  // Get current tab name for breadcrumb
  const currentTab = tabs.find(tab => location.pathname.startsWith(tab.path));
  const breadcrumbItems = [
    { label: 'Security', path: '/vms' },
    ...(currentTab ? [{ label: currentTab.label }] : []),
  ];

  return (
    <div className="p-6">
      {/* Content Area - no breadcrumb as requested */}
      <div className="bg-card border border-border rounded-lg p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default VMSLayout;
