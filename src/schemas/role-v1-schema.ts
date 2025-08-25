import { z } from "zod";

// Permission schema for individual object permissions
const PermissionSchema = z.object({
  create: z.boolean().default(false),
  read: z.boolean().default(false),
  update: z.boolean().default(false),
  delete: z.boolean().default(false),
  pick: z.boolean().default(false),
  assign: z.boolean().default(false),
  release: z.boolean().default(false),
});

// RBAC Role schema with detailed permissions per object
const RBACRoleSchema = z.object({
  name: z.string().describe("Role name (e.g., 'Admin', 'Purchaser')"),
  permissions: z
    .record(z.string(), PermissionSchema)
    .describe(
      "Object permissions mapping - key is object name/slug, value is permissions object"
    ),
});

// Enhanced schema for createRoleV1 - Supporting both simple and RBAC modes
export const CreateRoleV1Schema = z.object({
  tenantName: z.string().describe("Tenant name"),
  baseUrl: z.string().describe("Base URL"),
  email: z.string().email().describe("User email"),
  appId: z.string().describe("Application ID"),
  appSlug: z.string().describe("Application slug"),

  rolesData: z
    .object({
      // Simple mode - just role names (existing functionality)
      roles: z
        .array(
          z.object({
            name: z.string().describe("Role name"),
          })
        )
        .optional()
        .describe("Simple roles - will get full permissions on all objects"),

      // RBAC mode - detailed permissions per role and object
      rbac: z
        .array(RBACRoleSchema)
        .optional()
        .describe("RBAC roles with detailed permissions per object"),
    })
    .refine((data) => data.roles || data.rbac, {
      message:
        "Either 'roles' (simple mode) or 'rbac' (detailed mode) must be provided",
      path: ["roles", "rbac"],
    }),
});

export type CreateRoleV1Params = z.infer<typeof CreateRoleV1Schema>;
export type Permission = z.infer<typeof PermissionSchema>;
export type RBACRole = z.infer<typeof RBACRoleSchema>;
