import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  Shield, 
  MapPin, 
  Calendar, 
  User, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileCheck,
  Image as ImageIcon,
  ClipboardList,
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

const ViewSafetyMeasure: React.FC = () => {
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
      // const response = await getSafetyMeasureById(id);
      // setData(response.data);
      
      // Static placeholder
      setData(null);
    } catch (error) {
      console.error('Error fetching Safety Measure:', error);
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
        <h3 className="text-lg font-semibold text-foreground mb-2">Safety Measure Not Found</h3>
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
              <h1 className="text-lg font-bold text-foreground">{data.name}</h1>
            </div>
            <button
              onClick={() => navigate(`/safety/module/safety-measures/${id}/edit`)}
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
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
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
                <span className="text-xs text-muted-foreground">Priority</span>
                <span className={cn(
                  "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                  data.priority === 'High' ? 'bg-error/10 text-error' :
                  data.priority === 'Medium' ? 'bg-warning/10 text-warning' :
                  'bg-info/10 text-info'
                )}>
                  {data.priority || '-'}
                </span>
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

          {/* Location Details */}
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
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Location Details</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Location/Area</span>
                <p className="text-sm font-medium text-foreground">{data.location || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Description</span>
                <p className="text-sm text-foreground">{data.description || '-'}</p>
              </div>
            </div>
          </motion.div>

          {/* Inspection Schedule */}
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
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Inspection Schedule</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Frequency</span>
                <p className="text-sm font-medium text-foreground">{data.frequency || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Next Inspection Date</span>
                <p className="text-sm text-foreground">
                  {data.next_inspection_date ? new Date(data.next_inspection_date).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Last Inspection Date</span>
                <p className="text-sm text-foreground">
                  {data.last_inspection_date ? new Date(data.last_inspection_date).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Assigned To</span>
                <p className="text-sm text-foreground">{data.assigned_to || '-'}</p>
              </div>
            </div>
          </motion.div>

          {/* Photos Gallery */}
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
                <ImageIcon className="w-5 h-5 text-green-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Photos</h2>
            </div>
            {data.photos && data.photos.length > 0 ? (
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No photos available
              </div>
            )}
          </motion.div>

          {/* Work Checklist */}
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
                <ClipboardList className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Work Checklist</h2>
            </div>
            {data.checklist_items && data.checklist_items.length > 0 ? (
              <div className="space-y-2">
                {data.checklist_items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-border rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.task_name}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      item.status === 'Completed' ? 'bg-success/10 text-success' :
                      item.status === 'In Progress' ? 'bg-warning/10 text-warning' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No checklist items
              </div>
            )}
          </motion.div>

          {/* Compliance */}
          <motion.div
            variants={item}
            className={cn(
              "col-span-12 md:col-span-6 lg:col-span-4",
              "bg-card border border-border rounded-xl p-6",
              "hover:shadow-lg transition-shadow"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Compliance</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Regulatory Requirements</span>
                <p className="text-sm text-foreground">{data.regulatory_requirements || '-'}</p>
              </div>
              {data.certifications && data.certifications.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Certifications</span>
                  <div className="mt-2 space-y-2">
                    {data.certifications.map((cert: any, index: number) => (
                      <div key={index} className="p-2 border border-border rounded text-sm">
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Issued: {cert.issued_date} • Expires: {cert.expiry_date}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
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

export default ViewSafetyMeasure;