export type SortOrder = 'asc' | 'desc' | null;

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface SortConfig<T> {
  key: keyof T | string;
  order: SortOrder;
}

export interface DataGridProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onViewMore?: (item: T) => void;
  isLoading?: boolean;
}

export interface DataGridHeaderProps {
  title: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export interface DataGridTableProps<T> {
  columns: Column<T>[];
  data: T[];
  sortConfig: SortConfig<T>;
  selectedIds: Set<string | number>;
  filters: Record<string, Set<string>>;
  openFilterKey: string | null;
  onSort: (key: keyof T | string) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string | number) => void;
  onFilterToggle: (columnKey: string) => void;
  onViewMore?: (item: T) => void;
  allData: T[];
}

export interface DataGridFilterPopupProps {
  columnKey: string;
  columnLabel: string;
  uniqueValues: string[];
  tempFilters: Set<string>;
  filterSearch: string;
  isFiltered: boolean;
  onFilterSearchChange: (value: string) => void;
  onToggleValue: (value: string) => void;
  onToggleSelectAll: (values: string[]) => void;
  onClear: () => void;
  onApply: (columnKey: string) => void;
  onClose: () => void;
}

export interface DataGridPaginationProps {
  page: number;
  rowsPerPage: number;
  totalItems: number;
  selectedCount: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}