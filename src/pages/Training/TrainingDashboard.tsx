import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Award,
  TrendingUp,
  Loader2,
  ArrowRight,
  CheckCircle,
  Clock
} from 'lucide-react';

interface DashboardStats {
  total_programs: number;
  active_sessions: number;
  total_enrollments: number;
  completion_rate: number;
  upcoming_sessions: number;
  materials_count: number;
}

interface UpcomingSession {
  id: string | number;
  session_name: string;
  training_program: string;
  date_time: string;
  location: string;
  enrolled_count: number;
  max_capacity: number;
  status: string;
}

const TrainingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total_programs: 0,
    active_sessions: 0,
    total_enrollments: 0,
    completion_rate: 0,
    upcoming_sessions: 0,
    materials_count: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      // const [statsRes, sessionsRes] = await Promise.all([
      //   getTrainingDashboardStats(),
      //   getUpcomingSessions({ limit: 5 })
      // ]);
      // setStats(statsRes.data);
      // setUpcomingSessions(sessionsRes.data);
      
      // Static placeholder data
      setStats({
        total_programs: 0,
        active_sessions: 0,
        total_enrollments: 0,
        completion_rate: 0,
        upcoming_sessions: 0,
        materials_count: 0,
      });
      setUpcomingSessions([]);
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
        <h1 className="text-2xl font-bold text-foreground">Training Dashboard</h1>
        <p className="text-muted-foreground">Overview of training programs, sessions, and materials</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Total Programs</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.total_programs}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">Active Sessions</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.active_sessions}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">Total Enrollments</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.total_enrollments}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm text-muted-foreground">Completion Rate</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.completion_rate}%</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <span className="text-sm text-muted-foreground">Upcoming Sessions</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.upcoming_sessions}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm text-muted-foreground">Training Materials</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.materials_count}</p>
        </div>
      </div>

      {/* Charts Section - Placeholder for future charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Programs by Category</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart placeholder - Programs by Category
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Completion Rate Trend (Last 6 Months)</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart placeholder - Completion Rate Trend
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Upcoming Sessions</h3>
          <button
            onClick={() => navigate('/training/module/training-sessions')}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {upcomingSessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No upcoming sessions found
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer"
                onClick={() => navigate(`/training/module/training-sessions/${session.id}`)}
              >
                <div>
                  <p className="font-medium text-foreground">{session.session_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {session.training_program} • {new Date(session.date_time).toLocaleDateString()} • {session.location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {session.enrolled_count}/{session.max_capacity} enrolled
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    session.status === 'Completed' ? 'bg-success/10 text-success' :
                    session.status === 'Ongoing' ? 'bg-blue-500/10 text-blue-500' :
                    session.status === 'Scheduled' ? 'bg-warning/10 text-warning' :
                    'bg-error/10 text-error'
                  }`}>
                    {session.status}
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

export default TrainingDashboard;
