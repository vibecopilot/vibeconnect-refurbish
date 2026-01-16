import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import TabNavigation from '../../components/ui/TabNavigation';
import FitoutList from './FitoutList';
import FitOutSetupPage from './FitOutSetupPage';
import FitoutChecklistList from './FitoutChecklistList';

interface FitoutHubProps {
  initialTab?: 'setup' | 'requests' | 'checklist';
}

const FitoutHub: React.FC<FitoutHubProps> = ({ initialTab = 'requests' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    console.log('[FitoutHub] Rendering with tab:', initialTab);
    setActiveTab(initialTab);
  }, [initialTab]);

  const tabs = [
    { id: 'setup', label: 'Fitout Setup' },
    { id: 'requests', label: 'Fitout Requests' },
    { id: 'checklist', label: 'Fitout Checklist' },
  ];

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'Fitout' }]} />
      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId as 'setup' | 'requests' | 'checklist')} />

      {activeTab === 'setup' && (
        <div className="bg-card border border-border rounded-xl p-4">
          <FitOutSetupPage embedded />
        </div>
      )}

      {activeTab === 'requests' && (
        <FitoutList embedded />
      )}

      {activeTab === 'checklist' && (
        <div className="bg-card border border-border rounded-xl p-4">
          <FitoutChecklistList embedded />
        </div>
      )}
    </div>
  );
};

export default FitoutHub;
