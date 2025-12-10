import React from 'react';
import Breadcrumb from './Breadcrumb';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageTitleProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, breadcrumbs, actions }) => {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} />
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
};

export default PageTitle;