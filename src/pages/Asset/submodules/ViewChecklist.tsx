import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, Edit, ArrowLeft, AlertTriangle, ClipboardList, HelpCircle } from 'lucide-react';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import StatusBadge, { StatusType } from '../../../components/ui/StatusBadge';
import { checklistService, Checklist } from '../../../services/assetSubModules.service';

interface ChecklistDetail extends Checklist {
  questions?: { id: number; question: string; question_type?: string }[];
  created_at?: string;
  updated_at?: string;
}

const ViewChecklist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<ChecklistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChecklistDetails();
  }, [id]);

  const fetchChecklistDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await checklistService.getChecklistById(id);
      setChecklist(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch checklist details');
    } finally {
      setLoading(false);
    }
  };

  const getChecklistStatus = (): StatusType => {
    if (!checklist) return 'available';
    if (checklist.status?.toLowerCase() === 'active') return 'in-use';
    if (checklist.status?.toLowerCase() === 'inactive') return 'breakdown';
    return 'available';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading checklist details...</p>
      </div>
    );
  }

  if (error || !checklist) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Checklist</h3>
        <p className="text-muted-foreground mb-4">{error || 'Checklist not found'}</p>
        <button onClick={() => navigate('/asset/checklist')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Breadcrumb items={[
        { label: 'FM Module', path: '/asset' },
        { label: 'Asset', path: '/asset' },
        { label: 'Checklist', path: '/asset/checklist' },
        { label: checklist.name || `Checklist #${checklist.id}` }
      ]} />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/asset/checklist')} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{checklist.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={getChecklistStatus()} />
              {checklist.ctype && <span className="px-2 py-0.5 text-xs font-medium rounded-full border bg-blue-100 text-blue-700 border-blue-200">{checklist.ctype}</span>}
            </div>
          </div>
        </div>
        <Link to={`/asset/checklist/${id}/edit`} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Edit className="w-4 h-4" /> Edit Checklist
        </Link>
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" /> Checklist Details
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoItem label="Name" value={checklist.name} />
              <InfoItem label="Type" value={checklist.ctype || '-'} />
              <InfoItem label="Frequency" value={checklist.frequency || '-'} />
              <InfoItem label="Questions" value={String(checklist.questions_count || checklist.questions?.length || 0)} />
              <InfoItem label="Created On" value={formatDate(checklist.created_at)} />
              <InfoItem label="Status" value={checklist.status || '-'} />
            </div>
            {checklist.description && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p className="text-foreground">{checklist.description}</p>
              </div>
            )}
          </div>
        </div>

        {checklist.questions && checklist.questions.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" /> Questions ({checklist.questions.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {checklist.questions.map((q, index) => (
                  <div key={q.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-xs font-medium">{index + 1}</span>
                    <div className="flex-1">
                      <p className="text-foreground">{q.question}</p>
                      {q.question_type && <span className="text-xs text-muted-foreground mt-1">Type: {q.question_type}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);

export default ViewChecklist;
