import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, AlertTriangle, ClipboardCheck, Clock, User, FileText } from 'lucide-react';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { routineTaskService, RoutineTask } from '../../../services/assetSubModules.service';

interface TaskDetail extends RoutineTask {
  submissions?: { id: number; question?: string; answer?: string }[];
}

const ViewRoutineTask: React.FC = () => {
  const { id, assetId } = useParams<{ id: string; assetId?: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskDetails();
  }, [id, assetId]);

  const fetchTaskDetails = async () => {
    if (!id || !assetId) return;
    setLoading(true);
    try {
      const res = await routineTaskService.getRoutineTaskById(assetId, id);
      const data = res.data;
      const activity = Array.isArray(data?.activities) ? data.activities[0] : data?.activity || data;
      if (activity) {
        setTask({ ...(activity as RoutineTask), submissions: (activity as any)?.submissions || [] });
      } else {
        setError('Task not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task details');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading task details...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Task</h3>
        <p className="text-muted-foreground mb-4">{error || 'Task not found'}</p>
        <button onClick={() => navigate('/asset/routine-task')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 pb-0">
        <Breadcrumb
          items={[
            { label: 'FM Module', path: '/asset' },
            { label: 'Asset', path: '/asset' },
            { label: 'Routine Task', path: '/asset/routine-task' },
            { label: task.checklist_name || `Task #${task.id}` }
          ]}
        />
      </div>

      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/asset/routine-task')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="h-8 w-px bg-border" />
            <div>
              <h1 className="text-lg font-bold text-foreground">{task.checklist_name || `Task #${task.id}`}</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-muted text-foreground text-[11px] border border-border capitalize">
                  {task.status || '-'}
                </span>
                {task.asset_name && <span>• {task.asset_name}</span>}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Highlights */}
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-xs text-muted-foreground">Status</p>
          <span className="px-2 py-1 inline-flex w-fit rounded-full bg-muted text-foreground text-xs border border-border capitalize">
            {task.status || '-'}
          </span>
          <p className="text-xs text-muted-foreground">Frequency</p>
          <p className="text-sm font-semibold">{task.frequency || '-'}</p>
        </div>
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-xs text-muted-foreground">Asset</p>
          <p className="text-sm font-semibold">{task.asset_name || '-'}</p>
          <p className="text-xs text-muted-foreground">Location</p>
          <p className="text-sm font-semibold">{(task as any).location || '-'}</p>
        </div>
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-xs text-muted-foreground">Start / End</p>
          <p className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> {formatDateTime(task.start_time)}
          </p>
          <p className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> {formatDateTime(task.end_time)}
          </p>
        </div>
      </div>

      <div className="px-6 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Task Details */}
        <div className="lg:col-span-6 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Task Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem label="Checklist" value={task.checklist_name || '-'} />
            <InfoItem label="Asset" value={task.asset_name || '-'} />
            <InfoItem label="Status" value={task.status || '-'} />
            <InfoItem label="Frequency" value={task.frequency || '-'} />
            <InfoItem label="Location" value={(task as any).location || '-'} />
            <InfoItem label="Completed By" value={(task as any).assigned_to_name || '-'} />
          </div>
        </div>

        {/* Schedule */}
        <div className="lg:col-span-6 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Schedule</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem label="Start Time" value={formatDateTime(task.start_time)} />
            <InfoItem label="End Time" value={formatDateTime(task.end_time)} />
            <InfoItem label="Assigned To" value={task.assigned_to || '-'} />
            <InfoItem label="Created On" value={formatDateTime(task.created_at)} />
            <InfoItem label="Updated On" value={formatDateTime(task.updated_at)} />
          </div>
        </div>

        {/* Submissions */}
        {task.submissions && task.submissions.length > 0 && (
          <div className="lg:col-span-12 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Submissions ({task.submissions.length})</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {task.submissions.map((sub, index) => (
                <div key={sub.id || index} className="p-4 bg-muted/20 border border-border rounded-lg space-y-2">
                  <p className="text-xs text-muted-foreground">{sub.question || `Question ${index + 1}`}</p>
                  <p className="text-sm font-medium text-foreground">{sub.answer || '-'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Groups / Questions */}
        {task.groups && task.groups.length > 0 && (
          <div className="lg:col-span-12 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Checklist Questions</h2>
            </div>
            <div className="p-6 space-y-5">
              {task.groups.map((group, gIdx) => (
                <div key={group.group_id || gIdx} className="border border-border rounded-xl p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      {group.group || group.group_id ? group.group || `Group ${group.group_id}` : `Group ${gIdx + 1}`}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {group.questions?.length || 0} questions
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {group.questions?.map((q, qIdx) => (
                      <div key={q.id || qIdx} className="bg-background border border-border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{q.name || `Question ${qIdx + 1}`}</p>
                          <span className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground uppercase border border-border">
                            {q.qtype || '-'}
                          </span>
                        </div>
                        {q.qtype === 'multiple' && (
                          <div className="flex flex-wrap gap-2">
                            {[q.option1, q.option2, q.option3, q.option4]
                              .filter(Boolean)
                              .map((opt, optIdx) => (
                                <span
                                  key={optIdx}
                                  className="px-2 py-1 text-xs rounded-full bg-muted border border-border text-foreground"
                                >
                                  {opt}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);

export default ViewRoutineTask; 
