import { z } from "zod";

/**
 * Schema for grid properties configuration
 */
const GridPropsSchema = z.object({
  w: z.number().optional().describe("Width in grid units"),
  h: z.number().optional().describe("Height in grid units"), 
  x: z.number().optional().describe("X position in grid"),
  y: z.number().optional().describe("Y position in grid"),
  minW: z.number().optional().describe("Minimum width"),
  maxW: z.number().optional().describe("Maximum width"),
  minH: z.number().optional().describe("Minimum height"), 
  maxH: z.number().optional().describe("Maximum height"),
  moved: z.boolean().optional().default(false).describe("Whether widget has been moved"),
  static: z.boolean().optional().default(false).describe("Whether widget is static"),
  isResizable: z.boolean().optional().default(true).describe("Whether widget is resizable"),
});

/**
 * Schema for widget types supported by pages
 */
const WidgetTypeSchema = z.enum([
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
]);

/**
 * Schema for individual widget configuration with grid properties
 */
const WidgetConfigSchema = z.object({
  type: WidgetTypeSchema.describe("Widget type"),
  grid_props: GridPropsSchema.optional().describe("Custom grid positioning and sizing for this widget"),
  props: z.record(z.any()).optional().describe("Custom widget properties"),
  objectSlug: z.string().optional().describe("Data source object for this widget")
});

/**
 * Schema for page types
 */
const PageTypeSchema = z.enum(["record", "dashboard"]);

/**
 * Schema for individual page definition
 */
const PageDefinitionSchema = z.object({
  name: z.string().describe("Name of the page"),
  role: z
    .string()
    .optional()
    .describe("Role that has access to this page (Admin, User, etc.)"),
  type: PageTypeSchema.describe(
    "Type of page (dashboard for list view, record for detail view)"
  ),
  widgets: z
    .array(
      z.union([
        WidgetTypeSchema,
        WidgetConfigSchema
      ])
    )
    .describe("List of widgets - can be simple string names or detailed configurations with grid_props"),
  objectSlug: z
    .string()
    .optional()
    .describe("The object this page is associated with"),
  mode: z
    .string()
    .optional()
    .default("view")
    .describe("Page mode (view, edit)"),
  show_header: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show page header"),
  grid_props: GridPropsSchema.optional().describe("Default grid properties for all widgets on this page"),
});

/**
 * Main schema for createPagesV1 tool
 */
export const CreatePagesV1Schema = z.object({
  tenantName: z.string().describe("The tenant name"),
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  appId: z.string().describe("The application ID"),
  pages: z
    .array(PageDefinitionSchema)
    .describe(
      "Array of page definitions. Simple format: [{name: 'Store Dashboard', type: 'dashboard', widgets: ['table', 'chart']}] or with grid_props: [{name: 'Custom Page', widgets: [{type: 'table', grid_props: {w: 12, h: 30, x: 0, y: 0}}]}]"
    ),
  useAILayout: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Whether to use AI to generate optimal widget layout and grid positions"
    ),
});

export type CreatePagesV1Params = z.infer<typeof CreatePagesV1Schema>;
