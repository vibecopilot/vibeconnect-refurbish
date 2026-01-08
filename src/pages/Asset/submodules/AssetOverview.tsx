import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Package, Wrench, AlertTriangle, ClipboardCheck, Calendar, FileText, Eye, EyeOff, Grid, List, Edit2 } from 'lucide-react';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../../components/ui/StatusBadge';
import { getSiteAsset } from '../../../api';
import { Asset } from '../../../services/asset.service';

const AssetOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [activeCard, setActiveCard] = useState<string>('all');
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    inUse: 0,
    breakdown: 0,
    activities: 0,
    ppm: 0,
    amc: 0,
  });

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSiteAsset(pagination.page);
      const assets = response.data.site_assets;
      
      // Sort by created_at DESC
      const sortedAssets = assets.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const breakdownAssets = assets.filter((asset: any) => asset.breakdown === true);
      const inUseAssets = assets.filter((asset: any) => asset.breakdown === false || asset.breakdown === null);

      setAllAssets(sortedAssets);
      setFilteredAssets(sortedAssets);
      setStats({
        total: assets.length,
        inUse: inUseAssets.length,
        breakdown: breakdownAssets.length,
        activities: 0, // TODO: Implement when API available
        ppm: 0, // TODO: Implement when API available
        amc: 0, // TODO: Implement when API available
      });
      
      // Set pagination
      setPagination(prev => ({
        ...prev,
        total: assets.length,
        totalPages: Math.ceil(assets.length / prev.perPage),
      }));
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleCardClick = (cardType: string) => {
    setActiveCard(cardType);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when switching cards
    
    // For now, we'll filter the already fetched data
    // In a real implementation, you would make a new API call with the filter
    switch (cardType) {
      case 'all':
        setFilteredAssets(allAssets);
        break;
      case 'inUse':
        setFilteredAssets(allAssets.filter((asset: any) => !asset.breakdown));
        break;
      case 'breakdown':
        setFilteredAssets(allAssets.filter((asset: any) => asset.breakdown));
        break;
      case 'activities':
      case 'ppm':
      case 'amc':
        // TODO: Implement filtering when data available
        setFilteredAssets([]);
        break;
      default:
        setFilteredAssets(allAssets);
    }
  };

  const getAssetStatus = (asset: any): StatusType => {
    if (asset.breakdown) return 'breakdown';
    return 'in-use';
  };

  const dateFormat = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

