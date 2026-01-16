import React from 'react';
import { Eye, Edit, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge, { StatusType } from './StatusBadge';

interface DataCardField {
  label: string;
  value: string | number;
}

interface DataCardProps {
  title: string;
  subtitle?: string;
  status?: StatusType;
  fields: DataCardField[];
  viewPath?: string;
  editPath?: string;
  copyPath?: string;
  onView?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
  id?: string;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

const DataCard: React.FC<DataCardProps> = ({
  title,
  subtitle,
  status,
  fields,
  viewPath,
  editPath,
  copyPath,
  onView,
  onEdit,
  onCopy,
  id,
  isSelected,
  onToggleSelect,
}) => {
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Get the target element
    const target = e.target as HTMLElement;

    // Check if click is on action links/buttons (View, Edit)
    const isActionElement = target.closest('a, button');

    // Check if click is on the checkbox itself
    const isCheckbox = target.getAttribute('type') === 'checkbox';

    // Only toggle selection if not clicking on actions or checkbox
    // (checkbox has its own handler)
    if (!isActionElement && !isCheckbox && onToggleSelect) {
      onToggleSelect();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Get the target element
    const target = e.target as HTMLElement;

    // Check if click is on action links/buttons
    const isActionElement = target.closest('a, button');

    // Only toggle selection on double-click if not on action elements
    if (!isActionElement && onToggleSelect) {
      onToggleSelect();
    }
  };

  return (
    <div
      className={`bg-card border rounded-xl p-5 hover:shadow-card-hover transition-shadow cursor-pointer ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
      onClick={handleCardClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {status && <StatusBadge status={status} size="sm" />}
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2 cursor-pointer"
            />
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-2 mb-4">
        {fields.map((field, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{field.label}</span>
            <span className="text-foreground font-medium">{field.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        {(viewPath || onView) && (
          viewPath ? (
            <Link 
              to={viewPath} 
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Eye className="w-4 h-4" />
              View
            </Link>
          ) : (
            <button 
              onClick={onView}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
          )
        )}
        {(editPath || onEdit) && (
          editPath ? (
            <Link 
              to={editPath} 
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          ) : (
            <button 
              onClick={onEdit}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )
        )}
        {(copyPath || onCopy) && (
          copyPath ? (
            <Link
              to={copyPath}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Link>
          ) : (
            <button
              onClick={onCopy}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default DataCard;
