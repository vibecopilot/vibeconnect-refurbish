import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ListToolbar from '../../components/ui/ListToolbar';
import DataCard from '../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import { 
  getSoftServices, 
  softServiceDownloadQrCode, 
  getSoftServiceDownload,
  importSoftServices
} from '../../api';
import { Loader2, Wrench, AlertCircle, RefreshCw, Eye, Edit2, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface Unit {
  id: number;
  name: string;
}

interface SoftService {
  id: number | string;
  name: string;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  units?: Unit[]; // Array of units
  user_name?: string; // Created by field
  created_by?: string;
  created_at?: string;
  status?: string;
}

const ServiceList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ADD THIS LINE
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [services, setServices] = useState<SoftService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  
  const getPerPage = (mode: 'grid' | 'table') => mode === 'grid' ? 12 : 10;
  const [pagination, setPagination] = useState({ page: 1, perPage: getPerPage('grid'), total: 0, totalPages: 0 });

  useEffect(() => {
    setPagination(prev => ({ ...prev, perPage: getPerPage(viewMode), page: 1 }));
  }, [viewMode]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchValue]);

const fetchServices = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await getSoftServices(pagination.page, pagination.perPage, searchValue);
    const data = response.data;

    const serviceList =
      (Array.isArray(data) && data) ||
      data?.results ||
      data?.soft_services ||
      data?.data ||
      [];

    setServices(serviceList);

    setPagination((prev) => {
      const total = data.total || data.total_count || data.count || serviceList.length;
      const totalPages = data.total_pages || Math.ceil(total / prev.perPage) || 1;
      return {
        ...prev,
        total,
        totalPages,
      };
    });
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to fetch services");
    setServices([]);
  } finally {
    setLoading(false);
  }
}, [pagination.page, pagination.perPage, searchValue]);


useEffect(() => {
  fetchServices();
}, [fetchServices, location.key]); // ? route change/back navigation triggers refetch


// Also fetch when component becomes visible (for navigation back)
useEffect(() => {
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      fetchServices();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibility);
  return () => document.removeEventListener('visibilitychange', handleVisibility);
}, []);


useEffect(() => {
  fetchServices();
}, [fetchServices, location.key]); // âœ… route change/back navigation triggers refetch


