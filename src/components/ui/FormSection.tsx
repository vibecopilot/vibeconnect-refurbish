import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormSectionProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, icon: Icon, children }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        {Icon && (
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <h2 className="text-lg font-semibold text-foreground uppercase tracking-wide">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
};

export default FormSection;