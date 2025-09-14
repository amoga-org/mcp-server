export interface AttributeMetadata {
  is_color: boolean;
  options: any[];
  is_dynamic: boolean;
}

export interface AttributePayload {
  tj_type: string;
  background_color: string;
  border_radius: string;
  component: string;
  data_type: string;
  component_type: string;
  component_subtype: string;
  default_value: string;
  display_name: string;
  disposition: string;
  hide: boolean;
  instruction_text: string;
  is_editable: boolean;
  key: string;
  meta_data: Record<string, any>;
  metadata_strapi: Record<string, any>;
  rank: number | null;
  required_strapi: boolean;
  resized: boolean;
  strapi_unique: boolean;
  text_color: string;
  tj_disabled: boolean;
  tj_isrequired: boolean;
  tj_metadata: Record<string, any>;
  tj_visibility: boolean;
  type_strapi: string;
  ui_header_align: string;
  validation_data: string;
  validation_type: string;
  width: string;
  master_slug: string;
  is_encrypted: boolean;
  is_primary: boolean;
  attribute_of: string;
  is_auditable: boolean;
  attribute_meta: AttributeMetadata;
  is_global: boolean;
  is_default: boolean;
  is_internal: boolean;
  related_objects_configuration: any[];
}

export interface ComponentType {
  label: string;
  value: string;
  title: string;
  tj_type: string;
  component?: string;
  type_strapi: string;
  strapi_unique: boolean;
  data_type?: string;
  validation_type: string;
  hide?: boolean;
  desc?: string;
}
