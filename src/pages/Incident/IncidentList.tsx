import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Edit, AlertTriangle, Clock, CheckCircle, Pause, Target, Loader2 } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ListToolbar from '../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { getIncidents } from '../../api';
import { dateFormatSTD } from '../../utils/dateUtils';

interface Incident {
  id: number;
  time_and_date?: string;
  primary_incident_category?: string;
  secondary_incident_category?: string;
  incident_severity?: string;
  incident_level?: string;
  status?: string | null;
  building_id?: number;
  probability?: string;
  description?: string;
  created_by_id?: number;
  created_by_name?: string;
  primary_incident_sub_category?: string;
  primary_incident_sub_sub_category?: string;
  secondary_incident_sub_category?: string;
  secondary_incident_sub_sub_category?: string;
  support_required?: boolean;
  building_name?: string;
}

interface IncidentResponse {
  total_pages: number;
  total_count: number;
  current_page: number;
  incidents: Incident[];
}

interface WidgetStats {
  total: number;
  open: number;
  underInvestigation: number;
  closed: number;
  pending: number;
  supportRequired: number;
}

const IncidentList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchValue, setSearchValue] = useState('');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });

  // Calculate widget stats from incidents array
  const widgetStats: WidgetStats = useMemo(() => {
    const stats = {
      total: incidents.length,
      open: 0,
      underInvestigation: 0,
      closed: 0,
      pending: 0,
      supportRequired: 0,
    };

    incidents.forEach((incident) => {
      // Status can be null (Open), string, or undefined
      const status = incident.status;
      
      if (status === null || status === undefined || status === 'Open') {
        stats.open++;
      } else if (status === 'Under Investigation') {
        stats.underInvestigation++;
      } else if (status === 'Closed') {
        stats.closed++;
      } else if (status === 'Pending') {
        stats.pending++;
      }

      if (incident.support_required === true) {
        stats.supportRequired++;
      }
    });

    return stats;
  }, [incidents]);

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    if (searchValue) {
      const filtered = incidents.filter(
        (inc) =>
          inc.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
          inc.building_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
          inc.primary_incident_category?.toLowerCase().includes(searchValue.toLowerCase()) ||
          String(inc.id).includes(searchValue)
      );
      setFilteredIncidents(filtered);
    } else {
      setFilteredIncidents(incidents);
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchValue, incidents]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await getIncidents();
      const data = res.data as IncidentResponse;
      
      // Handle response structure
      if (data && data.incidents) {
        setIncidents(data.incidents);
        setFilteredIncidents(data.incidents);
        setPagination({
          page: data.current_page || 1,
          perPage: 10,
          total: data.total_count || data.incidents.length,
          totalPages: data.total_pages || 1,
        });
      } else if (Array.isArray(data)) {
        // Fallback for array response
        setIncidents(data);
        setFilteredIncidents(data);
        setPagination({
          page: 1,
          perPage: 10,
          total: data.length,
          totalPages: 1,
        });
      } else {
        setIncidents([]);
        setFilteredIncidents([]);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setIncidents([]);
      setFilteredIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const paginatedData = filteredIncidents.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage
  );

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return dateFormatSTD(dateString);
    } catch {
      return dateString;
    }
  };

  const getIncidentLevelColor = (level?: string) => {
    if (!level) return 'default';
    
    const levelNum = parseInt(level.replace('Level ', '').trim());
    if (levelNum === 1) return 'error'; // Extreme Risk - Red
    if (levelNum === 2) return 'warning'; // High Risk - Orange
    if (levelNum >= 3) return 'success'; // Low Risk - Green
    return 'default';
  };

  const getStatusDisplay = (status?: string | null) => {
    if (status === null || status === undefined || status === '') {
      return 'Open';
    }
    return status;
  };

  const columns: TableColumn<Incident>[] = [
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/incident/${row.id}`}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <Eye className="w-4 h-4 text-primary" />
          </Link>
          <Link
            to={`/incident/${row.id}/edit`}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <Edit className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      ),
    },
    {
      key: 'sr_no',
      header: 'Sr. No.',
      sortable: false,
      render: (_, __, index) => (
        <span className="text-sm text-foreground">{(pagination.page - 1) * pagination.perPage + index + 1}</span>
      ),
    },
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-foreground">{value}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-foreground max-w-xs truncate block" title={String(value)}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'building_name',
      header: 'Building',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'time_and_date',
      header: 'Incident Time',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{formatDateTime(String(value))}</span>,
    },
    {
      key: 'incident_level',
      header: 'Incident Level',
      sortable: true,
      render: (value) => {
        const level = String(value || '-');
        const color = getIncidentLevelColor(level);
        return (
          <StatusBadge
            status={color as 'pending' | 'approved' | 'rejected'}
            label={level}
          />
        );
      },
    },
    {
      key: 'primary_incident_category',
      header: 'Category',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'primary_incident_sub_category',
      header: 'Sub Category',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'primary_incident_sub_sub_category',
      header: 'Sub Sub Category',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
    {
      key: 'secondary_incident_category',
      header: 'Secondary',
      sortable: true,
      render: (value) => <span className="text-sm text-foreground">{value || '-'}</span>,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb items={[
        { label: 'Safety', path: '/incident' },
        { label: 'Incident Management' }
      ]} />

      {/* Widget Cards */}
      <div className="grid grid-cols-6 gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-error-light flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-error" />
            </div>
            <span className="text-xs text-muted-foreground">Total Incidents</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{widgetStats.total}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-warning-light flex items-center justify-center">
              <Clock className="w-4 h-4 text-warning" />
            </div>
            <span className="text-xs text-muted-foreground">Open</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{widgetStats.open}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-info-light flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-info" />
            </div>
            <span className="text-xs text-muted-foreground">Under Investigation</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{widgetStats.underInvestigation}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-success-light flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
            <span className="text-xs text-muted-foreground">Closed</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{widgetStats.closed}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-warning-light flex items-center justify-center">
              <Pause className="w-4 h-4 text-warning" />
            </div>
            <span className="text-xs text-muted-foreground">Pending</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{widgetStats.pending}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-error-light flex items-center justify-center">
              <Target className="w-4 h-4 text-error" />
            </div>
            <span className="text-xs text-muted-foreground">Support Required</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{widgetStats.supportRequired}</p>
        </div>
      </div>

      {/* List Toolbar */}
      <ListToolbar
        searchPlaceholder="Search incidents..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={() => {}}
        onExport={() => {}}
        onAdd={() => navigate('/incident/create')}
        addLabel="+ Add Incident"
        showViewToggle={true}
      />

      {/* Table View */}
      {viewMode === 'table' ? (
        <>
          <DataTable
            columns={columns}
            data={paginatedData}
            getRowId={(row) => String(row.id)}
            viewPath={(row) => `/incident/${row.id}`}
            onView={(row) => navigate(`/incident/${row.id}`)}
            showActions={false}
          />
          {paginatedData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-card border-t border-border">
              <AlertTriangle className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No Incidents Found</p>
            </div>
          )}
        </>
      ) : (
        // Grid View (keeping existing grid view)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedData.map((incident) => (
            <div
              key={incident.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">#{incident.id}</span>
                <StatusBadge
                  status={getStatusDisplay(incident.status) === 'Closed' ? 'approved' : 'pending'}
                  label={getStatusDisplay(incident.status)}
                />
              </div>
              
              <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">
                {incident.description || 'No Description'}
              </h3>
              
              <div className="space-y-1 text-xs text-muted-foreground mb-4">
                <p><span className="font-medium">Building:</span> {incident.building_name || '-'}</p>
                <p><span className="font-medium">Level:</span> {incident.incident_level || '-'}</p>
                <p><span className="font-medium">Date:</span> {formatDateTime(incident.time_and_date)}</p>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Link
                  to={`/incident/${incident.id}`}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Eye className="w-4 h-4 text-primary" />
                </Link>
                <Link
                  to={`/incident/${incident.id}/edit`}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.perPage + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentList;
