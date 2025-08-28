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
  component_type:
    | "text"
    | "enumeration"
    | "date"
    | "boolean"
    | "number"
    | "related_field";
}

export interface AppPublishStatus {
  current_version: {
    App_meta: string;
    Datastore: string;
    Forms: string;
    Workflow: string;
    Pages: string;
    Automation: string;
  };
  deployed_version: {
    App_meta: string;
    Datastore: string;
    Forms: string;
    Workflow: string;
    Pages: string;
    Automation: string;
  };
  status: {
    App_meta: string;
    Datastore?: string;
    Forms: string;
    Workflow: string;
    Pages: string;
    Automation: string;
  };
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
  icon?: any;
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
                .enum([
                  "text",
                  "enumeration",
                  "date",
                  "boolean",
                  "number",
                  "related_field",
                ])
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
                    "note",
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

// Create Attribute Schema and Interface
export const CreateAttributeSchema = z.object({
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  tenantName: z.string().describe("The tenant name"),
  attributes: z
    .array(
      z.object({
        display_name: z.string().describe("Display name of the attribute"),
        component_type: z
          .enum([
            "enumeration",
            "text",
            "number",
            "boolean",
            "date",
            "related_field",
          ])
          .describe("Component type category for the attribute"),
        component_subtype: z
          .string()
          .describe("Specific component subtype within the category"),
        key: z.string().describe("Unique key for the attribute"),
        related_objects_configuration: z
          .array(
            z.object({
              parent: z
                .string()
                .nullable()
                .describe("Parent object slug, null for root object"),
              attributes: z
                .array(z.string())
                .length(1)
                .describe(
                  "Array with exactly one attribute name to fetch from this object"
                ),
              object_slug: z
                .string()
                .describe("The slug of the object to fetch data from"),
              source_attribute: z
                .string()
                .optional()
                .describe("The source attribute that links to parent object"),
            })
          )
          .optional()
          .describe(
            "Configuration for related objects hierarchy for cascading dropdowns"
          ),
      })
    )
    .describe("Array of attributes to create"),
});

export interface CreateAttributeParams {
  baseUrl: string;
  tenantName: string;
  attributes: Array<{
    display_name: string;
    component_type:
      | "enumeration"
      | "text"
      | "number"
      | "boolean"
      | "date"
      | "related_field";
    component_subtype: string;
    key: string;
    related_objects_configuration?: Array<{
      parent: string | null;
      attributes: string[];
      object_slug: string;
      source_attribute?: string;
    }>;
  }>;
}

// Publish App Schema and Interface
export const PublishAppSchema = z.object({
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  appId: z.string().describe("The application ID to publish"),
  tenantName: z.string().describe("The tenant name"),
  version: z.string().describe("The version of app contract version"),
});

export interface PublishAppParams {
  baseUrl: string;
  appId: string;
  tenantName: string;
  version: string;
}

// Check Publish Status Schema and Interface
export const CheckPublishStatusSchema = z.object({
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  identifier: z
    .string()
    .describe("The application identifier to check status for"),
  tenantName: z.string().describe("The tenant name"),
  maxChecks: z
    .number()
    .optional()
    .default(20)
    .describe("Maximum number of status checks (default: 20)"),
  intervalSeconds: z
    .number()
    .optional()
    .default(30)
    .describe("Interval between checks in seconds (default: 30)"),
});

export interface CheckPublishStatusParams {
  baseUrl: string;
  identifier: string;
  tenantName: string;
  maxChecks?: number;
  intervalSeconds?: number;
}

// Generate Workflow Schema and Interface
export const GenerateWorkflowSchema = z.object({
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  appId: z.string().describe("The application ID to generate workflow for"),
  appName: z
    .string()
    .optional()
    .describe(
      "The application name (optional - will be fetched from app contract if not provided)"
    ),
  tenantName: z.string().describe("The tenant name"),
  caseObjects: z
    .array(
      z.object({
        name: z.string().describe("Name of the workitem object"),
        slug: z.string().describe("Slug of the workitem object"),
      })
    )
    .optional()
    .describe(
      "Array of workitem objects to create workflows for (optional - will be fetched from app contract if not provided). ONLY objects with type 'workitem' are valid for workflow generation."
    ),
});

export interface GenerateWorkflowParams {
  baseUrl: string;
  appId: string;
  tenantName: string;
  caseObjects?: Array<{
    name: string;
    slug: string;
    relationship?: Array<{
      name: string;
      slug: string;
    }>;
  }>;
}

// Workflow V1 Schema and Interfaces
export const WorkflowV1TaskSchema = z.object({
  slug: z.string().min(1).describe("Unique identifier for the task"),
  displayName: z.string().min(1).describe("Human-readable name for the task"),
  outcomes: z.array(z.string()).min(1).describe("Possible outcomes when the task completes"),
  assignee: z.string().optional().describe("Specific user to assign task to (e.g., '${initiator}', 'john.doe')"),
  candidateGroups: z.string().optional().describe("Group(s) that can claim this task (e.g., 'managers,reviewers')"),
  dueDate: z.string().optional().describe("Due date in ISO duration format (e.g., 'P2D' for 2 days, 'P1W' for 1 week)"),
  formKey: z.string().optional().describe("Form key for task UI (defaults to '{taskSlug}Form')"),
  repetitionLimit: z.number().min(1).optional().describe("Maximum times this task can be repeated")
});

export const WorkflowV1ConditionSchema = z.object({
  sourceTask: z.string().min(1).describe("Task that triggers this condition"),
  targetTask: z.string().min(1).describe("Task that will be activated"),
  outcome: z.string().min(1).describe("Required outcome from source task"),
  operator: z.enum(["equals", "notEquals"]).default("equals").describe("Comparison operator")
});

export const WorkflowV1PatternSchema = z.object({
  type: z.enum(["sequential", "approval-chain", "parallel", "conditional", "retry"])
    .describe("Type of workflow pattern"),
  tasks: z.array(z.string()).min(1).describe("List of task slugs involved in this pattern"),
  conditions: z.array(WorkflowV1ConditionSchema).optional()
    .describe("Conditions that control task activation (optional for some patterns)")
});

export const WorkflowV1BusinessLogicSchema = z.object({
  tasks: z.array(WorkflowV1TaskSchema).min(1)
    .describe("List of tasks in the workflow"),
  patterns: z.array(WorkflowV1PatternSchema)
    .describe("Business logic patterns that control workflow execution")
});

export const WorkflowV1ParamsSchema = z.object({
  baseUrl: z.string().url().describe("Base URL of the API server"),
  appId: z.string().min(1).describe("Application ID"),
  tenantName: z.string().min(1).describe("Tenant name"),
  caseName: z.string().min(1)
    .describe("Case name (must match a workitem object slug from the app contract)"),
  businessLogic: WorkflowV1BusinessLogicSchema.optional()
    .describe("Business logic definition for generating CMMN XML"),
  xml: z.string().optional()
    .describe("Pre-generated CMMN XML (if provided, businessLogic will be ignored)")
}).refine(
  (data) => data.businessLogic || data.xml,
  {
    message: "Either businessLogic or xml parameter must be provided",
    path: ["businessLogic", "xml"]
  }
);

export interface WorkflowV1TaskDefinition {
  slug: string;
  displayName: string;
  outcomes: string[];
  assignee?: string;
  candidateGroups?: string;
  dueDate?: string;
  formKey?: string;
  repetitionLimit?: number;
}

export interface WorkflowV1ConditionDefinition {
  sourceTask: string;
  targetTask: string;
  outcome: string;
  operator?: 'equals' | 'notEquals';
}

export interface WorkflowV1BusinessPattern {
  type: 'sequential' | 'approval-chain' | 'parallel' | 'conditional' | 'retry';
  tasks: string[];
  conditions?: WorkflowV1ConditionDefinition[];
}

export interface WorkflowV1BusinessLogic {
  tasks: WorkflowV1TaskDefinition[];
  patterns: WorkflowV1BusinessPattern[];
}

export interface WorkflowV1Params {
  baseUrl: string;
  appId: string;
  tenantName: string;
  caseName: string;
  businessLogic?: WorkflowV1BusinessLogic;
  xml?: string;
}

export interface WorkflowV1Response {
  success: boolean;
  cmmnXml?: string;
  deploymentResult?: any;
  configurationResult?: any;
  error?: string;
}

// Create Automation Schema and Interface
const CreateAutomationBaseSchema = z.object({
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  appId: z.string().describe("The application ID to create automation for"),
  tenantName: z.string().describe("The tenant name"),
  email: z
    .string()
    .email()
    .describe("Email address of the user creating the automation"),
  name: z.string().describe("Name of the automation"),
  triggerType: z
    .enum(["object", "core", "schedule", "webhook"])
    .describe("Type of trigger for the automation"),

  // Object trigger specific fields
  objectSlug: z
    .string()
    .optional()
    .describe(
      "Slug of the object to automate (required when triggerType is 'object' or for core events)"
    ),
  crudEvent: z
    .enum(["created", "updated", "deleted"])
    .optional()
    .describe(
      "CRUD event to trigger on (required when triggerType is 'object')"
    ),

  // Core trigger specific fields
  coreEventName: z
    .string()
    .optional()
    .describe(
      "Core event name (e.g., 'import', 'export', 'sync') for core triggers"
    ),

  // Schedule trigger specific fields
  cronExpression: z
    .string()
    .optional()
    .describe(
      "Cron expression for schedule triggers (e.g., '*/5 * * * *' for every 5 minutes, '0 0 * * *' for daily)"
    ),
  // Script configuration
  scriptDescription: z
    .string()
    .describe(
      "Comprehensive description including: 1) What the script should do, 2) Which utility functions to import and use, 3) Business logic flow, 4) Error handling requirements, 5) Integration patterns needed (email, database, external APIs, etc.)"
    ),
  customScript: z
    .string()
    .optional()
    .describe(
      "Custom Python script code (if not provided, AI will generate based on scriptDescription)"
    ),
});

export { CreateAutomationBaseSchema };

export const CreateAutomationSchema = CreateAutomationBaseSchema.refine(
  (data) => {
    // Validation for object triggers
    if (data.triggerType === "object") {
      return data.objectSlug && data.crudEvent;
    }
    // Validation for core triggers
    if (data.triggerType === "core") {
      return data.objectSlug; // Object slug is required as task_type
    }
    // Validation for schedule triggers
    if (data.triggerType === "schedule") {
      return data.cronExpression;
    }
    return true;
  },
  {
    message:
      "Missing required fields: object triggers need objectSlug and crudEvent, core triggers need objectSlug, schedule triggers need cronExpression",
    path: ["triggerType"],
  }
);

export interface CreateAutomationParams {
  baseUrl: string;
  appId: string;
  tenantName: string;
  email: string;
  name: string;
  triggerType: "object" | "core" | "schedule" | "webhook";
  objectSlug?: string;
  crudEvent?: "created" | "updated" | "deleted";
  coreEventName?: string;
  cronExpression?: string;
  scriptDescription: string; // Comprehensive description including what to do, which utils to use, business logic, error handling, and integration patterns
  customScript?: string;
}

// Navbar Creation Types
export const CreateNavbarSchema = z.object({
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  appId: z.string().describe("The application ID to create navbar for"),
  tenantName: z.string().describe("The tenant name"),
  email: z
    .string()
    .email()
    .describe("Email address of the user creating the navbar"),
  navbarName: z
    .array(z.string())
    .describe("Array of navbar names for each role (excluding administrator)"),
  includeRoleMapping: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Whether to automatically map pages to roles based on permissions"
    ),
});

