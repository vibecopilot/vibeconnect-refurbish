import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  ClipboardCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Loader2,
  ArrowRight
} from 'lucide-react';

interface DashboardStats {
  total_safety_measures: number;
  active_inspections: number;
  pending_inspections: number;
  overdue_inspections: number;
  compliance_rate: number;
  recent_inspections_count: number;
}

interface RecentInspection {
  id: string | number;
  safety_measure_name: string;
  inspector_name: string;
  inspection_date: string;
  status: string;
  score?: number;
}

const SafetyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total_safety_measures: 0,
    active_inspections: 0,
    pending_inspections: 0,
    overdue_inspections: 0,
    compliance_rate: 0,
    recent_inspections_count: 0,
  });
  const [recentInspections, setRecentInspections] = useState<RecentInspection[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      // const [statsRes, inspectionsRes] = await Promise.all([
      //   getSafetyDashboardStats(),
      //   getRecentInspections({ limit: 5 })
      // ]);
      // setStats(statsRes.data);
      // setRecentInspections(inspectionsRes.data);
      
      // Static placeholder data
      setStats({
        total_safety_measures: 0,
        active_inspections: 0,
        pending_inspections: 0,
        overdue_inspections: 0,
        compliance_rate: 0,
        recent_inspections_count: 0,
      });
      setRecentInspections([]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Safety Dashboard</h1>
        <p className="text-muted-foreground">Overview of safety measures and inspections</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Total Safety Measures</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.total_safety_measures}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">Active Inspections</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.active_inspections}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <span className="text-sm text-muted-foreground">Pending Inspections</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.pending_inspections}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
            <span className="text-sm text-muted-foreground">Overdue Inspections</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.overdue_inspections}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm text-muted-foreground">Compliance Rate</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.compliance_rate}%</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm text-muted-foreground">Recent Inspections (7 days)</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.recent_inspections_count}</p>
        </div>
      </div>

      {/* Charts Section - Placeholder for future charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Inspections by Status</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart placeholder - Inspections by Status
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Inspections Trend (Last 6 Months)</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart placeholder - Inspections Trend
          </div>
        </div>
      </div>

      {/* Recent Inspections */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Inspections</h3>
          <button
            onClick={() => navigate('/safety/module/safety-inspections')}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {recentInspections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent inspections found
          </div>
        ) : (
          <div className="space-y-2">
            {recentInspections.map((inspection) => (
              <div
                key={inspection.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer"
                onClick={() => navigate(`/safety/module/safety-inspections/${inspection.id}`)}
              >
                <div>
                  <p className="font-medium text-foreground">{inspection.safety_measure_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {inspection.inspector_name} • {new Date(inspection.inspection_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {inspection.score && (
                    <span className="text-sm font-medium text-foreground">Score: {inspection.score}</span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    inspection.status === 'Completed' ? 'bg-success/10 text-success' :
                    inspection.status === 'Pending' ? 'bg-warning/10 text-warning' :
                    'bg-error/10 text-error'
                  }`}>
                    {inspection.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyDashboard;