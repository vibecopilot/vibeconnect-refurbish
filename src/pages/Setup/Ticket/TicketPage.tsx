import React, { useState } from 'react';
import TicketSetupTab from './TicketSetupTab';
import TicketEscalationTab from './TicketEscalationTab';
import TicketCostApprovalTab from './TicketCostApprovalTab';

const TicketPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'setup' | 'escalation' | 'cost-approval'>('setup');

  return (
    <div className="space-y-6">
      {/* Main Tab Navigation */}
      <div className="border-b border-border bg-card">
        <div className="flex">
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'setup'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Setup
          </button>
          <button
            onClick={() => setActiveTab('escalation')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'escalation'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Escalation Setup
          </button>
          <button
            onClick={() => setActiveTab('cost-approval')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'cost-approval'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Cost Approval
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'setup' && <TicketSetupTab />}
      {activeTab === 'escalation' && <TicketEscalationTab />}
      {activeTab === 'cost-approval' && <TicketCostApprovalTab />}
    </div>
  );
};

export default TicketPage;