// Also fetch when component becomes visible (for navigation back)
useEffect(() => {
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      fetchServices();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibility);
  return () => document.removeEventListener('visibilitychange', handleVisibility);
}, []);


  const handleExport = async () => {
    try {
      const response = await getSoftServiceDownload();
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'soft_services.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export successful');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleQrCode = async () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    const loadingToast = toast.loading('QR code downloading, please wait!');

    try {
      const response = await softServiceDownloadQrCode(selectedRows);

      // Ensure we have blob data
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Create blob from response data
      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: 'application/pdf' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'service_qr_codes.pdf';

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.dismiss(loadingToast);
      toast.success('QR Codes downloaded successfully');

      // Clear selection after successful download
      setSelectedRows([]);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error downloading QR codes:', error);
      toast.error('Failed to download QR codes. Please try again.');
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      toast.error('No file selected');
      return;
    }
    const formData = new FormData();
    formData.append('file', importFile);
    try {
      toast.loading('Uploading services...');
      const res = await importSoftServices(formData);
      toast.dismiss();
      if (res.status === 200) {
        toast.success('Services imported successfully');
        setIsImportOpen(false);
        setImportFile(null);
        fetchServices();
      } else {
        toast.error('Import failed, please try again');
      }
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error('Import failed, please try again');
    }
  };

  const handleDownloadSample = () => {
    toast.error('Sample download not configured yet');
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const paginatedServices = services.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage
  );

  const columns: TableColumn<SoftService>[] = [
    {
      key: 'actions',
      header: 'ACTION',
      width: '100px',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Link to={`/soft-services/${row.id}`} className="p-1.5 rounded-md hover:bg-accent text-primary">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/soft-services/${row.id}/edit`} className="p-1.5 rounded-md hover:bg-accent text-primary">
            <Edit2 className="w-4 h-4" />
          </Link>
        </div>
      )
    },
    {
      key: 'name',
      header: 'SERVICE NAME',
      sortable: true,
      render: (v) => v || '-'
    },
    { 
      key: 'building_name', 
      header: 'BUILDING', 
      render: (v) => v || '-' 
    },
    { 
      key: 'floor_name', 
      header: 'FLOOR', 
      render: (v) => v || '-' 
    },
    { 
      key: 'units', 
      header: 'UNIT', 
      render: (_, row) => {
        // Handle units array (matching existing project)
        if (row.units && Array.isArray(row.units) && row.units.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
              {row.units.map((unit, idx) => (
                <span key={unit.id || idx} className="text-sm">
                  {unit.name}{idx < (row.units?.length || 0) - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          );
        }
        // Fallback to single unit_name
        return row.unit_name || '-';
      }
    },
    { 
      key: 'user_name', 
      header: 'CREATED BY', 
      render: (_, row) => {
        // Check both user_name and created_by fields
        return row.user_name || row.created_by || '-';
      }
    },
    { 
      key: 'created_at', 
      header: 'CREATED ON', 
      render: (v) => formatDate(v) 
    },
  ];

  if (loading && services.length === 0) {
    return (
      <div className="p-6">
        <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Service' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error && services.length === 0) {
    return (
      <div className="p-6">
        <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Service' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Services</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button onClick={fetchServices} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Service' }]} />

      <ListToolbar
        searchPlaceholder="Search By Service name"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExport}
        onAdd={() => navigate('/soft-services/create')}
        addLabel="Add"
        showQrCode
        qrCodeDisabled={selectedRows.length === 0}
        onQrCode={handleQrCode}
        additionalButtons={(
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
        )}
      />

      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-card shadow-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Bulk Upload
              </h2>
              <button className="text-xl leading-none" onClick={() => setIsImportOpen(false)}>×</button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="border border-dashed border-border rounded-lg p-6 text-center bg-muted/30">
                <p className="font-medium mb-2">Drag &amp; Drop or</p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Choose File
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-muted-foreground mt-2">{importFile ? importFile.name : 'No file chosen'}</p>
              </div>

              <div className="flex justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent"
                >
                  <Download className="w-4 h-4" />
                  Download Sample Format
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImportOpen(false)}
                    className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
                  >
                    Import
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}

      {!loading && paginatedServices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <Wrench className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
          <Link to="/soft-services/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Add Service</Link>
        </div>
      )}

      {viewMode === 'grid' && paginatedServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedServices.map((service) => {
            // Format units for display in card
            const unitDisplay = service.units && Array.isArray(service.units) && service.units.length > 0
              ? service.units.map(u => u.name).join(', ')
              : service.unit_name || '-';

            return (
              <DataCard
                key={service.id}
                id={String(service.id)}
                title={service.name}
                subtitle={`Building: ${service.building_name || '-'}`}
                fields={[
                  { label: 'Floor', value: service.floor_name || '-' },
                  { label: 'Unit', value: unitDisplay },
                  { label: 'Created By', value: service.user_name || service.created_by || '-' },
                  { label: 'Created On', value: formatDate(service.created_at) },
                ]}
                viewPath={`/soft-services/${service.id}`}
                editPath={`/soft-services/${service.id}/edit`}
                isSelected={selectedRows.includes(String(service.id))}
                onToggleSelect={() => {
                  setSelectedRows(prev =>
                    prev.includes(String(service.id))
                      ? prev.filter(r => r !== String(service.id))
                      : [...prev, String(service.id)]
                  );
                }}
              />
            );
          })}
        </div>
      ) : paginatedServices.length > 0 && (
        <DataTable 
          columns={columns} 
          data={paginatedServices} 
          selectable 
          selectedRows={selectedRows} 
          onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])} 
          onSelectAll={() => setSelectedRows(selectedRows.length === paginatedServices.length ? [] : paginatedServices.map(s => String(s.id)))} 
        />
      )}

      {services.length > 0 && (
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
              «
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              ‹ Prev
            </button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">
              {pagination.page}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              Next ›
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.totalPages }))}
              disabled={pagination.page >= pagination.totalPages}
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
            <option value={10}>10</option>
            <option value={12}>12</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default ServiceList;



