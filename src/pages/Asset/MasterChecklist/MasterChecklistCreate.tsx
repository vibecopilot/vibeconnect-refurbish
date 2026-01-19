import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, ClipboardCheck } from 'lucide-react';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import ChecklistCreateForm from '../../../components/forms/ChecklistCreateForm';
import { ChecklistType } from './types';

const TypeToggle = ({
  value,
  onChange,
}: {
  value: ChecklistType;
  onChange: (val: ChecklistType) => void;
}) => {
  const options: Array<{ value: ChecklistType; label: string; icon: React.ReactNode }> = [
    { value: 'routine', label: 'Routine', icon: <ClipboardList className="w-5 h-5" /> },
    { value: 'ppm', label: 'PPM', icon: <ClipboardCheck className="w-5 h-5" /> },
  ];
  return (
    <div className="flex gap-3">
      {options.map((opt) => {
        const active = value === opt.value;
        const activeClasses =
          opt.value === 'ppm'
            ? 'bg-purple-600 text-white border-purple-500'
            : 'bg-blue-600 text-white border-blue-500';
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all shadow-sm ${
              active ? activeClasses : 'bg-card text-foreground border-border hover:bg-accent'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

const MasterChecklistCreate: React.FC = () => {
  const navigate = useNavigate();
  const [checklistType, setChecklistType] = useState<ChecklistType>('routine');

  const breadcrumbs = [
    { label: 'FM Module' },
    { label: 'Asset', path: '/asset' },
    { label: 'Master Checklist', path: '/asset/master-checklist' },
    { label: 'Create Checklist' },
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
              <h1 className="text-lg font-bold text-foreground">Create Checklist</h1>
              <p className="text-xs text-muted-foreground">Build a routine or PPM checklist in one flow</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        <Breadcrumb items={breadcrumbs} />

        {/* Type Selector */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Checklist Type</h3>
              <p className="text-sm text-muted-foreground">Choose whether this is a Routine or PPM checklist</p>
            </div>
            <TypeToggle value={checklistType} onChange={setChecklistType} />
          </div>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-2 shadow-sm">
          <ChecklistCreateForm checklistType={checklistType} />
        </div>
      </div>
    </div>
  );
};

export default MasterChecklistCreate;
