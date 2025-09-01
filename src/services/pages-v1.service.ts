import { v4 as uuidv4 } from "uuid";
import { getCrmToken, getAppContract } from "./app.service.js";
import { CreatePagesV1Params } from "../schemas/pages-v1-schema.js";
import { widgets } from "../config/widgets.js";

/**
 * Create a page using the internal API (similar to api.js implementation)
 */
async function createPageV1(baseUrl: string, token: string, data: any): Promise<any> {
  try {
    const response = await fetch(`${baseUrl}/api/v1/core/page`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Update page with widgets (similar to api.js implementation)
 */
async function updateMappedWidget(baseUrl: string, token: string, pageId: string, data: any): Promise<any> {
  try {
    const response = await fetch(
      `${baseUrl}/api/v1/core/page/${pageId}/widget`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Handle page creation with widget mapping (similar to handleUsePageTemplate in api.js)
 */
async function handleUsePageTemplate(baseUrl: string, token: string, pageData: any): Promise<void> {
  try {
    const { widgets: pageWidgets, ...metaData } = pageData;
    const createResponse = await createPageV1(baseUrl, token, metaData);
    if (createResponse.status === 1) {
      await updateMappedWidget(baseUrl, token, createResponse.data.id, {
        page_widget: pageWidgets || [],
      });
    }
  } catch (error) {
    console.error("Error creating page template:", error);
    throw error;
  }
}

/**
 * Get widget configuration based on widget type name
 * Maps user-friendly names to actual widget configurations
 */
function getWidgetConfig(widgetTypeName: string): any {
  // Map user-friendly names to actual widget keys
  const nameMapping: Record<string, string> = {
    // Direct mappings for schema widget names
    "note": "note",
    "activity": "activity", 
    "attachment": "attachment",
    "button": "button",
    "calendar": "calendar",
    "carousel": "carousel",
    "chart": "chart",
    "comment": "comment",
    "container": "container",
    "conversation": "conversation",
    "dropdown": "dropdown",
    "file_preview": "file_preview",
    "header": "header",
    "html_parser": "html_parser", 
    "iframe": "iframe",
    "json": "json",
    "jsonform": "jsonform",
    "leaderboard": "leaderboard",
    "list": "list",
    "map": "map",
    "page": "page",
    "path": "path",
    "progressbar": "progressbar",
    "qrScanner": "qrScanner",
    "richTextEditor": "richTextEditor",
    "spacer": "spacer",
    "stats": "stats",
    "table": "table",
    "tabs": "tabs",
    "ticker": "ticker",
    "lits": "list", // typo fix

    // Legacy/friendly name mappings
    "Table": "table",
    "Header": "header", 
    "JSON Form": "jsonform",
    "Comments": "comment",
    "Progress bar": "progressbar",
    "Notes": "note",
    "Activity": "activity",
    "Attachment": "attachment",
    "Chart": "chart",
    "KPI": "stats",
    "List": "list",
    "Text": "richTextEditor",
    "Image": "iframe",
    "Card": "container"
  };

  const widgetKey = nameMapping[widgetTypeName] || widgetTypeName.toLowerCase();
  const widgetConfig = widgets[widgetKey as keyof typeof widgets];
  
  if (!widgetConfig) {
    // Fallback to a basic container if widget not found
    console.warn(`Widget type "${widgetTypeName}" not found, using container as fallback`);
    return widgets.container;
  }
  
  return widgetConfig;
}


/**
 * Generate widget configuration from AI-provided widget data
 * Similar to create-sot's approach
 */
function generateWidget(
  widgetConfig: any,  // Always an object with type and grid_props from AI
  objectSlug?: string,
  contractObjects?: any[]
): any {
  // Extract widget configuration from AI params
  const widgetType = widgetConfig.type;
  const aiGridProps = widgetConfig.grid_props || {};
  const customProps = widgetConfig.props || {};
  const widgetObjectSlug = widgetConfig.objectSlug || objectSlug;

  const baseConfig = getWidgetConfig(widgetType);
  const widgetId = uuidv4();
  
  // Use the same pattern as createSotData: destructure configs and rest
  const { configs, ...rest } = baseConfig;
  
  // Enhanced config with custom properties
  let enhancedConfigs = { ...configs };
  
  // Apply custom props to enhanced config
  if (Object.keys(customProps).length > 0) {
    enhancedConfigs.props = {
      ...enhancedConfigs.props,
      ...customProps,
    };
  }

  // Enhanced config for table widgets (similar to createSotData)
  if (widgetType === "table" && widgetObjectSlug && contractObjects) {
    const targetObject = contractObjects.find(
      (obj: any) => obj.slug === widgetObjectSlug
    );
    if (targetObject) {
      // Add datastore property
      enhancedConfigs.props = {
        ...enhancedConfigs.props,
        data_source: {
          name: targetObject.name,
          slug: targetObject.slug,
        },
      };
      // Add columns property from object attributes
      if (targetObject.attributes && Array.isArray(targetObject.attributes)) {
        const tableColumns = targetObject.attributes.map(
          (attr: any, index: number) => ({
            key: attr.key,
            hide: false,
            pinned: index == 0 ? true : false,
            parent: "",
            masked: false,
            clickable: null,
          })
        );
        enhancedConfigs.props.columns = tableColumns;
      }
    }
  }

  // Enhanced config for header widgets (similar to createSotData)
  if (widgetType === "header" && widgetObjectSlug && contractObjects) {
    const targetObject = contractObjects.find(
      (obj: any) => obj.slug === widgetObjectSlug
    );
    if (targetObject) {
      // Add data_source array with object information
      enhancedConfigs.props = {
        ...enhancedConfigs.props,
        data_source: [
          {
            name: targetObject.name,
            slug: targetObject.slug,
          },
        ],
      };
      if (targetObject.attributes && Array.isArray(targetObject.attributes)) {
        const hardcodedAttributes = [
          {
            key: "created_at",
            hide: false,
            parentKey: targetObject.slug,
            parentDisplayName: targetObject.name,
            masked: false,
            pinned: false,
          },
          {
            key: "updated_at", 
            hide: false,
            parentKey: targetObject.slug,
            parentDisplayName: targetObject.name,
            masked: false,
            pinned: false,
          },
          {
            key: "created_by",
            hide: false,
            parentKey: targetObject.slug,
            parentDisplayName: targetObject.name,
            masked: false,
            pinned: false,
          },
        ];
        const pinnedAttributes = ["status", "assignee"];
        const headerAttributes = targetObject.attributes.map((attr: any) => {
          const isPinned = pinnedAttributes.includes(attr.key);
          return {
            key: attr.key,
            hide: !isPinned,
            pinned: isPinned,
            parentKey: targetObject.slug,
            parentDisplayName: targetObject.name,
            masked: false,
          };
        });
        enhancedConfigs.props.attributes = [
          ...headerAttributes,
          ...hardcodedAttributes,
        ];
      }
    }
  }
  
  // Create widget structure matching create-sot implementation
  const widget = {
    configs: {
      ...enhancedConfigs,
      grid_props: {
        // Merge AI-provided grid_props with widget defaults (like create-sot line 471-474)
        ...aiGridProps,
        ...enhancedConfigs.grid_props,
        // AI should provide these required values
        x: aiGridProps.x || 0,
        y: aiGridProps.y || 0,
        w: aiGridProps.w || 12,
        h: aiGridProps.h || 10,
        // Add unique identifier
        i: widgetId,
        // Standard properties from AI or defaults
        moved: aiGridProps.moved || false,
        static: aiGridProps.static || false,
        isResizable: aiGridProps.isResizable !== false,
      },
    },
    ...rest, // Include other properties from base config
    id: widgetId,
  }

  return widget;
}

/**
 * Create pages with widgets using AI-optimized layout
 */
export async function createPagesV1(params: CreatePagesV1Params): Promise<any> {
  try {
    const { token } = await getCrmToken(params.baseUrl, params.tenantName);
    
    // Get app contract to understand objects
    const appContract = await getAppContract({
      baseUrl: params.baseUrl,
      appId: params.appId,
      tenantName: params.tenantName,
    });

    // Get contract objects for widget enhancement
    const contractObjects = appContract?.contract_json?.objects || [];

    const createdPages = [];
    const errors = [];

    for (const pageDefinition of params.pages) {
      try {
        // Generate widgets exactly like create-sot
        const widgets: any[] = [];
        
        // Process each widget with AI-provided grid_props
        if (pageDefinition.widgets && Array.isArray(pageDefinition.widgets)) {
          pageDefinition.widgets.forEach((widgetConfig) => {
            const widget = generateWidget(
              widgetConfig,
              pageDefinition.objectSlug,
              contractObjects
            );
            widgets.push(widget);
          });
        }

        // Page type comes directly from pageDefinition

        // Create page data exactly like create-sot (line 481-490)
        const pageData = {
          application_id: params.appId,
          display_name: pageDefinition.name,
          mode: "view", // Fixed mode like create-sot
          name: pageDefinition.name,
          object_slug: pageDefinition.objectSlug || "",
          show_header: true, // Fixed like create-sot
          type: pageDefinition.type,
          widgets: widgets,
        };

        // Use the same approach as handleUsePageTemplate
        await handleUsePageTemplate(params.baseUrl, token, pageData);
        
        createdPages.push({
          name: pageDefinition.name,
          pageId: "created", // We don't get the ID back but we know it was created
          type: pageDefinition.type,
          widgetCount: widgets.length,
          objectSlug: pageDefinition.objectSlug || "",
        });
      } catch (error) {
        errors.push({
          page: pageDefinition.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      success: errors.length === 0,
      createdPages,
      errors,
      totalRequested: params.pages.length,
      totalCreated: createdPages.length,
      message: errors.length === 0
        ? `Successfully created ${createdPages.length} pages`
        : `Created ${createdPages.length} of ${params.pages.length} pages with ${errors.length} errors`,
    };
  } catch (error) {
    return {
      success: false,
      createdPages: [],
      errors: [{ error: error instanceof Error ? error.message : String(error) }],
      totalRequested: params.pages.length,
      totalCreated: 0,
      message: `Failed to create pages: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}