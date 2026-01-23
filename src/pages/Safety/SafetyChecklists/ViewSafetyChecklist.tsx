import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  Play,
  ClipboardList, 
  HelpCircle,
  CheckCircle,
  Clock,
  Loader2,
  AlertTriangle
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

const ViewSafetyChecklist: React.FC = () => {
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
      // const response = await getSafetyChecklistById(id);
      // setData(response.data);
      
      setData(null);
    } catch (error) {
      console.error('Error fetching Safety Checklist:', error);
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
        <h3 className="text-lg font-semibold text-foreground mb-2">Checklist Not Found</h3>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const totalQuestions = data.groups?.reduce((sum: number, group: any) => 
    sum + (group.questions?.length || 0), 0) || 0;

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
              <h1 className="text-lg font-bold text-foreground">{data.name}</h1>
            </div>
            <button
              onClick={() => navigate(`/safety/module/safety-checklists/${id}/execute`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              <Play className="w-4 h-4" />
              Execute/Test
            </button>
            <button
              onClick={() => navigate(`/safety/module/safety-checklists/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors text-sm"
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
          {/* Checklist Information */}
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
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Checklist Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Name</span>
                <p className="text-sm font-medium text-foreground">{data.name || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Category</span>
                <p className="text-sm text-foreground">{data.category || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Status</span>
                <span className={cn(
                  "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                  data.status === 'Active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                )}>
                  {data.status || '-'}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Total Questions</span>
                <p className="text-sm font-medium text-foreground">{totalQuestions}</p>
              </div>
            </div>
          </motion.div>

          {/* Test Settings */}
          {data.test_mode && (
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
                  <CheckCircle className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Test Settings</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground">Test Mode</span>
                  <p className="text-sm font-medium text-success">Enabled</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Passing Score</span>
                  <p className="text-sm font-medium text-foreground">{data.passing_score || 0}%</p>
                </div>
                {data.time_limit && (
                  <div>
                    <span className="text-xs text-muted-foreground">Time Limit</span>
                    <p className="text-sm font-medium text-foreground">{data.time_limit} minutes</p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-muted-foreground">Randomize Questions</span>
                  <p className="text-sm font-medium text-foreground">
                    {data.randomize_questions ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Description */}
          {data.description && (
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
                  <HelpCircle className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Description</h2>
              </div>
              <p className="text-sm text-foreground">{data.description}</p>
            </motion.div>
          )}

          {/* Questions by Section */}
          <motion.div
            variants={item}
            className={cn(
              "col-span-12",
              "bg-card border border-border rounded-xl p-6",
              "hover:shadow-lg transition-shadow"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Questions</h2>
            </div>
            {data.groups && data.groups.length > 0 ? (
              <div className="space-y-6">
                {data.groups.map((group: any, groupIndex: number) => (
                  <div key={groupIndex} className="border border-border rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-3">{group.group || `Section ${groupIndex + 1}`}</h3>
                    <div className="space-y-3">
                      {group.questions?.map((question: any, qIndex: number) => (
                        <div key={qIndex} className="p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm font-medium text-foreground">
                              {qIndex + 1}. {question.name}
                            </p>
                            <div className="flex gap-2">
                              {question.required && (
                                <span className="px-2 py-0.5 bg-error/10 text-error rounded text-xs">Required</span>
                              )}
                              {question.photo_required && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">Photo Required</span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Type: {question.type || question.qtype}
                            {question.help_text && (
                              <span className="ml-2">• Help: {question.help_text}</span>
                            )}
                            {data.test_mode && question.weightage && (
                              <span className="ml-2">• Weightage: {question.weightage}</span>
                            )}
                          </div>
                          {question.options && question.options.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Options: {question.options.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No questions available
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ViewSafetyChecklist;