import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DataCard from '../../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../../components/ui/StatusBadge';
import { Loader2, Gauge, AlertCircle, RefreshCw, Eye, EyeOff, Edit } from 'lucide-react';
import { getMeteredSiteAsset, getFloors, getUnits } from '../../../api';
import { getItemInLocalStorage } from '../../../utils/localStorage';

interface Meter {
  id: number;
  name: string;
  serial_number?: string;
  model_number?: string;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  purchased_on?: string;
  purchase_cost?: number;
  warranty_expiry?: string;
  critical?: boolean;
  breakdown?: boolean;
  capacity?: string;
  installation?: string;
  is_meter?: boolean;
  created_at: string;
}

interface MeterListProps {
  viewMode: 'grid' | 'table';
  searchValue: string;
  perPage?: number;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  isColumnMenuOpen: boolean;
  setIsColumnMenuOpen: (value: boolean) => void;
}

const MeterList: React.FC<MeterListProps> = ({ 
  viewMode, 
  searchValue, 
  perPage = 10,
  isFilterOpen,
  setIsFilterOpen,
  isColumnMenuOpen,
  setIsColumnMenuOpen
}) => {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, perPage, total: 0, totalPages: 0 });
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  const buildings = getItemInLocalStorage('Building') || [];
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    building_id: '',
    floor_id: '',
    unit_id: '',
  });

  useEffect(() => {
    setPagination(prev => ({ ...prev, perPage, page: 1 }));
  }, [perPage]);

  const fetchMeters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMeteredSiteAsset();
      const filteredAssets = response.data.site_assets.filter((asset: Meter) => asset.is_meter);
      const sortedData = filteredAssets.sort((a: Meter, b: Meter) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setMeters(sortedData);
      setPagination(prev => ({
        ...prev,
        total: sortedData.length,
        totalPages: Math.ceil(sortedData.length / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meters');
      setMeters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMeters(); }, [fetchMeters]);

  const handleBuildingChange = async (buildingId: string) => {
    setFilters(prev => ({ ...prev, building_id: buildingId, floor_id: '', unit_id: '' }));
    setFloors([]);
    setUnits([]);
    
    if (buildingId) {
      try {
        const response = await getFloors(Number(buildingId));
        setFloors(response.data.map((item: any) => ({ name: item.name, id: item.id })));
      } catch (error) {
        console.error('Error fetching floors:', error);
      }
    }
  };

  const handleFloorChange = async (floorId: string) => {
    setFilters(prev => ({ ...prev, floor_id: floorId, unit_id: '' }));
    setUnits([]);
    
    if (floorId) {
      try {
        const response = await getUnits(Number(floorId));
        setUnits(response.data.map((item: any) => ({ name: item.name, id: item.id })));
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    }
  };

  const handleFilterApply = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setIsFilterOpen(false);
  };

  const handleFilterReset = () => {
    setFilters({
      building_id: '',
      floor_id: '',
      unit_id: '',
    });
    setFloors([]);
    setUnits([]);
    setPagination(prev => ({ ...prev, page: 1 }));
    setIsFilterOpen(false);
  };

  const getMeterStatus = (meter: Meter): StatusType => {
    // Check breakdown field
    if (meter.breakdown) return 'breakdown';
    return 'in-use';
  };

  const dateFormat = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Client-side search filtering
  let filteredMeters = meters.filter(meter => 
    !searchValue || 
    meter.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    meter.building_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    meter.unit_name?.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Client-side filter by building, floor, unit
  if (filters.building_id) {
    filteredMeters = filteredMeters.filter(meter => 
      meter.building_name === buildings.find((b: any) => b.id === Number(filters.building_id))?.name
    );
  }
  if (filters.floor_id) {
    filteredMeters = filteredMeters.filter(meter => 
      meter.floor_name === floors.find((f: any) => f.id === Number(filters.floor_id))?.name
    );
  }
  if (filters.unit_id) {
    filteredMeters = filteredMeters.filter(meter => 
      meter.unit_name === units.find((u: any) => u.id === Number(filters.unit_id))?.name
    );
  }

  // Client-side pagination
  const startIndex = (pagination.page - 1) * pagination.perPage;
  const endIndex = startIndex + pagination.perPage;
  const paginatedMeters = filteredMeters.slice(startIndex, endIndex);

  const allColumns: Array<TableColumn<Meter> & { id: string; label: string }> = [
    // Action column
    {
      id: 'action',
      label: 'Action',
      key: 'action',
      header: 'Action',
      width: '100px',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Link to={`/asset/${row.id}`} className="text-primary hover:text-primary/80">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/asset/${row.id}/edit`} className="text-primary hover:text-primary/80">
            <Edit className="w-4 h-4" />
          </Link>
        </div>
      )
    },
    { id: 'id', label: 'S.No', key: 'id', header: 'S.No', width: '80px', render: (_val, _row, idx) => startIndex + idx + 1 },
    { id: 'building_name', label: 'Building', key: 'building_name', header: 'Building', render: (v) => v || '-' },
    { id: 'floor_name', label: 'Floor', key: 'floor_name', header: 'Floor', render: (v) => v || '-' },
    { id: 'unit_name', label: 'Unit', key: 'unit_name', header: 'Unit', render: (v) => v || '-' },
    { id: 'name', label: 'Asset Name', key: 'name', header: 'Asset Name', sortable: true, render: (v) => v || '-' },
    { id: 'serial_number', label: 'Serial Number', key: 'serial_number', header: 'Serial Number', render: (v) => v || '-' },
    { id: 'model_number', label: 'Model Number', key: 'model_number', header: 'Model Number', render: (v) => v || '-' },
    { id: 'purchased_on', label: 'Purchase Date', key: 'purchased_on', header: 'Purchase Date', render: (v) => v || '-' },
    { id: 'purchase_cost', label: 'Purchase Cost', key: 'purchase_cost', header: 'Purchase Cost', render: (v) => v ? `₹${v.toLocaleString()}` : '-' },
    { id: 'warranty_expiry', label: 'Warranty Expiry', key: 'warranty_expiry', header: 'Warranty Expiry', render: (v) => v || '-' },
    { id: 'critical', label: 'Critical', key: 'critical', header: 'Critical', render: (v) => v ? 'Yes' : 'No' },
    { id: 'breakdown', label: 'Breakdown', key: 'breakdown', header: 'Breakdown', render: (v) => v ? 'Yes' : 'No' },
    { id: 'capacity', label: 'Capacity', key: 'capacity', header: 'Capacity', render: (v) => v || '-' },
    { id: 'created_at', label: 'Created On', key: 'created_at', header: 'Created On', render: (v) => dateFormat(v) },
    { id: 'installation', label: 'Installation Date', key: 'installation', header: 'Installation Date', render: (v) => v || '-' },
    { id: 'is_meter', label: 'Meter Configured', key: 'is_meter', header: 'Meter Configured', render: (v) => v ? 'Yes' : 'No' },
  ];

  const visibleColumns = allColumns.filter(col => !hiddenColumns.has(col.id));

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

  if (loading && meters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading meters...</p>
      </div>
    );
  }

  if (error && meters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Meters</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button onClick={fetchMeters} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const hasActiveFilters = filters.building_id || filters.floor_id || filters.unit_id;

  if (paginatedMeters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
        <Gauge className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Meters Found</h3>
        <p className="text-muted-foreground mb-4">
          {hasActiveFilters
            ? 'No meters match the selected filters'
            : searchValue
              ? `No meters match "${searchValue}"`
              : 'No meter assets added yet'
          }
        </p>
        {hasActiveFilters ? (
          <button
            onClick={handleFilterReset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
          >
            Clear Filters
          </button>
        ) : (
          <Link to="/asset/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Add Asset</Link>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-4xl rounded-xl bg-card shadow-xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold">Filter By</h2>
              <button className="text-xl leading-none" onClick={() => setIsFilterOpen(false)}>×</button>
            </div>

            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Building Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">Building Name</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.building_id}
                    onChange={(e) => handleBuildingChange(e.target.value)}
                  >
                    <option value="">Select Building</option>
                    {(buildings as any[]).map((building: any) => (
                      <option key={building.id} value={building.id}>{building.name}</option>
                    ))}
                  </select>
                </div>

                {/* Floor Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">Floor Name</label>
                  <select 
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" 
                    value={filters.floor_id} 
                    onChange={(e) => handleFloorChange(e.target.value)}
                    disabled={!floors.length}
                  >
                    <option value="">Select Floor</option>
                    {floors.map((floor) => (
                      <option key={floor.id} value={floor.id}>{floor.name}</option>
                    ))}
                  </select>
                </div>

                {/* Unit Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Name</label>
                  <select 
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" 
                    value={filters.unit_id} 
                    onChange={(e) => setFilters(prev => ({ ...prev, unit_id: e.target.value }))}
                    disabled={!units.length}
                  >
                    <option value="">Select Unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
              <button 
                className="rounded-md border border-border px-4 py-2 text-sm" 
                onClick={handleFilterReset}
              >
                Reset
              </button>
              <button 
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" 
                onClick={handleFilterApply}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hide Columns Dropdown */}
      {isColumnMenuOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsColumnMenuOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-40 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
                Toggle Column Visibility
              </div>
              {allColumns.map((col) => (
                <label key={col.id} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded cursor-pointer">
                  <input type="checkbox" checked={!hiddenColumns.has(col.id)} onChange={() => toggleColumnVisibility(col.id)} className="w-4 h-4" />
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

      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedMeters.map((meter) => (
            <DataCard
              key={meter.id}
              title={meter.name}
              subtitle={meter.building_name || '-'}
              status={getMeterStatus(meter)}
              fields={[
                { label: 'Floor', value: meter.floor_name || '-' },
                { label: 'Unit', value: meter.unit_name || '-' },
                { label: 'Capacity', value: meter.capacity || '-' },
                { label: 'Critical', value: meter.critical ? 'Yes' : 'No' },
              ]}
              viewPath={`/asset/${meter.id}`}
              editPath={`/asset/${meter.id}/edit`}
            />
          ))}
        </div>
      ) : (
        <DataTable columns={visibleColumns} data={paginatedMeters} viewPath={(row) => `/asset/${row.id}`} />
      )}

      {paginatedMeters.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredMeters.length)} of {filteredMeters.length} records
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">«</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">‹ Prev</button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={endIndex >= filteredMeters.length} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Next ›</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: Math.ceil(filteredMeters.length / prev.perPage) }))} disabled={endIndex >= filteredMeters.length} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">»</button>
          </div>
          <select value={pagination.perPage} onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))} className="px-2 py-1.5 text-sm border border-border rounded-md bg-background">
            <option value={10}>10 / page</option><option value={12}>12 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option>
          </select>
        </div>
      )}
    </>
  );
};

export default MeterList;