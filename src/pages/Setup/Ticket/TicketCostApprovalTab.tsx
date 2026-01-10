import React, { useState } from 'react';
import FMCostApproval from './components/FMCostApproval';
import ProjectCostApproval from './components/ProjectCostApproval';
import ToggleSwitch from '../../../Buttons/ToggleSwitch';

const TicketCostApprovalTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'fm' | 'project'>('fm');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 bg-card border border-border rounded-lg px-4 py-3">
        <span className="text-sm font-medium text-foreground">Approval Level:</span>
        <div className="flex items-center gap-3 text-sm">
          <span>Access Level</span>
          <ToggleSwitch />
          <span>User Level</span>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="border-b border-border bg-card">
        <div className="flex">
          <button
            onClick={() => setActiveSubTab('fm')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeSubTab === 'fm'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            FM
          </button>
          <button
            onClick={() => setActiveSubTab('project')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeSubTab === 'project'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Project
          </button>
        </div>
      </div>

      {/* Sub-tab Content */}
      {activeSubTab === 'fm' && <FMCostApproval />}
      {activeSubTab === 'project' && <ProjectCostApproval />}
    </div>
  );
};

export default TicketCostApprovalTab;
