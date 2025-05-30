import {
  APIResponse,
  CreatePageResponse,
} from "../interfaces/api.interfaces.js";
import { API_ENDPOINTS } from "../constants/api.constants.js";
import { WidgetType } from "../types/api.types.js";

/**
 * Creates a new page via API
 * @param baseUrl - Base URL for the API
 * @param token - Authentication token
 * @param data - Page data to be created
 * @returns Promise with API response
 */
export const createPageV1 = async <T>(
  baseUrl: string,
  token: string,
  data: T
): Promise<CreatePageResponse> => {
  try {
    const response = await fetch(API_ENDPOINTS.CREATE_PAGE(baseUrl), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log("Create page result:", result);
    return result;
  } catch (error) {
    console.error("Error in createPageV1:", error);
    throw error;
  }
};

/**
 * Updates widget mapping for a page
 * @param baseUrl - Base URL for the API
 * @param token - Authentication token
 * @param pageId - ID of the page to update
 * @param data - Widget data to update
 * @returns Promise with API response
 */
export const updateMappedWidget = async <T extends WidgetType>(
  baseUrl: string,
  token: string,
  pageId: string,
  data: { page_widget: T[] }
): Promise<APIResponse> => {
  try {
    // Double sanitize the data before sending
    const sanitizedData = {
      page_widget: data.page_widget,
    };

    // Additional safety check
    const safeJson = JSON.stringify(sanitizedData, (key, value) => {
      if (typeof value === "string") {
        return value.replace(/<[^>]*>/g, "").trim();
      }
      return value;
    });

    const response = await fetch(API_ENDPOINTS.UPDATE_WIDGET(baseUrl, pageId), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: safeJson,
    });

    const result = await response.json();
    console.log("Update widget result:", result);

    if (!response.ok) throw result;
    return result;
  } catch (error) {
    console.error("Error in updateMappedWidget:", error);
    throw error;
  }
};
