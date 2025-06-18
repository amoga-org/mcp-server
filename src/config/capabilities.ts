/**
 * MCP Server capabilities configuration
 * This file defines the capabilities that the server provides
 */
import { z } from "zod";

export const SERVER_CAPABILITIES = {
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
} as const;
