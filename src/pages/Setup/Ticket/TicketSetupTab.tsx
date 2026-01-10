import React, { useState } from 'react';
import TicketCategoryType from './components/TicketCategoryType';
import TicketStatus from './components/TicketStatus';
import TicketOperationalDays from './components/TicketOperationalDays';

const TicketSetupTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'category' | 'status' | 'operational'>('category');

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="border-b border-border bg-card">
        <div className="flex">
          <button
            onClick={() => setActiveSubTab('category')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeSubTab === 'category'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Category Type
          </button>
          <button
            onClick={() => setActiveSubTab('status')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeSubTab === 'status'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Status
          </button>
          <button
            onClick={() => setActiveSubTab('operational')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeSubTab === 'operational'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Operational Days
          </button>
        </div>
      </div>

      {/* Sub-tab Content */}
      {activeSubTab === 'category' && <TicketCategoryType />}
      {activeSubTab === 'status' && <TicketStatus />}
      {activeSubTab === 'operational' && <TicketOperationalDays />}
    </div>
  );
};

export default TicketSetupTab;