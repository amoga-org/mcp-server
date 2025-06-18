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
} from "./types/app.types.js";

// Tool handlers
import { toolHandlers } from "./handlers/tool-handlers.js";

// Environment configuration
dotenv.config();

if (!process.env.MCP_API_KEY) {
  console.error("MCP_API_KEY environment variable is not set");
  process.exit(1);
}

// Create server instance
const server = new McpServer({
  name: "amogastudio",
  version: "1.0.0",
  capabilities: {
    resources: SERVER_CAPABILITIES.resources,
    tools: {
      "create-app": {
        description: TOOL_DESCRIPTIONS.CREATE_APP,
        parameters: CreateAppSchema,
      },
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
      "create-object": {
        description: TOOL_DESCRIPTIONS.CREATE_OBJECT,
        parameters: CreateObjectSchema,
      },
      "create-sot": {
        description: TOOL_DESCRIPTIONS.CREATE_SOT,
        parameters: CreateSotSchema,
      },
      "delete-object": {
        description: TOOL_DESCRIPTIONS.DELETE_OBJECT,
        parameters: DeleteObjectSchema,
      },
    },
  },
});

// Register tool handlers
server.tool(
  "create-app",
  TOOL_DESCRIPTIONS.CREATE_APP,
  CreateAppSchema.shape,
  toolHandlers["create-app"]
);
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
server.tool(
  "create-object",
  TOOL_DESCRIPTIONS.CREATE_OBJECT,
  CreateObjectSchema.shape,
  toolHandlers["create-object"]
);
server.tool(
  "create-sot",
  TOOL_DESCRIPTIONS.CREATE_SOT,
  CreateSotSchema.shape,
  toolHandlers["create-sot"]
);
server.tool(
  "delete-object",
  TOOL_DESCRIPTIONS.DELETE_OBJECT,
  DeleteObjectSchema.shape,
  toolHandlers["delete-object"]
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
