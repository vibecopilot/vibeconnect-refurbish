import React, { useState } from 'react';
import ResponseEscalation from './components/ResponseEscalation';
import ResolutionEscalation from './components/ResolutionEscalation';

const TicketEscalationTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'response' | 'resolution'>('response');

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="border-b border-border bg-card">
        <div className="flex">
          <button
            onClick={() => setActiveSubTab('response')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeSubTab === 'response'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Response Escalation
          </button>
          <button
            onClick={() => setActiveSubTab('resolution')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeSubTab === 'resolution'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Resolution Escalation
          </button>
        </div>
      </div>

      {/* Sub-tab Content */}
      {activeSubTab === 'response' && <ResponseEscalation />}
      {activeSubTab === 'resolution' && <ResolutionEscalation />}
    </div>
  );
};

export default TicketEscalationTab;