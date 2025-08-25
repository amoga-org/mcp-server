import { z } from "zod";

// Publish V1 Schema - Simple publish function for V1 architecture
export const PublishV1Schema = z.object({
  tenantName: z.string().describe("The tenant name"),
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  appId: z.string().describe("The application ID to publish"),
  version: z
    .string()
    .optional()
    .describe(
      "Optional version to publish (will use current version if not provided)"
    ),
});

export type PublishV1Params = z.infer<typeof PublishV1Schema>;
