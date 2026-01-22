import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  ClipboardCheck,
  Shield,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  PenTool,
  Loader2,
  Maximize2
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const ViewSafetyInspection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await getSafetyInspectionById(id);
      // setData(response.data);
      
      setData(null);
    } catch (error) {
      console.error('Error fetching Safety Inspection:', error);
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

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Inspection Not Found</h3>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'Completed') return 'bg-success/10 text-success';
    if (status === 'Failed') return 'bg-error/10 text-error';
    return 'bg-warning/10 text-warning';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="h-8 w-px bg-border" />
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">
                {data.inspection_id || `Inspection #${id}`}
              </h1>
            </div>
            <button
              onClick={() => navigate(`/safety/module/safety-inspections/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-12 gap-4 auto-rows-[minmax(120px,auto)]"
        >
          {/* Inspection Information */}
          <motion.div
            variants={item}
            className={cn(
              "col-span-12 md:col-span-6 lg:col-span-4",
              "bg-card border border-border rounded-xl p-6",
              "hover:shadow-lg transition-shadow"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Inspection Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Inspection ID</span>
                <p className="text-sm font-medium text-foreground">{data.inspection_id || `#${id}`}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Status</span>
                <span className={cn(
                  "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                  getStatusColor(data.status || 'Pending')
                )}>
                  {data.status || '-'}
                </span>
              </div>
              {data.score !== null && data.score !== undefined && (
                <div>
                  <span className="text-xs text-muted-foreground">Score</span>
                  <p className="text-sm font-medium text-foreground">{data.score}%</p>
                </div>
              )}
              <div>
                <span className="text-xs text-muted-foreground">Inspection Date</span>
                <p className="text-sm text-foreground">{formatDate(data.inspection_date)}</p>
              </div>
            </div>
          </motion.div>

          {/* Safety Measure */}
          <motion.div
            variants={item}
            className={cn(
              "col-span-12 md:col-span-6 lg:col-span-4",
              "bg-card border border-border rounded-xl p-6",
              "hover:shadow-lg transition-shadow"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Safety Measure</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Name</span>
                <p className="text-sm font-medium text-foreground">{data.safety_measure_name || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Category</span>
                <p className="text-sm text-foreground">{data.safety_measure_category || '-'}</p>
              </div>
            </div>
          </motion.div>

          {/* Inspector Details */}
          <motion.div
            variants={item}
            className={cn(
              "col-span-12 md:col-span-6 lg:col-span-4",
              "bg-card border border-border rounded-xl p-6",
              "hover:shadow-lg transition-shadow"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Inspector Details</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Inspector Name</span>
                <p className="text-sm font-medium text-foreground">{data.inspector_name || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Next Inspection Date</span>
                <p className="text-sm text-foreground">{formatDate(data.next_inspection_date)}</p>
              </div>
            </div>
          </motion.div>

          {/* Findings */}
          {data.findings && (
            <motion.div
              variants={item}
              className={cn(
                "col-span-12 md:col-span-6 lg:col-span-4",
                "bg-card border border-border rounded-xl p-6",
                "hover:shadow-lg transition-shadow"
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Findings</h2>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{data.findings}</p>
            </motion.div>
          )}

          {/* Notes/Comments */}
          {data.notes && (
            <motion.div
              variants={item}
              className={cn(
                "col-span-12 md:col-span-6 lg:col-span-4",
                "bg-card border border-border rounded-xl p-6",
                "hover:shadow-lg transition-shadow"
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Notes/Comments</h2>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{data.notes}</p>
            </motion.div>
          )}

          {/* Photos */}
          {data.photos && data.photos.length > 0 && (
            <motion.div
              variants={item}
              className={cn(
                "col-span-12 md:col-span-6 lg:col-span-8",
                "bg-card border border-border rounded-xl p-6",
                "hover:shadow-lg transition-shadow"
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-indigo-500" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Photos</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.photos.map((photo: string, index: number) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-border"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Corrective Actions */}
          {data.corrective_actions && data.corrective_actions.length > 0 && (
            <motion.div
              variants={item}
              className={cn(
                "col-span-12 md:col-span-6 lg:col-span-4",
                "bg-card border border-border rounded-xl p-6",
                "hover:shadow-lg transition-shadow"
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Corrective Actions</h2>
              </div>
              <div className="space-y-3">
                {data.corrective_actions.map((action: any, index: number) => (
                  <div key={index} className="border border-border rounded-lg p-3">
                    <p className="text-sm font-medium text-foreground mb-1">{action.action_description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Assigned: {action.assigned_to}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full",
                        action.status === 'Completed' ? 'bg-success/10 text-success' :
                        action.status === 'In Progress' ? 'bg-warning/10 text-warning' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {action.status}
                      </span>
                    </div>
                    {action.due_date && (
                      <p className="text-xs text-muted-foreground mt-1">Due: {formatDate(action.due_date)}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Checklist Responses */}
          {data.checklist_responses && data.checklist_responses.length > 0 && (
            <motion.div
              variants={item}
              className={cn(
                "col-span-12",
                "bg-card border border-border rounded-xl p-6",
                "hover:shadow-lg transition-shadow"
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-cyan-500" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Checklist Responses</h2>
              </div>
              <div className="space-y-3">
                {data.checklist_responses.map((response: any, index: number) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">{response.question_name || `Question ${index + 1}`}</p>
                      {response.answer && (
                        <span className="px-2 py-1 bg-success/10 text-success rounded text-xs">Answered</span>
                      )}
                    </div>
                    <div className="text-sm text-foreground">
                      <span className="text-muted-foreground">Answer: </span>
                      <span>{String(response.answer) || 'Not answered'}</span>
                    </div>
                    {response.photo && (
                      <div className="mt-2">
                        <img
                          src={response.photo}
                          alt="Response photo"
                          className="w-24 h-24 object-cover rounded-lg border border-border"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Sign-off */}
          {data.signature && (
            <motion.div
              variants={item}
              className={cn(
                "col-span-12 md:col-span-6 lg:col-span-4",
                "bg-card border border-border rounded-xl p-6",
                "hover:shadow-lg transition-shadow"
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-pink-500" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Sign-off</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground">Inspector Signature</span>
                  <div className="mt-2 border border-border rounded-lg p-4 bg-background">
                    <img src={data.signature} alt="Signature" className="max-h-20" />
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Approval Status</span>
                  <span className={cn(
                    "inline-flex px-2 py-1 rounded-full text-xs font-medium ml-2",
                    data.approval_status === 'Approved' ? 'bg-success/10 text-success' :
                    data.approval_status === 'Rejected' ? 'bg-error/10 text-error' :
                    'bg-warning/10 text-warning'
                  )}>
                    {data.approval_status || 'Pending'}
                  </span>
                </div>
                {data.comments && (
                  <div>
                    <span className="text-xs text-muted-foreground">Comments</span>
                    <p className="text-sm text-foreground mt-1">{data.comments}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto}
            alt="Full size"
            className="max-w-full max-h-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ViewSafetyInspection;