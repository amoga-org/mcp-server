import { z } from "zod";

// Schema for createAppV1 - Just create app, no processing
export const CreateAppV1Schema = z.object({
  tenantName: z.string().describe("Tenant name"),
  baseUrl: z.string().describe("Base URL"),
  email: z.string().email().describe("User email"),
  appData: z.object({
    name: z.string().describe("Application name"),
    slug: z.string().optional().describe("Application slug"),
    icon: z
      .object({
        svg: z.string(),
        color: z.string(),
        style: z.string(),
      })
      .optional(),
  }),
});

export type CreateAppV1Params = z.infer<typeof CreateAppV1Schema>;
