import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DataCard from '../../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../../components/ui/StatusBadge';
import { assetService, Asset } from '../../../services/asset.service';
import { Loader2, Package, AlertCircle, RefreshCw, Eye, EyeOff, Upload, Download, QrCode, Edit } from 'lucide-react';
import { getFloors, getUnits, downloadQrCode } from '../../../api'; // ✅ Import downloadQrCode from api
import { getItemInLocalStorage } from '../../../utils/localStorage';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';


interface AssetMainListProps {
  viewMode: 'grid' | 'table';
  searchValue: string;
  perPage?: number;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  isColumnMenuOpen: boolean;
  setIsColumnMenuOpen: (value: boolean) => void;
  isImportOpen: boolean;
  setIsImportOpen: (value: boolean) => void;
  onQrDownload?: () => void;
  onExport?: () => void;
  onExportSet?: (fn: () => void) => void;
  onQrSet?: (fn: () => void) => void; // ✅ Add this
}


const AssetMainList: React.FC<AssetMainListProps> = ({ 
  viewMode, 
  searchValue, 
  perPage = 10,
  isFilterOpen,
  setIsFilterOpen,
  isColumnMenuOpen,
  setIsColumnMenuOpen,
  isImportOpen,
  setIsImportOpen,
  onQrDownload,
  onExport,
  onExportSet,
  onQrSet // ✅ Add this
}) => {

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage, total: 0, totalPages: 0 });
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [importFile, setImportFile] = useState<File | null>(null);

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

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await assetService.getAssets(pagination.page, pagination.perPage, { 
        search: searchValue,
        building_id: filters.building_id,
        floor_id: filters.floor_id,
        unit_id: filters.unit_id,
      });
      const data = response.data;
      const assetList = Array.isArray(data) ? data : data?.site_assets || data?.data || [];
      setAssets(assetList);
      setPagination(prev => ({
        ...prev,
        total: data.total || data.total_count || assetList.length,
        totalPages: data.total_pages || Math.ceil((data.total || data.total_count || assetList.length) / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assets');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, searchValue, filters]);

   // ✅ Add this useEffect to expose QR function
  useEffect(() => {
    if (onExportSet) {
      onExportSet(() => handleExportToExcel);
    }
    if (onQrSet) {
      onQrSet(() => handleQrDownload); // ✅ Expose QR function to parent
    }
  }, [onExportSet, onQrSet, selectedRows, assets]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  // Import Functionality
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!importFile) {
      toast.error('Please select a file to upload.');
      return;
    }

    const token = getItemInLocalStorage('TOKEN');
    const formData = new FormData();
    formData.append('file', importFile);

    try {
      toast.loading('Uploading file...');
      const response = await fetch(`https://admin.vibecopilot.ai/site_assets/import/?token=${token}`, {
        method: 'POST',
        body: formData,
      });

      toast.dismiss();
      if (response.ok) {
        toast.success('File uploaded successfully.');
        setIsImportOpen(false);
        setImportFile(null);
        fetchAssets(); // Refresh the list
      } else {
        toast.error('File upload failed.');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error uploading file:', error);
      toast.error('An error occurred while uploading the file.');
    }
  };


// QR Code Download Functionality - COPIED FROM OLD COMPONENT
const handleQrDownload = async () => {
  if (selectedRows.length === 0) {
    return toast.error("Please select at least one asset.");
  }

  console.log('Selected rows for QR:', selectedRows);
  toast.loading("QR code downloading, please wait!");

  try {
    const response = await downloadQrCode(selectedRows);
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "qr_codes.pdf");
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    link.parentNode.removeChild(link);
    console.log(response);
    toast.dismiss();
    toast.success("QR code downloaded successfully");
  } catch (error) {
    toast.dismiss();
    console.error("Error downloading QR code:", error);
    toast.error("Something went wrong, please try again");
  }
};

const handleExportToExcel = useCallback(() => {
  const dateFormat = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const mappedData = assets.map((asset) => ({
    "Asset Name": asset.name,
    "Asset Type": asset.asset_type || '-',
    "Serial No.": asset.serial_number || '-',
    "Model No.": asset.model_number || '-',
    "Description": asset.description || '-',
    "Building": asset.building_name || '-',
    "Floor": asset.floor_name || '-',
    "Unit": asset.unit_name || '-',
    "Vendor": asset.vendor_name || '-',
    "Asset Group": asset.group_name || '-',
    "Asset Sub Group": asset.sub_group_name || '-',
    "Purchased On": asset.purchased_on || '-',
    "Purchased Cost": asset.purchase_cost || '-',
    "Critical": asset.critical ? "Yes" : "No",
    "Breakdown": asset.breakdown ? "Yes" : "No",
    "Meter Configured": asset.is_meter ? "Yes" : "No",
    "Created On": dateFormat(asset.created_at),
    "Updated On": asset.updated_at ? dateFormat(asset.updated_at) : '-',
    "Comment": asset.remarks || '-',
    "Installation": asset.installation || '-',
    "Warranty Start": asset.warranty_start || '-',
    "Warranty Expiry": asset.warranty_expiry || '-',
  }));

  const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileName = "asset_data.xlsx";
  const ws = XLSX.utils.json_to_sheet(mappedData);
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: fileType });
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  
  toast.success('Excel file exported successfully');
}, [assets]);


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

  const getAssetStatus = (asset: Asset): StatusType => {
    if (asset.breakdown) return 'breakdown';
    return 'in-use';
  };

  const allColumns: Array<TableColumn<Asset> & { id: string; label: string }> = [
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
    { id: 'id', label: 'S.No', key: 'id', header: 'S.No', width: '80px', render: (_val, _row, idx) => idx + 1 },
    { id: 'asset_number', label: 'Asset Number', key: 'asset_number', header: 'Asset Number', render: (v) => v || '-' },
    { id: 'name', label: 'Asset Name', key: 'name', header: 'Asset Name', sortable: true, render: (v) => v || '-' },
    { id: 'building_name', label: 'Building', key: 'building_name', header: 'Building', render: (v) => v || '-' },
    { id: 'floor_name', label: 'Floor', key: 'floor_name', header: 'Floor', render: (v) => v || '-' },
    { id: 'unit_name', label: 'Unit', key: 'unit_name', header: 'Unit', render: (v) => v || '-' },
    { id: 'equipemnt_id', label: 'Equipment Id', key: 'equipemnt_id', header: 'Equipment Id', render: (v) => v || '-' },
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
    { id: 'created_at', label: 'Created On', key: 'created_at', header: 'Created On', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { id: 'updated_at', label: 'Updated On', key: 'updated_at', header: 'Updated On', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { id: 'warranty_start', label: 'W Start', key: 'warranty_start', header: 'W Start', render: (v) => v || '-' },
    { id: 'installation', label: 'Installation Date', key: 'installation', header: 'Installation Date', render: (v) => v || '-' },
    { id: 'warranty_expiry', label: 'W Expiry', key: 'warranty_expiry', header: 'W Expiry', render: (v) => v || '-' },
    { id: 'is_meter', label: 'Meter Configured', key: 'is_meter', header: 'Meter Configured', render: (v) => v ? 'Yes' : 'No' },
    { id: 'warranty', label: 'Warranty', key: 'warranty', header: 'Warranty', render: (_, row) => (row.warranty_start === null || row.warranty_start === '') ? 'No' : 'Yes' },
    { id: 'vendor_name', label: 'Supplier', key: 'vendor_name', header: 'Supplier', render: (v) => v || '-' },
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

  if (loading && assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading Assets...</p>
      </div>
    );
  }

  if (error && assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Assets</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button onClick={fetchAssets} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
        <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Assets Found</h3>
        <p className="text-muted-foreground mb-4">{searchValue ? `No assets match "${searchValue}"` : 'No assets added yet'}</p>
        <Link to="/asset/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Add Asset</Link>
      </div>
    );
  }

  return (
    <>
      {/* Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-card shadow-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Bulk Upload
              </h2>
              <button className="text-xl leading-none" onClick={() => setIsImportOpen(false)}>×</button>
            </div>

            <form onSubmit={handleImportSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Drag & Drop or Select File
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  required
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>

              <div className="flex justify-end gap-3">
                <a
                  download="assets_import.xlsx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent"
                  href="https://admin.vibecopilot.ai/assets/assets_import.xlsx"
                >
                  Download Sample
                </a>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
                >
                  Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          {assets.map((asset) => (
            <DataCard
              key={asset.id}
              title={asset.name || `Asset #${asset.id}`}
              subtitle={asset.asset_number || '-'}
              status={getAssetStatus(asset)}
              fields={[
                { label: 'OEM', value: asset.oem_name || '-' },
                { label: 'Model', value: asset.model_number || '-' },
                { label: 'Location', value: asset.building_name || '-' },
                { label: 'Cost', value: asset.purchase_cost ? `₹${asset.purchase_cost.toLocaleString()}` : '-' },
              ]}
              viewPath={`/asset/${asset.id}`}
              editPath={`/asset/${asset.id}/edit`}
            />
          ))}
        </div>
      ) : (
        <DataTable 
          columns={visibleColumns} 
          data={assets} 
          selectable 
          selectedRows={selectedRows} 
          onSelectRow={(id) => {
    console.log('Row clicked:', id); // 🔍 Debug
    setSelectedRows(prev => {
      const newSelection = prev.includes(id) 
        ? prev.filter(r => r !== id) 
        : [...prev, id];
      console.log('Updated selection:', newSelection); // 🔍 Debug
      return newSelection;
    });
  }} 
  onSelectAll={() => {
    const allIds = assets.map(a => String(a.id));
    console.log('Select All clicked:', allIds); // 🔍 Debug
    setSelectedRows(selectedRows.length === assets.length ? [] : allIds);
  }} 
  viewPath={(row) => `/asset/${row.id}`} 
        />
      )}

      {assets.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">Showing {((pagination.page - 1) * pagination.perPage) + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} records</div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">«</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">‹ Prev</button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Next ›</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.totalPages }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">»</button>
          </div>
          <select value={pagination.perPage} onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))} className="px-2 py-1.5 text-sm border border-border rounded-md bg-background">
            <option value={10}>10 / page</option><option value={12}>12 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option>
          </select>
        </div>
      )}
    </>
  );
};

export default AssetMainList;