const columns: Array<TableColumn<any> & { id: string; label: string }> = [
  { 
    id: 'action', 
    label: 'Action', 
    key: 'action',  // ✅ unique key
    header: 'Action', 
    width: '100px',
    render: (_, row) => {
      console.log('Rendering action column for row:', row.id);
      return (
        <div className="flex items-center gap-3">
          <Link to={`/assets/asset-details/${row.id}`} className="text-primary hover:text-primary/80">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/assets/edit-asset/${row.id}`} className="text-primary hover:text-primary/80">
            <Edit2 className="w-4 h-4" />
          </Link>
        </div>
      );
    }
  },
  
  { 
    id: 'sno',  // ✅ Changed from 'id'
    label: 'S.No', 
    key: 'sno',  // ✅ Changed from 'id'
    header: 'S.No', 
    width: '80px', 
    render: (_val, _row, idx) => idx + 1 
  },
  { id: 'building_name', label: 'Building', key: 'building_name', header: 'Building', render: (v) => v || '-' },
  { id: 'floor_name', label: 'Floor', key: 'floor_name', header: 'Floor', render: (v) => v || '-' },
  { id: 'unit_name', label: 'Unit', key: 'unit_name', header: 'Unit', render: (v) => v || '-' },
  { id: 'name', label: 'Asset Name', key: 'name', header: 'Asset Name', sortable: true, render: (v) => v || '-' },
  
  // Asset Number - API returns this ✅
  { 
    id: 'asset_number', 
    label: 'Asset Number', 
    key: 'asset_number', 
    header: 'Asset Number', 
    render: (v) => v || '-' 
  },
  
  // Equipment Id - API returns "equipemnt_id" (with typo) ✅
  { 
    id: 'equipemnt_id', 
    label: 'Equipment Id', 
    key: 'equipemnt_id', 
    header: 'Equipment Id', 
    render: (v) => v || '-' 
  },
  
  { id: 'oem_name', label: 'OEM Name', key: 'oem_name', header: 'OEM Name', render: (v) => v || '-' },
  { id: 'serial_number', label: 'Serial Number', key: 'serial_number', header: 'Serial Number', render: (v) => v || '-' },
  { id: 'model_number', label: 'Model Number', key: 'model_number', header: 'Model Number', render: (v) => v || '-' },
  { id: 'group_name', label: 'Group', key: 'group_name', header: 'Group', render: (v) => v || '-' },
  { id: 'sub_group_name', label: 'Sub Group', key: 'sub_group_name', header: 'Sub Group', render: (v) => v || '-' },
  { id: 'purchased_on', label: 'Purchase Date', key: 'purchased_on', header: 'Purchase Date', render: (v) => v || '-' },
  { id: 'purchase_cost', label: 'Purchase Cost', key: 'purchase_cost', header: 'Purchase Cost', render: (v) => v ? `₹${v.toLocaleString()}` : '-' },
  { id: 'critical', label: 'Critical', key: 'critical', header: 'Critical', render: (v) => v ? 'Yes' : 'No' },
  { id: 'status', label: 'Status', key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={getAssetStatus(row)} /> },
  { id: 'capacity', label: 'Capacity', key: 'capacity', header: 'Capacity', render: (v) => v || '-' },
  { id: 'created_at', label: 'Created On', key: 'created_at', header: 'Created On', render: (v) => dateFormat(v) },
  { id: 'updated_at', label: 'Updated On', key: 'updated_at', header: 'Updated On', render: (v) => v ? dateFormat(v) : '-' },
  
  // Warranty Yes/No - checks if warranty_start is null
  { 
    id: 'warranty', 
    label: 'Warranty', 
    key: 'warranty', 
    header: 'Warranty', 
    render: (_, row) => (row.warranty_start === null || row.warranty_start === '') ? 'No' : 'Yes' 
  },
  
  { id: 'warranty_start', label: 'W Start', key: 'warranty_start', header: 'W Start', render: (v) => v || '-' },
  { id: 'installation', label: 'Installation Date', key: 'installation', header: 'Installation Date', render: (v) => v || '-' },
  { id: 'warranty_expiry', label: 'W Expiry', key: 'warranty_expiry', header: 'W Expiry', render: (v) => v || '-' },
  { id: 'is_meter', label: 'Meter Configured', key: 'is_meter', header: 'Meter Configured', render: (v) => v ? 'Yes' : 'No' },
  { id: 'vendor_name', label: 'Supplier', key: 'vendor_name', header: 'Supplier', render: (v) => v || '-' },
];

  // Calculate paginated data
  const paginatedAssets = filteredAssets.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage
  );

  // Column visibility functions
  const toggleColumnVisibility = (columnId: string) => {
    setHiddenColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  // Get visible columns
  const visibleColumns = columns.filter(col => !hiddenColumns.has(col.id));


console.log('Columns labels:', columns.map(c => c.label));
console.log('Hidden columns set:', hiddenColumns);
console.log('Action hidden:', hiddenColumns.has('action'));
console.log('Visible columns:', visibleColumns.map(c => c.label));
console.log('Hidden columns:', Array.from(hiddenColumns));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards - Responsive Full Width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {/* Total Assets Card */}
        <div
          onClick={() => handleCardClick('all')}
          className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'all'
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-card text-blue-500 border-blue-500 hover:bg-blue-50'
          }`}
        >
          <Package className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Total Assets</span>
          <span className={`text-2xl font-bold mt-1 ${activeCard === 'all' ? 'text-white' : 'text-foreground'}`}>
            {stats.total}
          </span>
        </div>

        {/* Assets in Use Card */}
        <div
          onClick={() => handleCardClick('inUse')}
          className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'inUse'
              ? 'bg-green-500 text-white border-green-500'
              : 'bg-card text-green-600 border-green-500 hover:bg-green-50'
          }`}
        >
          <Wrench className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Assets in Use</span>
          <span className={`text-2xl font-bold mt-1 ${activeCard === 'inUse' ? 'text-white' : 'text-foreground'}`}>
            {stats.inUse}
          </span>
        </div>

        {/* Assets in Breakdown Card */}
        <div
          onClick={() => handleCardClick('breakdown')}
          className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'breakdown'
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-card text-red-600 border-red-500 hover:bg-red-50'
          }`}
        >
          <AlertTriangle className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Assets in Breakdown</span>
          <span className={`text-2xl font-bold mt-1 ${activeCard === 'breakdown' ? 'text-white' : 'text-foreground'}`}>
            {stats.breakdown}
          </span>
        </div>

        {/* Activities Performed Card */}
        <div
          onClick={() => handleCardClick('activities')}
          className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'activities'
              ? 'bg-yellow-500 text-white border-yellow-500'
              : 'bg-card text-yellow-600 border-yellow-500 hover:bg-yellow-50'
          }`}
        >
          <ClipboardCheck className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Activities Performed</span>
          <span className={`text-2xl font-bold mt-1 ${activeCard === 'activities' ? 'text-white' : 'text-foreground'}`}>
            {stats.activities}
          </span>
        </div>

        {/* PPM Performed Card */}
        <div
          onClick={() => handleCardClick('ppm')}
          className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'ppm'
              ? 'bg-cyan-500 text-white border-cyan-500'
              : 'bg-card text-cyan-600 border-cyan-500 hover:bg-cyan-50'
          }`}
        >
          <Calendar className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">PPM Performed</span>
          <span className={`text-2xl font-bold mt-1 ${activeCard === 'ppm' ? 'text-white' : 'text-foreground'}`}>
            {stats.ppm}
          </span>
        </div>

        {/* AMC Performed Card */}
        <div
          onClick={() => handleCardClick('amc')}
          className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'amc'
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-card text-orange-600 border-orange-500 hover:bg-orange-50'
          }`}
        >
          <FileText className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">AMC Performed</span>
          <span className={`text-2xl font-bold mt-1 ${activeCard === 'amc' ? 'text-white' : 'text-foreground'}`}>
            {stats.amc}
          </span>
        </div>
      </div>

      {/* View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div />

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {/* Hide Columns */}
          <div className="relative">
            <button
              onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-accent"
            >
              <Eye className="w-4 h-4" />
              Hide Columns
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Column Menu Dropdown */}
            {isColumnMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsColumnMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-40 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
                      Toggle Column Visibility
                    </div>
                    {columns.map((col) => (
                      <label key={col.id} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!hiddenColumns.has(col.id)}
                          onChange={() => toggleColumnVisibility(col.id)}
                          className="w-4 h-4"
                        />
                        <span className="flex items-center gap-2 text-sm">
                          {hiddenColumns.has(col.id) ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-primary" />}
                          {col.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-lg font-semibold mb-4">
          {activeCard === 'all' && 'All Assets'}
          {activeCard === 'inUse' && 'Assets in Use'}
          {activeCard === 'breakdown' && 'Assets in Breakdown'}
          {activeCard === 'activities' && 'Activities Performed'}
          {activeCard === 'ppm' && 'PPM Performed'}
          {activeCard === 'amc' && 'AMC Performed'}
        </h3>
        
        {filteredAssets.length > 0 ? (
          viewMode === 'table' ? (
            <DataTable
              columns={visibleColumns}
              data={paginatedAssets}
              viewPath={(row) => `/asset/${row.id}`}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedAssets.map((asset) => (
                <div key={asset.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{asset.name || `Asset #${asset.id}`}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      (asset as any).breakdown ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {(asset as any).breakdown ? 'Breakdown' : 'In Use'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div><span className="font-medium">Serial:</span> {asset.serial_number || '-'}</div>
                    <div><span className="font-medium">Model:</span> {asset.model_number || '-'}</div>
                    <div><span className="font-medium">Location:</span> {asset.building_name || '-'}</div>
                    <div><span className="font-medium">Cost:</span> {asset.purchase_cost ? `₹${asset.purchase_cost.toLocaleString()}` : '-'}</div>
                    <div><span className="font-medium">OEM:</span> {asset.oem_name || '-'}</div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link
                      to={`/assets/asset-details/${asset.id}`}
                      className="flex-1 text-center px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/assets/edit-asset/${asset.id}`}
                      className="flex-1 text-center px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/90"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredAssets.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} to {Math.min(pagination.page * pagination.perPage, filteredAssets.length)} of {filteredAssets.length} records
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              «
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              ‹ Prev
            </button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(Math.ceil(filteredAssets.length / prev.perPage), prev.page + 1) }))}
              disabled={pagination.page >= Math.ceil(filteredAssets.length / pagination.perPage)}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              Next ›
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.ceil(filteredAssets.length / prev.perPage) }))}
              disabled={pagination.page >= Math.ceil(filteredAssets.length / pagination.perPage)}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              »
            </button>
          </div>
          <select
            value={pagination.perPage}
            onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))}
            className="px-2 py-1.5 text-sm border border-border rounded-md bg-background"
          >
            <option value={10}>10 / page</option>
            <option value={12}>12 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default AssetOverview;
