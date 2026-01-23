import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Users, 
  MapPin, 
  FileText,
  MessageSquare,
  AlertTriangle,
  Loader2,
  CheckCircle,
  X,
  Link as LinkIcon
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

const ViewTrainingSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await getTrainingSessionById(id);
      // setData(response.data);
      
      // Static placeholder
      setData(null);
    } catch (error) {
      console.error('Error fetching Training Session:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
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
        <h3 className="text-lg font-semibold text-foreground mb-2">Training Session Not Found</h3>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

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
              <h1 className="text-lg font-bold text-foreground">{data.session_name || '-'}</h1>
            </div>
            <button
              onClick={() => navigate(`/training/module/training-sessions/${id}/edit`)}
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
          {/* Session Information */}
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
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Session Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Session Name</span>
                <p className="text-sm font-medium text-foreground">{data.session_name || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Training Program</span>
                <p className="text-sm text-foreground">{data.training_program || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Date & Time</span>
                <p className="text-sm text-foreground">{formatDateTime(data.date_time)}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Location/Venue</span>
                <p className="text-sm text-foreground">{data.location || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Instructor</span>
                <p className="text-sm text-foreground">{data.instructor || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Max Capacity</span>
                <p className="text-sm text-foreground">{data.max_capacity || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Status</span>
                <span className={cn(
                  "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                  data.status === 'Completed' ? 'bg-success/10 text-success' :
                  data.status === 'Ongoing' ? 'bg-blue-500/10 text-blue-500' :
                  data.status === 'Scheduled' ? 'bg-warning/10 text-warning' :
                  'bg-error/10 text-error'
                )}>
                  {data.status || '-'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Attendees List */}
          <motion.div
            variants={item}
            className={cn(
              "col-span-12 md:col-span-6 lg:col-span-8",
              "bg-card border border-border rounded-xl p-6",
              "hover:shadow-lg transition-shadow"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Attendees List</h2>
            </div>
            {data.attendees && data.attendees.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {data.attendees.map((attendee: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">{attendee.name}</p>
                      <p className="text-xs text-muted-foreground">{attendee.email}</p>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      attendee.attendance_status === 'Present' ? 'bg-success/10 text-success' :
                      attendee.attendance_status === 'Absent' ? 'bg-error/10 text-error' :
                      'bg-warning/10 text-warning'
                    )}>
                      {attendee.attendance_status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No attendees found
              </div>
            )}
          </motion.div>

          {/* Materials/Resources */}
          <motion.div
            variants={item}
            className={cn(
              "col-span-12 md:col-span-6 lg:col-span-6",
              "bg-card border border-border rounded-xl p-6",
              "hover:shadow-lg transition-shadow"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Materials/Resources</h2>
            </div>
            {data.materials && data.materials.length > 0 ? (
              <div className="space-y-2">
                {data.materials.map((material: any, index: number) => (
                  <div key={index} className="p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      {material.type === 'Link' ? (
                        <LinkIcon className="w-4 h-4 text-primary" />
                      ) : (
                        <FileText className="w-4 h-4 text-primary" />
                      )}
                      <span className="text-sm font-medium text-foreground">{material.title}</span>
                    </div>
                    {material.url && (
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        {material.url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No materials available
              </div>
            )}
          </motion.div>

          {/* Feedback Collection */}
          <motion.div
            variants={item}
            className={cn(
              "col-span-12 md:col-span-6 lg:col-span-6",
              "bg-card border border-border rounded-xl p-6",
              "hover:shadow-lg transition-shadow"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Feedback Collection</h2>
            </div>
            {data.feedback && data.feedback.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.feedback.map((fb: any, index: number) => (
                  <div key={index} className="p-3 border border-border rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-2">{fb.question}</p>
                    {fb.response ? (
                      <p className="text-xs text-muted-foreground">{fb.response}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No response yet</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No feedback questions available
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ViewTrainingSession;
