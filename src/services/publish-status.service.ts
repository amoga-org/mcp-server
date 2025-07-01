import { getCrmToken } from "./app.service.js";
import { AppPublishStatus } from "../types/app.types.js";

/**
 * Check the publish status of an application
 * @param baseUrl - Base URL for the API
 * @param identifier - Application identifier
 * @param tenantName - Tenant name
 * @returns Promise with the publish status response
 */
export const checkPublishStatus = async (
  baseUrl: string,
  identifier: string,
  tenantName: string
): Promise<AppPublishStatus> => {
  try {
    const { token } = await getCrmToken(baseUrl, tenantName);

    const response = await fetch(
      `${baseUrl}/api/v1/core/studio/app/published/infra/version/${identifier}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Validate the response structure
    if (!result.data) {
      throw new Error("Invalid API response: missing data field");
    }

    if (!result.data.status) {
      throw new Error("Invalid API response: missing status field");
    }

    return result.data;
  } catch (error) {
    console.error("Error checking publish status:", error);
    throw error;
  }
};

/**
 * Get the status category for a given status value
 * @param statusValue - The status value to categorize
 * @returns Status category
 */
export const getStatusCategory = (statusValue: string): string => {
  switch (statusValue) {
    case "in_progress":
      return "in_progress";
    case "queued":
      return "queued";
    case "failure":
      return "failure";
    case "completed":
    case "success":
    case "not_started":
    case "": // Empty string is also considered completed
      return "completed";
    default:
      return "unknown";
  }
};

/**
 * Check if all components are in a completed state
 * @param status - Status object from the API response
 * @returns Boolean indicating if publishing is complete
 * Note: Empty string ("") is considered as completed status
 */
export const isPublishingComplete = (
  status: Record<string, string>
): boolean => {
  const completedStates = [
    "completed",
    "success",
    "not_started",
    "", // Empty string is also a completed state
    "failure",
  ];
  return Object.values(status).every((state) =>
    completedStates.includes(state)
  );
};

/**
 * Format status output with categorized statuses
 * @param status - Status object from the API response
 * @returns Formatted status text with categories
 */
export const formatStatusOutput = (status: Record<string, string>): string => {
  if (!status || typeof status !== "object") {
    return "❓ Invalid status data received";
  }

  const categorizedStatus = Object.entries(status).reduce(
    (acc, [component, statusValue]) => {
      const category = getStatusCategory(statusValue || "");
      if (!acc[category]) acc[category] = [];

      // Display empty string as "completed" for user clarity
      const displayValue =
        statusValue === "" ? "completed" : statusValue || "pending";
      acc[category].push(`${component}: ${displayValue}`);
      return acc;
    },
    {} as Record<string, string[]>
  );

  let output = "";

  if (categorizedStatus.completed && categorizedStatus.completed.length > 0) {
    output += `✅ Completed Components:\n${categorizedStatus.completed
      .map((s) => `  ${s}`)
      .join("\n")}\n\n`;
  }

  if (
    categorizedStatus.in_progress &&
    categorizedStatus.in_progress.length > 0
  ) {
    output += `🔄 In Progress Components:\n${categorizedStatus.in_progress
      .map((s) => `  ${s}`)
      .join("\n")}\n\n`;
  }

  if (categorizedStatus.queued && categorizedStatus.queued.length > 0) {
    output += `⏸️ Queued Components:\n${categorizedStatus.queued
      .map((s) => `  ${s}`)
      .join("\n")}\n\n`;
  }

  if (categorizedStatus.failure && categorizedStatus.failure.length > 0) {
    output += `❌ Failed Components:\n${categorizedStatus.failure
      .map((s) => `  ${s}`)
      .join("\n")}\n\n`;
  }

  if (categorizedStatus.unknown && categorizedStatus.unknown.length > 0) {
    output += `❓ Unknown Status Components:\n${categorizedStatus.unknown
      .map((s) => `  ${s}`)
      .join("\n")}\n\n`;
  }

  return output.trim() || "No status information available";
};

/**
 * Get a single status check (no polling)
 * @param baseUrl - Base URL for the API
 * @param identifier - Application identifier
 * @param tenantName - Tenant name
 * @returns Promise with current status and completion state
 */
export const getSinglePublishStatus = async (
  baseUrl: string,
  identifier: string,
  tenantName: string
): Promise<{
  status: AppPublishStatus;
  isComplete: boolean;
}> => {
  const status = await checkPublishStatus(baseUrl, identifier, tenantName);
  const isComplete = isPublishingComplete(status.status);

  return {
    status,
    isComplete,
  };
};

/**
 * Quick status check without polling - useful for testing
 * @param baseUrl - Base URL for the API
 * @param identifier - Application identifier
 * @param tenantName - Tenant name
 * @returns Promise with formatted status information
 */
export const getQuickStatusSummary = async (
  baseUrl: string,
  identifier: string,
  tenantName: string
): Promise<string> => {
  try {
    const result = await getSinglePublishStatus(
      baseUrl,
      identifier,
      tenantName
    );
    const formattedStatus = formatStatusOutput(result.status.status);

    return `📊 Quick Status Check:\n\n${formattedStatus}\n\nPublishing Complete: ${
      result.isComplete ? "✅ Yes" : "❌ No"
    }`;
  } catch (error) {
    return `❌ Error getting status: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
  }
};

/**
 * Monitor publish status with polling
 * @param baseUrl - Base URL for the API
 * @param identifier - Application identifier
 * @param tenantName - Tenant name
 * @param maxChecks - Maximum number of checks (default: 20)
 * @param intervalSeconds - Interval between checks in seconds (default: 30)
 * @returns Promise with final status and completion state
 */
export const monitorPublishStatus = async (
  baseUrl: string,
  identifier: string,
  tenantName: string,
  maxChecks: number = 20,
  intervalSeconds: number = 30
): Promise<{
  status: AppPublishStatus;
  isComplete: boolean;
  checksPerformed: number;
}> => {
  let checksPerformed = 0;
  let lastStatus: AppPublishStatus | null = null;
  let isComplete = false;

  for (let i = 0; i < maxChecks; i++) {
    try {
      checksPerformed++;
      lastStatus = await checkPublishStatus(baseUrl, identifier, tenantName);

      isComplete = isPublishingComplete(lastStatus.status);
      if (isComplete) {
        // console.log(`Publishing completed after ${checksPerformed} checks`);
        break;
      }

      // Wait for the specified interval before next check (except for the last iteration)
      if (i < maxChecks - 1) {
        // console.log(`Waiting ${intervalSeconds}s before next check...`);
        await new Promise((resolve) =>
          setTimeout(resolve, intervalSeconds * 1000)
        );
      }
    } catch (error) {
      //   console.error(`Error during check ${checksPerformed}:`, error);
      // Continue with remaining checks unless it's the last one
      if (i === maxChecks - 1) {
        throw error;
      }
    }
  }

  if (!lastStatus) {
    throw new Error("Failed to get any status response");
  }

  return {
    status: lastStatus,
    isComplete,
    checksPerformed,
  };
};
