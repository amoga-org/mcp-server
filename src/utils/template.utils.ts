import { PageData } from "../interfaces/api.interfaces.js";
import { createPageV1, updateMappedWidget } from "../services/api.service.js";

/**
 * Handles page template creation and widget mapping
 * @param baseUrl - Base URL for the API
 * @param token - Authentication token
 * @param pageData - Page data containing widgets and metadata
 */
export const handleUsePageTemplate = async (
  baseUrl: string,
  token: string,
  pageData: PageData
): Promise<void> => {
  try {
    const { widgets, ...metaData } = pageData;
    const createResponse = await createPageV1(baseUrl, token, metaData);
    console.log("Create page response:", createResponse);

    if (createResponse.status === 1) {
      await updateMappedWidget(baseUrl, token, createResponse.data.id, {
        page_widget: widgets,
      });
    }
  } catch (error) {
    console.error("Error in handleUsePageTemplate:", error);
    throw error;
  }
};
