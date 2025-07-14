import { getCrmToken, getAllApps } from "./app.service.js";
import {
  CreateUserParams,
  UserResponse,
  MasterData,
  UserManagementData,
} from "../types/app.types.js";
import { getUserManagementData } from "./job-title.service.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Get master data for job titles, departments, and assignments
 * @param baseUrl - The base URL of the backend system
 * @param appId - Application ID
 * @param token - Authentication token
 * @param jobTitle - Optional job title to filter master data
 * @returns Master data for job titles and related fields
 */
export const getMasterData = async (
  baseUrl: string,
  coreAppId: string,
  token: string,
  jobTitle?: string
): Promise<MasterData> => {
  try {
    // Encode the job title for URL parameter
    const encodedJobTitle = jobTitle ? encodeURIComponent(jobTitle) : "";

    const response = await fetch(
      `${baseUrl}/api/v2/work/get/all/master/data/${coreAppId}?jobtitleNUQ=${encodedJobTitle}&departmeNSR=&assignedEPK=&assignedLJS=&assignedPBV=`,
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
      throw new Error(`Failed to get master data: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      jobtitleNUQ: data.data?.jobtitleNUQ || [],
      departmeNSR: data.data?.departmeNSR || [],
      assignedEPK: data.data?.assignedEPK || [],
      assignedLJS: data.data?.assignedLJS || [],
      assignedPBV: data.data?.assignedPBV || [],
    };
  } catch (error) {
    throw new Error(
      `Error fetching master data: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

/**
 * Generate user name based on role
 * @param roleName - The role name
 * @returns Generated user name
 */
const generateUserName = (roleName: string): string => {
  const cleanRoleName = roleName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return cleanRoleName;
};

/**
 * Generate email based on app slug and role name
 * @param appSlug - Application slug
 * @param roleName - Role name
 * @returns Generated email
 */
const generateEmail = (appSlug: string, roleName: string): string => {
  const cleanRoleName = roleName.toLowerCase().replace(/\s+/g, "");
  const cleanAppSlug = appSlug.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
  return `${cleanAppSlug}.${cleanRoleName}@amoga.dev`;
};

/**
 * Check if user already exists by email
 * @param baseUrl - The base URL of the backend system
 * @param tenantName - Tenant name
 * @param email - User email to check
 * @param token - Authentication token
 * @returns Promise<boolean> - true if user exists, false otherwise
 */
export const checkUserExists = async (
  baseUrl: string,
  tenantName: string,
  email: string,
  token: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://${tenantName}.amoga.app/api/v2/object/usersmjjs/find`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "application/json, text/plain, */*",
        },
        body: JSON.stringify({
          select: {
            name: true,
            emailid_cub: true,
            id: true,
          },
          where: {
            AND: [
              {
                emailid_cub: email,
              },
            ],
          },
          orderBy: [
            {
              id: "desc",
            },
          ],
          skip: 0,
          take: 10,
        }),
      }
    );

    if (!response.ok) {
      console.warn(`Failed to check user existence: ${response.statusText}`);
      return false; // Assume user doesn't exist if check fails
    }

    const result = await response.json();
    return result.data && result.data.length > 0;
  } catch (error) {
    console.warn(`Error checking user existence: ${error}`);
    return false; // Assume user doesn't exist if check fails
  }
};

/**
 * Create users via API
 * @param params - User creation parameters
 * @returns Promise with creation result
 */
