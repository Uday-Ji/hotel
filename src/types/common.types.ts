export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  isActive: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface MenuItem {
  id: number;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  isActive: boolean;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  isActive: boolean;
  color?: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';