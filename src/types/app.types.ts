import { z } from "zod";

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
    type: string;
    name: string;
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

// TypeScript interface for create-app tool parameters
export interface CreateAppParams {
  tenantName: string;
  baseUrl: string;
  appName: string;
  amo_application_id?: string;
}

// Zod schema for create-app tool validation
export const CreateAppSchema = z.object({
  tenantName: z.string().describe("The tenant name for the application"),
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  appName: z.string().describe("The name of the application to create"),
  amo_application_id: z
    .string()
    .optional()
    .describe("Optional AMO application ID for updates"),
});

// Type derived from zod schema
export type CreateAppInput = z.infer<typeof CreateAppSchema>;

// Schema for get-apps tool
export const GetAppsSchema = z.object({
  tenantName: z.string().describe("The tenant name"),
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  amo_application_id: z
    .string()
    .optional()
    .describe("Optional AMO application ID"),
});

export interface GetAppsParams {
  tenantName: string;
  baseUrl: string;
  amo_application_id?: string;
}

// Schema for delete-app tool
export const DeleteAppSchema = z.object({
  tenantName: z.string().describe("The tenant name"),
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  appId: z.string().describe("The application ID to delete"),
});

export interface DeleteAppParams {
  tenantName: string;
  baseUrl: string;
  appId: string;
}

// Schema for get-app-contract tool
export const GetAppContractSchema = z.object({
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  appId: z.string().describe("The application ID"),
  tenantName: z.string().describe("The tenant name"),
});

export interface GetAppContractParams {
  baseUrl: string;
  appId: string;
  tenantName: string;
}

// Schema for delete-object tool
export const DeleteObjectSchema = z.object({
  tenantName: z.string().describe("The tenant name"),
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  appId: z.string().describe("The application ID"),
  objectName: z.string().describe("The name of the object to delete"),
});

export interface DeleteObjectParams {
  tenantName: string;
  baseUrl: string;
  appId: string;
  objectName: string;
}

// Schema for create-object tool
export const CreateObjectSchema = z.object({
  tenantName: z.string().describe("The tenant name"),
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  appId: z.string().describe("The application ID"),
  appSlug: z.string().describe("The application slug"),
  email: z
    .string()
    .email()
    .describe("Email address of the user creating the objects"),
  appName: z.string().describe("The application name"),
  objects: z
    .array(
      z.object({
        name: z.string().describe("Name of the object"),
        type: z
          .enum([
            "workitem",
            "task",
            "object",
            "amotask",
            "call_activity",
            "email_activity",
            "master",
            "segment",
          ])
          .describe("Type of the object"),
        slug: z.string().optional().describe("Optional slug for the object"),
        attributes: z
          .array(
            z.object({
              display_name: z
                .string()
                .describe("Display name of the attribute"),
              component_type: z
                .enum(["text", "enumeration", "date", "boolean", "number"])
                .describe("Type of the component"),
            })
          )
          .optional()
          .describe("Optional attributes for the object"),
        status: z
          .array(
            z.object({
              name: z.string().describe("Status name"),
              color: z.string().describe("Status color"),
              amo_name: z
                .enum([
                  "todo",
                  "inProgress",
                  "completed",
                  "onHold",
                  "inCompleted",
                  "reopen",
                ])
                .describe("AMO status name"),
            })
          )
          .optional()
          .describe("Optional status definitions"),
        relationship: z
          .array(
            z.object({
              name: z.string().describe("Relationship name"),
              relationship_type: z
                .enum(["manyToOne", "oneToMany"])
                .describe("Type of relationship"),
            })
          )
          .optional()
          .describe("Optional relationships"),
      })
    )
    .describe("Array of objects to create"),
  id: z.string().optional().describe("Optional ID"),
  amo_application_id: z
    .string()
    .optional()
    .describe("Optional AMO application ID"),
});

export interface CreateObjectParams {
  tenantName: string;
  baseUrl: string;
  appId: string;
  appSlug: string;
  email: string;
  appName: string;
  objects: ObjectDefinition[];
  id?: string;
  amo_application_id?: string;
}

