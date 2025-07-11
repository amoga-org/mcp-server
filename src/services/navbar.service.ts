import { getCrmToken, getAppContract } from "./app.service.js";
import {
  CreateNavbarParams,
  NavbarItem,
  NavbarResponse,
  SidebarProps,
} from "../types/app.types.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate AI-driven navbar name based on role
 * @param roleName - The role name
 * @param appName - The application name
 * @returns Generated navbar name
 */
/**
 * Filter pages based on role permissions
 * @param pages - All available pages
 * @param rolePermissions - Role's permissions object
 * @returns Filtered pages that the role has access to
 */
const filterPagesByRolePermissions = (
  pages: any[],
  rolePermissions: any
): any[] => {
  if (!rolePermissions || !rolePermissions.loco_permission) {
    return pages; // Return all pages if no permissions defined
  }

  return pages.filter((page: any) => {
    // If page has an object_slug, check if role has permission for that object
    if (page.workitem_slug) {
      const objPermissions =
        rolePermissions.loco_permission[page.workitem_slug];
      return objPermissions && objPermissions.read === true;
    }

    // For general pages (dashboard, etc.), allow access
    return true;
  });
};

/**
 * Create SOW-compliant navbar template structure with role-based page filtering
 * SOW Grouping Order: Dashboard → Tasks → App Modules (containing Cases & Objects) → Admin (Master/Meta objects)
 * @param pages - Available pages
 * @param objects - App contract objects
 * @param appId - Application ID
 * @param rolePermissions - Role permissions for filtering
 * @param isAdminRole - Whether this role has admin privileges
 * @returns Sidebar props structure
 */
