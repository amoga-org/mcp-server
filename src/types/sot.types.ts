import { Widget } from "./widget.types.js";

export type ObjectType =
  | "workitem"
  | "task"
  | "object"
  | "amotask"
  //   | "call_activity"
  //   | "email_activity"
  | "master"
  | "segment";
export type PageType = "record" | "dashboard";
export type OriginationType =
  | "workflow"
  | "automation"
  | "actions"
  | "template_email_whatsApp"
  | "template_pdf"
  | "create_form"
  | "page"
  | "navbar_and_roles"
  | "dashboard";

export interface Status {
  display_name: string;
  color: string;
  slug: string;
}

export interface Origination {
  value: string;
  slug: string;
  display_name: string;
  type?: PageType;
}

export interface SOTData {
  id: string;
  description: string;
  instruction: string;
  object_slug: ObjectType;
  origination_type: OriginationType;
  name: string;
  status: Status;
  origination: Origination;
  widgets?: Widget[];
}
