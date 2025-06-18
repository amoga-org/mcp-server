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
} from "../types/app.types.js";

// Helper function to get CRM token
async function getCrmToken(
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

    // First, copy all existing roles
    Object.keys(existingPermissions).forEach((roleKey) => {
      const existingRole = existingPermissions[roleKey];
      finalPermissions[roleKey] = {
        loco_role: existingRole.loco_role || roleKey,
        display_name: existingRole.display_name || roleKey,
        loco_permission: { ...(existingRole.loco_permission || {}) },
        permission_level: { ...(existingRole.permission_level || {}) },
        mapped_job_titles: [],
      };
    });

    // Then, add or update with new roles
    roles.forEach((role) => {
      const existingRole = finalPermissions[role.loco_role];

      finalPermissions[role.loco_role] = {
        loco_role: role.loco_role,
        display_name: role.display_name,
        loco_permission: {
          ...(existingRole?.loco_permission || {}),
          ...(role.loco_permission || {}),
        },
        permission_level: {
          ...(existingRole?.permission_level || {}),
          ...(role.permission_level || {}),
        },
        mapped_job_titles: [],
      };
    });

    // Now ensure ALL roles have permissions for ALL objects
    if (objectSlugs.length > 0) {
      Object.keys(finalPermissions).forEach((roleKey) => {
        const role = finalPermissions[roleKey];

        // Initialize permission objects if they don't exist
        if (!role.loco_permission) {
          role.loco_permission = {};
        }
        if (!role.permission_level) {
          role.permission_level = {};
        }

        // Ensure every object slug has permissions in this role
        objectSlugs.forEach((slug: string) => {
          if (!role.loco_permission[slug]) {
            role.loco_permission[slug] = { ...defaultPermission };
          }
          if (!role.permission_level[slug]) {
            role.permission_level[slug] = 40;
          }
        });
      });
    }

    // If no objects exist and no existing roles, create default roles
    if (
      objectSlugs.length === 0 &&
      Object.keys(finalPermissions).length === 0 &&
      roles.length === 0
    ) {
      const defaultRoles = [
        {
          loco_role: "administrator",
          display_name: "Administrator",
          loco_permission: {},
          permission_level: {},
        },
      ];

      defaultRoles.forEach((role) => {
        finalPermissions[role.loco_role] = role;
      });
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
