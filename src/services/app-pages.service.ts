import { getCrmToken } from "./app.service.js";
import {
  GetAppPagesParams,
  GetAppPagesResponse,
  AppPage,
} from "../types/app.types.js";

/**
 * Get all pages for an app from the navbar API
 * @param params - Parameters for fetching app pages
 * @returns Promise with pages response
 */
export const getAppPages = async (
  params: GetAppPagesParams
): Promise<GetAppPagesResponse> => {
  try {
    const { token } = await getCrmToken(params.baseUrl, params.tenantName);
    if (!token) {
      throw new Error("Failed to obtain authentication token");
    }
    const response = await fetch(
      `${params.baseUrl}/api/v1/core/page/apps/navbar`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "application/json, text/plain, */*",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `API request failed with status ${response.status}: ${response.statusText}`
      );
    }

    const responseData = await response.json();
    const data: AppPage[] = responseData.data || responseData;
    // Filter by application_id if appId is provided
    let filteredPages = data;
    let filtered = false;
    if (params.appId) {
      filteredPages = data.filter(
        (page) =>
          page.application_id === params.appId || page.app_id === params.appId
      );
      filtered = true;
    }
    return {
      success: true,
      pages: filteredPages,
      total: filteredPages.length,
      filtered: filtered,
      message: params.appId
        ? `Found ${filteredPages.length} pages for app ${params.appId} (filtered from ${data.length} total)`
        : `Found ${filteredPages.length} total pages`,
    };
  } catch (error) {
    // Provide more specific error messages
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = String(error);
    }
    return {
      success: false,
      pages: [],
      total: 0,
      filtered: false,
      message: `Failed to fetch app pages: ${errorMessage}`,
    };
  }
};
