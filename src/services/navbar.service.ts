import { getCrmToken, getAppContract } from "./app.service.js";
import {
  CreateNavbarParams,
  NavbarItem,
  NavbarResponse,
} from "../types/app.types.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate AI-driven navbar name based on role
 * @param roleName - The role name
 * @param appName - The application name
 * @returns Generated navbar name
 */
const generateNavbarName = (roleName: string, appName?: string): string => {
  const roleNames: Record<string, string> = {
    admin: "Administrator",
    administrator: "Administrator",
    manager: "Manager",
    team_member: "Team Member",
    user: "User",
    employee: "Employee",
    supervisor: "Supervisor",
    lead: "Team Lead",
    analyst: "Data Analyst",
    developer: "Developer",
    designer: "Designer",
  };

  const cleanRoleName =
    roleNames[roleName.toLowerCase()] ||
    roleName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const appPrefix = appName ? `${appName.split(" ")[0]} ` : "";
  return `${appPrefix}${cleanRoleName} Navigation`;
};

/**
 * Create default navbar template structure
 * @param pages - Available pages
 * @param appId - Application ID
 * @returns Sidebar props structure
 */
const createDefaultNavbarTemplate = (pages: any[], appId: string) => {
  // Filter out record pages - only include dashboard, list, and custom pages
  const filteredPages = pages.filter(
    (page: any) =>
      page.type !== "record" &&
      (page.type === "dashboard" ||
        page.type === "list" ||
        page.type === "custom" ||
        !page.type)
  );

  const sidebarProps = [];

  // Dashboard Group
  const dashboardPages = filteredPages.filter(
    (page: any) =>
      page.type === "dashboard" ||
      page.name?.toLowerCase().includes("dashboard") ||
      page.display_name?.toLowerCase().includes("dashboard")
  );

  if (dashboardPages.length > 0) {
    const dashboardItems = dashboardPages.map((page: any, index: number) => ({
      icon: {
        svg: "chart-line",
        name: "analytics",
        type: "material-icons",
        color: "#5f6368",
        style: "solid",
        imgurl: "https://static.amoga.io/fa/solid/chart-line.svg",
        version: 1,
      },
      rank: index + 1,
      type: "Pages",
      uuid: uuidv4(),
      route: `/${page.page_id}`,
      app_id: appId,
      children: [],
      is_active: true,
      is_custom: true,
      meta_data: {},
      view_type: "item",
      is_default: page.is_default || false,
      display_name: page.display_name || page.name,
      default_homepage_type: "",
    }));

    sidebarProps.push({
      icon: {
        svg: "tachometer-alt",
        name: "dashboard",
        type: "material-icons",
        color: "#1976d2",
        style: "solid",
        imgurl: "https://static.amoga.io/fa/solid/tachometer-alt.svg",
        version: 1,
      },
      rank: 1,
      type: "",
      uuid: uuidv4(),
      route: "",
      app_id: appId,
      children: dashboardItems,
      is_active: true,
      is_custom: true,
      meta_data: {},
      view_type: "group",
      is_default: false,
      display_name: "Dashboard",
      default_homepage_type: "",
    });
  }

  // Tasks Group with predefined structure
  const taskPages = filteredPages.filter(
    (page: any) =>
      page.type === "list" ||
      page.name?.toLowerCase().includes("task") ||
      page.display_name?.toLowerCase().includes("task") ||
      page.workitem_type === "task"
  );

  if (taskPages.length > 0) {
    // Create the standard task items
    const taskItems = [
      {
        icon: {
          svg: "user-check",
          name: "assignment_ind",
          type: "material-icons",
          color: "#4caf50",
          style: "solid",
          imgurl: "https://static.amoga.io/fa/solid/user-check.svg",
          version: 1,
        },
        rank: 1,
        type: "Pages",
        uuid: uuidv4(),
        route: taskPages[0] ? `/${taskPages[0].page_id}` : "/my-tasks",
        app_id: appId,
        children: [],
        is_active: true,
        is_custom: true,
        meta_data: {},
        view_type: "item",
        is_default: false,
        display_name: "My Tasks",
        default_homepage_type: "",
      },
      {
        icon: {
          svg: "list-check",
          name: "assignment",
          type: "material-icons",
          color: "#2196f3",
          style: "solid",
          imgurl: "https://static.amoga.io/fa/solid/list-check.svg",
          version: 1,
        },
        rank: 2,
        type: "Pages",
        uuid: uuidv4(),
        route: taskPages[1]
          ? `/${taskPages[1].page_id}`
          : taskPages[0]
          ? `/${taskPages[0].page_id}`
          : "/all-tasks",
        app_id: appId,
        children: [],
        is_active: true,
        is_custom: true,
        meta_data: {},
        view_type: "item",
        is_default: false,
        display_name: "All Tasks",
        default_homepage_type: "",
      },
      {
        icon: {
          svg: "clock",
          name: "schedule",
          type: "material-icons",
          color: "#ff5722",
          style: "solid",
          imgurl: "https://static.amoga.io/fa/solid/clock.svg",
          version: 1,
        },
        rank: 3,
        type: "Pages",
        uuid: uuidv4(),
        route: taskPages[2]
          ? `/${taskPages[2].page_id}`
          : taskPages[0]
          ? `/${taskPages[0].page_id}`
          : "/overdue-tasks",
        app_id: appId,
        children: [],
        is_active: true,
        is_custom: true,
        meta_data: {},
        view_type: "item",
        is_default: false,
        display_name: "Over Due",
        default_homepage_type: "",
      },
    ];

    sidebarProps.push({
      icon: {
        svg: "tasks",
        name: "assignment",
        type: "material-icons",
        color: "#ff9800",
        style: "solid",
        imgurl: "https://static.amoga.io/fa/solid/tasks.svg",
        version: 1,
      },
      rank: 2,
      type: "",
      uuid: uuidv4(),
      route: "",
      app_id: appId,
      children: taskItems,
      is_active: true,
      is_custom: true,
      meta_data: {},
      view_type: "group",
      is_default: false,
      display_name: "Tasks",
      default_homepage_type: "",
    });
  }

  return sidebarProps;
};

