export const API_ENDPOINTS = {
  CREATE_PAGE: (baseUrl: string) => `${baseUrl}/api/v1/core/page`,
  UPDATE_WIDGET: (baseUrl: string, pageId: string) =>
    `${baseUrl}/api/v1/core/page/${pageId}/widget`,
} as const;
