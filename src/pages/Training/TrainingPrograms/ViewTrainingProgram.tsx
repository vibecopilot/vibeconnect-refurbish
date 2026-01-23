import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  BookOpen, 
  Users, 
  Calendar, 
  Award,
  FileText,
  Link as LinkIcon,
  AlertTriangle,
  Loader2,
  Maximize2,
  Clock,
  CheckCircle,
  X
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

const ViewTrainingProgram: React.FC = () => {
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
      // const response = await getTrainingProgramById(id);
      // setData(response.data);
      
      // Static placeholder
      setData(null);
    } catch (error) {
      console.error('Error fetching Training Program:', error);
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
        <h3 className="text-lg font-semibold text-foreground mb-2">Training Program Not Found</h3>
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
              <h1 className="text-lg font-bold text-foreground">{data.training_name || '-'}</h1>
            </div>
            <button
              onClick={() => navigate(`/training/module/training-programs/${id}/edit`)}
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
          {/* Basic Information */}
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
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Training Name</span>
                <p className="text-sm font-medium text-foreground">{data.training_name || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Category</span>
                <p className="text-sm text-foreground">{data.category || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Training Type</span>
                <p className="text-sm text-foreground">{data.training_type || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Duration</span>
                <p className="text-sm text-foreground">
                  {data.duration ? `${data.duration} ${data.duration_unit || 'hours'}` : '-'}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Instructor/Provider</span>
                <p className="text-sm text-foreground">{data.instructor || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Status</span>
                <span className={cn(
                  "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                  data.status === 'Active' ? 'bg-success/10 text-success' :
                  data.status === 'Draft' ? 'bg-warning/10 text-warning' :
                  'bg-error/10 text-error'
                )}>
                  {data.status || '-'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            variants={item}
            className={cn(
              "col-span-12 md:col-span-6 lg:col-span-8",
              "bg-card border border-border rounded-xl p-6",
              "hover:shadow-lg transition-shadow"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Description</h2>
            </div>
            <p className="text-sm text-foreground">{data.description || 'No description available'}</p>
          </motion.div>

          {/* Enrollment Details */}
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
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Enrollment</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Max Participants</span>
                <p className="text-sm font-medium text-foreground">{data.max_participants || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Enrollment Period</span>
                <p className="text-sm text-foreground">
                  {data.enrollment_start_date && data.enrollment_end_date
                    ? `${new Date(data.enrollment_start_date).toLocaleDateString()} - ${new Date(data.enrollment_end_date).toLocaleDateString()}`
                    : '-'
                  }
                </p>
              </div>
              {data.target_audience && data.target_audience.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Target Audience</span>
                  <div className="mt-2 space-y-1">
                    {data.target_audience.map((audience: any, index: number) => (
                      <div key={index} className="text-sm text-foreground">
                        {audience.role} - {audience.department}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.prerequisites && (
                <div>
                  <span className="text-xs text-muted-foreground">Prerequisites</span>
                  <p className="text-sm text-foreground">{data.prerequisites}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Assessment */}
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
                <Award className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Assessment</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {data.include_test ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : (
                  <X className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm text-foreground">Include test/quiz</span>
              </div>
              {data.include_test && (
                <div>
                  <span className="text-xs text-muted-foreground">Passing Score</span>
                  <p className="text-sm font-medium text-foreground">{data.passing_score || '-'}%</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                {data.certificate_on_completion ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : (
                  <X className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm text-foreground">Certificate on completion</span>
              </div>
            </div>
          </motion.div>

          {/* Modules/Sections */}
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
                <FileText className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Modules/Sections</h2>
            </div>
            {data.modules && data.modules.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.modules.map((module: any, index: number) => (
                  <div key={index} className="p-2 border border-border rounded">
                    <p className="text-sm font-medium text-foreground">{module.module_name}</p>
                    {module.description && (
                      <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No modules available
              </div>
            )}
          </motion.div>

          {/* Materials */}
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
                <FileText className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Materials</h2>
            </div>
            {data.materials && data.materials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.materials.map((material: any, index: number) => (
                  <div key={index} className="p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {material.type === 'Link' ? (
                        <LinkIcon className="w-4 h-4 text-primary" />
                      ) : (
                        <FileText className="w-4 h-4 text-primary" />
                      )}
                      <span className="text-xs text-muted-foreground">{material.type}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{material.title}</p>
                    {material.url && (
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 block"
                      >
                        {material.url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No materials available
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ViewTrainingProgram;
