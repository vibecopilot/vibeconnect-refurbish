import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Package, Wrench, AlertTriangle, ClipboardCheck, Calendar, FileText, Eye, EyeOff, Grid, List, Edit2 } from 'lucide-react';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../../components/ui/StatusBadge';
import { getPerPageSiteAsset } from '../../../api';
import { Asset } from '../../../services/asset.service';

const AssetOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeCard, setActiveCard] = useState<string>('all');
  const [cardFilter, setCardFilter] = useState<string>('');
  const getPerPage = (mode: 'grid' | 'table') => (mode === 'grid' ? 12 : 10);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [pagination, setPagination] = useState({ page: 1, perPage: getPerPage('grid'), total: 0, totalPages: 0 });
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    inUse: 0,
    breakdown: 0,
    activities: 0,
    ppm: 0,
    amc: 0,
  });

  // Fetch stats for all cards (runs once on mount)
  const fetchStats = useCallback(async () => {
    try {
      // Fetch each stat from backend with card_filter
      const [totalRes, inUseRes, breakdownRes, activitiesRes, ppmRes, amcRes] = await Promise.all([
        getPerPageSiteAsset(1, 1, '', ''), // all assets
        getPerPageSiteAsset(1, 1, '', 'in_use'),
        getPerPageSiteAsset(1, 1, '', 'breakdown'),
        getPerPageSiteAsset(1, 1, '', 'activities_performed'),
        getPerPageSiteAsset(1, 1, '', 'ppm_performed'),
        getPerPageSiteAsset(1, 1, '', 'amc_performed'),
      ]);

      setStats({
        total: totalRes.data.total || totalRes.data.total_count || 0,
        inUse: inUseRes.data.total || inUseRes.data.total_count || 0,
        breakdown: breakdownRes.data.total || breakdownRes.data.total_count || 0,
        activities: activitiesRes.data.total || activitiesRes.data.total_count || 0,
        ppm: ppmRes.data.total || ppmRes.data.total_count || 0,
        amc: amcRes.data.total || amcRes.data.total_count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Fetch assets with current filter
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPerPageSiteAsset(pagination.page, pagination.perPage, searchValue, cardFilter);
      const data = response.data;
      const assetsList = data.site_assets || data.data || [];

      // Sort by created_at DESC
      const sortedAssets = assetsList.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setAssets(sortedAssets);

      const totalCount = data.total || data.total_count || assetsList.length;

      // Set pagination
      setPagination(prev => ({
        ...prev,
        total: totalCount,
        totalPages: data.total_pages || Math.ceil(totalCount / prev.perPage),
      }));
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, searchValue, cardFilter]);

  // Fetch stats on component mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch assets when filter, pagination, or search changes
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Adjust per-page when view mode changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, perPage: getPerPage(viewMode), page: 1 }));
  }, [viewMode]);

  // Reset to page 1 when search value changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchValue]);

  // Handle card click - set filter and refetch from server
  const handleCardClick = (cardType: string) => {
    setActiveCard(cardType);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when switching cards

    // Map card type to API filter value
    const filterMap: Record<string, string> = {
      'all': '',
      'inUse': 'in_use',
      'breakdown': 'breakdown',
      'activities': 'activities_performed',
      'ppm': 'ppm_performed',
      'amc': 'amc_performed',
    };

    setCardFilter(filterMap[cardType] || '');
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
    key: 'action',  // âœ… unique key
    header: 'Action', 
    width: '100px',
    render: (_, row) => {
      console.log('Rendering action column for row:', row.id);
      return (
        <div className="flex items-center gap-3">
          <Link to={`/asset/${row.id}`} state={{ from: 'overview' }} className="text-primary hover:text-primary/80" title="View">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/asset/${row.id}/edit`} state={{ from: 'overview' }} className="text-primary hover:text-primary/80" title="Edit">
            <Edit2 className="w-4 h-4" />
          </Link>
        </div>
      );
    }
  },
  
  { 
    id: 'sno',  // âœ… Changed from 'id'
    label: 'S.No', 
    key: 'sno',  // âœ… Changed from 'id'
    header: 'S.No', 
    width: '80px', 
    render: (_val, _row, idx) => idx + 1 
  },
  { id: 'building_name', label: 'Building', key: 'building_name', header: 'Building', render: (v) => v || '-' },
  { id: 'floor_name', label: 'Floor', key: 'floor_name', header: 'Floor', render: (v) => v || '-' },
  { id: 'unit_name', label: 'Unit', key: 'unit_name', header: 'Unit', render: (v) => v || '-' },
  { id: 'name', label: 'Asset Name', key: 'name', header: 'Asset Name', sortable: true, render: (v) => v || '-' },
  
  // Asset Number - API returns this âœ…
  { 
    id: 'asset_number', 
    label: 'Asset Number', 
    key: 'asset_number', 
    header: 'Asset Number', 
    render: (v) => v || '-' 
  },
  
  // Equipment Id - API returns "equipemnt_id" (with typo) âœ…
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
  { id: 'purchase_cost', label: 'Purchase Cost', key: 'purchase_cost', header: 'Purchase Cost', render: (v) => v ? `â‚¹${v.toLocaleString()}` : '-' },
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

  // Data is already paginated by API (server-side)
  const paginatedAssets = assets;

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
      {/* Statistics Cards - Clean Permit Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {/* Total Assets Card */}
        <button
          onClick={() => handleCardClick('all')}
          className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'all'
              ? 'bg-blue-100 text-blue-700 border-blue-200 ring-2 ring-offset-2 ring-primary'
              : 'bg-blue-100 text-blue-700 border-blue-200 hover:opacity-80'
          }`}
        >
          <span className="text-xs font-medium">Total Assets</span>
          <span className="text-xl font-bold mt-1">
            {stats.total}
          </span>
        </button>

        {/* Assets in Use Card */}
        <button
          onClick={() => handleCardClick('inUse')}
          className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'inUse'
              ? 'bg-green-100 text-green-700 border-green-200 ring-2 ring-offset-2 ring-primary'
              : 'bg-green-100 text-green-700 border-green-200 hover:opacity-80'
          }`}
        >
          <span className="text-xs font-medium">Assets in Use</span>
          <span className="text-xl font-bold mt-1">
            {stats.inUse}
          </span>
        </button>

        {/* Assets in Breakdown Card */}
        <button
          onClick={() => handleCardClick('breakdown')}
          className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'breakdown'
              ? 'bg-red-100 text-red-700 border-red-200 ring-2 ring-offset-2 ring-primary'
              : 'bg-red-100 text-red-700 border-red-200 hover:opacity-80'
          }`}
        >
          <span className="text-xs font-medium">Assets in Breakdown</span>
          <span className="text-xl font-bold mt-1">
            {stats.breakdown}
          </span>
        </button>

        {/* Activities Performed Card */}
        <button
          onClick={() => handleCardClick('activities')}
          className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'activities'
              ? 'bg-yellow-100 text-yellow-700 border-yellow-200 ring-2 ring-offset-2 ring-primary'
              : 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:opacity-80'
          }`}
        >
          <span className="text-xs font-medium">Activities Performed</span>
          <span className="text-xl font-bold mt-1">
            {stats.activities}
          </span>
        </button>

        {/* PPM Performed Card */}
        <button
          onClick={() => handleCardClick('ppm')}
          className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'ppm'
              ? 'bg-cyan-100 text-cyan-700 border-cyan-200 ring-2 ring-offset-2 ring-primary'
              : 'bg-cyan-100 text-cyan-700 border-cyan-200 hover:opacity-80'
          }`}
        >
          <span className="text-xs font-medium">PPM Performed</span>
          <span className="text-xl font-bold mt-1">
            {stats.ppm}
          </span>
        </button>

        {/* AMC Performed Card */}
        <button
          onClick={() => handleCardClick('amc')}
          className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'amc'
              ? 'bg-orange-100 text-orange-700 border-orange-200 ring-2 ring-offset-2 ring-primary'
              : 'bg-orange-100 text-orange-700 border-orange-200 hover:opacity-80'
          }`}
        >
          <span className="text-xs font-medium">AMC Performed</span>
          <span className="text-xl font-bold mt-1">
            {stats.amc}
          </span>
        </button>
      </div>

      {/* Search + View Controls */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-2 mb-4">
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

          {/* Search */}
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search assets..."
            className="pl-3 pr-3 py-2 w-64 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />

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
                          {col.header}
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
        
        {assets.length > 0 ? (
          viewMode === 'table' ? (
            <DataTable
              columns={visibleColumns}
              data={paginatedAssets}
              viewPath={(row) => `/asset/${row.id}`}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedAssets.map((asset: Asset) => (
                <div key={asset.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="mb-3">
                    <h3 className="font-semibold text-foreground">{asset.name || `Asset #${asset.id}`}</h3>
                    <p className="text-xs text-muted-foreground">{asset.building_name || '-'}</p>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div><span className="font-medium">Serial:</span> {asset.serial_number || '-'}</div>
                    <div><span className="font-medium">Model:</span> {asset.model_number || '-'}</div>
                    <div><span className="font-medium">Status:</span> {(asset as any).breakdown ? 'Breakdown' : 'In Use'}</div>
                    <div><span className="font-medium">Cost:</span> {asset.purchase_cost ? `₹${asset.purchase_cost.toLocaleString()}` : '-'}</div>
                    <div><span className="font-medium">OEM:</span> {asset.oem_name || '-'}</div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-primary">
                    <Link to={`/asset/${asset.id}`} state={{ from: 'overview' }} className="inline-flex items-center gap-1 hover:text-primary/80">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                    <Link to={`/asset/${asset.id}/edit`} state={{ from: 'overview' }} className="inline-flex items-center gap-1 hover:text-primary/80">
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
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
      {assets.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} records
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              {"<<"}
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: pagination.totalPages }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              {">>"}
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