export const createUser = async (
  params: CreateUserParams
): Promise<UserResponse> => {
  try {
    const { token } = await getCrmToken(params.baseUrl, params.tenantName);

    // Get all apps to find the core application
    const allApps = await getAllApps({
      baseUrl: params.baseUrl,
      tenantName: params.tenantName,
    });

    // Find the core application with slug 'coreapplGAT'
    const coreApp = allApps.find((app: any) => app.slug === "coreapplGAT");

    if (!coreApp) {
      return {
        success: false,
        message: "Core application with slug 'coreapplGAT' not found",
      };
    }

    const coreAppId = coreApp.uuid;

    // Get user management data to extract roles and app info
    const managementData = await getUserManagementData(
      params.baseUrl,
      params.appId,
      token
    );

    // console.log(
    //   "Management data received:",
    //   JSON.stringify(managementData, null, 2)
    // );

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
    const appSlug = appName.toLowerCase().replace(/\s+/g, "_");

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

    const createdUsers = [];
    const skippedUsers = [];
    let userNameIndex = 0;

    // Create user for each role (excluding administrator)
    for (const role of filteredRoles) {
      // Extract role name from label (format: "rolename (appname)")
      const roleName = role.label.split(" (")[0];

      try {
        // Get master data for this specific role name as job title
        const masterData = await getMasterData(
          params.baseUrl,
          coreAppId,
          token,
          ""
        );

        // console.log("Master data received:", JSON.stringify(masterData, null, 2));
        // Use provided user name or generate one
        const userName = appName + " " + roleName;
        //   params.userNames && params.userNames[userNameIndex]
        //     ? params.userNames[userNameIndex]
        //     : generateUserName(roleName);

        // Generate email
        const userEmail = generateEmail(appSlug, roleName);

        // Check if user already exists
        const userExists = await checkUserExists(
          params.baseUrl,
          params.tenantName,
          userEmail,
          token
        );

        if (userExists) {
          skippedUsers.push({
            role: roleName,
            userName: userName,
            email: userEmail,
            reason: "User with this email already exists",
          });
          userNameIndex++;
          continue;
        }

        // Use provided password or default to email
        const userPassword =
          params.passwords && params.passwords[userNameIndex]
            ? params.passwords[userNameIndex]
            : userEmail;

        // Use provided phone number
        // const phoneNumber =
        //   params.phoneNumbers && params.phoneNumbers[userNameIndex]
        //     ? params.phoneNumbers[userNameIndex]
        //     : "";
        const phoneNumber = "";
        let jobTitleName = appName + " " + roleName;
        // Find matching job title from master data
        const jobTitle = masterData.jobtitleNUQ.find((jt) =>
          jt.value.toLowerCase().includes(jobTitleName.toLowerCase())
        );

        const masterData_ = await getMasterData(
          params.baseUrl,
          coreAppId,
          token,
          jobTitle?.value
        );

        // Find matching department
        const department = masterData_.departmeNSR.find((dept) =>
          dept.label
            .toLowerCase()
            .includes(params.department?.toLowerCase() || "engineering")
        );

        // Get assigned apps (all available apps)
        const assignedApps = appName;

        // Get assigned roles (all available roles)
        const assignedRoles = `${roleName} (${appName})`;
        // Get assigned navbar
        const assignedNavbar =
          (appName + " " + roleName).toLowerCase() || "default";
        // Split name into first and last name
        const nameParts = userName.split(" ");
        const firstName = nameParts[0] || roleName;
        const lastName = nameParts.slice(1).join(" ") || "User";

        // Prepare user data
        const userData = {
          parentCategory: null,
          category: "usersMJJ",
          data: {
            usersMJJ__name: userName,
            usersMJJ__status: "todo",
            usersMJJ__emailidCUB: userEmail,
            usersMJJ__phonenumGMN: phoneNumber,
            usersMJJ__reportstIMO: "",
            usersMJJ__jobtitleNUQ: jobTitle?.value || "admin",
            usersMJJ__departmeNSR: department?.value || "engineering",
            usersMJJ__assignedEPK: assignedApps,
            usersMJJ__assignedLJS: assignedRoles,
            usersMJJ__assignedPBV: assignedNavbar,
            usersMJJ__firstname: firstName,
            usersMJJ__lastname: lastName,
            usersMJJ__password: userEmail,
          },
          parent_instance_id: "",
          workflow_instance_id: null,
          notify: true,
        };

        // Debug logging
        // console.log(`Creating user for role: ${roleName}`);
        // console.log(`User data:`, JSON.stringify(userData, null, 2));
        // console.log(
        //   `API URL: https://${params.tenantName}.amoga.app/api/v2/create/object/flow/${params.appId}?sync=true`
        // );

        // Create user via API
        const response = await fetch(
          `https://${params.tenantName}.amoga.app/api/v2/create/object/flow/${coreAppId}?sync=true`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              accept: "application/json, text/plain, */*",
            },
            body: JSON.stringify(userData),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          //   console.warn(
          //     `Failed to create user for role ${roleName}:`,
          //     `Status: ${response.status}`,
          //     `Response: ${errorText}`
          //   );
          continue;
        }

        const result = await response.json();

        createdUsers.push({
          role: roleName,
          userName: userName,
          email: userEmail,
          jobTitle: jobTitle?.label || "Default Job Title",
          department: department?.label || params.department || "Engineering",
          userId: result.id || result.instance_id,
        });

        userNameIndex++;
      } catch (roleError) {
        // console.warn(`Error creating user for role ${roleName}:`, roleError);
        continue;
      }
    }

    if (createdUsers.length === 0 && skippedUsers.length === 0) {
      return {
        success: false,
        message: `Failed to create any users. Processed ${filteredRoles.length} roles but all failed. Check console logs for detailed error information.`,
      };
    }

    let successMessage = "";

    if (createdUsers.length > 0) {
      const rolesList = createdUsers.map((user) => user.role).join(", ");
      successMessage += `Successfully created ${
        createdUsers.length
      } users for roles: ${rolesList}.\n\nUsers Created:\n${createdUsers
        .map(
          (user) =>
            `• ${user.userName} (${user.role})\n  └─ Email: ${user.email}\n  └─ Job Title: ${user.jobTitle}\n  └─ Department: ${user.department}`
        )
        .join("\n\n")}`;
    }

    if (skippedUsers.length > 0) {
      if (successMessage) successMessage += "\n\n";
      successMessage += `Skipped ${
        skippedUsers.length
      } users (already exist):\n${skippedUsers
        .map(
          (user) =>
            `• ${user.userName} (${user.role})\n  └─ Email: ${user.email}\n  └─ Reason: ${user.reason}`
        )
        .join("\n\n")}`;
    }

    if (createdUsers.length > 0) {
      successMessage += `\n\nEach new user is configured with:\n• Status: TODO (ready for assignment)\n• Email: Generated as ${appSlug}.{rolename}@amoga.dev\n• Job Title: Mapped from created job titles\n• Department: ${
        params.department || "Engineering"
      }\n• App Assignment: Linked to current application\n• Password: Set to email address (can be changed)\n\nUsers are automatically linked to their corresponding roles and job titles.`;
    }

    return {
      success: true,
      message: successMessage,
      created_users: createdUsers,
      skipped_users: skippedUsers,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create users: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};