export interface CreateNavbarParams {
  baseUrl: string;
  appId: string;
  tenantName: string;
  email: string;
  navbarName: string[];
  includeRoleMapping?: boolean;
  appContract?: any; // Optional for when called from handler
  appPages?: AppPage[]; // Optional for when called from handler
}

// Full sidebar props interface for navbar creation
export interface SidebarProps {
  uuid: string;
  display_name: string;
  rank: number;
  icon: {
    type: string;
    name: string;
    version: number;
    style: string;
    svg: string;
    color: string;
    imgurl: string;
  };
  type: string;
  is_active: boolean;
  children: SidebarProps[];
  meta_data: Record<string, any>;
  route: string;
  app_id?: string;
  is_default: boolean;
  is_custom: boolean;
  default_homepage_type: string;
  view_type: string;
  is_mobile?: boolean; // Optional mobile flag
}

export interface NavbarItem {
  id: string;
  display_name: string;
  icon?: object | string; // Can be an object with icon details or a string for simple icons
  route?: string;
  type: "page" | "folder" | "divider";
  children?: NavbarItem[];
  roles?: string[];
}

export interface NavbarResponse {
  success: boolean;
  navbar_id?: string;
  user_mapping_id?: string;
  navbar_items: NavbarItem[];
  role_mappings: Record<string, string[]>;
  message: string;
}

