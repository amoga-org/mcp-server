#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  createAppPayload,
  getAllApps,
  deleteAppPayload,
  getAppContract,
  createAppContract,
  createSotData,
  deleteObject,
} from "./utils/api.js";
import dotenv from "dotenv";
// Create server instance
dotenv.config();
if (!process.env.MCP_API_KEY) {
  console.error("MCP_API_KEY environment variable is not set");
  process.exit(1);
}
const server = new McpServer({
  name: "amogastudio",
  version: "1.0.0",
  capabilities: {
    resources: {
      appStudio: {
        description:
          "Low-code application builder for defining data models, UI screens, and workflows",
        schema: z.object({
          createApp: z.boolean().describe("Allows creating new applications"),
          manageModels: z
            .boolean()
            .describe("Supports defining and modifying data models"),
          designUI: z
            .boolean()
            .describe("Allows visual design of user interfaces"),
          automateWorkflows: z
            .boolean()
            .describe("Enables drag-and-drop workflow automation"),
        }),
      },
      integrationHub: {
        description:
          "Integration layer for connecting third-party services and APIs",
        schema: z.object({
          connectors: z
            .boolean()
            .describe(
              "Supports prebuilt connectors (e.g., Slack, Stripe, PostgreSQL)"
            ),
          customAPI: z
            .boolean()
            .describe("Allows users to define and consume custom REST APIs"),
        }),
      },
      permissions: {
        description: "User roles and access control system for applications",
        schema: z.object({
          roleBasedAccess: z.boolean(),
          tenantScoping: z.boolean(),
        }),
      },
    },
    tools: {
      "create-app": {
        description: "Create a new application and update the backend system",
        parameters: z.object({
          tenantName: z.string(),
          baseUrl: z.string().url(),
          appName: z.string(),
          id: z.string().optional(), // For updateObject
          amo_application_id: z.string().optional(), // For updateObject
        }),
      },
      "get-apps": {
        description: "Get all applications for a tenant",
        parameters: z.object({
          tenantName: z.string(),
          baseUrl: z.string().url(),
        }),
      },
      "delete-app": {
        description: "Delete an application from the backend system",
        parameters: z.object({
          tenantName: z.string(),
          baseUrl: z.string().url(),
          appId: z.string(),
        }),
      },
      "get-app-contract": {
        description: "Fetch all objects in an app contract and their details",
        parameters: z.object({
          baseUrl: z.string().url(),
          appId: z.string(),
          tenantName: z.string(),
        }),
      },
      "create-object": {
        description:
          "Create structured objects like workitems, tasks, and masters with attributes, statuses, and defined relationships." +
          "This tool lets you model business entities (e.g., workflows, data objects, master lists) by specifying fields, lifecycle states, and how objects relate to each other." +
          "⚠️ Relationship Rules:" +
          "Only two relationship types are supported: oneToMany and manyToOne." +
          "A task can be related to a workitem using only one task → workitem relationship." +
          "Only two relationships are allowed between object types.",
        parameters: z.object({
          tenantName: z.string(),
          baseUrl: z.string().url(),
          appId: z.string(),
          appSlug: z.string(),
          email: z.string().email(),
          appName: z.string(),
          objects: z.array(
            z.object({
              name: z.string(),
              type: z.enum([
                "workitem",
                "task",
                "object",
                "amotask",
                "call_activity",
                "email_activity",
                "master",
                "segment",
              ]),
              slug: z.string().optional(),
              attributes: z
                .array(
                  z.object({
                    display_name: z.string(),
                    component_type: z.enum([
                      "text",
                      "enumeration",
                      "date",
                      "boolean",
                      "number",
                    ]),
                  })
                )
                .optional(),
              status: z
                .array(
                  z.object({
                    name: z.string(),
                    color: z.string(),
                    amo_name: z.enum([
                      "todo",
                      "inProgress",
                      "completed",
                      "onHold",
                      "inCompleted",
                      "reopen",
                    ]),
                  })
                )
                .optional(),
              relationship: z
                .array(
                  z.object({
                    name: z.string(),
                    relationship_type: z.enum(["manyToOne", "oneToMany"]),
                  })
                )
                .optional(),
            })
          ),
          id: z.string().optional(),
          amo_application_id: z.string().optional(),
        }),
      },
      "create-sot": {
        description:
          "Create SOT (Status Origination Tree). " +
          "The SOT defines how and from where an object’s status can change. Each transition is linked to an origination source such as a workflow, automation rule, or page. " +
          "If `origination_type` is set to `page`, the AI must auto-generate a **UI page layout** for the target object. The layout should include a relevant set of widgets under the `widgets` property. If not explicitly provided, the AI should decide when `origination_type` should be `page` based on the nature of the object and transition context. " +
          "- `record`: All widgets applicable to the object type are allowed (e.g., header, details, comment, activity, jsonform, attachments, etc.), including `stats` and `table` if appropriate.\n" +
          "- `general`: Only `stats` and `table` widgets must be included. No other widgets are allowed.\n" +
          "⚙️ Widget Auto-Generation Rules:\n" +
          "- If object type is `workitem` or `task`, include:\n" +
          "  • header, details, comment, activity\n" +
          "- If object type is for display (e.g., `object`, `master`), include:\n" +
          "  • header, table, filter, stats, jsonform\n" +
          "- If collaboration is needed, include:\n" +
          "  • comment, note, attachment, conversation\n" +
          "- If automation or tracking is involved, include:\n" +
          "  • automationLogs, eventLog, progressbar, taskIframe\n" +
          "- For advanced or custom UI, optionally include:\n" +
          "  • customComponent, container, richTextEditor, carousel, qrscanner, calendar, map, chart, json\n" +
          "🧩 Grid Layout Auto-Generation:\n" +
          "Each widget must include a `grid_props` object for layout control. The AI must auto-generate these dynamically based on widget type and available space.\n" +
          "- Default layout values:\n" +
          "  • w: width (max 12)\n" +
          "  • h: height (calculated based on widget type — 1 grid unit = 14px, so total height in px ÷ 14 = h)\n" +
          "  • x, y: position on grid (auto-calculated to prevent overlap)\n" +
          "  • isResizable: true\n" +
          "  • static: false\n" +
          "🖼️ Page Layout Previews (for origination_type = page):\n" +
          "- WorkItem General Page:\n" +
          "  ┌───────────────────────────────┐\n" +
          "  │   [ Stat Widget 1 ]           │\n" +
          "  │   [ Stat Widget 2 ]           │\n" +
          "  │   [ Stat Widget 3 ]           │\n" +
          "  │                               │\n" +
          "  │   [ Table - Assigned Items ]  │\n" +
          "  └───────────────────────────────┘\n" +
          "- WorkItem / Task / Object Record Page:\n" +
          "  ┌───────────────────────────────┐\n" +
          "  │       [ Header Widget ]       │\n" +
          "  │     [ Details Widget ]        │\n" +
          "  │ [ Comment ]    [ Activity ]   │\n" +
          "  └───────────────────────────────┘\n" +
          "- Task / Object General Page:\n" +
          "  ┌───────────────────────────────┐\n" +
          "  │       [ Table Widget ]        │\n" +
          "  └───────────────────────────────┘\n" +
          "- Object with Full Display Needs:\n" +
          "  ┌───────────────────────────────┐\n" +
          "  │  [ Stats ]   [ Filters ]       │\n" +
          "  │        [ Table Widget ]        │\n" +
          "  │        [ JSON Form ]           │\n" +
          "  └───────────────────────────────┘\n",
        parameters: z.object({
          baseUrl: z.string().url(),
          appId: z.string(),
          tenantName: z.string(),
          sotData: z.array(
            z.object({
              id: z.string(),
              description: z.string(),
              instruction: z.string(),
              object_slug: z.string(),
              origination_type: z.enum([
                "workflow",
                "automation",
                "actions",
                "template_email_whatsApp",
                "template_pdf",
                "create_form",
                "page",
                "navbar_and_roles",
                "dashboard",
              ]),
              name: z.string(),
              status: z.object({
                display_name: z.string(),
                color: z.string(),
                slug: z.string(),
              }),
              origination: z.object({
                value: z.string(),
                slug: z.string(),
                display_name: z.string(),
              }),
              // ✅ Add widgets only if origination_type is "page"
              widgets: z
                .array(
                  z.object({
                    type: z.enum([
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
                    ]),
                    grid_props: z.object({
                      h: z.number(),
                      i: z.string(), // unique ID
                      w: z.number().max(12),
                      x: z.number(),
                      y: z.number(),
                      maxH: z.number().optional(),
                      maxW: z.number().default(12),
                      minH: z.number().default(3),
                      minW: z.number().default(3),
                      moved: z.boolean().default(false),
                      static: z.boolean().default(false),
                      isResizable: z.boolean().default(true),
                    }),
                  })
                )
                .optional(), // Only present for pages
              // ✅ Add widgets only if origination_type is "page"
            })
          ),
        }),
      },
      "delete-object": {
        description: "Delete an object from the application contract",
        parameters: z.object({
          tenantName: z.string(),
          baseUrl: z.string().url(),
          appId: z.string(),
          objectName: z.string(),
        }),
      },
    },
  },
});
// This tool creates a new application based on the provided tenant name, base URL, and app name,
// and returns the application ID and slug or an error message if creation fails.
server.tool(
  "create-app",
  "Create an application and update backend",
  {
    tenantName: z.string(),
    baseUrl: z.string().url(),
    appName: z.string(),
    amo_application_id: z.string().optional(),
  },
  async ({ tenantName, baseUrl, appName, amo_application_id }) => {
    try {
      const { appId, appSlug } = await createAppPayload(
        tenantName,
        baseUrl,
        appName,
        amo_application_id
      );
      return {
        content: [
          {
            type: "text",
            text: `✅ Application created: ID = ${appId}, Slug = ${appSlug}`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to create application: ${err.message || err}`,
          },
        ],
      };
    }
  }
);
//Retrieves all applications for a specified tenant based on the provided tenant name and base URL,
//and returns a list of application names or an error message if retrieval fails.
server.tool(
  "get-apps",
  "Get all applications for a tenant",
  {
    tenantName: z.string(),
    baseUrl: z.string().url(),
    amo_application_id: z.string().optional(),
  },
  async ({ tenantName, baseUrl }) => {
    try {
      const data = await getAllApps(baseUrl, tenantName);
      const apps = data || [];
      return {
        content: [
          {
            type: "text",
            text:
              `✅ Found ${apps.length} applications:\n` +
              apps.map((a: any) => `- ${a.application_name}`).join("\n"),
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to get apps: ${err.message || err}`,
          },
        ],
      };
    }
  }
);
//Deletes an application based on the provided tenant name, base URL, and application ID,
server.tool(
  "delete-app",
  "Delete an application and update backend",
  {
    tenantName: z.string(),
    baseUrl: z.string().url(),
    appId: z.string(),
  },
  async ({ tenantName, baseUrl, appId }) => {
    try {
      await deleteAppPayload(tenantName, baseUrl, appId);
      return {
        content: [
          {
            type: "text",
            text: `✅ Application with ID ${appId} has been deleted successfully.`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to delete application: ${err.message || err}`,
          },
        ],
      };
    }
  }
);

//get app contract
server.tool(
  "get-app-contract",
  "Fetch all objects in an app contract.",
  {
    baseUrl: z.string().url(),
    appId: z.string(),
    tenantName: z.string(),
  },
  async ({ baseUrl, appId, tenantName }) => {
    const contractJson = await getAppContract(baseUrl, tenantName, appId);
    try {
      return {
        content: [
          { type: "text", text: `✅ Found ${JSON.stringify(contractJson)}` },
        ],
      };
    } catch (err) {
      return { content: [{ type: "text", text: `❌ ${err}` }] };
    }
  }
);
// create app contract objects, relationships, statuses, and attributes.
server.tool(
  "create-object",
  "Create structured objects like workitems, tasks, and masters with attributes, statuses, and defined relationships." +
    "This tool lets you model business entities (e.g., workflows, data objects, master lists) by specifying fields, lifecycle states, and how objects relate to each other." +
    "⚠️ Relationship Rules:" +
    "Only two relationship types are supported: oneToMany and manyToOne." +
    "A task can be related to a workitem using only one task → workitem relationship." +
    "Only two relationships are allowed between object types.",
  {
    tenantName: z.string(),
    baseUrl: z.string().url(),
    appId: z.string(),
    appSlug: z.string(),
    email: z.string().email(),
    appName: z.string(),
    objects: z.array(
      z.object({
        name: z.string(),
        type: z.enum([
          "workitem",
          "task",
          "object",
          "amotask",
          "call_activity",
          "email_activity",
          "master",
          "segment",
        ]),
        slug: z.string().optional(),
        attributes: z
          .array(
            z.object({
              display_name: z.string(),
              component_type: z.enum([
                "text",
                "enumeration",
                "date",
                "boolean",
                "number",
              ]),
            })
          )
          .optional(),
        status: z
          .array(
            z.object({
              name: z.string(),
              color: z.string(),
              amo_name: z.enum([
                "todo",
                "inProgress",
                "completed",
                "onHold",
                "inCompleted",
                "reopen",
              ]),
            })
          )
          .optional(),
        relationship: z
          .array(
            z.object({
              name: z.string(),
              relationship_type: z.enum(["manyToOne", "oneToMany"]),
            })
          )
          .optional(),
      })
    ),
    id: z.string().optional(),
    amo_application_id: z.string().optional(),
  },
  async ({ tenantName, baseUrl, appName, appId, appSlug, email, objects }) => {
    try {
      const contractJson = await createAppContract(
        baseUrl,
        tenantName,
        objects,
        appSlug,
        appId,
        email,
        appName
      );
      // Create objects with attributes, statuses, and relationships

      return {
        content: [
          {
            type: "text",
            text: `✅ Objects created successfully for app ${appId} or JSON:${JSON.stringify(
              contractJson
            )}`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to create objects: ${err.message || err}`,
          },
        ],
      };
    }
  }
);
server.tool(
  "create-sot",
  "Create SOT (Status Origination Tree). " +
    "The SOT defines how and from where an object’s status can change. Each transition is linked to an origination source such as a workflow, automation rule, or page. " +
    "If `origination_type` is set to `page`, the AI must auto-generate a **UI page layout** for the target object. The layout should include a relevant set of widgets under the `widgets` property. If not explicitly provided, the AI should decide when `origination_type` should be `page` based on the nature of the object and transition context. " +
    "- `record`: All widgets applicable to the object type are allowed (e.g., header, details, comment, activity, jsonform, attachments, etc.), including `stats` and `table` if appropriate.\n" +
    "- `general`: Only `stats` and `table` widgets must be included. No other widgets are allowed.\n" +
    "⚙️ Widget Auto-Generation Rules:\n" +
    "- If object type is `workitem` or `task`, include:\n" +
    "  • header, details, comment, activity\n" +
    "- If object type is for display (e.g., `object`, `master`), include:\n" +
    "  • header, table, filter, stats, jsonform\n" +
    "- If collaboration is needed, include:\n" +
    "  • comment, note, attachment, conversation\n" +
    "- If automation or tracking is involved, include:\n" +
    "  • automationLogs, eventLog, progressbar, taskIframe\n" +
    "- For advanced or custom UI, optionally include:\n" +
    "  • customComponent, container, richTextEditor, carousel, qrscanner, calendar, map, chart, json\n" +
    "🧩 Grid Layout Auto-Generation:\n" +
    "Each widget must include a `grid_props` object for layout control. The AI must auto-generate these dynamically based on widget type and available space.\n" +
    "- Default layout values:\n" +
    "  • w: width (max 12)\n" +
    "  • h: height (calculated based on widget type — 1 grid unit = 14px, so total height in px ÷ 14 = h)\n" +
    "  • x, y: position on grid (auto-calculated to prevent overlap)\n" +
    "  • isResizable: true\n" +
    "  • static: false\n" +
    "🖼️ Page Layout Previews (for origination_type = page):\n" +
    "- WorkItem General Page:\n" +
    "  ┌───────────────────────────────┐\n" +
    "  │   [ Stat Widget 1 ]           │\n" +
    "  │   [ Stat Widget 2 ]           │\n" +
    "  │   [ Stat Widget 3 ]           │\n" +
    "  │                               │\n" +
    "  │   [ Table - Assigned Items ]  │\n" +
    "  └───────────────────────────────┘\n" +
    "- WorkItem / Task / Object Record Page:\n" +
    "  ┌───────────────────────────────┐\n" +
    "  │       [ Header Widget ]       │\n" +
    "  │     [ Details Widget ]        │\n" +
    "  │ [ Comment ]    [ Activity ]   │\n" +
    "  └───────────────────────────────┘\n" +
    "- Task / Object General Page:\n" +
    "  ┌───────────────────────────────┐\n" +
    "  │       [ Table Widget ]        │\n" +
    "  └───────────────────────────────┘\n" +
    "- Object with Full Display Needs:\n" +
    "  ┌───────────────────────────────┐\n" +
    "  │  [ Stats1]   [Stats2]         │\n" +
    "  │        [ Table Widget ]       │\n" +
    "  │        [ JSON Form ]          │\n" +
    "  └───────────────────────────────┘\n",
  {
    baseUrl: z.string().url(),
    appId: z.string(),
    tenantName: z.string(),
    sotData: z.array(
      z.object({
        id: z.string(),
        description: z.string(),
        instruction: z.string(),
        object_slug: z.string(),
        origination_type: z.enum([
          "workflow",
          "automation",
          "actions",
          "template_email_whatsApp",
          "template_pdf",
          "create_form",
          "page",
          "navbar_and_roles",
          "dashboard",
        ]),
        name: z.string(),
        status: z.object({
          display_name: z.string(),
          color: z.string(),
          slug: z.string(),
        }),
        origination: z.object({
          value: z.string(),
          slug: z.string(),
          display_name: z.string(),
          type: z.enum(["dashboard", "record"]).optional(), // <-- Add this line
        }),
        widgets: z
          .array(
            z.object({
              type: z.enum([
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
              ]),
              grid_props: z.object({
                h: z.number(),
                i: z.string(), // unique ID
                w: z.number().max(12),
                x: z.number(),
                y: z.number(),
                moved: z.boolean().default(false),
                static: z.boolean().default(false),
                isResizable: z.boolean().default(true),
              }),
            })
          )
          .optional(),
      })
    ),
  },
  async ({ baseUrl, appId, tenantName, sotData }) => {
    try {
      // First get the app contract to validate against
      const contractJson = await getAppContract(baseUrl, tenantName, appId);
      if (!contractJson) {
        throw new Error("Could not fetch app contract");
      }
      // Call createSotData to update the contract with new SOTs while preserving existing ones
      const updatedContract = await createSotData(
        baseUrl,
        tenantName,
        appId,
        sotData,
        contractJson
      );

      return {
        content: [
          {
            type: "text",
            text: `✅ SOTs created/updated successfully. Existing SOTs were preserved`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to create/update SOTs: ${err.message || err}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "delete-object",
  "Delete an object from the application contract",
  {
    tenantName: z.string(),
    baseUrl: z.string().url(),
    appId: z.string(),
    objectName: z.string(),
  },
  async ({ tenantName, baseUrl, appId, objectName }) => {
    try {
      await deleteObject(baseUrl, tenantName, appId, objectName);
      return {
        content: [
          {
            type: "text",
            text: `✅ Successfully deleted object "${objectName}"`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to delete object: ${err.message || err}`,
          },
        ],
      };
    }
  }
);
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("App studio MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
