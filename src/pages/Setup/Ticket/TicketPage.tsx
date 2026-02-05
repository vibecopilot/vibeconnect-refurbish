// import React, { useState } from 'react';
// import TicketSetupTab from './TicketSetupTab';
// import TicketEscalationTab from './TicketEscalationTab';
// import TicketCostApprovalTab from './TicketCostApprovalTab';

// const TicketPage: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<'setup' | 'escalation' | 'cost-approval'>('setup');

//   return (
//     <div className="space-y-6">
//       {/* Main Tab Navigation */}
//       <div className="border-b border-border bg-card">
//         <div className="flex">
//           <button
//             onClick={() => setActiveTab('setup')}
//             className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
//               activeTab === 'setup'
//                 ? 'border-primary text-primary bg-primary/5'
//                 : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
//             }`}
//           >
//             Setup
//           </button>
//           <button
//             onClick={() => setActiveTab('escalation')}
//             className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
//               activeTab === 'escalation'
//                 ? 'border-primary text-primary bg-primary/5'
//                 : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
//             }`}
//           >
//             Escalation Setup
//           </button>
//           <button
//             onClick={() => setActiveTab('cost-approval')}
//             className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
//               activeTab === 'cost-approval'
//                 ? 'border-primary text-primary bg-primary/5'
//                 : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
//             }`}
//           >
//             Cost Approval
//           </button>
//         </div>
//       </div>

//       {/* Tab Content */}
//       {activeTab === 'setup' && <TicketSetupTab />}
//       {activeTab === 'escalation' && <TicketEscalationTab />}
//       {activeTab === 'cost-approval' && <TicketCostApprovalTab />}
//     </div>
//   );
// };

// export default TicketPage;

import React, { useState } from 'react';
import TicketSetupTab from './TicketSetupTab';
import TicketEscalationTab from './TicketEscalationTab';
import TicketCostApprovalTab from './TicketCostApprovalTab';

const TicketPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'setup' | 'escalation' | 'cost-approval'>('setup');

  return (
    <div className="w-full">
      {/* Main Tab Navigation - Full Width with Equal Distribution */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="w-full flex">
          <button
            onClick={() => setActiveTab('setup')}
            className={`flex-1 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${
              activeTab === 'setup'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Setup
          </button>
          <button
            onClick={() => setActiveTab('escalation')}
            className={`flex-1 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${
              activeTab === 'escalation'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Escalation Setup
          </button>
          <button
            onClick={() => setActiveTab('cost-approval')}
            className={`flex-1 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${
              activeTab === 'cost-approval'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Cost Approval
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === 'setup' && <TicketSetupTab />}
        {activeTab === 'escalation' && <TicketEscalationTab />}
        {activeTab === 'cost-approval' && <TicketCostApprovalTab />}
      </div>
    </div>
  );
};

export default TicketPage;