export interface AppProps {
  application_name: string;
  application_props: Record<string, any>;
  application_version: string;
  color: string;
  contract_version: string;
  created_by: string;
  description: string;
  endpoint_setting: Record<string, any>;
  icon: {
    color: string;
    svg: string;
    style: string;
    version: number;
  };
  slug: string;
  state: string;
  create_pages: boolean;
  cover_image: string;
}

export interface Attribute {
  display_name: string;
  component_type: "text" | "enumeration" | "date" | "boolean" | "number";
}

export interface ObjectStatus {
  name: string;
  color?: string;
  amo_name?:
    | "todo"
    | "inProgress"
    | "completed"
    | "onHold"
    | "inCompleted"
    | "reopen";
}

export interface Relationship {
  name: string;
  relationship_type: "manyToOne" | "oneToMany";
}

export interface ObjectDefinition {
  name: string;
  type:
    | "workitem"
    | "task"
    | "object"
    | "amotask"
    | "call_activity"
    | "email_activity"
    | "master"
    | "segment";
  slug?: string;
  attributes?: Attribute[];
  status?: ObjectStatus[];
  relationship?: Relationship[];
}

export interface AppContract {
  objects: ObjectDefinition[];
  id?: string;
  amo_application_id?: string;
}
