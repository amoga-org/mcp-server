#!/usr/bin/env node

/**
 * MCP Server for App Studio
 * A Model Context Protocol server for low-code application development
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";

// Configuration and constants
import { TOOL_DESCRIPTIONS } from "./constants/tool-descriptions.js";
import { SERVER_CAPABILITIES } from "./config/capabilities.js";

// Type definitions and schemas
import {
  CreateAppSchema,
  GetAppsSchema,
  DeleteAppSchema,
  GetAppContractSchema,
  CreateObjectSchema,
  CreateSotSchema,
  DeleteObjectSchema,
  CreateUpdateRolesSchema,
  CreateAttributeSchema,
  PublishAppSchema,
  CheckPublishStatusSchema,
  GenerateWorkflowSchema,
  WorkflowV1ParamsSchema,
  CreateAutomationSchema,
  CreateAutomationBaseSchema,
  CreateNavbarSchema,
  GetAppPagesSchema,
  CreateJobTitleSchema,
  CreateUserSchema,
} from "./types/app.types.js";
import { DummyDataSchema } from "./schemas/dummy-data-schema.js";
import { CreateAppV1Schema } from "./schemas/app-v1-schema.js";
import { CreateSOTV1Schema } from "./schemas/sot-v1-schema.js";
import { CreateRoleV1Schema } from "./schemas/role-v1-schema.js";
import { CreateAutomationV1Schema } from "./schemas/automation-v1-schema.js";
import { PublishV1Schema } from "./schemas/publish-v1-schema.js";
import { CreatePagesV1Schema } from "./schemas/pages-v1-schema.js";

// Tool handlers
import { toolHandlers } from "./handlers/tool-handlers.js";

// Environment configuration
dotenv.config();

if (!process.env.AMOGA_API_KEY) {
  console.error("AMOGA_API_KEY environment variable is not set");
  process.exit(1);
}

// Create server instance
const server = new McpServer({
  name: "amogastudio",
  version: "1.0.0",
  capabilities: {
    resources: SERVER_CAPABILITIES.resources,
    tools: {
    //   "create-app": {
    //     description: TOOL_DESCRIPTIONS.CREATE_APP,
    //     parameters: CreateAppSchema,
    //   },
      "get-apps": {
        description: TOOL_DESCRIPTIONS.GET_APPS,
        parameters: GetAppsSchema,
      },
      "delete-app": {
        description: TOOL_DESCRIPTIONS.DELETE_APP,
        parameters: DeleteAppSchema,
      },
      "get-app-contract": {
        description: TOOL_DESCRIPTIONS.GET_APP_CONTRACT,
        parameters: GetAppContractSchema,
      },
    //   "create-object": {
    //     description: TOOL_DESCRIPTIONS.CREATE_OBJECT,
    //     parameters: CreateObjectSchema,
    //   },
    //   "create-sot": {
    //     description: TOOL_DESCRIPTIONS.CREATE_SOT,
    //     parameters: CreateSotSchema,
    //   },
      "delete-object": {
        description: TOOL_DESCRIPTIONS.DELETE_OBJECT,
        parameters: DeleteObjectSchema,
      },
    //   "create-update-roles": {
    //     description: TOOL_DESCRIPTIONS.CREATE_UPDATE_ROLES,
    //     parameters: CreateUpdateRolesSchema,
    //   },
    //   "create-attributes": {
    //     description: TOOL_DESCRIPTIONS.CREATE_UPDATE_ATTRIBUTE,
    //     parameters: CreateAttributeSchema,
    //   },
      "add-dummy-data": {
        description: TOOL_DESCRIPTIONS.ADD_DUMMY_DATA,
        parameters: DummyDataSchema,
      },
    //   "publish-app": {
    //     description: TOOL_DESCRIPTIONS.PUBLISH_APP,
    //     parameters: PublishAppSchema,
    //   },
      "check-publish-status": {
        description: TOOL_DESCRIPTIONS.CHECK_PUBLISH_STATUS,
        parameters: CheckPublishStatusSchema,
      },
    //   "generate-workflow": {
    //     description: TOOL_DESCRIPTIONS.GENERATE_WORKFLOW,
    //     parameters: GenerateWorkflowSchema,
    //   },
      "generate-workflow-v1": {
        description: TOOL_DESCRIPTIONS.GENERATE_WORKFLOW_V1,
        parameters: WorkflowV1ParamsSchema,
      },
    //   "create-automation": {
    //     description: TOOL_DESCRIPTIONS.CREATE_AUTOMATION,
    //     parameters: CreateAutomationSchema,
    //   },
      "create-navbar": {
        description: TOOL_DESCRIPTIONS.CREATE_NAVBAR,
        parameters: CreateNavbarSchema,
      },
      "get-app-pages": {
        description: TOOL_DESCRIPTIONS.GET_APP_PAGES,
        parameters: GetAppPagesSchema,
      },
      "create-job-title": {
        description: TOOL_DESCRIPTIONS.CREATE_JOB_TITLE,
        parameters: CreateJobTitleSchema,
      },
      "create-user": {
        description: TOOL_DESCRIPTIONS.CREATE_USER,
        parameters: CreateUserSchema,
      },
      createAppV1: {
        description:
          "V1: Create application only - takes app details and creates app",
        parameters: CreateAppV1Schema,
      },
      createSOTV1: {
        description:
          "🆕 V1: Create objects with attributes and SOT - Enhanced with custom color support! " +
          "Processes masters and objects with SOT, supports custom status_values with restricted amo_name values. " +
          "Features: ✅ User-defined colors ✅ Restricted amo_name values (todo, inProgress, completed, onHold, inCompleted, reopen) " +
          "✅ Custom display names and colors ✅ Backward compatibility with string arrays",
        parameters: CreateSOTV1Schema,
      },
      createRoleV1: {
        description:
          "🔐 ADVANCED RBAC ROLE CREATOR: Create roles with intelligent contract-based permission mapping! " +
          "Supports two modes: 1) Simple Mode - create roles with full permissions on all objects, " +
          "2) RBAC Mode - define detailed permissions per role and object. In RBAC mode, the tool automatically: " +
          "✨ Fetches your app contract to understand available objects ✨ Maps permission definitions to actual contract objects " +
          "✨ Sets specified permissions for matched objects ✨ Adds default 'false' permissions for unmentioned contract objects " +
          "✨ Skips objects not found in contract ✨ Provides detailed mapping analysis " +
          "Perfect for complex permission structures with granular access control!",
        parameters: CreateRoleV1Schema,
      },
      createAutomationV1: {
        description:
          "🚀 AI-POWERED AUTOMATION GENERATOR WITH CONTRACT ANALYSIS: Just describe what you want and AI creates complete working automation! " +
          "This advanced tool automatically fetches your app contract, analyzes available objects and attributes, then generates complete Python automation code " +
          "with proper trigger details, script code, error handling, and business logic. Simply provide a natural language description " +
          "(e.g., 'When a task is created, send email to assignee and create follow-up reminder') and the AI will: " +
          "✨ Analyze your app contract structure ✨ Generate trigger details based on available objects ✨ Create complete Python script code " +
          "✨ Add contract-aware field mapping ✨ Include professional error handling ✨ Generate beautiful email templates " +
          "✨ Add PDF generation and database operations ✨ Create working automation that saves via API. " +
          "Two modes: 'description' (AI generates everything) or 'pseudo' (manual control). No programming knowledge required!",
        parameters: CreateAutomationV1Schema,
      },
      publishV1: {
        description:
          "V1: Publish application - simple application publishing for V1 architecture",
        parameters: PublishV1Schema,
      },
      createPagesV1: {
        description:
          "🎨 SMART PAGE CREATOR WITH AI LAYOUT: Create multiple pages with widgets in one go! " +
          "Just provide page definitions with names, roles, types (index is a dashboard/record), and widgets. " +
          "Features: ✨ Smart widget positioning with AI layout optimization ✨ Automatic grid calculation " +
          "✨ Support for all widget types (Table, Header, JSON Form, Comments, Progress bar, Notes, Activity, Attachment) " +
          "✨ Role-based access configuration ✨ Index pages for lists and Record pages for details " +
          "✨ Pre-configured widget properties and styling. Perfect for quickly setting up admin interfaces!",
        parameters: CreatePagesV1Schema,
      },
    },
  },
});

// Register tool handlers
// server.tool(
//   "create-app",
//   TOOL_DESCRIPTIONS.CREATE_APP,
//   CreateAppSchema.shape,
//   toolHandlers["create-app"]
// );
server.tool(
  "get-apps",
  TOOL_DESCRIPTIONS.GET_APPS,
  GetAppsSchema.shape,
  toolHandlers["get-apps"]
);
server.tool(
  "delete-app",
  TOOL_DESCRIPTIONS.DELETE_APP,
  DeleteAppSchema.shape,
  toolHandlers["delete-app"]
);
server.tool(
  "get-app-contract",
  TOOL_DESCRIPTIONS.GET_APP_CONTRACT,
  GetAppContractSchema.shape,
  toolHandlers["get-app-contract"]
);
// server.tool(
//   "create-object",
//   TOOL_DESCRIPTIONS.CREATE_OBJECT,
//   CreateObjectSchema.shape,
//   toolHandlers["create-object"]
// );
// server.tool(
//   "create-sot",
//   TOOL_DESCRIPTIONS.CREATE_SOT,
//   CreateSotSchema.shape,
//   toolHandlers["create-sot"]
// );
server.tool(
  "delete-object",
  TOOL_DESCRIPTIONS.DELETE_OBJECT,
  DeleteObjectSchema.shape,
  toolHandlers["delete-object"]
);
// server.tool(
//   "create-update-roles",
//   TOOL_DESCRIPTIONS.CREATE_UPDATE_ROLES,
//   CreateUpdateRolesSchema.shape,
//   toolHandlers["create-update-roles"]
// );
server.tool(
  "create-attributes",
  TOOL_DESCRIPTIONS.CREATE_UPDATE_ATTRIBUTE,
  CreateAttributeSchema.shape,
  toolHandlers["create-attributes"]
);
server.tool(
  "add-dummy-data",
  TOOL_DESCRIPTIONS.ADD_DUMMY_DATA,
  DummyDataSchema.shape,
  toolHandlers["add-dummy-data"]
);
// server.tool(
//   "publish-app",
//   TOOL_DESCRIPTIONS.PUBLISH_APP,
//   PublishAppSchema.shape,
//   toolHandlers["publish-app"]
// );
server.tool(
  "check-publish-status",
  TOOL_DESCRIPTIONS.CHECK_PUBLISH_STATUS,
  CheckPublishStatusSchema.shape,
  toolHandlers["check-publish-status"]
);
// server.tool(
//   "generate-workflow",
//   TOOL_DESCRIPTIONS.GENERATE_WORKFLOW,
//   GenerateWorkflowSchema.shape,
//   toolHandlers["generate-workflow"]
// );
server.tool(
  "generate-workflow-v1",
  TOOL_DESCRIPTIONS.GENERATE_WORKFLOW_V1,
  WorkflowV1ParamsSchema._def.schema.shape,
  toolHandlers["generate-workflow-v1"]
);
// server.tool(
//   "create-automation",
//   TOOL_DESCRIPTIONS.CREATE_AUTOMATION,
//   CreateAutomationBaseSchema.shape,
//   toolHandlers["create-automation"]
// );
server.tool(
  "get-app-pages",
  TOOL_DESCRIPTIONS.GET_APP_PAGES,
  GetAppPagesSchema.shape,
  toolHandlers["get-app-pages"]
);
server.tool(
  "create-navbar",
  TOOL_DESCRIPTIONS.CREATE_NAVBAR,
  CreateNavbarSchema.shape,
  toolHandlers["create-navbar"]
);
server.tool(
  "create-job-title",
  TOOL_DESCRIPTIONS.CREATE_JOB_TITLE,
  CreateJobTitleSchema.shape,
  toolHandlers["create-job-title"]
);
server.tool(
  "create-user",
  TOOL_DESCRIPTIONS.CREATE_USER,
  CreateUserSchema.shape,
  toolHandlers["create-user"]
);

// V1 Tools - Simple and Direct
server.tool(
  "createAppV1",
  "V1: Create application only - takes app details and creates app",
  CreateAppV1Schema.shape,
  toolHandlers["createAppV1"]
);
server.tool(
  "createSOTV1",
  "🆕 V1: Create objects with attributes and SOT - Enhanced with custom color support! " +
  "Processes masters and objects with SOT, supports custom status_values with restricted amo_name values. " +
  "Features: ✅ User-defined colors ✅ Restricted amo_name (todo, inProgress, completed, onHold, inCompleted, reopen) ✅ Backward compatibility",
  CreateSOTV1Schema.shape,
  toolHandlers["createSOTV1"]
);
server.tool(
  "createRoleV1",
  "🔐 ADVANCED RBAC ROLE CREATOR: Create roles with intelligent contract-based permission mapping! " +
    "Supports two modes: 1) Simple Mode - create roles with full permissions on all objects, " +
    "2) RBAC Mode - define detailed permissions per role and object. In RBAC mode, the tool automatically: " +
    "✨ Fetches your app contract to understand available objects ✨ Maps permission definitions to actual contract objects " +
    "✨ Sets specified permissions for matched objects ✨ Adds default 'false' permissions for unmentioned contract objects " +
    "✨ Skips objects not found in contract ✨ Provides detailed mapping analysis " +
    "Perfect for complex permission structures with granular access control!",
  CreateRoleV1Schema.shape,
  toolHandlers["createRoleV1"]
);
server.tool(
  "createAutomationV1",
  "🚀 AI-POWERED AUTOMATION GENERATOR WITH CONTRACT ANALYSIS: Just describe what you want and AI creates complete working automation! " +
    "This advanced tool automatically fetches your app contract, analyzes available objects and attributes, then generates complete Python automation code " +
    "with proper trigger details, script code, error handling, and business logic. Simply provide a natural language description " +
    "(e.g., 'When a task is created, send email to assignee and create follow-up reminder') and the AI will: " +
    "✨ Analyze your app contract structure ✨ Generate trigger details based on available objects ✨ Create complete Python script code " +
    "✨ Add contract-aware field mapping ✨ Include professional error handling ✨ Generate beautiful email templates " +
    "✨ Add PDF generation and database operations ✨ Create working automation that saves via API. " +
    "Two modes: 'description' (AI generates everything) or 'pseudo' (manual control). No programming knowledge required!",
  CreateAutomationV1Schema.shape,
  toolHandlers["createAutomationV1"]
);
server.tool(
  "publishV1",
  "V1: Publish application - simple application publishing for V1 architecture",
  PublishV1Schema.shape,
  toolHandlers["publishV1"]
);
server.tool(
  "createPagesV1",
  "🎨 SMART PAGE CREATOR WITH AI LAYOUT: Create multiple pages with widgets in one go! " +
    "Just provide page definitions with names, roles, types (dashboard/record), and widgets. " +
    "Features: ✨ Smart widget positioning with AI layout optimization ✨ Automatic grid calculation " +
    "✨ Support for all widget types (Table, Header, JSON Form, Comments, Progress bar, Notes, Activity, Attachment) " +
    "✨ Role-based access configuration ✨ Index pages for lists and Record pages for details " +
    "✨ Pre-configured widget properties and styling. Perfect for quickly setting up admin interfaces!",
  CreatePagesV1Schema.shape,
  toolHandlers["createPagesV1"]
);

/**
 * Main function to start the MCP server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("App studio MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
