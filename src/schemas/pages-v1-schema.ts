import { z } from "zod";

/**
 * Schema for widget grid properties - exact match to create-sot structure
 */
const WidgetGridPropsSchema = z.object({
  h: z
    .number()
    .min(5)
    .describe(
      "Height of the widget min is 5 and max is any number and 1 grid unit = 14px so proper height calculation is needed"
    ),
  i: z.string().describe("Unique ID of the widget"),
  w: z.number().max(12).describe("Width of the widget (max 12)"),
  x: z.number().describe("X position"),
  y: z.number().describe("Y position"),
  maxH: z.number().optional().describe("Maximum height"),
  maxW: z.number().default(12).describe("Maximum width"),
  minH: z.number().default(3).describe("Minimum height"),
  minW: z.number().default(3).describe("Minimum width"),
  moved: z.boolean().default(false).describe("Whether widget is moved"),
  static: z.boolean().default(false).describe("Whether widget is static"),
  isResizable: z
    .boolean()
    .default(true)
    .describe("Whether widget is resizable"),
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
 * Schema for individual widget - matches create-sot exactly
 */
const WidgetSchema = z.object({
  type: WidgetTypeSchema.describe("Type of widget"),
  grid_props: WidgetGridPropsSchema.describe("Grid properties for the widget"),
  props: z.record(z.any()).describe("Additional properties for the widget"),
});

/**
 * Schema for page types
 */
const PageTypeSchema = z.enum(["record", "dashboard"]);

/**
 * Schema for individual page definition - simplified to match create-sot
 */
const PageDefinitionSchema = z.object({
  name: z.string().describe("Name of the page"),
  type: PageTypeSchema.describe(
    "Type of page (dashboard for list view, record for detail view)"
  ),
  objectSlug: z
    .string()
    .optional()
    .describe("The object this page is associated with"),
  widgets: z
    .array(WidgetSchema)
    .optional()
    .describe("Optional widgets for the page with complete grid positioning"),
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
      "Array of page definitions. AI should calculate widget heights based on type and respect minimum heights (1 grid unit = 14px). Widget minimum heights from config: note(minH:10), activity(minH:20), attachment(minH:20), button(minH:2), calendar(minH:25), carousel(minH:18), chart(minH:4), comment(minH:15), container(minH:1), conversation(minH:10), dropdown(minH:4), file_preview(minH:10), header(minH:6), html_parser(minH:2), iframe(minH:4), json(minH:27), jsonform(minH:4), leaderboard(minH:2), list(minH:5), map(minH:2), page(minH:10), path(minH:4), progressbar(minH:1), qrScanner(minH:2), richTextEditor(minH:15), spacer(minH:1), stats(minH:4), table(minH:25), tabs(minH:10), ticker(minH:2). Format: [{name: 'Dashboard', type: 'dashboard', objectSlug: 'store', widgets: [{type: 'header', grid_props: {h: 15, i: 'uuid', w: 8, x: 0, y: 0}}]}]"
    ),
});

export type CreatePagesV1Params = z.infer<typeof CreatePagesV1Schema>;
