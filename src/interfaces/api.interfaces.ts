import { Widget } from "../types/widget.types.js";

export interface APIResponse<T = any> {
  status: number;
  data: T;
  message?: string;
}

export interface PageData {
  application_id: string;
  display_name: string;
  mode: string;
  name: string;
  object_slug: string;
  show_header: boolean;
  type: string;
  widgets: Widget[];
}

export interface CreatePageResponse {
  status: number;
  data: {
    id: string;
    [key: string]: any;
  };
}
