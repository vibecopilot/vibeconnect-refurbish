import React from 'react';
import PageTitle from '../../components/ui/PageTitle';
import ChecklistCreateForm from '../../components/forms/ChecklistCreateForm';

const CreatePPMChecklist: React.FC = () => {
  return (
    <div className="p-6">
      <PageTitle
        title="Add PPM Checklist"
        breadcrumbs={[
          { label: 'Asset', path: '/asset' },
          { label: 'PPM Checklist', path: '/asset/ppm-checklist' },
          { label: 'Add PPM Checklist' }
        ]}
      />

      <ChecklistCreateForm checklistType="ppm" />
    </div>
  );
};

export default CreatePPMChecklist;
