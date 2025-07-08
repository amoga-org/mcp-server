import { getCrmToken } from "./app.service.js";
import {
  CreateJobTitleParams,
  JobTitleResponse,
  UserManagementData,
} from "../types/app.types.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Get user management data including applications, navbars, and roles
 * @param baseUrl - The base URL of the backend system
 * @param appId - Application ID
 * @param token - Authentication token
 * @returns User management data
 */
export const getUserManagementData = async (
  baseUrl: string,
  appId: string,
  token: string
): Promise<UserManagementData> => {
  try {
    const response = await fetch(
      `${baseUrl}/api/v2/work/user/management/data?application_id=${appId}`,
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
        `Failed to get user management data: ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      applications: data.data.applications || [],
      navbar: data.data.navbar || [],
      roles: data.data.roles || [],
    };
  } catch (error) {
    throw new Error(
      `Error fetching user management data: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

/**
 * Generate job title name based on role
 * @param roleName - The role name
 * @param appName - The application name
 * @returns Generated job title name
 */
const generateJobTitleName = (roleName: string, appName?: string): string => {
  const roleNameMap: Record<string, string> = {
    manager: "Manager",
    team_member: "Team Member",
    user: "User",
    employee: "Employee",
    supervisor: "Supervisor",
    lead: "Team Lead",
    analyst: "Data Analyst",
    developer: "Developer",
    designer: "Designer",
    engineer: "Engineer",
    architect: "Solution Architect",
    consultant: "Consultant",
  };

  const cleanRoleName =
    roleNameMap[roleName.toLowerCase()] ||
    roleName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return cleanRoleName;
};

/**
 * Create job title via API
 * @param params - Job title creation parameters
 * @returns Promise with creation result
 */
export const createJobTitle = async (
  params: CreateJobTitleParams
): Promise<JobTitleResponse> => {
  try {
    const { token } = await getCrmToken(params.baseUrl, params.tenantName);

    // Get user management data to extract roles, navbars, and app info
    const managementData = await getUserManagementData(
      params.baseUrl,
      params.appId,
      token
    );
    // Find the application
    const application = managementData.applications.find(
      (app) => app.value === params.appId
    );

    if (!application) {
      return {
        success: false,
        message: `Application with ID ${params.appId} not found`,
      };
    }

    const appName = application.label;

    // Filter out administrator role
    const filteredRoles = managementData.roles.filter(
      (role: any) => !role.label?.toLowerCase().includes("administrator")
    );

    if (filteredRoles.length === 0) {
      return {
        success: false,
        message: "No non-administrator roles found in the application",
      };
    }

    const createdJobTitles = [];
    let jobTitleNameIndex = 0;

    // Create job title for each role (excluding administrator)
    for (const role of filteredRoles) {
      // Extract role name from label (format: "rolename (appname)")
      const roleName = role.label.split(" (")[0];

      try {
        // Use provided job title name or generate one
        const jobTitleName = appName + " " + roleName;
        //   params.jobTitleNames && params.jobTitleNames[jobTitleNameIndex]
        //     ? params.jobTitleNames[jobTitleNameIndex]
        //     : generateJobTitleName(roleName, appName);

        // Find corresponding navbar for this role
        const navbar = managementData.navbar.find((nav: any) =>
          nav.label?.toLowerCase().includes(appName.toLowerCase())
        );

        // Prepare job title data
        const jobTitleData = {
          parentCategory: null,
          category: "jobtitleLYQ",
          data: {
            jobtitleLYQ__jobtitleNUQ: jobTitleName,
            jobtitleLYQ__isactiveVAO: true,
            // jobtitleLYQ__departmeNSR: params.department || "Engineering",
            // jobtitleLYQ__assignedEPK: params.assignedTo || appName,
            jobtitleLYQ__departmeNSR: "Engineering",
            jobtitleLYQ__assignedEPK: appName,
            jobtitleLYQ__assignedLJS: `${roleName} (${appName})`,
            jobtitleLYQ__assignedPBV:
              navbar?.value ||
              (appName + " " + roleName).toLowerCase() ||
              "default",
            jobtitleLYQ__apps: [params.appId],
            jobtitleLYQ__roles: [role.value],
          },
          parent_instance_id: "",
          workflow_instance_id: null,
          notify: true,
        };
        // Create job title via API
        const response = await fetch(
          `https://${params.tenantName}.amoga.app/api/v2/create/object/flow/e23b7e76-2b00-4323-b495-5da9eee1fec1?sync=true`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              accept: "application/json, text/plain, */*",
            },
            body: JSON.stringify(jobTitleData),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          continue;
        }

        const result = await response.json();

        createdJobTitles.push({
          role: roleName,
          jobTitleName: jobTitleName,
          roleId: role.value,
          navbarId: navbar?.value,
          jobTitleId: result.id || result.instance_id,
        });

        jobTitleNameIndex++;
      } catch (roleError) {
        continue;
      }
    }

    if (createdJobTitles.length === 0) {
      return {
        success: false,
        message: `Failed to create any job titles. Processed ${filteredRoles.length} roles but all failed. Check console logs for detailed error information.`,
      };
    }

    const rolesList = createdJobTitles.map((jt) => jt.role).join(", ");
    const successMessage = `Successfully created ${
      createdJobTitles.length
    } job titles for roles: ${rolesList} (Administrator role excluded).\n\nJob Titles Created:\n${createdJobTitles
      .map((jt) => `• ${jt.jobTitleName} (${jt.role})`)
      .join(
        "\n"
      )}\n\nEach job title is mapped to:\n• Application: ${appName}\n• Department: ${
      params.department || "Engineering"
    }\n• Assigned To: ${
      params.assignedTo || appName
    }\n• Active Status: true\n\nJob titles are automatically linked to their corresponding roles and navbars.`;

    return {
      success: true,
      message: successMessage,
      created_job_titles: createdJobTitles,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create job titles: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};
