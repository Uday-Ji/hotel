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

// Update or add this export
export interface ApiStatus {
  statusCode: number;
  success: boolean;
  messageCode: string;
  messageText: string;
}

export interface ApiResponse<T> {
  status: ApiStatus;
  data: T;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}