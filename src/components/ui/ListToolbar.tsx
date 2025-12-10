import React from 'react';
import { Search, Filter, Grid3X3, List, Download, QrCode, Plus } from 'lucide-react';

interface ListToolbarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  viewMode?: 'grid' | 'table';
  onViewModeChange?: (mode: 'grid' | 'table') => void;
  onFilter?: () => void;
  onExport?: () => void;
  onQrCode?: () => void;
  onAdd?: () => void;
  addLabel?: string;
  showViewToggle?: boolean;
  showQrCode?: boolean;
}

const ListToolbar: React.FC<ListToolbarProps> = ({
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  viewMode = 'grid',
  onViewModeChange,
  onFilter,
  onExport,
  onQrCode,
  onAdd,
  addLabel = 'Add',
  showViewToggle = true,
  showQrCode = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      {/* Left Side - Add Button */}
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Plus className="w-4 h-4" />
          {addLabel}
        </button>
      )}

      {/* Right Side - Search and Actions */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* QR Code Button */}
        {showQrCode && onQrCode && (
          <button
            onClick={onQrCode}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <QrCode className="w-4 h-4" />
            QR Code
          </button>
        )}

        {/* Filter Button */}
        {onFilter && (
          <button
            onClick={onFilter}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        )}

        {/* View Toggle */}
        {showViewToggle && onViewModeChange && (
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-2 ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Export Button */}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        )}
      </div>
    </div>
  );
};

export default ListToolbar;