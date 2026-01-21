import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ChecklistCreateForm from '../../components/forms/ChecklistCreateForm';
import { getChecklistDetails } from '../../api';

type ChecklistType = 'routine' | 'ppm';

const SoftServiceCreateChecklist: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [checklistType, setChecklistType] = useState<ChecklistType>('routine');
  const [existingData, setExistingData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      if (!isEdit || !id) return;
      setLoading(true);
      try {
        const res = await getChecklistDetails(id);
        setExistingData(res.data);
        const ctype = res.data?.ctype;
        if (ctype === 'ppm') setChecklistType('ppm');
        else setChecklistType('routine');
      } catch (e) {
        console.error('Failed to load checklist details', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const breadcrumbs = [
    { label: 'FM Module' },
    { label: 'Soft Services', path: '/soft-services' },
    { label: 'Checklist', path: '/soft-services/checklist' },
    { label: isEdit ? 'Edit Checklist' : 'Create Checklist' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="h-8 w-px bg-border" />
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {isEdit ? 'Edit Checklist' : 'Create Checklist'}
              </h1>
              <p className="text-xs text-muted-foreground">
                Build a routine or PPM checklist for soft services
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        <Breadcrumb items={breadcrumbs} />

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-2 shadow-sm">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
          {!loading && (
            <ChecklistCreateForm
              checklistType={checklistType}
              existingData={existingData || undefined}
              isEditMode={isEdit}
              checklistId={id}
              ctypeOverride="soft_service"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SoftServiceCreateChecklist;
