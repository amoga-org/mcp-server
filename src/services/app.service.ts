import {
  AppProps,
  ObjectDefinition,
  CreateAppParams,
  GetAppsParams,
  DeleteAppParams,
  GetAppContractParams,
  DeleteObjectParams,
  CreateObjectParams,
  CreateSotParams,
  CreateUpdateRolesParams,
  Permission,
  PublishAppParams,
} from "../types/app.types.js";
import {
  createDefaultTaskPages,
  updateTaskDashboardPages,
} from "../utils/api.js";

// Helper function to get CRM token
export async function getCrmToken(
  baseUrl: string,
  tenantName: string
): Promise<{ token: string; coreApp: any }> {
  const apikey = process.env.MCP_API_KEY;
  if (!apikey) {
    throw new Error("API Key is required in configuration");
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/v1/core/studio/get/tenant/coreapp?name=${tenantName}`,
      {
        headers: {
          "API-KEY": apikey,
          "content-type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.data?.token) {
      throw new Error("Token not found in response");
    }

    return { coreApp: data.data.core_app, token: data.data.token };
  } catch (error: any) {
    throw new Error(`Failed to get CRM token: ${error.message}`);
  }
}

// Helper function to generate slug from app name
function generateSlug(name: string): string {
  return name.replace(/[^a-zA-Z]/g, "");
}

// Helper function to create app payload
function createAppPayload(appName: string): AppProps {
  return {
    application_name: appName,
    application_props: {},
    application_version: "2.0.0",
    color: "green",
    contract_version: "1.0",
    created_by: "",
    description: "",
    endpoint_setting: {},
    icon: {
      type: "material-icons-outlined",
      name: "apps",
      color: "#5f6368",
      svg: "memo",
      style: "solid",
      version: 1,
    },
    slug: generateSlug(appName),
    state: "active",
    create_pages: true,
    cover_image: "",
  };
}

export async function createApp(
  params: CreateAppParams
): Promise<{ appId: string; appSlug: string }> {
  const { tenantName, baseUrl, appName, amo_application_id } = params;

  try {
    const { token } = await getCrmToken(baseUrl, tenantName);
    const payload = createAppPayload(appName);

    const createAppResponse = await fetch(
      `${baseUrl}/api/v1/core/studio/create/loco/application`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const appData = await createAppResponse.json();
    const appId = appData.data.uuid;
    const appSlug = appData.data.slug;
    await createDefaultTaskPages(baseUrl, token, appData.data.uuid);
    return { appId, appSlug };
  } catch (error: any) {
    throw new Error(`Failed to create application: ${error.message}`);
  }
}

export async function getAllApps(params: GetAppsParams): Promise<any[]> {
  const { baseUrl, tenantName } = params;

  try {
    const { token } = await getCrmToken(baseUrl, tenantName);
    const response = await fetch(`${baseUrl}/api/v1/core/studio/apps`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch apps: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error: any) {
    throw new Error(`Failed to get applications: ${error.message}`);
  }
}

export async function deleteApp(params: DeleteAppParams): Promise<void> {
  const { tenantName, baseUrl, appId } = params;

  try {
    const { token } = await getCrmToken(baseUrl, tenantName);
    const response = await fetch(
      `${baseUrl}/api/v1/work/loco/application/delete?app_id=${appId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete app: ${response.statusText}`);
    }
  } catch (error: any) {
    throw new Error(`Failed to delete application: ${error.message}`);
  }
}

export async function getAppContract(
  params: GetAppContractParams
): Promise<any> {
  const { baseUrl, tenantName, appId } = params;

  try {
    const { token } = await getCrmToken(baseUrl, tenantName);
    const response = await fetch(
      `${baseUrl}/api/v1/core/studio/contract/view/${appId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch app contract: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    throw new Error(`Failed to get app contract: ${error.message}`);
  }
}

// Additional functions for complex operations - using the actual API endpoints

export async function createAppContract(
  baseUrl: string,
  tenantName: string,
  objects: ObjectDefinition[],
  appSlug: string,
  appId: string,
  email: string,
  appName: string
): Promise<any> {
  try {
    // This should call the actual createAppContract from utils/api.js logic
    // For now, we'll import and use the existing working implementation
    const { createAppContract: utilsCreateAppContract } = await import(
      "../utils/api.js"
    );
    return await utilsCreateAppContract(
      baseUrl,
      tenantName,
      objects,
      appSlug,
      appId,
      email,
      appName
    );
  } catch (error: any) {
    throw new Error(`Failed to create app contract: ${error.message}`);
  }
}

export async function createSotData(
  baseUrl: string,
  tenantName: string,
  appId: string,
  sotData: any[],
  existingContract: any
): Promise<any> {
  try {
    // This should call the actual createSotData from utils/api.js logic
    const { createSotData: utilsCreateSotData } = await import(
      "../utils/api.js"
    );
    return await utilsCreateSotData(
      baseUrl,
      tenantName,
      appId,
      sotData,
      existingContract
    );
  } catch (error: any) {
    throw new Error(`Failed to create SOT data: ${error.message}`);
  }
}
// Helper function to calculate permission level based on loco_permission
function calculatePermissionLevel(locoPermission: Permission): number {
  // No access - all permissions false
  if (
    !locoPermission.pick &&
    !locoPermission.read &&
    !locoPermission.assign &&
    !locoPermission.create &&
    !locoPermission.delete &&
    !locoPermission.update &&
    !locoPermission.release
  ) {
    return 10; // No access
  }

  // Read only - only read is true
  if (
    !locoPermission.pick &&
    locoPermission.read &&
    !locoPermission.assign &&
    !locoPermission.create &&
    !locoPermission.delete &&
    !locoPermission.update &&
    !locoPermission.release
  ) {
    return 20; // Read only
  }

  // Write - create, read, update but not delete
  if (
    locoPermission.pick &&
    locoPermission.read &&
    locoPermission.assign &&
    locoPermission.create &&
    !locoPermission.delete &&
    locoPermission.update &&
    locoPermission.release
  ) {
    return 30; // Write
  }

  // Full access - all permissions true
  if (
    locoPermission.pick &&
    locoPermission.read &&
    locoPermission.assign &&
    locoPermission.create &&
    locoPermission.delete &&
    locoPermission.update &&
    locoPermission.release
  ) {
    return 40; // Full access
  }

  // Custom - any other combination
  return 50; // Custom
}

// Helper function for roles permissions
function rolesPermissions(objects: any[], roleName: string, slug: string) {
  const defaultPermission = {
    create: true,
    read: true,
    update: true,
    delete: true,
    pick: true,
    assign: true,
    release: true,
  };

  const loco_permission = Object.assign(
    {},
    ...objects.map((item) => {
      return { [item.slug]: defaultPermission };
    })
  );

  const permission_level = Object.assign(
    {},
    ...objects.map((item) => {
      return { [item.slug]: 40 };
    })
  );

  return {
    [slug]: {
      loco_role: slug,
      display_name: roleName,
      loco_permission: loco_permission,
      permission_level: permission_level,
    },
  };
}

export async function deleteObject(params: DeleteObjectParams): Promise<void> {
  const { baseUrl, tenantName, appId, objectName } = params;
  try {
    const { token } = await getCrmToken(baseUrl, tenantName);

    // Get existing contract
    const existingContract = await getAppContract({
      baseUrl,
      tenantName,
      appId,
    });
    if (!existingContract?.contract_json.objects) {
      throw new Error("Could not fetch app contract or no objects found");
    }

    // Find the object to delete
    const objectToDelete = existingContract?.contract_json?.objects.find(
      (obj: ObjectDefinition) =>
        obj.name.toLowerCase() === objectName.toLowerCase()
    );

    if (!objectToDelete) {
      throw new Error(
        `Object with name "${objectName}" not found in the contract`
      );
    }

    // Remove the object and its relationships from other objects
    const updatedObjects = existingContract.contract_json.objects
      .filter(
        (obj: ObjectDefinition) =>
          obj.name.toLowerCase() !== objectName.toLowerCase()
      )
      .map((obj: ObjectDefinition) => {
        // Remove relationships that reference the deleted object
        if (obj.relationship) {
          obj.relationship = obj.relationship.filter(
            (rel: any) => rel.destination_object_slug !== objectToDelete.slug
          );
        }
        return obj;
      });

    // Remove forms related to the deleted object
    const updatedForms = (existingContract.forms || []).filter(
      (form: any) => form.slug !== objectToDelete.slug
    );

    // Update the contract
    const response = await fetch(
      `${baseUrl}/api/v1/core/studio/contract/app_meta/${appId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          contract_json: {
            ...existingContract,
            objects: updatedObjects,
          },
          forms: updatedForms,
          actions: existingContract.actions || [],
          //   permission: rolesPermissions(
          //     updatedObjects,
          //     "administrator",
          //     "administrator"
          //   ),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete object: ${response.statusText}`);
    }

    await response.json();
  } catch (error: any) {
    throw new Error(`Failed to delete object: ${error.message}`);
  }
}

export async function createObject(params: CreateObjectParams): Promise<any> {
  const { tenantName, baseUrl, appId, appSlug, email, appName, objects } =
    params;

  try {
    return await createAppContract(
      baseUrl,
      tenantName,
      objects,
      appSlug,
      appId,
      email,
      appName
    );
  } catch (error: any) {
    throw new Error(`Failed to create objects: ${error.message}`);
  }
}

export async function createSot(params: CreateSotParams): Promise<any> {
  const { baseUrl, appId, tenantName, sotData } = params;

  try {
    // First get the app contract to validate against
    const contractJson = await getAppContract({ baseUrl, tenantName, appId });
    if (!contractJson) {
      throw new Error("Could not fetch app contract");
    }

    // Call createSotData to update the contract with new SOTs while preserving existing ones
    return await createSotData(
      baseUrl,
      tenantName,
      appId,
      sotData,
      contractJson
    );
  } catch (error: any) {
    throw new Error(`Failed to create SOT: ${error.message}`);
  }
}

export async function createUpdateRoles(
  params: CreateUpdateRolesParams
): Promise<any> {
  const { baseUrl, tenantName, appId, roles } = params;
  try {
    const { token } = await getCrmToken(baseUrl, tenantName);
    // Get existing app contract to know what objects exist and current permissions
    const contract = await getAppContract({ baseUrl, tenantName, appId });
    // Get existing permissions from contract (preserve existing roles)
    const existingPermissions = contract?.permission || {};
    // Get existing object slugs
    const objectSlugs = (contract?.contract_json?.objects || []).map(
      (obj: ObjectDefinition) => obj.slug
    );

    // Default permission set
    const defaultPermission: Permission = {
      pick: true,
      read: true,
      assign: true,
      create: true,
      delete: true,
      update: true,
      release: true,
    };

    // Start with all existing permissions
    const finalPermissions: Record<string, any> = {};

    // Case 3: Update existing roles - ensure all objects have permissions
    Object.keys(existingPermissions).forEach((roleKey) => {
      const existingRole = existingPermissions[roleKey];
      const newRole: any = {
        loco_role: existingRole.loco_role || roleKey,
        display_name: existingRole.display_name || roleKey,
        mapped_job_titles: [],
        loco_permission: { ...(existingRole.loco_permission || {}) },
        permission_level: { ...(existingRole.permission_level || {}) },
      };

      // If objects exist, clean up and ensure permissions match actual objects
      if (objectSlugs.length > 0) {
        // Clean up permissions - only keep permissions for objects that exist
        const cleanedLocoPermission: Record<string, any> = {};
        const cleanedPermissionLevel: Record<string, any> = {};

        // Get object mapping for name/slug matching
        const objectMap = new Map();
        (contract?.contract_json?.objects || []).forEach(
          (obj: ObjectDefinition) => {
            objectMap.set(obj.slug, obj);
            objectMap.set(obj.name.toLowerCase(), obj);
          }
        );

        // Process existing permissions and match with actual objects
        Object.keys(newRole.loco_permission).forEach((key) => {
          const matchedObj =
            objectMap.get(key) || objectMap.get(key.toLowerCase());
          if (matchedObj) {
            cleanedLocoPermission[matchedObj.slug] =
              newRole.loco_permission[key];
          }
        });

        Object.keys(newRole.permission_level).forEach((key) => {
          const matchedObj =
            objectMap.get(key) || objectMap.get(key.toLowerCase());
          if (matchedObj) {
            cleanedPermissionLevel[matchedObj.slug] =
              newRole.permission_level[key];
          }
        });

        // Add missing permissions for all existing objects and calculate permission levels
        objectSlugs.forEach((slug: string) => {
          if (!cleanedLocoPermission[slug]) {
            cleanedLocoPermission[slug] = { ...defaultPermission };
          }
          // Calculate permission level based on loco_permission if not explicitly provided
          if (!cleanedPermissionLevel[slug]) {
            cleanedPermissionLevel[slug] = calculatePermissionLevel(
              cleanedLocoPermission[slug]
            );
          }
        });

        newRole.loco_permission = cleanedLocoPermission;
        newRole.permission_level = cleanedPermissionLevel;
      }
      finalPermissions[roleKey] = newRole;
    });

    // Process new roles from the request
    roles.forEach((role) => {
      // Skip administrator role - it's already created during app creation
      if (role.loco_role === "administrator") {
        if (finalPermissions["administrator"]) {
          const adminRole = finalPermissions["administrator"];
          // Merge any provided permissions with existing ones
          if (role.loco_permission) {
            adminRole.loco_permission = {
              ...(adminRole.loco_permission || {}),
              ...role.loco_permission,
            };
          }
          if (role.permission_level) {
            adminRole.permission_level = {
              ...(adminRole.permission_level || {}),
              ...role.permission_level,
            };
          }
        }
        return;
      }

      const existingRole = finalPermissions[role.loco_role];
      // Base role structure - always include loco_permission and permission_level
      const newRole: any = {
        loco_role: role.loco_role,
        display_name: role.display_name,
        mapped_job_titles: [],
        loco_permission: {},
        permission_level: {},
      };

      // Case 1: If no objects exist, keep permissions empty
      if (objectSlugs.length === 0) {
        // Keep loco_permission and permission_level as empty objects
        newRole.loco_permission = {};
        newRole.permission_level = {};
      } else {
        // Case 2: Objects exist - merge existing permissions with new ones
        // Start with existing permissions if role exists
        if (existingRole) {
          newRole.loco_permission = { ...(existingRole.loco_permission || {}) };
          newRole.permission_level = {
            ...(existingRole.permission_level || {}),
          };
        }

        // Merge any provided permissions
        if (role.loco_permission) {
          newRole.loco_permission = {
            ...newRole.loco_permission,
            ...role.loco_permission,
          };
        }
        if (role.permission_level) {
          newRole.permission_level = {
            ...newRole.permission_level,
            ...role.permission_level,
          };
        }

        // Clean up permissions - only keep permissions for objects that exist
        const cleanedLocoPermission: Record<string, any> = {};
        const cleanedPermissionLevel: Record<string, any> = {};

        // Get object mapping for name/slug matching
        const objectMap = new Map();
        (contract?.contract_json?.objects || []).forEach(
          (obj: ObjectDefinition) => {
            objectMap.set(obj.slug, obj);
            objectMap.set(obj.name.toLowerCase(), obj);
          }
        );

        // Process provided permissions and match with actual objects
        if (role.loco_permission) {
          Object.keys(role.loco_permission).forEach((key) => {
            const matchedObj =
              objectMap.get(key) || objectMap.get(key.toLowerCase());
            if (matchedObj) {
              cleanedLocoPermission[matchedObj.slug] =
                role.loco_permission![key];
              // Auto-calculate permission level based on loco_permission
              cleanedPermissionLevel[matchedObj.slug] =
                calculatePermissionLevel(role.loco_permission![key]);
            }
          });
        }

        // Override with explicitly provided permission levels if any
        if (role.permission_level) {
          Object.keys(role.permission_level).forEach((key) => {
            const matchedObj =
              objectMap.get(key) || objectMap.get(key.toLowerCase());
            if (matchedObj) {
              cleanedPermissionLevel[matchedObj.slug] =
                role.permission_level![key];
            }
          });
        }

        // Merge with existing permissions if role exists
        if (existingRole) {
          Object.keys(existingRole.loco_permission || {}).forEach((key) => {
            const matchedObj =
              objectMap.get(key) || objectMap.get(key.toLowerCase());
            if (matchedObj && !cleanedLocoPermission[matchedObj.slug]) {
              cleanedLocoPermission[matchedObj.slug] =
                existingRole.loco_permission[key];
            }
          });

          Object.keys(existingRole.permission_level || {}).forEach((key) => {
            const matchedObj =
              objectMap.get(key) || objectMap.get(key.toLowerCase());
            if (matchedObj && !cleanedPermissionLevel[matchedObj.slug]) {
              cleanedPermissionLevel[matchedObj.slug] =
                existingRole.permission_level[key];
            }
          });
        }

        // Add missing permissions for all existing objects (add defaults where missing)
        objectSlugs.forEach((slug: string) => {
          if (!cleanedLocoPermission[slug]) {
            cleanedLocoPermission[slug] = { ...defaultPermission };
          }
          // Calculate permission level based on loco_permission if not set
          if (!cleanedPermissionLevel[slug]) {
            cleanedPermissionLevel[slug] = calculatePermissionLevel(
              cleanedLocoPermission[slug]
            );
          }
        });

        newRole.loco_permission = cleanedLocoPermission;
        newRole.permission_level = cleanedPermissionLevel;
      }

      finalPermissions[role.loco_role] = newRole;
    });

    // Validate role uniqueness
    const roleNames = Object.keys(finalPermissions);
    const uniqueRoleNames = new Set(roleNames);
    if (roleNames.length !== uniqueRoleNames.size) {
      throw new Error(
        "Duplicate loco_role found. Each role must have a unique loco_role identifier."
      );
    }

    // Update the contract with the final roles
    const response = await fetch(
      `${baseUrl}/api/v1/core/studio/contract/roles/${appId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          permission: finalPermissions,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update roles: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      roles: Object.values(finalPermissions),
      totalRoles: Object.keys(finalPermissions).length,
      objectsCount: objectSlugs.length,
      message: `Successfully created/updated ${
        Object.keys(finalPermissions).length
      } role(s) with permissions for ${objectSlugs.length} object(s)`,
      data: data.data,
    };
  } catch (error: any) {
    throw new Error(`Failed to create/update roles: ${error.message}`);
  }
}

export async function publishApp(params: PublishAppParams): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  const { baseUrl, appId, tenantName } = params;
  const contract = await getAppContract({ baseUrl, tenantName, appId });

  const { token } = await getCrmToken(baseUrl, tenantName);
  let apiEndpoint = "/api/v1/core/studio/app/publish/";
  if (tenantName == "qa") {
    apiEndpoint = "/api/v2/app/publish/";
  }
  try {
    const response = await fetch(`${baseUrl}${apiEndpoint}${appId}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ version: contract.version }),
    });
    if (!response.ok) {
      let errorMessage = `Failed to publish application: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData?.message) {
          errorMessage += ` - ${errorData.message}`;
        }
      } catch (parseError) {
        // If we can't parse the error response, just use the basic error message
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    try {
      await updateTaskDashboardPages(
        baseUrl,
        appId,
        contract.objects || [],
        tenantName
      );
    } catch (error) {}

    return {
      success: true,
      message: `Application ${appId} published successfully. Task dashboard pages updated with all object information.`,
      data,
    };
  } catch (error: any) {
    if (error.message?.includes("Failed to publish application:")) {
      // Re-throw our custom error messages
      throw error;
    }

    // Handle other types of errors (network errors, etc.)
    throw new Error(`Failed to publish application: ${error.message || error}`);
  }
}