// Schema for get-app-pages tool
export const GetAppPagesSchema = z.object({
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  tenantName: z.string().describe("The tenant name"),
  appId: z
    .string()
    .optional()
    .describe(
      "Optional application ID to filter pages. If not provided, returns all pages"
    ),
});

export interface GetAppPagesParams {
  baseUrl: string;
  tenantName: string;
  appId?: string;
}

export interface AppPage {
  id: number;
  tenant_id: number;
  user_id: number;
  application_id: string;
  page_id: string;
  custom_field1?: string | null;
  custom_field2?: string | null;
  created_at: string;
  updated_at: string;
  name: string;
  display_name: string;
  type: string;
  is_default: boolean;
  mode: string;
  workitem_type?: string;
  workitem?: number;
  workitem_name?: string;
  workitem_slug?: string;
  application_name: string;
  app_id: string;
}

export interface GetAppPagesResponse {
  success: boolean;
  pages: AppPage[];
  total: number;
  filtered: boolean;
  message: string;
}

// Job Title Creation Types
export interface UserManagementData {
  applications: Array<{
    value: string;
    label: string;
  }>;
  navbar: Array<{
    value: string;
    label: string;
  }>;
  roles: Array<{
    value: string;
    label: string;
  }>;
}

export const CreateJobTitleSchema = z.object({
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  appId: z.string().describe("The application ID to create job title for"),
  tenantName: z.string().describe("The tenant name"),
  email: z
    .string()
    .email()
    .describe("Email address of the user creating the job title"),
  jobTitleNames: z
    .array(z.string())
    .describe(
      "Array of job title names for each role (excluding administrator)"
    ),
  department: z
    .string()
    .optional()
    .default("Engineering")
    .describe("Department name for the job title"),
  assignedTo: z
    .string()
    .optional()
    .default("System")
    .describe("Entity the job title is assigned to"),
});

