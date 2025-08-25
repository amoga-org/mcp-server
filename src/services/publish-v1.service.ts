/**
 * Publish V1 Service - Simple application publishing for V1 architecture
 */

import { PublishV1Params } from "../schemas/publish-v1-schema.js";
import {
  getCrmToken,
  getPublishVersion,
  getAppContract,
} from "./app.service.js";
import { updateTaskDashboardPages } from "../utils/api.js";

export async function publishV1(params: PublishV1Params): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}> {
  const { baseUrl, appId, tenantName, version } = params;

  try {
    // Get app contract to determine version if not provided - using the same function as publishApp
    const contract = await getAppContract({ baseUrl, tenantName, appId });
    const publishVersion = version || contract.version;

    // Get API version and token - using the same functions as publishApp
    const publish_version = await getPublishVersion(baseUrl, tenantName);
    const { token } = await getCrmToken(baseUrl, tenantName);

    // Determine API endpoint based on version - same logic as publishApp
    let apiEndpoint = "";
    if (publish_version === 2) {
      apiEndpoint = `${baseUrl}/api/v2/app/publish/${appId}`;
    } else {
      apiEndpoint = `${baseUrl}/api/v1/core/studio/app/publish/${appId}`;
    }

    // Make publish request - same as publishApp
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ version: publishVersion }),
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

      return {
        success: false,
        message: "Failed to publish application",
        error: errorMessage,
      };
    }

    const data = await response.json();

    // Update task dashboard pages - same as publishApp
    try {
      await updateTaskDashboardPages(
        baseUrl,
        appId,
        contract.contract_json?.objects || [],
        tenantName
      );
    } catch (error) {
      console.warn("Failed to update task dashboard pages:", error);
    }

    return {
      success: true,
      message: `✅ Application ${appId} published successfully (version: ${publishVersion})`,
      data: {
        appId,
        version: publishVersion,
        publishResponse: data,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      success: false,
      message: "Failed to publish application",
      error: errorMessage,
    };
  }
}
