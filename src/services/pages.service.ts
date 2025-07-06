import { getCrmToken } from "./app.service.js";
import {
  GetAppPagesParams,
  GetAppPagesResponse,
  AppPage,
} from "../types/app.types.js";

/**
 * Get all pages for applications with optional filtering by app ID
 * @param params - Parameters including baseUrl, tenantName, and optional appId
 * @returns Promise with pages data
 */
export const getAppPages = async (
  params: GetAppPagesParams
): Promise<GetAppPagesResponse> => {
  try {
    const { token } = await getCrmToken(params.baseUrl, params.tenantName);

    // Fetch all pages from the core page API
    const pagesResponse = await fetch(
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

    if (!pagesResponse.ok) {
      throw new Error(
        `Failed to fetch pages: ${pagesResponse.status} - ${pagesResponse.statusText}`
      );
    }

    const pagesData = await pagesResponse.json();
    let allPages: AppPage[] = [];

    // Handle different response structures
    if (Array.isArray(pagesData)) {
      allPages = pagesData;
    } else if (pagesData.data && Array.isArray(pagesData.data)) {
      allPages = pagesData.data;
    } else if (pagesData.pages && Array.isArray(pagesData.pages)) {
      allPages = pagesData.pages;
    } else {
      allPages = [];
    }

    // Filter by application_id if appId is provided
    let filteredPages = allPages;
    let isFiltered = false;

    if (params.appId) {
      filteredPages = allPages.filter(
        (page: any) => page.application_id === params.appId
      );
      isFiltered = true;
    }

    // Transform pages to ensure consistent structure
    const transformedPages: AppPage[] = filteredPages.map((page: any) => ({
      id: page.id,
      tenant_id: page.tenant_id,
      user_id: page.user_id,
      application_id: page.application_id,
      page_id: page.page_id,
      custom_field1: page.custom_field1,
      custom_field2: page.custom_field2,
      created_at: page.created_at,
      updated_at: page.updated_at,
      name: page.name,
      display_name: page.display_name,
      type: page.type,
      is_default: page.is_default,
      mode: page.mode,
      workitem_type: page.workitem_type,
      workitem: page.workitem,
      workitem_name: page.workitem_name,
      workitem_slug: page.workitem_slug,
      application_name: page.application_name,
      app_id: page.app_id,
    }));

    const message = isFiltered
      ? `Found ${transformedPages.length} pages for application ${params.appId} (filtered from ${allPages.length} total pages)`
      : `Found ${transformedPages.length} pages across all applications`;

    return {
      success: true,
      pages: transformedPages,
      total: transformedPages.length,
      filtered: isFiltered,
      message,
    };
  } catch (error) {
    return {
      success: false,
      pages: [],
      total: 0,
      filtered: false,
      message: `Failed to fetch pages: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};
