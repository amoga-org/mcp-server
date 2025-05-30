import { AppProps, AppContract, ObjectDefinition } from "../types/app.types.js";
import { SOTData } from "../types/sot.types.js";
import axios from "axios";

const API_VERSION = "v1";

function getApiUrl(baseUrl: string, tenantName: string, path: string): string {
  return `${baseUrl}/api/${API_VERSION}/${tenantName}/${path}`;
}

export async function createApp(
  baseUrl: string,
  tenantName: string,
  appProps: AppProps
): Promise<{ appId: string; appSlug: string }> {
  try {
    const response = await axios.post(
      getApiUrl(baseUrl, tenantName, "applications"),
      appProps
    );
    return {
      appId: response.data.id,
      appSlug: response.data.slug,
    };
  } catch (error: any) {
    throw new Error(`Failed to create application: ${error.message}`);
  }
}

export async function getAllApps(
  baseUrl: string,
  tenantName: string
): Promise<any[]> {
  try {
    const response = await axios.get(
      getApiUrl(baseUrl, tenantName, "applications")
    );
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to get applications: ${error.message}`);
  }
}

export async function deleteApp(
  baseUrl: string,
  tenantName: string,
  appId: string
): Promise<void> {
  try {
    await axios.delete(getApiUrl(baseUrl, tenantName, `applications/${appId}`));
  } catch (error: any) {
    throw new Error(`Failed to delete application: ${error.message}`);
  }
}

export async function getAppContract(
  baseUrl: string,
  tenantName: string,
  appId: string
): Promise<AppContract> {
  try {
    const response = await axios.get(
      getApiUrl(baseUrl, tenantName, `applications/${appId}/contract`)
    );
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to get app contract: ${error.message}`);
  }
}

export async function updateAppContract(
  baseUrl: string,
  tenantName: string,
  appId: string,
  contract: AppContract
): Promise<void> {
  try {
    await axios.put(
      getApiUrl(baseUrl, tenantName, `applications/${appId}/contract`),
      contract
    );
  } catch (error: any) {
    throw new Error(`Failed to update app contract: ${error.message}`);
  }
}

export async function createAppContract(
  baseUrl: string,
  tenantName: string,
  objects: ObjectDefinition[],
  appSlug: string,
  appId: string,
  email: string,
  appName: string
): Promise<AppContract> {
  try {
    const contract: AppContract = {
      objects,
      id: appId,
      amo_application_id: undefined,
    };
    await updateAppContract(baseUrl, tenantName, appId, contract);
    return contract;
  } catch (error: any) {
    throw new Error(`Failed to create app contract: ${error.message}`);
  }
}

export async function createSotData(
  baseUrl: string,
  tenantName: string,
  appId: string,
  sotData: SOTData[],
  existingContract: AppContract
): Promise<AppContract> {
  try {
    // Logic to modify contract using sotData can go here
    return existingContract;
  } catch (error: any) {
    throw new Error(`Failed to create SOT data: ${error.message}`);
  }
}

export async function deleteObject(
  baseUrl: string,
  tenantName: string,
  appId: string,
  objectName: string
): Promise<void> {
  try {
    const contract = await getAppContract(baseUrl, tenantName, appId);
    contract.objects = contract.objects.filter(
      (obj) => obj.name !== objectName
    );
    await updateAppContract(baseUrl, tenantName, appId, contract);
  } catch (error: any) {
    throw new Error(`Failed to delete object: ${error.message}`);
  }
}
