import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getItemInLocalStorage } from '../../utils/localStorage';

interface SetupModule {
  id: string;
  name: string;
  path: string;
  feature?: string;
  siteIdRequired?: number;
  subTabs?: { id: string; name: string; path: string }[];
}

interface SetupCategory {
  id: string;
  label: string;
  modules: SetupModule[];
}

const SetupLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [allowedFeatures, setAllowedFeatures] = useState<string[]>([]);
  const siteId = getItemInLocalStorage('SITEID');

  // Parse URL path to extract category, module, and subTab
  // URL format: /setup/{category}/{module}/{subTab?}
  const pathParts = location.pathname.replace('/setup/', '').split('/').filter(Boolean);
  const urlCategory = pathParts[0] || '';
  const urlModule = pathParts[1] || '';
  const urlSubTab = pathParts[2] || '';

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
        {
          id: 'account',
          name: 'Account',
          path: '/setup/general/account/floor',
          subTabs: [
            { id: 'floor', name: 'Floor', path: '/setup/general/account/floor' },
            { id: 'unit', name: 'Unit', path: '/setup/general/account/unit' },
          ]
        },
        { id: 'users', name: 'Users', path: '/setup/general/users' },
        { id: 'user-roles', name: 'User Roles', path: '/setup/general/user-roles', siteIdRequired: 10 },
        { id: 'fm-user', name: 'FM User', path: '/setup/general/fm-user', siteIdRequired: 10 },
      ],
    },
    {
      id: 'fm-module',
      label: 'FM MODULE',
      modules: [
        { id: 'asset-group', name: 'Asset/Stock Group', path: '/setup/fm-module/asset-group', feature: 'assets' },
        { id: 'master-checklist', name: 'Master Checklist', path: '/setup/fm-module/master-checklist', feature: 'assets' },
        { id: 'meter-category', name: 'Meter Category Type', path: '/setup/fm-module/meter-category', feature: 'assets' },
      ],
    },
    {
      id: 'service-desk',
      label: 'SERVICE DESK',
      modules: [
        { id: 'ticket', name: 'Ticket', path: '/setup/service-desk/ticket', feature: 'tickets' },
      ],
    },
    {
      id: 'crm',
      label: 'CRM',
      modules: [
        { id: 'contact-category', name: 'Contact Category', path: '/setup/crm/contact-category', feature: 'contacts' },
        { id: 'supplier', name: 'Supplier', path: '/setup/crm/supplier', feature: 'vendors' },
        { id: 'visitor', name: 'Visitor', path: '/setup/crm/visitor', feature: 'gatepass' },
        { id: 'visitor-alerts', name: 'Visitor Alerts', path: '/setup/crm/visitor-alerts', feature: 'gatepass' },
      ],
    },
    {
      id: 'value-added',
      label: 'VALUE ADDED SERVICES',
      modules: [
        { id: 'workspace-booking', name: 'Workspace Booking', path: '/setup/value-added/workspace-booking', feature: 'space' },
        { id: 'fnb', name: 'F&B', path: '/setup/value-added/fnb', feature: 'fnb' },
      ],
    },
    {
      id: 'finance',
      label: 'FINANCE',
      modules: [
        { id: 'invoice-approval', name: 'Invoice Approval', path: '/setup/finance/invoice-approval', feature: 'bills' },
        { id: 'billing', name: 'Billing', path: '/setup/finance/billing', feature: 'cam_bill' },
        { id: 'addresses', name: 'Addresses', path: '/setup/finance/addresses', feature: 'purchase_order' },
        { id: 'sac-hsn', name: 'SAC/HSN Setup', path: '/setup/finance/sac-hsn', feature: 'purchase_order' },
      ],
    },
    {
      id: 'booking',
      label: 'BOOKING MANAGEMENT',
      modules: [
        { id: 'parking', name: 'Parking', path: '/setup/booking/parking', feature: 'parking' },
        { id: 'fb-setup', name: 'F&B Setup', path: '/setup/booking/fb-setup', feature: 'fnb' },
      ],
    },
    {
      id: 'transitioning',
      label: 'TRANSITIONING',
      modules: [
        { id: 'permit', name: 'Permit', path: '/setup/transitioning/permit', feature: 'permits' },
        { id: 'incidents', name: 'Incidents Setup', path: '/setup/transitioning/incidents', feature: 'incidents' },
      ],
    },
    {
      id: 'compliance',
      label: 'COMPLIANCE',
      modules: [
        { id: 'communication', name: 'Communication Setup Control', path: '/setup/compliance/communication', feature: 'communication' },
        { id: 'revamp-compliance', name: 'Compliance Setup', path: '/setup/compliance/revamp-compliance', feature: 'compliance' },
      ],
    },
    {
      id: 'usertree',
      label: 'USER-TREE',
      modules: [{ id: 'usertree', name: 'User Tree View', path: '/setup/usertree/usertree' }],
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

  // Derive active values from URL params with fallbacks
  const activeCategory = urlCategory || (visibleCategories[0]?.id || 'general');
  const currentCategory = visibleCategories.find((cat) => cat.id === activeCategory);

  // Get active module from URL
  const activeModule = urlModule || currentCategory?.modules[0]?.id || '';
  const currentModule = currentCategory?.modules.find((m) => m.id === activeModule);

  // Get active subTab (for account module)
  const activeSubTab = urlSubTab || '';

  // Redirect to proper URL if on base /setup route
  useEffect(() => {
    if (location.pathname === '/setup' || location.pathname === '/setup/') {
      if (visibleCategories.length > 0) {
        const firstCategory = visibleCategories[0];
        const firstModule = firstCategory.modules[0];
        navigate(firstModule.path, { replace: true });
      }
    }
  }, [location.pathname, visibleCategories, navigate]);

  // Navigation handlers
  const handleCategoryChange = (categoryId: string) => {
    const category = visibleCategories.find((cat) => cat.id === categoryId);
    if (category && category.modules.length > 0) {
      navigate(category.modules[0].path);
    }
  };

  const handleModuleChange = (module: SetupModule) => {
    navigate(module.path);
  };

  const handleSubTabChange = (path: string) => {
    navigate(path);
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
                onClick={() => handleCategoryChange(category.id)}
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
                    onClick={() => handleModuleChange(module)}
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

      {/* Level 3: Sub-tabs (for Account: Floor, Unit) */}
      {currentModule?.subTabs && currentModule.subTabs.length > 0 && (
        <div className="border-b border-border bg-card">
          <div className="flex px-6">
            {currentModule.subTabs.map((subTab) => (
              <button
                key={subTab.id}
                onClick={() => handleSubTabChange(subTab.path)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeSubTab === subTab.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {subTab.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Area - Outlet renders the matched child route */}
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default SetupLayout;