// Schema for create-sot tool
export const CreateSotSchema = z.object({
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  appId: z.string().describe("The application ID"),
  tenantName: z.string().describe("The tenant name"),
  sotData: z
    .array(
      z
        .object({
          id: z.string().describe("Unique identifier for the SOT"),
          description: z.string().describe("Description of the SOT"),
          instruction: z.string().describe("Instructions for the SOT"),
          object_slug: z.string().describe("Object slug this SOT belongs to"),
          origination_type: z
            .enum([
              "workflow",
              "automation",
              "actions",
              "template_email_whatsApp",
              "template_pdf",
              "create_form",
              "page",
              "navbar_and_roles",
              "dashboard",
            ])
            .describe("Type of origination"),
          name: z.string().describe("Name of the SOT"),
          status: z
            .object({
              display_name: z.string().describe("Display name of the status"),
              color: z.string().describe("Color of the status"),
              slug: z.string().describe("Slug of the status"),
            })
            .describe("Status information"),
          origination: z
            .object({
              value: z.string().describe("Value of the origination"),
              slug: z.string().describe("Slug of the origination"),
              display_name: z
                .string()
                .describe("Display name of the origination"),
              type: z
                .enum(["dashboard", "record"])
                .optional()
                .describe(
                  "Type of origination - required only when origination_type is 'page'"
                ),
            })
            .describe("Origination information"),
          widgets: z
            .array(
              z.object({
                type: z
                  .enum([
                    "activity",
                    "attachment",
                    "button",
                    "calendar",
                    "carousel",
                    "chart",
                    "comment",
                    "container",
                    "conversation",
                    "dropdown",
                    "file_preview",
                    "header",
                    "html_parser",
                    "iframe",
                    "json",
                    "jsonform",
                    "leaderboard",
                    "list",
                    "map",
                    "page",
                    "path",
                    "progressbar",
                    "qrScanner",
                    "richTextEditor",
                    "spacer",
                    "stats",
                    "table",
                    "tabs",
                    "ticker",
                    "lits",
                  ])
                  .describe("Type of widget"),
                grid_props: z
                  .object({
                    h: z.number().describe("Height of the widget"),
                    i: z.string().describe("Unique ID of the widget"),
                    w: z
                      .number()
                      .max(12)
                      .describe("Width of the widget (max 12)"),
                    x: z.number().describe("X position"),
                    y: z.number().describe("Y position"),
                    maxH: z.number().optional().describe("Maximum height"),
                    maxW: z.number().default(12).describe("Maximum width"),
                    minH: z.number().default(3).describe("Minimum height"),
                    minW: z.number().default(3).describe("Minimum width"),
                    moved: z
                      .boolean()
                      .default(false)
                      .describe("Whether widget is moved"),
                    static: z
                      .boolean()
                      .default(false)
                      .describe("Whether widget is static"),
                    isResizable: z
                      .boolean()
                      .default(true)
                      .describe("Whether widget is resizable"),
                  })
                  .describe("Grid properties for the widget"),
              })
            )
            .optional()
            .describe("Optional widgets for page origination type"),
        })
        .refine(
          (data) => {
            // If origination_type is "page", then origination.type must be provided
            if (data.origination_type === "page") {
              return data.origination.type !== undefined;
            }
            return true;
          },
          {
            message:
              "When origination_type is 'page', origination.type must be specified as either 'dashboard' or 'record'",
            path: ["origination", "type"],
          }
        )
    )
    .describe("Array of SOT data to create"),
});

export interface CreateSotParams {
  baseUrl: string;
  appId: string;
  tenantName: string;
  sotData: Array<{
    id: string;
    description: string;
    instruction: string;
    object_slug: string;
    origination_type:
      | "workflow"
      | "automation"
      | "actions"
      | "template_email_whatsApp"
      | "template_pdf"
      | "create_form"
      | "page"
      | "navbar_and_roles"
      | "dashboard";
    name: string;
    status: {
      display_name: string;
      color: string;
      slug: string;
    };
    origination: {
      value: string;
      slug: string;
      display_name: string;
      type?: "dashboard" | "record";
    };
    widgets?: Array<{
      type: string;
      grid_props: {
        h: number;
        i: string;
        w: number;
        x: number;
        y: number;
        maxH?: number;
        maxW?: number;
        minH?: number;
        minW?: number;
        moved?: boolean;
        static?: boolean;
        isResizable?: boolean;
      };
    }>;
  }>;
}

// RBAC Roles Schema and Interface
const PermissionSchema = z.object({
  pick: z.boolean().default(true),
  read: z.boolean().default(true),
  assign: z.boolean().default(true),
  create: z.boolean().default(true),
  delete: z.boolean().default(true),
  update: z.boolean().default(true),
  release: z.boolean().default(true),
});

const RoleSchema = z.object({
  display_name: z.string().describe("Display name of the role"),
  loco_role: z.string().describe("Unique role identifier at app level"),
  loco_permission: z
    .record(z.string(), PermissionSchema)
    .optional()
    .describe("Object slug to permissions mapping"),
  permission_level: z
    .record(z.string(), z.number())
    .optional()
    .describe("Permission levels for objects"),
});

export const CreateUpdateRolesSchema = z.object({
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  tenantName: z.string().describe("The tenant name"),
  appId: z.string().describe("The application ID"),
  roles: z.array(RoleSchema).describe("Array of roles to create or update"),
});

export interface Permission {
  pick: boolean;
  read: boolean;
  assign: boolean;
  create: boolean;
  delete: boolean;
  update: boolean;
  release: boolean;
}

export interface Role {
  display_name: string;
  loco_role: string;
  loco_permission?: Record<string, Permission>;
  permission_level?: Record<string, number>;
}

export interface CreateUpdateRolesParams {
  baseUrl: string;
  tenantName: string;
  appId: string;
  roles: Role[];
}
