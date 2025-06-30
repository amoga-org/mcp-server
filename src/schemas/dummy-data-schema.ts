import { z } from "zod";
/**
 * Base schema containing common properties for all API requests
 */
const BaseSchema = z.object({
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  tenantName: z.string().describe("The tenant name"),
});
// System fields that are always present
const SystemFieldsSchema = z.object({
  name: z
    .string()
    .describe(
      "Record name - if not provided, will be generated based on object type and business context"
    ),
  status: z
    .string()
    .describe("Status value - should match contract's status amo_name or name"),
  priority: z
    .string()
    .describe(
      "Priority value -   should match contract's priority amo_name or name if not provided, will be set based on object type and context"
    ),
  dueDate: z
    .string()
    .optional()
    .describe(
      "Due date - if not provided, will be set based on priority and status"
    ),
  assignee: z.string().optional().describe("Assignee - optional field"),
});

export const DummyDataSchema = BaseSchema.extend({
  appId: z.string().describe("The application ID"),
  objectSlug: z
    .string()
    .describe("The object slug (table name) to add dummy data to"),
  count: z
    .number()
    .optional()
    .default(10)
    .describe("Number of dummy records to generate"),
  recordList: z
    .array(
      z.object({
        // System fields
        ...SystemFieldsSchema.shape,
        attributes: z
          .record(z.string(), z.any())
          .optional()
          .describe(
            "Custom attributes for the record. Keys should match contract attributes. Values will be generated based on attribute type if not provided."
          ),
      })
    )
    .describe(
      "List of records to create. If not provided, records will be generated automatically based on the app contract.\n" +
        "Process:\n" +
        "1. Fetches app contract for object schema\n" +
        "2. Uses contract's status values and amo_names\n" +
        "3. Generates contextual names based on object type\n" +
        "4. Sets priorities based on business logic\n" +
        "5. Generates due dates based on priority and status\n" +
        "6. Creates dummy values for custom attributes based on their types\n" +
        "Example:\n" +
        "{\n" +
        '  "name": "Task-2025001",\n' +
        '  "status": "in_progress",\n' +
        '  "priority": "high",\n' +
        '  "attributes": {\n' +
        '    "description": "Sample task description",\n' +
        '    "category": "development"\n' +
        "  }\n" +
        "}"
    ),
});
