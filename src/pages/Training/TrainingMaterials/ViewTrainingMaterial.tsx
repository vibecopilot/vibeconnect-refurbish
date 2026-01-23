import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Video,
  Link as LinkIcon,
  Tag,
  Calendar,
  AlertTriangle,
  Loader2,
  Download,
  ExternalLink
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

const ViewTrainingMaterial: React.FC = () => {
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
      // const response = await getTrainingMaterialById(id);
      // setData(response.data);
      
      // Static placeholder
      setData(null);
    } catch (error) {
      console.error('Error fetching Training Material:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
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
        <h3 className="text-lg font-semibold text-foreground mb-2">Training Material Not Found</h3>
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
              <h1 className="text-lg font-bold text-foreground">{data.title || '-'}</h1>
            </div>
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
          {/* Material Details */}
          <motion.div
            variants={item}
            className={cn(
              "col-span-12 md:col-span-6 lg:col-span-8",
              "bg-card border border-border rounded-xl p-6",
              "hover:shadow-lg transition-shadow"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {data.type === 'Video' ? (
                  <Video className="w-5 h-5 text-primary" />
                ) : data.type === 'Link' ? (
                  <LinkIcon className="w-5 h-5 text-primary" />
                ) : (
                  <FileText className="w-5 h-5 text-primary" />
                )}
              </div>
              <h2 className="text-lg font-semibold text-foreground">Material Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-muted-foreground">Title</span>
                <p className="text-sm font-medium text-foreground">{data.title || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Description</span>
                <p className="text-sm text-foreground">{data.description || 'No description available'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Category</span>
                  <p className="text-sm text-foreground">{data.category || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Type</span>
                  <p className="text-sm text-foreground">{data.type || '-'}</p>
                </div>
              </div>
              {data.file_url && (
                <div>
                  <span className="text-xs text-muted-foreground">File</span>
                  <div className="mt-2">
                    <a
                      href={data.file_url}
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download File
                    </a>
                  </div>
                </div>
              )}
              {data.video_url && (
                <div>
                  <span className="text-xs text-muted-foreground">Video</span>
                  <div className="mt-2">
                    <a
                      href={data.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Video
                    </a>
                  </div>
                </div>
              )}
              {data.link_url && (
                <div>
                  <span className="text-xs text-muted-foreground">Link</span>
                  <div className="mt-2">
                    <a
                      href={data.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                    >
                      {data.link_url}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Tags & Metadata */}
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
                <Tag className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Tags & Metadata</h2>
            </div>
            <div className="space-y-4">
              {data.tags && data.tags.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Tags</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary text-xs rounded text-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="text-xs text-muted-foreground">Created Date</span>
                <p className="text-sm text-foreground">{formatDate(data.created_date)}</p>
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
            </div>
          </motion.div>

          {/* Related Trainings */}
          {data.related_trainings && data.related_trainings.length > 0 && (
            <motion.div
              variants={item}
              className={cn(
                "col-span-12",
                "bg-card border border-border rounded-xl p-6",
                "hover:shadow-lg transition-shadow"
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Related Trainings</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.related_trainings.map((training: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer"
                    onClick={() => navigate(`/training/module/training-programs/${training.id}`)}
                  >
                    <p className="text-sm font-medium text-foreground">{training.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{training.category}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ViewTrainingMaterial;
