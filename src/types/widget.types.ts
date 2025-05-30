export interface GridProps {
  h?: number;
  w?: number;
  x?: number;
  y?: number;
  i?: string;
  maxH: number;
  maxW: number;
  minH: number;
  minW: number;
  moved?: boolean;
  static?: boolean;
  isResizable?: boolean;
}

export interface WidgetConfig {
  grid_props: GridProps;
  props: Record<string, any>;
  dynamically_binded?: any[];
  icon?: {
    type: string;
    name: string;
    color: string;
    svg: string;
    style: string;
    version: number;
  };
  color?: string;
  type: string;
  display_name: string;
  description: string;
  is_refresh?: boolean;
}

export interface Widget {
  configs: WidgetConfig;
  is_default: boolean;
  is_active: boolean;
  widget_version: number;
  slug?: string;
}
