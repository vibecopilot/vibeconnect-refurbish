import React from 'react';
import { PackageCheck } from 'lucide-react';
import ListToolbar from '../../../components/ui/ListToolbar';

const GRNSRNList: React.FC = () => {
  return (
    <div className="space-y-4">
      <ListToolbar
        searchPlaceholder="Search GRN/SRN..."
        searchValue=""
        onSearchChange={() => {}}
        viewMode="table"
        onViewModeChange={() => {}}
        onFilter={() => {}}
        onExport={() => {}}
        showViewToggle={true}
        onAdd={() => {}}
        addLabel="Create GRN/SRN"
      />

      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
        <PackageCheck className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">GRN/SRN</h3>
        <p className="text-muted-foreground mb-4">Coming Soon</p>
      </div>
    </div>
  );
};

export default GRNSRNList;

