import React, { useState, useEffect } from 'react';
import { getItemInLocalStorage } from '../../utils/localStorage';
import FloorPage from './Account/FloorPage';
import UnitPage from './Account/UnitPage';
import UsersPage from './users/UsersPage';
import AssetGroupPage from './AssetStock/AssetGroupPage';
import TicketPage from './Ticket/TicketPage';
import BusinessSetup from '../SubPages/BusinessSetup';
import SetupBookingFacility from '../SubPages/SetupBookingFacility';
import ParkingSetup from './ParkingSetup';
import AddressesSetup from './AddressSetup/AddressSetup';
import PermitSetup from './PermitSetup';
import UserRolesSetup from './UserRolesSetup';
import FMUserSetupNew from './FMUserSetupNew';
import IncidentSetup from './IncidentSetupPages/IncidentSetup';
import ComplianceSetup from './ComplianceSetupPages/ComplianceSetup';
import SupplierSetup from './Supplier/SupplierSetup';
import VisitorSetup from './VisitorSetup';
import BillingSetup from './BillingSetup/BillingSetup';
import MeterCategoryType from './MeterCategoryType/MeterCategoryType';
import InvoiceApprovalSetup from './InvoiceApprovalSetupPages/InvoiceApprovalSetup';
import CommunicationSetupControl from './CommunicationSetup/CommunicationSetupControl';
import UserTreePage from './UserTree/UserTreePage';

interface SetupModule {
  id: string;
  name: string;
  feature?: string;
  siteIdRequired?: number;
}

interface SetupCategory {
  id: string;
  label: string;
  modules: SetupModule[];
}

const SetupPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [activeModule, setActiveModule] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<string>('');
  const [allowedFeatures, setAllowedFeatures] = useState<string[]>([]);
  const siteId = getItemInLocalStorage('SITEID');

  useEffect(() => {
    const storedFeatures = getItemInLocalStorage('FEATURES');
    if (storedFeatures && Array.isArray(storedFeatures)) {
      setAllowedFeatures(storedFeatures.map((feature: any) => feature.feature_name));
    }
  }, []);

  const setupCategories: SetupCategory[] = [
    {
      id: 'general',
      label: 'GENERAL',
      modules: [
        { id: 'account', name: 'Account' },
        { id: 'users', name: 'Users' },
        { id: 'user-roles', name: 'User Roles', siteIdRequired: 10 },
        { id: 'fm-user', name: 'FM User', siteIdRequired: 10 },
      ],
    },
    {
      id: 'fm-module',
      label: 'FM MODULE',
      modules: [
        { id: 'asset-group', name: 'Asset/Stock Group', feature: 'assets' },
        { id: 'master-checklist', name: 'Master Checklist', feature: 'assets' },
        { id: 'meter-category', name: 'Meter Category Type', feature: 'assets' },
      ],
    },
    {
      id: 'service-desk',
      label: 'SERVICE DESK',
      modules: [
        { id: 'ticket', name: 'Ticket', feature: 'tickets' },
      ],
    },
    {
      id: 'crm',
      label: 'CRM',
      modules: [
        { id: 'contact-category', name: 'Contact Category', feature: 'contacts' },
        { id: 'supplier', name: 'Supplier', feature: 'vendors' },
        { id: 'visitor', name: 'Visitor', feature: 'gatepass' },
        { id: 'visitor-alerts', name: 'Visitor Alerts', feature: 'gatepass' },
      ],
    },
    {
      id: 'value-added',
      label: 'VALUE ADDED SERVICES',
      modules: [
        { id: 'workspace-booking', name: 'Workspace Booking', feature: 'space' },
        { id: 'fnb', name: 'F&B', feature: 'fnb' },
      ],
    },
    {
      id: 'finance',
      label: 'FINANCE',
      modules: [
        { id: 'invoice-approval', name: 'Invoice Approval', feature: 'bills' },
        { id: 'billing', name: 'Billing', feature: 'cam_bill' },
        { id: 'addresses', name: 'Addresses', feature: 'purchase_order' },
        { id: 'sac-hsn', name: 'SAC/HSN Setup', feature: 'purchase_order' },
      ],
    },
    {
      id: 'booking',
      label: 'BOOKING MANAGEMENT',
      modules: [
        { id: 'parking', name: 'Parking', feature: 'parking' },
      ],
    },
    {
      id: 'transitioning',
      label: 'TRANSITIONING',
      modules: [
        { id: 'permit', name: 'Permit', feature: 'permits' },
      ],
    },
    {
      id: 'compliance',
      label: 'COMPLIANCE',
      modules: [
        { id: 'incidents', name: 'Incidents Setup', feature: 'incidents' },
        { id: 'compliance-setup', name: 'Compliance Setup', feature: 'compliance' },
        { id: 'communication', name: 'Communication Setup Control', feature: 'communication' },
      ],
    },
   {
      id: 'usertree',
      label: 'USER-TREE',
      modules: [{ id: 'usertree', name: 'User Tree View' }],
    },
  ];

  const isModuleVisible = (module: SetupModule): boolean => {
    if (module.siteIdRequired && siteId !== module.siteIdRequired) {
      return false;
    }
    if (module.feature && !allowedFeatures.includes(module.feature)) {
      return false;
    }
    return true;
  };

  const getVisibleCategories = (): SetupCategory[] => {
    return setupCategories
      .map((category) => ({
        ...category,
        modules: category.modules.filter(isModuleVisible),
      }))
      .filter((category) => category.modules.length > 0);
  };

  const visibleCategories = getVisibleCategories();
  const currentCategory = visibleCategories.find((cat) => cat.id === activeCategory);

  // Set default module when category changes (only when switching categories)
  useEffect(() => {
    if (currentCategory && currentCategory.modules.length > 0) {
      setActiveModule(currentCategory.modules[0].id);
      // Set default sub-tab for account
      if (currentCategory.modules[0].id === 'account') {
        setActiveSubTab('floor');
      } else {
        setActiveSubTab('');
      }
    }
  }, [activeCategory]);

  // Render module content
  const renderModuleContent = () => {
    if (activeModule === 'account') {
      return (
        <div>
          {/* Account Sub-tabs */}
          <div className="border-b border-border bg-card mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveSubTab('floor')}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeSubTab === 'floor'
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Floor
              </button>
              <button
                onClick={() => setActiveSubTab('unit')}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeSubTab === 'unit'
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Unit
              </button>
            </div>
          </div>

          {/* Account Sub-tab Content */}
          {activeSubTab === 'floor' && <FloorPage />}
          {activeSubTab === 'unit' && <UnitPage />}
        </div>
      );
    }

    if (activeModule === 'users') {
      return <UsersPage />;
    }

    if (activeModule === 'user-roles') {
      return <UserRolesSetup />;
    }

    if (activeModule === 'fm-user') {
      return <FMUserSetupNew />;
    }

    if (activeModule === 'asset-group') {
      return <AssetGroupPage />;
    }

    if (activeModule === 'meter-category') {
      return <MeterCategoryType />;
    }

    if (activeModule === 'ticket') {
      return <TicketPage />;
    }

    if (activeModule === 'contact-category') {
      return <BusinessSetup />;
    }

    if (activeModule === 'supplier') {
      return <SupplierSetup />;
    }

    if (activeModule === 'visitor') {
      return <VisitorSetup />;
    }

    if (activeModule === 'workspace-booking') {
      return <SetupBookingFacility />;
    }

    if (activeModule === 'parking') {
      return <ParkingSetup />;
    }

    if (activeModule === 'addresses') {
      return <AddressesSetup />;
    }

    if (activeModule === 'billing') {
      return <BillingSetup />;
    }

    if (activeModule === 'invoice-approval') {
      return <InvoiceApprovalSetup />;
    }

    if (activeModule === 'permit') {
      return <PermitSetup />;
    }

    if (activeModule === 'incidents') {
      return <IncidentSetup />;
    }

    if (activeModule === 'compliance-setup') {
      return <ComplianceSetup />;
    }

    if (activeModule === 'communication') {
      return <CommunicationSetupControl />;
    }

    if(activeModule==='usertree')
    {
      return <UserTreePage/>
    }

    // Placeholder for other modules
    return (
      <div className="text-center py-12 bg-card border border-border rounded-lg">
        <p className="text-lg font-medium text-foreground mb-2">
          {currentCategory?.modules.find((m) => m.id === activeModule)?.name}
        </p>
        <p className="text-sm text-muted-foreground">
          This module is under development
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Setup Modules</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure and manage your system settings
          </p>
        </div>

        {/* Level 1: Category Tabs (GENERAL, FM MODULE, etc.) */}
        <div className="w-full overflow-x-auto">
          <div className="flex w-full min-w-max">
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 uppercase ${
                  activeCategory === category.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Level 2: Module Tabs (Account, Users, etc.) */}
      {currentCategory &&
  currentCategory.id !== 'usertree' &&
  currentCategory.modules.length > 0 && (
    <div className="border-b border-border bg-card">
      <div className="w-full overflow-x-auto">
        <div className="flex w-full min-w-max px-6">
          {currentCategory.modules.map((module) => (
            <button
              key={module.id}
              onClick={() => {
                setActiveModule(module.id);
                setActiveSubTab(module.id === 'account' ? 'floor' : '');
              }}
              className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 ${
                activeModule === module.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground'
              }`}
            >
              {module.name}
            </button>
          ))}
        </div>
      </div>
    </div>
)}


      {/* Level 3: Module Content */}
      <div className="p-6">
        {renderModuleContent()}
      </div>
    </div>
  );
};

export default SetupPage;