const createSOWNavbarTemplate = (
  pages: any[],
  objects: any[],
  appId: string,
  rolePermissions: any,
  isAdminRole: boolean = false
): SidebarProps[] => {
  // Filter pages based on role permissions
  const accessiblePages = filterPagesByRolePermissions(pages, rolePermissions);

  // Filter out record pages - only include dashboard, list, and custom pages
  const filteredPages = accessiblePages.filter(
    (page: any) =>
      page.type !== "record" &&
      (page.type === "dashboard" ||
        page.type === "list" ||
        page.type === "custom" ||
        !page.type)
  );

  const sidebarProps: SidebarProps[] = [];
  let currentRank = 2;

  let dashboardItemType = {
    uuid: uuidv4(),
    display_name: "Dashboard",
    rank: 1,
    icon: {
      type: "material-icons",
      name: "insert_emoticon",
      version: 1,
      style: "light",
      svg: "chart-line",
      color: "#5f6368",
      imgurl: "https://static.amoga.io/fa/light/chart-line.svg",
    },
    type: "External Link",
    is_active: true,
    children: [],
    meta_data: {},
    route: "https://amoga.io",
    is_default: false,
    is_custom: true,
    default_homepage_type: "",
    view_type: "item",
  };
  sidebarProps.push(dashboardItemType);
  // 2. TASKS GROUP (Rank 2) - Only include if task objects exist and role has permission
  const taskObjects = objects.filter(
    (obj: any) =>
      obj.type === "task" && hasObjectPermission(rolePermissions, obj.slug)
  );
  const taskPages = filteredPages.filter(
    (page: any) =>
      //   page.type === "dashboard" ||
      //   page.name?.toLowerCase().includes("task") ||
      //   page.display_name?.toLowerCase().includes("task") ||
      page.workitem_type === "task"
  );

  if (taskObjects.length > 0 || taskPages.length > 0) {
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
        route: taskPages[0] ? `/${taskPages[0].page_id}` : "/my-tasks", // Always use page_id
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
          : "/all-tasks", // Always use page_id
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
          : "/overdue-tasks", // Always use page_id
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
      rank: currentRank++,
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

  // 3. APP MODULES (workitem + object types) grouped by app name (Rank 3) - Only parent/top-level objects with permission
  const moduleObjects = objects.filter(
    (obj: any) =>
      (obj.type === "workitem" ||
        obj.type === "object" ||
        obj.type === "segment") &&
      !obj.parent &&
      obj.type !== "master" && // Exclude master objects for admin section
      hasObjectPermission(rolePermissions, obj.slug)
  );

  if (moduleObjects.length > 0) {
    // Group all objects (workitem + object) by their app name
    const appGroups = new Map<string, any[]>();

    moduleObjects.forEach((moduleObj: any) => {
      // Use app name from contract or default to app name based on object type
      const appName =
        moduleObj.application_name ||
        (moduleObj.type === "workitem" ? "Cases" : "Objects");
      if (!appGroups.has(appName)) {
        appGroups.set(appName, []);
      }
      appGroups.get(appName)!.push(moduleObj);
    });
    // Create a group for each app containing all its objects
    appGroups.forEach((groupObjects, groupAppName) => {
      const allModuleItems: any[] = [];

      groupObjects.forEach((moduleObj: any, index: number) => {
        const modulePages = filteredPages.filter(
          (page: any) => page.workitem_slug === moduleObj.slug
        );
        const moduleItems = generateObjectMenuItems(
          moduleObj,
          modulePages,
          appId,
          moduleObj.type
        );

        // Add each object's menu items with proper ranking
        moduleItems.forEach((item: any, itemIndex: number) => {
          allModuleItems.push({
            ...item,
            rank: index * 10 + itemIndex + 1,
            display_name: `${item.display_name}`, // Keep original display name like "My Leads", "All Customers"
          });
        });
      });

      sidebarProps.push({
        icon: {
          svg: "briefcase",
          name: "work",
          type: "material-icons",
          color: "#9c27b0",
          style: "solid",
          imgurl: "https://static.amoga.io/fa/solid/briefcase.svg",
          version: 1,
        },
        rank: currentRank++,
        type: "",
        uuid: uuidv4(),
        route: "",
        app_id: appId,
        children: allModuleItems,
        is_active: true,
        is_custom: true,
        meta_data: {
          //   section_type: "app_module",
          //   app_name: groupAppName,
          //   object_count: groupObjects.length,
          //   object_types: [...new Set(groupObjects.map((obj) => obj.type))],
        },
        view_type: "group",
        is_default: false,
        display_name: groupAppName,
        default_homepage_type: "",
      });
    });
  }

  // 4. ADMIN SECTION (Master/Meta objects) (Last rank) - Only for admin roles with permission
  if (isAdminRole) {
    const masterObjects = objects.filter(
      (obj: any) =>
        obj.type === "master" &&
        !obj.parent &&
        hasObjectPermission(rolePermissions, obj.slug)
    );

    if (masterObjects.length > 0) {
      const adminItems: any[] = [];

      masterObjects.forEach((masterObj: any, index: number) => {
        const masterPages = filteredPages.filter(
          (page: any) => page.workitem_slug === masterObj.slug
        );

        const masterItems = generateObjectMenuItems(
          masterObj,
          masterPages,
          appId,
          "master"
        );

        // Add master object items to admin section
        adminItems.push(
          ...masterItems.map((item: any, itemIndex: number) => ({
            ...item,
            rank: index * 10 + itemIndex + 1,
            display_name: `${masterObj.display_name || masterObj.name} - ${
              item.display_name
            }`,
          }))
        );
      });

      if (adminItems.length > 0) {
        sidebarProps.push({
          icon: {
            svg: "cog",
            name: "admin_panel_settings",
            type: "material-icons",
            color: "#795548",
            style: "solid",
            imgurl: "https://static.amoga.io/fa/solid/cog.svg",
            version: 1,
          },
          rank: currentRank++,
          type: "",
          uuid: uuidv4(),
          route: "",
          app_id: appId,
          children: adminItems,
          is_active: true,
          is_custom: true,
          meta_data: { section_type: "admin" },
          view_type: "group",
          is_default: false,
          display_name: "Admin",
          default_homepage_type: "",
        });
      }
    }
  }

  return sidebarProps;
};

/**
 * Generate standard menu items for an object (My [Object], All [Object], Overdue, etc.)
 */
const generateObjectMenuItems = (
  obj: any,
  pages: any[],
  appId: string,
  objectType: string
) => {
  const baseRoute = pages.length > 0 ? `/${pages[0].page_id}` : `/${obj.slug}`;
  const objectName = obj.display_name || obj.name;

  // Define icons based on object type
  const getIconForObjectType = (type: string) => {
    switch (type) {
      case "workitem":
        return {
          svg: "briefcase",
          name: "work",
          type: "material-icons",
          color: "#9c27b0",
          style: "solid",
          imgurl: "https://static.amoga.io/fa/solid/briefcase.svg",
          version: 1,
        };
      case "object":
        return {
          svg: "cube",
          name: "category",
          type: "material-icons",
          color: "#607d8b",
          style: "solid",
          imgurl: "https://static.amoga.io/fa/solid/cube.svg",
          version: 1,
        };
      case "task":
        return {
          svg: "tasks",
          name: "assignment",
          type: "material-icons",
          color: "#ff9800",
          style: "solid",
          imgurl: "https://static.amoga.io/fa/solid/tasks.svg",
          version: 1,
        };
      case "master":
        return {
          svg: "cog",
          name: "settings",
          type: "material-icons",
          color: "#795548",
          style: "solid",
          imgurl: "https://static.amoga.io/fa/solid/cog.svg",
          version: 1,
        };
      case "segment":
        return {
          svg: "tags",
          name: "label",
          type: "material-icons",
          color: "#3f51b5",
          style: "solid",
          imgurl: "https://static.amoga.io/fa/solid/tags.svg",
          version: 1,
        };
      default:
        return {
          svg: "folder",
          name: "folder",
          type: "material-icons",
          color: "#5f6368",
          style: "solid",
          imgurl: "https://static.amoga.io/fa/solid/folder.svg",
          version: 1,
        };
    }
  };

  const objectIcon = getIconForObjectType(objectType);

  const items = [
    {
      icon: objectIcon,
      rank: 1,
      type: "Pages",
      uuid: uuidv4(),
      route: pages[1] ? `/${pages[1].page_id}` : baseRoute,
      app_id: appId,
      children: [],
      is_active: true,
      is_custom: true,
      meta_data: { filter_type: "all", object_slug: obj.slug },
      view_type: "item",
      is_default: false,
      display_name: `${objectName}`,
      default_homepage_type: "",
    },
  ];

  // Add Overdue option for workitem and task types
  if (objectType === "task") {
    items.push({
      icon: {
        svg: "exclamation-triangle",
        name: "warning",
        type: "material-icons",
        color: "#ff5722",
        style: "solid",
        imgurl: "https://static.amoga.io/fa/solid/exclamation-triangle.svg",
        version: 1,
      },
      rank: 3,
      type: "Pages",
      uuid: uuidv4(),
      route: pages[2] ? `/${pages[2].page_id}` : baseRoute, // Always use page_id
      app_id: appId,
      children: [],
      is_active: true,
      is_custom: true,
      meta_data: { filter_type: "overdue", object_slug: obj.slug },
      view_type: "item",
      is_default: false,
      display_name: `Overdue ${objectName}`,
      default_homepage_type: "",
    });
  }

  return items;
};

/**
 * Check if role has permission to access an object
 */
const hasObjectPermission = (
  rolePermissions: any,
  objectSlug: string
): boolean => {
  if (!rolePermissions || !rolePermissions.loco_permission) {
    return true; // Default to allow if no permissions defined
  }

  const objPermissions = rolePermissions.loco_permission[objectSlug];
  if (!objPermissions) {
    return false;
  }

  // Check if user has at least read permission
  return objPermissions.read === true;
};

/**
 * Determine if a role is an admin role
 */
const isAdminRole = (roleName: string): boolean => {
  const adminRoleNames = ["admin", "administrator"];
  return adminRoleNames.includes(roleName.toLowerCase());
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
    const appName = appContract?.contract_json?.application_name;
    const appObjects = appContract?.contract_json?.objects || [];

    // Filter out administrator role
    const filteredRolesData = Object.fromEntries(
      Object.entries(rolesData).filter(
        ([roleName]) =>
          !isAdminRole(roleName) || roleName.toLowerCase() !== "administrator"
      )
    );

    // Filter out record pages - only include actual navigable pages
    const filteredPages = pages.filter(
      (page: any) => page.type !== "record" && page.type !== "create"
    );
    const createdNavbars = [];
    let lastNavbarId = null;
    let lastUserMappingId = null;

    // Create a navbar for each role (excluding administrator)
    let navbarNameIndex = 0;
    for (const [roleName, roleData] of Object.entries(filteredRolesData)) {
      try {
        // Use provided navbar name array or generate one
        const navbarName = appName + " " + roleName;
        // params.navbarName && params.navbarName[navbarNameIndex]
        //   ? params.navbarName[navbarNameIndex]
        //   : generateNavbarName(roleName, appName);

        // Determine if this is an admin role (but not administrator specifically)
        const roleIsAdmin =
          isAdminRole(roleName) && roleName.toLowerCase() !== "administrator";

        // Create the SOW-compliant template structure with role-based filtering
        const sidebarProps = createSOWNavbarTemplate(
          filteredPages,
          appObjects,
          params.appId,
          roleData,
          roleIsAdmin
        );

        // Always add Settings at the end (but not for regular users without permissions)
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
          is_mobile: true,
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
          console.warn(
            `Failed to create navbar for role ${roleName}:`,
            errorText
          );
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
          } catch (mappingError) {
            console.warn(
              `Failed to map navbar to user for role ${roleName}:`,
              mappingError
            );
          }
        }

        createdNavbars.push({
          role: roleName,
          navbarName: navbarName,
          navbarId: navbarId,
          userMappingId: userMappingId,
          sectionsCount: sidebarProps.length,
        });

        navbarNameIndex++;
      } catch (roleError) {
        console.warn(`Error creating navbar for role ${roleName}:`, roleError);
        continue;
      }
    }

    // Convert the last created navbar structure to NavbarItem format for response
    const templateStructure = createSOWNavbarTemplate(
      filteredPages,
      appObjects,
      params.appId,
      Object.values(filteredRolesData)[0] || {},
      false // Don't use admin for template structure generation
    );
    const navbarItems: NavbarItem[] = templateStructure.map((item: any) => ({
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
        roles: Object.keys(filteredRolesData),
      })),
      roles: Object.keys(filteredRolesData),
    }));

    // Add settings item
    navbarItems.push({
      id: uuidv4(),
      display_name: "Settings",
      icon: "settings",
      route: "/(tabs)/settings",
      type: "page",
      roles: Object.keys(filteredRolesData),
    });

    const navbarNames = createdNavbars.map((nb) => nb.navbarName).join(", ");
    const objectTypeCounts = {
      dashboard: filteredPages.filter((p) => p.type === "dashboard").length,
      workitem: appObjects.filter(
        (obj: any) => obj.type === "workitem" && !obj.parent
      ).length,
      task: appObjects.filter((obj: any) => obj.type === "task").length,
      object: appObjects.filter(
        (obj: any) => obj.type === "object" && !obj.parent
      ).length,
      master: appObjects.filter(
        (obj: any) => obj.type === "master" && !obj.parent
      ).length,
    };

    const rolesList = Object.keys(filteredRolesData).join(", ");
    const successMessage = `Successfully created ${
      createdNavbars.length
    } SOW-compliant navbars for roles: ${rolesList} (Administrator role excluded).\n\nNavbar Names:\n${createdNavbars
      .map((nb) => `• ${nb.navbarName} (${nb.role})`)
      .join("\n")}\n\nSOW Structure Applied:\n• Dashboard: ${
      objectTypeCounts.dashboard
    } pages\n• Tasks: ${objectTypeCounts.task} objects\n• App Modules: ${
      objectTypeCounts.workitem + objectTypeCounts.object
    } objects (Cases + Objects grouped by app)\n• Admin/Master Objects: ${
      objectTypeCounts.master
    } objects\n\nRole-based permissions applied - users only see pages they have access to.\nAll routes use page_id for navigation.\nAdministrator role excluded from navbar creation.\nWorkitem and Object types are grouped together by their application name (e.g., Sales CRM contains both Leads and Customers).`;

    return {
      success: true,
      navbar_id: lastNavbarId,
      user_mapping_id: lastUserMappingId || undefined,
      navbar_items: navbarItems,
      role_mappings: Object.keys(filteredRolesData).reduce((acc, role) => {
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
