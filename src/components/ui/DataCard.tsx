import React from 'react';
import { Eye, Edit } from 'lucide-react';
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
  onView?: () => void;
  onEdit?: () => void;
}

const DataCard: React.FC<DataCardProps> = ({
  title,
  subtitle,
  status,
  fields,
  viewPath,
  editPath,
  onView,
  onEdit,
}) => {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-card-hover transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {status && <StatusBadge status={status} size="sm" />}
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
      </div>
    </div>
  );
};

export default DataCard;