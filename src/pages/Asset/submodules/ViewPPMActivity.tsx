import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Clock, Eye, LayoutGrid, List, Loader2, User } from 'lucide-react';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { ppmActivityService } from '../../../services/assetSubModules.service';

type ActivitySubmission = {
  id?: number;
  value?: string;
  question?: {
    id?: number;
    name?: string;
    group_name?: string;
  };
  question_attachments?: { id?: number; document?: string }[];
};

type ActivityRow = {
  id: number;
  start_time?: string;
  end_time?: string;
  status?: string;
  assigned_to?: string | null;
  assigned_name?: string | null;
  checklist?: { id?: number; name?: string; frequency?: string } | null;
  comment?: string | null;
  activity_log?: { submissions?: ActivitySubmission[] };
};

type SiteAsset = { id?: number; name?: string; description?: string };

const ViewPPMActivity: React.FC = () => {
  const { id, assetId } = useParams<{ id: string; assetId?: string }>();
  const navigate = useNavigate();

  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [siteAsset, setSiteAsset] = useState<SiteAsset | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(id ? Number(id) : null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    fetchActivityDetails();
  }, [assetId, id]);

  useEffect(() => {
    if (!selectedId && activities.length > 0) {
      setSelectedId(activities[0].id);
    }
  }, [activities, selectedId]);

  const fetchActivityDetails = async () => {
    if (!assetId) return;
    setLoading(true);
    try {
      const res = await ppmActivityService.getPPMActivityByAsset(assetId);
      const raw = res.data || {};
      const activityList = Array.isArray(raw.activities) ? raw.activities : [];
      setActivities(activityList);
      setSiteAsset(raw.site_asset || null);
      if (id) {
        setSelectedId(Number(id));
      } else if (activityList.length) {
        setSelectedId(activityList[0].id);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch PPM activity details');
    } finally {
      setLoading(false);
    }
  };

  const selectedActivity = useMemo(
    () => activities.find((item) => String(item.id) === String(selectedId)) || null,
    [activities, selectedId],
  );

  const filteredActivities = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return activities;
    return activities.filter((item) => {
      const haystack = [
        item.checklist?.name,
        item.checklist?.frequency,
        item.assigned_name,
        item.assigned_to,
        item.status,
        item.comment,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [activities, search]);

  useEffect(() => {
    if (!filteredActivities.length) return;
    const stillVisible = filteredActivities.find((a) => String(a.id) === String(selectedId));
    if (!stillVisible) {
      setSelectedId(filteredActivities[0].id);
    }
  }, [filteredActivities, selectedId]);

  const formatDateTime = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        <p className="text-muted-foreground">Loading PPM activities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-12 w-12 text-destructive mb-3" />
        <p className="text-lg font-semibold mb-1">Unable to load PPM activity</p>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => navigate('/asset/ppm-activity')}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
        >
          Back to PPM activities
        </button>
      </div>
    );
  }

  const headerTitle =
    selectedActivity?.checklist?.name ||
    (activities.length > 0 ? 'PPM Activity' : 'No PPM activities found');

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur pb-2">
          <Breadcrumb
            items={[
              { label: 'FM Module', path: '/asset' },
              { label: 'Asset', path: '/asset' },
              { label: 'PPM Activity', path: '/asset/ppm-activity' },
              { label: headerTitle },
            ]}
          />
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => navigate('/asset/ppm-activity')}
              className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
              aria-label="Back to PPM Activity"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold text-foreground">{headerTitle}</h1>
              <p className="text-sm text-muted-foreground">
                {siteAsset?.name ? `Asset · ${siteAsset.name}` : 'PPM schedules'}
              </p>
            </div>
          </div>
        </div>

        {selectedActivity && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card title="PPM Details" icon={<Clock className="h-5 w-5 text-primary" />}>
              <InfoRow label="Checklist" value={selectedActivity.checklist?.name || '-'} />
              <InfoRow label="Frequency" value={selectedActivity.checklist?.frequency || '-'} />
              <InfoRow label="Status" value={selectedActivity.status || '-'} />
              <InfoRow label="Asset" value={siteAsset?.name || '-'} />
            </Card>

            <Card title="Schedule" icon={<User className="h-5 w-5 text-primary" />}>
              <InfoRow label="Start Time" value={formatDateTime(selectedActivity.start_time)} />
              <InfoRow label="End Time" value={formatDateTime(selectedActivity.end_time)} />
              <InfoRow
                label="Assigned To"
                value={selectedActivity.assigned_name || selectedActivity.assigned_to || '-'}
              />
              <InfoRow label="Comment" value={selectedActivity.comment || '-'} />
            </Card>

            <Card title="Submissions" icon={<Clock className="h-5 w-5 text-primary" />}>
              {selectedActivity.activity_log?.submissions?.length ? (
                <div className="space-y-3">
                  {selectedActivity.activity_log.submissions.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="rounded-lg border border-border bg-muted/40 px-3 py-2"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {item.question?.name || `Question ${idx + 1}`}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.value || 'No response'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No submissions yet</p>
              )}
            </Card>
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border">
            <div>
              <h2 className="text-lg font-semibold text-foreground">All Activities</h2>
              <p className="text-sm text-muted-foreground">Select a row to preview details.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-1">
                <button
                  aria-label="List view"
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full ${
                    viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  aria-label="Grid view"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full ${
                    viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by checklist, status, or assignee"
                className="h-10 w-60 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <span className="text-xs text-muted-foreground">Total {filteredActivities.length}</span>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left w-14">View</th>
                    <th className="px-4 py-3 text-left">Checklist</th>
                    <th className="px-4 py-3 text-left">Frequency</th>
                    <th className="px-4 py-3 text-left">Start</th>
                    <th className="px-4 py-3 text-left">End</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Assigned To</th>
                    <th className="px-4 py-3 text-left">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map((item) => {
                    const isSelected = String(item.id) === String(selectedId);
                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-border last:border-0 ${
                          isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedId(item.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
                            aria-label="View activity"
                          >
                            <Eye className="h-4 w-4 text-primary" />
                          </button>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {item.checklist?.name || '-'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.checklist?.frequency || '-'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDateTime(item.start_time)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDateTime(item.end_time)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{item.status || '-'}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.assigned_name || item.assigned_to || '-'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{item.comment || '-'}</td>
                      </tr>
                    );
                  })}
                  {!filteredActivities.length && (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                        No PPM activities available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredActivities.length ? (
                filteredActivities.map((item) => {
                  const isSelected = String(item.id) === String(selectedId);
                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border border-border bg-card p-4 shadow-sm transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Checklist</p>
                          <h3 className="text-base font-semibold text-foreground">
                            {item.checklist?.name || '-'}
                          </h3>
                        </div>
                        <button
                          onClick={() => setSelectedId(item.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
                          aria-label="View activity"
                        >
                          <Eye className="h-4 w-4 text-primary" />
                        </button>
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Frequency</span>
                          <span className="text-foreground">{item.checklist?.frequency || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status</span>
                          <span className="text-foreground">{item.status || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Start</span>
                          <span className="text-foreground">{formatDateTime(item.start_time)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Assigned</span>
                          <span className="text-foreground">
                            {item.assigned_name || item.assigned_to || '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-8 text-center text-muted-foreground">
                  No PPM activities available.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Card: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  children,
}) => (
  <div className="rounded-2xl border border-border bg-card shadow-sm">
    <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/30">
      {icon}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
    <div className="p-5 space-y-3">{children}</div>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground text-right">{value}</span>
  </div>
);

export default ViewPPMActivity;
