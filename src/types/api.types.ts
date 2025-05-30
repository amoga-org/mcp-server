export interface APIResponse<T = any> {
  status: number;
  data: T;
  message?: string;
}

export interface CreatePageResponse {
  status: number;
  data: {
    id: string;
    [key: string]: any;
  };
}

export interface APIError extends Error {
  status?: number;
  code?: string;
}

export interface WidgetType {
  configs?: {
    props?: {
      htmlContent?: string;
    };
  };
}
