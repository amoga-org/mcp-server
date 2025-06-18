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
} from "../types/app.types.js";
import { SOTData } from "../types/sot.types.js";

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
      mapped_job_titles: [],
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
    if (!existingContract?.objects) {
      throw new Error("Could not fetch app contract or no objects found");
    }

    // Find the object to delete
    const objectToDelete = existingContract.objects.find(
      (obj: ObjectDefinition) =>
        obj.name.toLowerCase() === objectName.toLowerCase()
    );

    if (!objectToDelete) {
      throw new Error(
        `Object with name "${objectName}" not found in the contract`
      );
    }

    // Remove the object and its relationships from other objects
    const updatedObjects = existingContract.objects
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
          permission: rolesPermissions(updatedObjects, "administrator", "administrator"),
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
