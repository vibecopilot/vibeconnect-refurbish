import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Package, ClipboardCheck, ListChecks, Clock, CheckCircle, AlertCircle, Eye, EyeOff, Download, Search } from 'lucide-react';
import DataCard from '../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import { getSoftServices, getServicesChecklist, getServicesTaskList } from '../../api';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

interface Service {
  id: number;
  name: string;
  building_name: string;
  floor_name: string;
  units: Array<{ id: number; name: string }>;
  user_name: string;
  created_at: string;
}

interface SoftServicesOverviewProps {
  viewMode?: 'grid' | 'table';
  searchValue?: string;
  perPage?: number;
  isColumnMenuOpen?: boolean;
  setIsColumnMenuOpen?: (value: boolean) => void;
}

const SoftServicesOverview: React.FC<SoftServicesOverviewProps> = ({
  viewMode = 'table',
  searchValue = '',
  perPage = 10,
  isColumnMenuOpen = false,
  setIsColumnMenuOpen = () => {}
}) => {
  const [loading, setLoading] = useState(true);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [activeCard, setActiveCard] = useState<string>('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage, total: 0, totalPages: 0 });
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  // Statistics
  const [stats, setStats] = useState({
    totalServices: 0,
    checklist: 0,
    tasks: 0,
    pending: 0,
    complete: 0,
    overdue: 0,
  });

  useEffect(() => {
    setPagination(prev => ({ ...prev, perPage, page: 1 }));
  }, [perPage]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Services
      const serviceResponse = await getSoftServices();
      const sortedServices = serviceResponse.data.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAllServices(sortedServices);
      setFilteredServices(sortedServices);

      // Fetch Task Stats
      const taskResponse = await getServicesTaskList();
      const taskData = taskResponse.data;

      setStats({
        totalServices: taskData.total_services || 0,
        checklist: taskData.checklist || 0,
        tasks: taskData.tasks || 0,
        pending: taskData.by_status?.pending || 0,
        complete: taskData.by_status?.complete || 0,
        overdue: taskData.by_status?.overdue || 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCardClick = (cardType: string) => {
    setActiveCard(cardType);
    // For now, just show all services. You can add filtering logic if needed.
    setFilteredServices(allServices);
  };

  const dateFormat = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Client-side search filtering
  const filteredData = allServices.filter(service =>
    !searchValue ||
    service.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    service.building_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    service.floor_name?.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Client-side pagination
  const startIndex = (pagination.page - 1) * pagination.perPage;
  const endIndex = startIndex + pagination.perPage;
  const paginatedServices = filteredData.slice(startIndex, endIndex);

  // Export to Excel functionality
  const handleExportToExcel = () => {
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileName = "Soft_Services_Overview.xlsx";
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    
    toast.success('Excel file exported successfully');
  };

  const allColumns: Array<TableColumn<Service> & { id: string; label: string }> = [
    { id: 'id', label: 'S.No', key: 'id', header: 'S.No', width: '80px', render: (_val, _row, idx) => startIndex + idx + 1 },
    { id: 'name', label: 'Service Name', key: 'name', header: 'Service Name', sortable: true, render: (v) => v || '-' },
    { id: 'building_name', label: 'Building', key: 'building_name', header: 'Building', render: (v) => v || '-' },
    { id: 'floor_name', label: 'Floor', key: 'floor_name', header: 'Floor', render: (v) => v || '-' },
    {
      id: 'units',
      label: 'Unit',
      key: 'units',
      header: 'Unit',
      render: (_v, row) => (
        <div className="flex gap-1 flex-wrap">
          {row.units?.map((unit, idx) => (
            <span key={unit.id}>
              {unit.name}
              {idx < (row.units?.length || 0) - 1 && ','}
            </span>
          ))}
        </div>
      )
    },
    { id: 'user_name', label: 'Created By', key: 'user_name', header: 'Created By', render: (v) => v || '-' },
    { id: 'created_at', label: 'Created On', key: 'created_at', header: 'Created On', render: (v) => dateFormat(v) },
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

  if (loading && allServices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards - Full Width Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Services Card */}
        <div
          onClick={() => handleCardClick('all')}
          className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'all'
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-card text-blue-500 border-blue-500 hover:bg-blue-50'
          }`}
        >
          <Package className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Total Services</span>
          <span className={`text-2xl font-bold mt-1 ${activeCard === 'all' ? 'text-white' : 'text-foreground'}`}>
            {stats.totalServices}
          </span>
        </div>

        {/* Checklist Card */}
        <div
          onClick={() => handleCardClick('checklist')}
          className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'checklist'
              ? 'bg-green-500 text-white border-green-500'
              : 'bg-card text-green-600 border-green-500 hover:bg-green-50'
          }`}
        >
          <ClipboardCheck className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Checklist</span>
          <span className={`text-2xl font-bold mt-1 ${activeCard === 'checklist' ? 'text-white' : 'text-foreground'}`}>
            {stats.checklist}
          </span>
        </div>

        {/* Tasks Card */}
        <div
          onClick={() => handleCardClick('tasks')}
          className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'tasks'
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-card text-red-600 border-red-500 hover:bg-red-50'
          }`}
        >
          <ListChecks className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Tasks</span>
          <span className={`text-2xl font-bold mt-1 ${activeCard === 'tasks' ? 'text-white' : 'text-foreground'}`}>
            {stats.tasks}
          </span>
        </div>

        {/* Tasks Pending Card */}
        <div
          onClick={() => handleCardClick('pending')}
          className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'pending'
              ? 'bg-yellow-500 text-white border-yellow-500'
              : 'bg-card text-yellow-600 border-yellow-500 hover:bg-yellow-50'
          }`}
        >
          <Clock className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Tasks Pending</span>
          <span className={`text-2xl font-bold mt-1 ${activeCard === 'pending' ? 'text-white' : 'text-foreground'}`}>
            {stats.pending}
          </span>
        </div>

        {/* Tasks Completed Card */}
        <div
          onClick={() => handleCardClick('complete')}
          className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'complete'
              ? 'bg-cyan-500 text-white border-cyan-500'
              : 'bg-card text-cyan-600 border-cyan-500 hover:bg-cyan-50'
          }`}
        >
          <CheckCircle className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Tasks Completed</span>
          <span className={`text-2xl font-bold mt-1 ${activeCard === 'complete' ? 'text-white' : 'text-foreground'}`}>
            {stats.complete}
          </span>
        </div>

        {/* Tasks Overdue Card */}
        <div
          onClick={() => handleCardClick('overdue')}
          className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeCard === 'overdue'
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-card text-orange-600 border-orange-500 hover:bg-orange-50'
          }`}
        >
          <AlertCircle className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Tasks Overdue</span>
          <span className={`text-2xl font-bold mt-1 ${activeCard === 'overdue' ? 'text-white' : 'text-foreground'}`}>
            {stats.overdue}
          </span>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold">
            {activeCard === 'all' && 'All Services'}
            {activeCard === 'checklist' && 'Checklist'}
            {activeCard === 'tasks' && 'All Tasks'}
            {activeCard === 'pending' && 'Pending Tasks'}
            {activeCard === 'complete' && 'Completed Tasks'}
            {activeCard === 'overdue' && 'Overdue Tasks'}
          </h3>
          
          {/* Search and Column Controls */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, building, or floor..."
                value={searchValue}
                onChange={(e) => {
                  // This would be handled by parent component, but we'll show the search value
                  console.log('Search value:', e.target.value);
                }}
                className="pl-10 pr-4 py-2 w-full sm:w-64 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            {/* Column Visibility Toggle */}
            <div className="relative">
              <button
                onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <Eye className="w-4 h-4" />
                Columns
              </button>
              
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
            </div>
          </div>
        </div>
        
        {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}
        
        {paginatedServices.length > 0 ? (
          <DataTable
            columns={visibleColumns}
            data={paginatedServices}
            selectable
            selectedRows={selectedRows}
            onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])}
            onSelectAll={() => setSelectedRows(selectedRows.length === paginatedServices.length ? [] : paginatedServices.map(s => String(s.id)))}
            viewPath={(row) => `/soft-services/${row.id}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
        
        {/* Pagination */}
        {paginatedServices.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} records
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">«</button>
              <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">‹ Prev</button>
              <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
              <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={endIndex >= filteredData.length} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Next ›</button>
              <button onClick={() => setPagination(prev => ({ ...prev, page: Math.ceil(filteredData.length / prev.perPage) }))} disabled={endIndex >= filteredData.length} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">»</button>
            </div>
            <select value={pagination.perPage} onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))} className="px-2 py-1.5 text-sm border border-border rounded-md bg-background">
              <option value={10}>10 / page</option>
              <option value={12}>12 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoftServicesOverview;