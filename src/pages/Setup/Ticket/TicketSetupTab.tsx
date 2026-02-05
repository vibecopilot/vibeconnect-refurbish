// import React, { useState } from 'react';
// import TicketCategoryType from './components/TicketCategoryType';
// import TicketStatus from './components/TicketStatus';
// import TicketOperationalDays from './components/TicketOperationalDays';

// const TicketSetupTab: React.FC = () => {
//   const [activeSubTab, setActiveSubTab] = useState<'category' | 'status' | 'operational'>('category');

//   return (
//     <div className="space-y-6">
//       {/* Sub-tab Navigation */}
//       <div className="border-b border-border bg-card">
//         <div className="flex">
//           <button
//             onClick={() => setActiveSubTab('category')}
//             className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
//               activeSubTab === 'category'
//                 ? 'border-primary text-primary bg-primary/5'
//                 : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
//             }`}
//           >
//             Category Type
//           </button>
//           <button
//             onClick={() => setActiveSubTab('status')}
//             className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
//               activeSubTab === 'status'
//                 ? 'border-primary text-primary bg-primary/5'
//                 : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
//             }`}
//           >
//             Status
//           </button>
//           <button
//             onClick={() => setActiveSubTab('operational')}
//             className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
//               activeSubTab === 'operational'
//                 ? 'border-primary text-primary bg-primary/5'
//                 : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
//             }`}
//           >
//             Operational Days
//           </button>
//         </div>
//       </div>

//       {/* Sub-tab Content */}
//       {activeSubTab === 'category' && <TicketCategoryType />}
//       {activeSubTab === 'status' && <TicketStatus />}
//       {activeSubTab === 'operational' && <TicketOperationalDays />}
//     </div>
//   );
// };

// export default TicketSetupTab;

import React, { useState } from 'react';
import TicketCategoryType from './components/TicketCategoryType';
import TicketStatus from './components/TicketStatus';
import TicketOperationalDays from './components/TicketOperationalDays';

const TicketSetupTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'category' | 'status' | 'operational'>('category');

  return (
    <div className="w-full">
      {/* Sub-tab Navigation - Full Width with Equal Distribution */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="w-full flex">
          <button
            onClick={() => setActiveSubTab('category')}
            className={`flex-1 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${
              activeSubTab === 'category'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Category Type
          </button>
          <button
            onClick={() => setActiveSubTab('status')}
            className={`flex-1 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${
              activeSubTab === 'status'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Status
          </button>
          <button
            onClick={() => setActiveSubTab('operational')}
            className={`flex-1 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${
              activeSubTab === 'operational'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Operational Days
          </button>
        </div>
      </div>

      {/* Sub-tab Content */}
      <div className="w-full">
        {activeSubTab === 'category' && <TicketCategoryType />}
        {activeSubTab === 'status' && <TicketStatus />}
        {activeSubTab === 'operational' && <TicketOperationalDays />}
      </div>
    </div>
  );
};

export default TicketSetupTab;