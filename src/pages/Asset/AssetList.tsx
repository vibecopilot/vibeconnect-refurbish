import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ListToolbar from '../../components/ui/ListToolbar';
import { AssetMainList, AMCList, MeterList, ChecklistList, RoutineTaskList, PPMChecklistList, PPMActivityList, PPMCalendar, StockItemsList,AssetOverview } from './submodules';

const AssetList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [exportCallback, setExportCallback] = useState<(() => void) | null>(null);
  const [qrCallback, setQrCallback] = useState<(() => void) | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isChecklistImportOpen, setIsChecklistImportOpen] = useState(false);
  // Records per page: 12 for grid, 10 for table
  const recordsPerPage = viewMode === 'grid' ? 12 : 10;

  // Derive active tab from URL path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/asset') return 'asset';
    if (path === '/asset/amc') return 'amc';
    if (path === '/asset/meter') return 'meter';
    if (path === '/asset/checklist') return 'checklist';
    if (path === '/asset/routine-task') return 'routine-task';
    if (path === '/asset/ppm-checklist') return 'ppm-checklist';
    if (path === '/asset/ppm-activity') return 'ppm-activity';
    if (path === '/asset/ppm-calendar') return 'ppm-calendar';
    if (path === '/asset/stock-items') return 'stock-items';
    if (path === '/asset/overview') return 'overview'; // ✅ Add this
    return 'asset';
  };

  const activeTab = getActiveTab();

  const handleSearch = (value: string) => setSearchValue(value);

  // Tabs with Add button
  const submodulesWithCreate = ['asset', 'meter', 'checklist', 'ppm-checklist'];

  // Tabs with Filter button
  const tabsWithFilter = ['asset', 'meter'];

  // Tabs with QR Code button
  const tabsWithQrCode = ['asset'];

  // Tabs with Export button
  const tabsWithExport = ['asset', 'amc', 'checklist'];

  // Tabs with Import button
  const tabsWithImport = ['asset', 'checklist'];

  const getAddPath = () => {
    if (!submodulesWithCreate.includes(activeTab)) return '';
    const paths: Record<string, string> = {
      'asset': '/asset/create',
      'meter': '/asset/meter/create',
      'checklist': '/asset/checklist/create',
      'ppm-checklist': '/asset/ppm-checklist/create',
    };
    return paths[activeTab] || '';
  };

  const getAddLabel = () => {
    if (!submodulesWithCreate.includes(activeTab)) return '';
    const labels: Record<string, string> = {
      'asset': 'Add Asset',
      'meter': 'Add Meter',
      'checklist': 'Add Checklist',
      'ppm-checklist': 'Add PPM Checklist',
    };
    return labels[activeTab] || '';
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      'asset': 'Assets',
      'amc': 'AMC',
      'meter': 'Meter',
      'checklist': 'Checklist',
      'routine-task': 'Routine Task',
      'ppm-checklist': 'PPM Checklist',
      'ppm-activity': 'PPM Activity',
      'ppm-calendar': 'PPM Calendar',
      'stock-items': 'Stock Items',
       'overview': 'Overview', // ✅ Add this
    };
    return titles[activeTab] || 'Assets';
  };

  const getBreadcrumbs = () => {
    const base = [{ label: 'Asset', path: '/asset' }];
    if (activeTab !== 'asset') {
      base.push({ label: getPageTitle() });
    }
    return base;
  };

  const renderContent = () => {
    const commonProps = {
      viewMode,
      searchValue,
      perPage: recordsPerPage,
      isFilterOpen,
      setIsFilterOpen,
      isColumnMenuOpen,
      setIsColumnMenuOpen,
    };

    switch (activeTab) {
      case 'asset': 
        return (
          <AssetMainList 
            {...commonProps} 
            isImportOpen={isImportOpen} 
            setIsImportOpen={setIsImportOpen} 
            onExportSet={setExportCallback}
            onQrSet={setQrCallback}
          />
        );
      case 'amc': 
        return <AMCList {...commonProps} onExportSet={setExportCallback} />;
      case 'meter': 
        return <MeterList {...commonProps} />;
      case 'checklist': 
  return (
    <ChecklistList 
      {...commonProps} 
      onExportSet={setExportCallback}
      isImportOpen={isChecklistImportOpen} // ✅ Use separate state
      setIsImportOpen={setIsChecklistImportOpen} // ✅ Use separate state
    />
  );
      case 'routine-task': 
        return <RoutineTaskList {...commonProps} />;
      case 'ppm-checklist': 
        return <PPMChecklistList {...commonProps} />;
      case 'ppm-activity': 
        return <PPMActivityList {...commonProps} />;
      case 'ppm-calendar': 
        return <PPMCalendar searchValue={searchValue} />;
      case 'stock-items': 
        return <StockItemsList {...commonProps} />;
      case 'overview': 
        return <AssetOverview />; // ✅ Add this
      default: 
        return <AssetMainList {...commonProps} isImportOpen={isImportOpen} setIsImportOpen={setIsImportOpen} onExportSet={setExportCallback} onQrSet={setQrCallback} />;
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb items={getBreadcrumbs()} />

     <ListToolbar
  searchPlaceholder={`Search ${activeTab.replace('-', ' ')}...`}
  searchValue={searchValue}
  onSearchChange={handleSearch}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  showViewToggle={activeTab !== 'ppm-calendar' && activeTab !== 'overview'} // ✅ Hide for overview
  onFilter={tabsWithFilter.includes(activeTab) ? () => setIsFilterOpen(true) : undefined}
  onExport={tabsWithExport.includes(activeTab) ? (exportCallback || (() => {})) : undefined}
  onAdd={getAddLabel() ? () => navigate(getAddPath()) : undefined}
  addLabel={getAddLabel()}
  showQrCode={tabsWithQrCode.includes(activeTab)}
  onQrCode={tabsWithQrCode.includes(activeTab) ? qrCallback || undefined : undefined}
  additionalButtons={
    activeTab !== 'overview' ? ( // ✅ Hide buttons for overview
      <>
        {tabsWithImport.includes(activeTab) && (
          <button
            onClick={() => {
              if (activeTab === 'asset') {
                setIsImportOpen(true);
              } else if (activeTab === 'checklist') {
                setIsChecklistImportOpen(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent"
          >
            Import
          </button>
        )}
        
        <button
          onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent"
        >
          Hide Columns
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </>
    ) : null
  }
/>

      {renderContent()}
    </div>
  );
};

export default AssetList;