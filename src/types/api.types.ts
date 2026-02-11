export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
}

export interface ApiRequestOptions extends RequestConfig {
  showErrorNotification?: boolean;
  showSuccessNotification?: boolean;
}