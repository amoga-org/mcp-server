/**
 * App V1 Service - Simple app creation
 */

import { CreateAppV1Params } from "../schemas/app-v1-schema.js";
import { createApp } from "./app.service.js";

export async function createAppV1(params: CreateAppV1Params) {
  try {
    const result = await createApp({
      tenantName: params.tenantName,
      baseUrl: params.baseUrl,
      appName: params.appData.name,
      icon: params.appData.icon,
    });

    return {
      success: true,
      message: `App "${params.appData.name}" created successfully`,
      appId: result.appId,
      appSlug: result.appSlug,
      appName: params.appData.name,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create app: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
