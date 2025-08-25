import { z } from "zod";

// Single automation definition schema
const AutomationDefinitionSchema = z
  .object({
    name: z.string().describe("Name of the automation"),
    trigger: z
      .string()
      .describe(
        "Trigger event type (e.g., 'event.task.created', 'schedule.every_15_minutes')"
      ),
    filter: z.string().optional().describe("Optional filter condition"),
    pseudo: z
      .string()
      .optional()
      .describe(
        "Pseudo code for the automation - preserved exactly as provided"
      ),
    description: z
      .string()
      .optional()
      .describe(
        "Natural language description of what the automation should do - AI will generate complete code from this"
      ),
  })
  .refine((data) => data.pseudo || data.description, {
    message: "Either 'pseudo' code or 'description' must be provided",
    path: ["pseudo", "description"],
  });

// Main schema for automation creation
export const CreateAutomationV1Schema = z.object({
  tenantName: z.string().describe("The tenant name"),
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  appId: z.string().describe("The application ID"),
  email: z
    .string()
    .email()
    .describe("Email address of the user creating automations"),
  automationsData: z.object({
    automations: z
      .array(AutomationDefinitionSchema)
      .describe("Array of automation definitions"),
  }),
});

export type CreateAutomationV1Params = z.infer<typeof CreateAutomationV1Schema>;
