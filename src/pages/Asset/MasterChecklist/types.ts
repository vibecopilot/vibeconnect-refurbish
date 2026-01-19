// Master Checklist Types

export type ChecklistType = 'routine' | 'ppm';

export interface ChecklistGroup {
  id?: number;
  group: string;
  questions: ChecklistQuestion[];
}

export interface ChecklistQuestion {
  id?: number;
  name: string;
  type: 'text' | 'number' | 'yes_no' | 'dropdown' | 'checkbox' | 'date' | 'time' | 'photo' | 'signature';
  options?: string[];
  required?: boolean;
  weightage?: number;
  create_ticket?: boolean;
}

export interface Checklist {
  id: number;
  site_id: number;
  name: string;
  description?: string;
  frequency: string;
  start_date: string;
  end_date: string;
  user_id: number;
  grace_period_unit: string;
  grace_period_value: string | null;
  created_at: string;
  updated_at: string;
  occurs: string;
  ctype: ChecklistType;
  priority_level: string | null;
  grace_period: number | null;
  supplier_id: number | null;
  lock_overdue: boolean | null;
  supervisors: string[];
  checklist_cron: any;
  groups: ChecklistGroup[];
  url: string;
}

export interface ChecklistListProps {
  viewMode: 'grid' | 'table';
  searchValue: string;
  perPage?: number;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  isColumnMenuOpen: boolean;
  setIsColumnMenuOpen: (value: boolean) => void;
  isImportOpen?: boolean;
  setIsImportOpen?: (value: boolean) => void;
  onExportSet?: (fn: () => void) => void;
  typeFilter?: ChecklistType | 'all';
  onTypeFilterChange?: (type: ChecklistType | 'all') => void;
  showInlineFilter?: boolean;
}

export interface ChecklistFormData {
  name: string;
  description?: string;
  frequency: string;
  start_date: string;
  end_date: string;
  ctype: ChecklistType;
  priority_level?: string;
  grace_period?: number;
  grace_period_unit?: string;
  supplier_id?: number;
  lock_overdue?: boolean;
  supervisors?: number[];
  groups: ChecklistGroup[];
}

export interface AssociationData {
  id: number;
  asset_id: number;
  asset_name: string;
  assigned_to: string;
  checklist_id: number;
  users_with_ids?: Array<{ user_id: number; user_name: string }>;
  created_at: string;
}
