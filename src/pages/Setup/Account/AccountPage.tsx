import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import FloorPage from './FloorPage';
import UnitPage from './UnitPage';

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'floor' | 'unit'>('floor');

  const tabs = [
    { id: 'floor' as const, label: 'Floor' },
    { id: 'unit' as const, label: 'Unit' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Account Setup</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage floors and units in your organization
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Tabs */}
        <div className="w-full overflow-x-auto">
          <div className="flex w-full min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {activeTab === 'floor' && <FloorPage />}
        {activeTab === 'unit' && <UnitPage />}
      </div>
    </div>
  );
};

export default AccountPage;