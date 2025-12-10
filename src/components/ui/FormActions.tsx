import React from 'react';
import { useNavigate } from 'react-router-dom';

interface FormActionsProps {
  onSave?: () => void;
  onSaveAndContinue?: () => void;
  onCancel?: () => void;
  cancelPath?: string;
  saveLabel?: string;
  saving?: boolean;
  showSaveAndContinue?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  onSave,
  onSaveAndContinue,
  onCancel,
  cancelPath,
  saveLabel = 'Save',
  saving = false,
  showSaveAndContinue = true,
}) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (cancelPath) {
      navigate(cancelPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-border">
      <button
        type="button"
        onClick={handleCancel}
        className="px-6 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-secondary transition-colors"
      >
        Cancel
      </button>
      
      {showSaveAndContinue && onSaveAndContinue && (
        <button
          type="button"
          onClick={onSaveAndContinue}
          disabled={saving}
          className="px-6 py-2.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
        >
          Save & Continue
        </button>
      )}
      
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : saveLabel}
      </button>
    </div>
  );
};

export default FormActions;