import { useState } from 'react';
import Navbar from '../../components/Navbar';
import AccountingNavbar from '../../components/navbars/AccountingNavbar';
import { 
  FaFileInvoiceDollar, 
  FaMoneyBillWave, 
  FaBuilding, 
  FaCog, 
  FaPercent,
  FaReceipt,
  FaChartLine
} from 'react-icons/fa';
import AccountingBills from './Setup/AccountingBills';
import MonthlyExpense from './Setup/MonthlyExpense';
import UnitConfig from './Setup/UnitConfig';
import BillingConfiguration from './Setup/BillingConfiguration';
import InterestConfiguration from './Setup/InterestConfiguration';
import IncomeTracking from './Setup/IncomeTracking';
import ReconciliationReport from './Setup/ReconciliationReport';

const AccountingSetup = () => {
  const [activeSection, setActiveSection] = useState('accounting-bills');

  const menuItems = [
    { 
      id: 'accounting-bills', 
      label: 'Accounting Bills', 
      icon: <FaFileInvoiceDollar />,
      component: AccountingBills
    },
    { 
      id: 'monthly-expense', 
      label: 'Monthly Expense', 
      icon: <FaMoneyBillWave />,
      component: MonthlyExpense
    },
    { 
      id: 'unit-config', 
      label: 'Unit Configuration', 
      icon: <FaBuilding />,
      component: UnitConfig
    },
    { 
      id: 'billing-config', 
      label: 'Billing Configuration', 
      icon: <FaCog />,
      component: BillingConfiguration
    },
    { 
      id: 'interest-config', 
      label: 'Interest Configuration', 
      icon: <FaPercent />,
      component: InterestConfiguration
    },
    { 
      id: 'income-tracking', 
      label: 'Income Tracking', 
      icon: <FaReceipt />,
      component: IncomeTracking
    },
    { 
      id: 'reconciliation', 
      label: 'Reconciliation Report', 
      icon: <FaChartLine />,
      component: ReconciliationReport
    }
  ];

  const ActiveComponent = menuItems.find(item => item.id === activeSection)?.component;

  return (
    <section className="flex">
      <Navbar />
      <div className="w-full flex mx-3 flex-col overflow-hidden">
        <AccountingNavbar />
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Accounting Setup</h2>
              <p className="text-sm text-gray-500 mt-1">Configure accounting settings</p>
            </div>
            <nav className="p-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all ${
                    activeSection === item.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountingSetup;
