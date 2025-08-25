import { z } from "zod";

// Schema for createSOTV1 - Create objects with attributes and SOT
export const CreateSOTV1Schema = z.object({
  tenantName: z.string().describe("Tenant name"),
  baseUrl: z.string().describe("Base URL"),
  email: z.string().email().describe("User email"),
  appId: z.string().describe("Application ID"),
  appSlug: z.string().describe("Application slug"),
  appName: z.string().describe("Application name"),

  // Raw YAML/JSON data that contains masters and objects
  objectsData: z.object({
    masters: z
      .array(
        z.object({
          name: z.string(),
          uid: z.string(),
          type: z.literal("master"),
          attributes: z.array(
            z.object({
              key: z.string(),
              type: z.string(),
              required: z.boolean().optional(),
              unique: z.boolean().optional(),
              index_page: z.boolean().optional(),
              record_ui_header: z.boolean().optional(),
              auditable: z.boolean().optional(),
              values: z.array(z.string()).optional(),
              related_master: z.string().optional(),
              formula: z.string().optional(),
              multiple: z.boolean().optional(),
            })
          ),
        })
      )
      .optional(),

    objects: z.array(
      z.object({
        name: z.string(),
        uid: z.string(),
        type: z.enum([
          "case",
          "task",
          "object",
          "workitem",
          "master",
          "segment",
        ]),
        interact_with_workflow: z.boolean().optional(),
        status_values: z.array(z.string()).optional(),
        priority_values: z.array(z.string()).optional(),
        attributes: z.array(
          z.object({
            key: z.string(),
            type: z.string(),
            required: z.boolean().optional(),
            unique: z.boolean().optional(),
            index_page: z.boolean().optional(),
            record_ui_header: z.boolean().optional(),
            auditable: z.boolean().optional(),
            values: z.array(z.string()).optional(),
            related_master: z.string().optional(),
            formula: z.string().optional(),
            multiple: z.boolean().optional(),
          })
        ),
        relationships: z
          .array(
            z.object({
              type: z.enum(["oneToMany", "manyToOne"]),
              related_object: z.string(),
            })
          )
          .optional(),
        sot: z
          .object({
            statuses: z.array(
              z.object({
                status: z.string(),
                origination_type: z.enum([
                  "workflow",
                  "page",
                  "automation",
                  "actions",
                ]),
                origination_name: z.string(),
                role: z.string().optional(),
                pseudo: z.string(),
              })
            ),
          })
          .optional(),
      })
    ),
  }),
});

export type CreateSOTV1Params = z.infer<typeof CreateSOTV1Schema>;
