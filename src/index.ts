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
          "Create objects with attributes, statuses, and relationships",
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
                    color: z.string().optional(),
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
                    relationship_type: z.string(),
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
          "Create SOT (Status origination Tree) The Status Origination Tree (SOT) defines how and from where an object’s status can change. Each status transition must be triggered by one or more originations, which represent the source or mechanism that initiates the transition.",
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
            })
          ),
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
  "Create objects with attributes, statuses, and relationships",
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
              color: z.string().optional(),
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
              relationship_type: z.string(),
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
  "Create SOT (Status origination Tree) The Status Origination Tree (SOT) defines how and from where an object's status can change. Each status transition must be triggered by one or more originations, which represent the source or mechanism that initiates the transition. object_slug is the slug of the object to which the SOT belongs.",
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
        }),
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
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("App studio MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
