/**
 * Role V1 Service - Create roles with RBAC support and smart contract mapping
 */

import {
  CreateRoleV1Params,
  Permission,
  RBACRole,
} from "../schemas/role-v1-schema.js";
import { createUpdateRoles, getAppContract } from "./app.service.js";

// Helper function to convert permission actions to boolean permissions
function parsePermissions(actions: string[]): Permission {
  const normalizedActions = actions.map((action) => action.toLowerCase());

  return {
    create: normalizedActions.includes("create"),
    read: normalizedActions.includes("read"),
    update: normalizedActions.includes("update"),
    delete: normalizedActions.includes("delete"),
    pick: normalizedActions.includes("pick"),
    assign: normalizedActions.includes("assign"),
    release: normalizedActions.includes("release"),
  };
}

// Helper function to find object in contract by name or slug
function findObjectInContract(
  objectName: string,
  contractObjects: any[]
): any | null {
  if (!contractObjects || contractObjects.length === 0) {
    return null;
  }

  const normalizedName = objectName.toLowerCase().trim();

  return contractObjects.find((obj) => {
    const objName = (obj.name || "").toLowerCase().trim();
    const objSlug = (obj.slug || "").toLowerCase().trim();

    return (
      objName === normalizedName ||
      objSlug === normalizedName ||
      objName.replace(/\s+/g, "_") === normalizedName ||
      objSlug.replace(/\s+/g, "_") === normalizedName ||
      objName.replace(/\s+/g, "") === normalizedName.replace(/\s+/g, "") ||
      // Handle common variations
      objName.replace(/[-_\s]/g, "") === normalizedName.replace(/[-_\s]/g, "")
    );
  });
}

// Helper function to create default false permissions
function createDefaultPermissions(): Permission {
  return {
    create: false,
    read: false,
    update: false,
    delete: false,
    pick: false,
    assign: false,
    release: false,
  };
}

export async function createRoleV1(params: CreateRoleV1Params) {
  try {
    console.log("Starting RBAC role creation with contract analysis...");

    // Step 1: Get app contract to see existing objects
    const appContract = await getAppContract({
      baseUrl: params.baseUrl,
      tenantName: params.tenantName,
      appId: params.appId,
    });

    const existingObjects = appContract?.objects || [];
    let processedRoles: any[] = [];
    let mode = "";

    // Step 2: Process roles based on mode (simple or RBAC)
    if (params.rolesData.rbac && params.rolesData.rbac.length > 0) {
      // RBAC Mode - Detailed permissions
      mode = "RBAC";

      processedRoles = params.rolesData.rbac.map((rbacRole: RBACRole) => {
        const roleName = rbacRole.name;
        const roleSlug = roleName.toLowerCase().replace(/\s+/g, "_");

        // Build loco_permission and permission_level for this role
        const locoPermission: Record<string, any> = {};
        const permissionLevel: Record<string, any> = {};

        // Process each permission defined in RBAC
        Object.entries(rbacRole.permissions).forEach(
          ([objectName, permissions]) => {
            // Find matching object in contract
            const matchedObject = findObjectInContract(
              objectName,
              existingObjects
            );

            if (matchedObject) {

              locoPermission[matchedObject.slug] = permissions;

              // Calculate permission level
              const permLevel = calculatePermissionLevel(permissions);
              permissionLevel[matchedObject.slug] = permLevel;
            }
          }
        );

        // Add default false permissions for contract objects not mentioned in RBAC
        existingObjects.forEach((contractObj: any) => {
          if (!locoPermission[contractObj.slug]) {

            locoPermission[contractObj.slug] = createDefaultPermissions();
            permissionLevel[contractObj.slug] = 10; // No access
          }
        });

        return {
          name: roleName,
          display_name: roleName,
          loco_role: roleSlug,
          loco_permission: locoPermission,
          permission_level: permissionLevel,
        };
      });
    } else if (params.rolesData.roles && params.rolesData.roles.length > 0) {
      // Simple Mode - Full permissions (backward compatibility)
      mode = "Simple";


      processedRoles = params.rolesData.roles.map((role) => ({
        name: role.name,
        display_name: role.name,
        loco_role: role.name.toLowerCase().replace(/\s+/g, "_"),
      }));
    } else {
      throw new Error("No roles provided in either 'roles' or 'rbac' format");
    }



    await createUpdateRoles({
      tenantName: params.tenantName,
      baseUrl: params.baseUrl,
      appId: params.appId,
      roles: processedRoles,
    });

    // Step 4: Generate summary
    const rbacSummary =
      mode === "RBAC"
        ? generateRBACMappingSummary(params.rolesData.rbac!, existingObjects)
        : null;

    return {
      success: true,
      message: `Created ${processedRoles.length} roles in ${mode} mode and mapped to ${existingObjects.length} objects`,
      rolesCreated: processedRoles.length,
      objectsMapped: existingObjects.length,
      roles: processedRoles.map((r) => r.name),
      objects: existingObjects.map((obj: any) => obj.name || obj.slug),
      mode: mode,
      rbacSummary: rbacSummary,
    };
  } catch (error) {
  
    return {
      success: false,
      message: `Failed to create roles: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Helper function to calculate permission level from boolean permissions
function calculatePermissionLevel(permissions: Permission): number {
  const {
    pick,
    read,
    assign,
    create,
    delete: del,
    update,
    release,
  } = permissions;

  // No access - all permissions false
  if (!pick && !read && !assign && !create && !del && !update && !release) {
    return 10;
  }

  // Read only - only read is true
  if (!pick && read && !assign && !create && !del && !update && !release) {
    return 20;
  }

  // Write - create, read, update but not delete
  if (pick && read && assign && create && !del && update && release) {
    return 30;
  }

  // Full access - all permissions true
  if (pick && read && assign && create && del && update && release) {
    return 40;
  }

  // Custom - any other combination
  return 50;
}

// Helper function to generate RBAC mapping summary
function generateRBACMappingSummary(
  rbacRoles: RBACRole[],
  contractObjects: any[]
) {
  const summary = {
    totalRoles: rbacRoles.length,
    totalContractObjects: contractObjects.length,
    mappedObjects: new Set<string>(),
    unmappedObjects: new Set<string>(),
    rolesBreakdown: {} as Record<string, any>,
  };

  // Track which objects were mapped
  rbacRoles.forEach((role) => {
    let mappedCount = 0;
    let unmappedCount = 0;

    Object.keys(role.permissions).forEach((objectName) => {
      const found = findObjectInContract(objectName, contractObjects);
      if (found) {
        summary.mappedObjects.add(found.slug);
        mappedCount++;
      } else {
        unmappedCount++;
      }
    });

    summary.rolesBreakdown[role.name] = {
      definedPermissions: Object.keys(role.permissions).length,
      mappedToContract: mappedCount,
      notFoundInContract: unmappedCount,
    };
  });

  // Find objects in contract that weren't mentioned in RBAC
  contractObjects.forEach((obj) => {
    if (!summary.mappedObjects.has(obj.slug)) {
      summary.unmappedObjects.add(obj.slug);
    }
  });

  return {
    ...summary,
    mappedObjects: Array.from(summary.mappedObjects),
    unmappedObjects: Array.from(summary.unmappedObjects),
  };
}
