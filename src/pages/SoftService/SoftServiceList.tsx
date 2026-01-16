import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ListToolbar from '../../components/ui/ListToolbar';
import DataCard from '../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import { softServiceService, SoftService } from '../../services/softService.service';
import { Loader2, Wrench, AlertCircle, RefreshCw, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const SoftServiceList: React.FC = () => {
  const navigate = useNavigate();
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

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await softServiceService.getServices(pagination.page, pagination.perPage);
      const data = response.data;
      const serviceList = Array.isArray(data) ? data : data?.soft_services || data?.data || [];
      setServices(serviceList);
      setPagination(prev => ({
        ...prev,
        total: data.total || data.total_count || serviceList.length,
        totalPages: data.total_pages || Math.ceil((data.total || serviceList.length) / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

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
      const res = await softServiceService.importServices(formData);
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

  const handleDownloadSample = async () => {
    toast.error('Sample download endpoint not configured yet');
  };

  const getServiceStatus = (service: SoftService): StatusType => {
    const status = service.status?.toLowerCase();
    if (status === 'active') return 'in-use';
    if (status === 'inactive') return 'breakdown';
    return 'in-store';
  };

  const columns: TableColumn<SoftService>[] = [
    { key: 'id', header: 'S.No', width: '80px', render: (_val, _row, idx) => idx + 1 },
    { key: 'name', header: 'Service Name', sortable: true },
    { key: 'service_type', header: 'Type', render: (v) => v || '-' },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={getServiceStatus(row)} /> },
    { key: 'building_name', header: 'Building', render: (v) => v || '-' },
    { key: 'frequency', header: 'Frequency', render: (v) => v || '-' },
  ];

  if (loading && services.length === 0) {
    return (
      <div className="p-6">
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
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
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
      <Breadcrumb items={[{ label: 'Soft Services', path: '/soft-services' }, { label: 'List' }]} />

      <ListToolbar
        searchPlaceholder="Search services..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={() => {}}
        onExport={() => {}}
        onAdd={() => navigate('/soft-services/create')}
        addLabel="Add Service"
        showQrCode
        qrCodeDisabled={selectedRows.length === 0}
        onQrCode={() => {
          if (selectedRows.length > 0) {
            // Here you would implement the actual QR code generation logic
            // For now, showing an alert to demonstrate functionality
            alert(`Generating QR code for ${selectedRows.length} selected service(s)`);
            console.log('Selected services for QR code:', selectedRows);
          } else {
            alert('Please select at least one service to generate QR code');
          }
        }}
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

      {!loading && services.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <Wrench className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
          <Link to="/soft-service/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Add Service</Link>
        </div>
      )}

      {viewMode === 'grid' && services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {services.map((service) => (
            <DataCard 
              key={service.id} 
              id={String(service.id)}
              title={service.name} 
              subtitle={service.service_type || '-'} 
              status={getServiceStatus(service)} 
              fields={[
                { label: 'Building', value: service.building_name || '-' },
                { label: 'Frequency', value: service.frequency || '-' },
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
          ))}
        </div>
      ) : services.length > 0 && (
        <DataTable columns={columns} data={services} selectable selectedRows={selectedRows} onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])} onSelectAll={() => setSelectedRows(selectedRows.length === services.length ? [] : services.map(s => String(s.id)))} viewPath={(row) => `/soft-services/${row.id}`} />
      )}

      {services.length > 0 && (
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
            <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default SoftServiceList;