export interface CreateJobTitleParams {
  baseUrl: string;
  appId: string;
  tenantName: string;
  email: string;
  jobTitleNames: string[];
  department?: string;
  assignedTo?: string;
}

export interface JobTitleResponse {
  success: boolean;
  message: string;
  created_job_titles?: Array<{
    role: string;
    jobTitleName: string;
    roleId: string;
    navbarId?: string;
    jobTitleId?: string;
  }>;
  skipped_job_titles?: Array<{
    role: string;
    jobTitleName: string;
    reason: string;
  }>;
}

// Create User Types
export interface MasterData {
  jobtitleNUQ: Array<{
    value: string;
    label: string;
  }>;
  departmeNSR: Array<{
    value: string;
    label: string;
  }>;
  assignedEPK: Array<{
    value: string;
    label: string;
  }>;
  assignedLJS: Array<{
    value: string;
    label: string;
  }>;
  assignedPBV: Array<{
    value: string;
    label: string;
  }>;
}

export const CreateUserSchema = z.object({
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  appId: z.string().describe("The application ID to create users for"),
  tenantName: z.string().describe("The tenant name"),
  email: z
    .string()
    .email()
    .describe("Email address of the user creating the users"),
  userNames: z
    .array(z.string())
    .optional()
    .describe(
      "Array of user names for each role (optional - will use role names if not provided)"
    ),
  department: z
    .string()
    .optional()
    .default("Engineering")
    .describe("Department name for the users"),
  phoneNumbers: z
    .array(z.string())
    .optional()
    .describe("Array of phone numbers for users (optional)"),
  passwords: z
    .array(z.string())
    .optional()
    .describe(
      "Array of passwords for users (optional - will use email as password if not provided)"
    ),
});

export interface CreateUserParams {
  baseUrl: string;
  appId: string;
  tenantName: string;
  email: string;
  userNames?: string[];
  department?: string;
  phoneNumbers?: string[];
  passwords?: string[];
}

export interface UserResponse {
  success: boolean;
  message: string;
  created_users?: Array<{
    role: string;
    userName: string;
    email: string;
    jobTitle: string;
    department: string;
    userId?: string;
  }>;
  skipped_users?: Array<{
    role: string;
    userName: string;
    email: string;
    reason: string;
  }>;
}