/**
 * Create navbar via API
 * @param params - Navbar creation parameters
 * @returns Promise with creation result
 */
export const createNavbar = async (
  params: CreateNavbarParams
): Promise<NavbarResponse> => {
  try {
    const { token } = await getCrmToken(params.baseUrl, params.tenantName);

    let appContract = params.appContract;
    let pages = params.appPages || [];

    // Get the app contract if not provided
    if (!appContract) {
      appContract = await getAppContract({
        baseUrl: params.baseUrl,
        appId: params.appId,
        tenantName: params.tenantName,
      });
    }

    const existingPermissions = appContract?.permission || {};
    const rolesData = existingPermissions;
    const rolesArray = Object.values(rolesData);
    const appName = appContract?.contract_json?.app_name || "App";

    // Filter out record pages - only include actual navigable pages
    const filteredPages = pages.filter(
      (page: any) => page.type !== "record" && page.type !== "create"
    );

    const createdNavbars = [];
    let lastNavbarId = null;
    let lastUserMappingId = null;

    // Create a navbar for each role
    for (const [roleName, roleData] of Object.entries(rolesData)) {
      try {
        const navbarName =
          params.navbarName || generateNavbarName(roleName, appName);

        // Create the default template structure
        const sidebarProps = createDefaultNavbarTemplate(
          filteredPages,
          params.appId
        );

        // Always add Settings at the end
        sidebarProps.push({
          icon: {
            svg: "gear",
            name: "settings",
            type: "material-icons",
            color: "#5f6368",
            style: "light",
            imgurl: "https://static.amoga.io/fa/solid/gear.svg",
            version: 1,
          },
          rank: 99,
          type: "settings",
          uuid: uuidv4(),
          route: "/(tabs)/settings",
          app_id: params.appId,
          children: [],
          is_active: true,
          is_custom: true,
          meta_data: {},
          view_type: "item",
          is_default: false,
          display_name: "Settings",
          default_homepage_type: "",
        });
        // Create navbar using the API
        const navbarResponse = await fetch(
          `${params.baseUrl}/api/v2/core/navigation/list`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              accept: "application/json, text/plain, */*",
            },
            body: JSON.stringify({
              display_name: navbarName,
              sidebar_props: sidebarProps,
            }),
          }
        );

        if (!navbarResponse.ok) {
          const errorText = await navbarResponse.text();

          continue;
        }

        const navbarResult = await navbarResponse.json();
        const navbarId = navbarResult.id || navbarResult.navigation_id;
        lastNavbarId = navbarId;

        // Try to map navbar to user (optional)
        let userMappingId: string | undefined;
        if (navbarId) {
          try {
            const userMappingResponse = await fetch(
              `${params.baseUrl}/api/v2/core/unassigned/user/${navbarId}`,
              {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                  accept: "application/json, text/plain, */*",
                },
              }
            );

            if (userMappingResponse.ok) {
              const mappingResult = await userMappingResponse.json();
              userMappingId = mappingResult.id;
              lastUserMappingId = userMappingId;
            }
          } catch (mappingError) {}
        }

        createdNavbars.push({
          role: roleName,
          navbarName: navbarName,
          navbarId: navbarId,
          userMappingId: userMappingId,
          sectionsCount: sidebarProps.length,
        });
      } catch (roleError) {
        continue;
      }
    }

    // Convert the last created navbar structure to NavbarItem format for response
    const templateStructure = createDefaultNavbarTemplate(
      filteredPages,
      params.appId
    );
    const navbarItems: NavbarItem[] = templateStructure.map((item) => ({
      id: item.uuid,
      display_name: item.display_name,
      icon:
        typeof item.icon === "object" ? item.icon.name || "folder" : item.icon,
      route: item.route,
      type: item.view_type as "page" | "folder" | "divider",
      children: item.children?.map((child: any) => ({
        id: child.uuid,
        display_name: child.display_name,
        icon:
          typeof child.icon === "object"
            ? child.icon.name || "description"
            : child.icon,
        route: child.route,
        type: "page" as const,
        roles: Object.keys(existingPermissions),
      })),
      roles: Object.keys(existingPermissions),
    }));

    // Add settings item
    navbarItems.push({
      id: uuidv4(),
      display_name: "Settings",
      icon: "settings",
      route: "/(tabs)/settings",
      type: "page",
      roles: Object.keys(existingPermissions),
    });

    const navbarNames = createdNavbars.map((nb) => nb.navbarName).join(", ");
    const successMessage = `Successfully created ${
      createdNavbars.length
    } navbars for roles: ${Object.keys(rolesData).join(
      ", "
    )}.\n\nNavbar Names:\n${createdNavbars
      .map((nb) => `• ${nb.navbarName} (${nb.role})`)
      .join("\n")}\n\nTemplate includes Dashboard and Tasks groups with ${
      filteredPages.length
    } pages mapped to appropriate sections.`;

    return {
      success: true,
      navbar_id: lastNavbarId,
      user_mapping_id: lastUserMappingId || undefined,
      navbar_items: navbarItems,
      role_mappings: Object.keys(existingPermissions).reduce((acc, role) => {
        acc[role] = navbarItems.map((item) => item.id);
        return acc;
      }, {} as Record<string, string[]>),
      message: successMessage,
    };
  } catch (error) {
    return {
      success: false,
      navbar_items: [],
      role_mappings: {},
      message: `Failed to create navbar: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};
