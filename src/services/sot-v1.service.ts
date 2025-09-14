/**
 * SOT V1 Service - Create objects with attributes and SOT
 */

import { CreateSOTV1Params } from "../schemas/sot-v1-schema.js";
import { createObject, createSot, getCrmToken } from "./app.service.js";
import { getAttributes, createAttributeBatch } from "./attribute.service.js";
import { AttributePayload } from "../types/attribute.types.js";

// Attribute type metadata
const typeMetaData: any = {
  text: [
    {
      label: "Short text",
      value: "string",
      title: "Short text",
      type_strapi: "string",
      strapi_unique: false,
      validation_type: "",
      tj_type: "TextInput",
    },
    {
      label: "Long text",
      value: "text",
      title: "Long text",
      type_strapi: "text",
      strapi_unique: false,
      validation_type: "",
      tj_type: "TextArea",
    },
  ],
  number: [
    {
      label: "Integer",
      value: "integer",
      title: "Integer",
      type_strapi: "integer",
      strapi_unique: false,
      validation_type: "number",
      tj_type: "TextInput",
    },
    {
      label: "Float",
      value: "float",
      title: "Float",
      type_strapi: "float",
      strapi_unique: false,
      validation_type: "decimal",
      tj_type: "TextInput",
    },
  ],
  boolean: [
    {
      label: "Toggle",
      value: "toggle",
      title: "Toggle",
      type_strapi: "boolean",
      strapi_unique: false,
      validation_type: "",
      tj_type: "Toggle",
    },
  ],
  date: {
    renderformat: "dd/MM/yyyy",
    includetime: false,
    timeformat: "12",
    isRelative: false,
    isCalculative: false,
    operation: "subtraction",
    includeShift: "",
    firstAttribute: {},
    secondAttribute: {},
    data_type: "datetime",
    type_strapi: "datetime",
    component: "calendar",
  },
  enumeration: [
    {
      label: "Enumeration",
      value: "enumeration",
      title: "Enumeration",
      type_strapi: "enumeration",
      strapi_unique: false,
      validation_type: "",
      tj_type: "Dropdown",
      component: "Dropdown",
    },
  ],
  related_field: [
    {
      label: "Related Field",
      value: "related_field",
      title: "Related Field",
      tj_type: "Dropdown",
      component: "Dropdown",
      type_strapi: "string",
      strapi_unique: false,
      data_type: "string",
      validation_type: "",
      component_type: "related_field",
      attribute_meta: {
        options: [],
        is_color: true,
        is_dynamic: false,
        related_objects_configuration: [],
      },
    },
  ],
};

// Reserved system attributes that cannot be created
const RESERVED_ATTRIBUTES = new Set([
  "status",
  "priority",
  "due_date",
  "name",
  "assignee",
  "created_at",
  "updated_at",
]);

// Validate attributes against reserved list
const validateAttributes = (
  attributes: Array<{ key: string; display_name?: string }>
) => {
  const reservedAttrs = attributes.filter(
    (attr) =>
      RESERVED_ATTRIBUTES.has(attr.key.toLowerCase()) ||
      (attr.display_name &&
        RESERVED_ATTRIBUTES.has(attr.display_name.toLowerCase()))
  );

  if (reservedAttrs.length > 0) {
    throw new Error(
      `Cannot create reserved system attributes: ${reservedAttrs
        .map((attr) => attr.display_name || attr.key)
        .join(", ")}. These attributes are managed by the system.`
    );
  }
};

// Create missing attributes at tenant level
async function createMissingAttributes(
  baseUrl: string,
  tenantName: string,
  attributes: any[],
  appId?: string
): Promise<void> {
  if (attributes.length === 0) return;

  const { token } = await getCrmToken(baseUrl, tenantName);
  const allAvailableAttributes = await getAttributes(baseUrl, token, appId || "");

  // Filter attributes that don't exist at tenant level
  const attributesToCreate = attributes.filter((attr) => {
    const existsInTenant = Object.keys(allAvailableAttributes).some(
      (existingKey) =>
        existingKey.toLowerCase() === attr.key.toLowerCase() ||
        allAvailableAttributes[existingKey]?.display_name?.toLowerCase() ===
          attr.display_name?.toLowerCase()
    );
    return !existsInTenant;
  });

  if (attributesToCreate.length === 0) return;

  // Validate no reserved attributes
  validateAttributes(attributesToCreate);

  // Convert to full attribute payloads
  const attributePayloads: AttributePayload[] = attributesToCreate.map(
    (attr) => {
      // Get component type and subtype from user type
      let componentType = "text";
      let componentSubtype = "string";

      if (attr.type.includes("text.short")) {
        componentType = "text";
        componentSubtype = "string";
      } else if (attr.type.includes("text.long")) {
        componentType = "text";
        componentSubtype = "text";
      } else if (attr.type.includes("number.integer")) {
        componentType = "number";
        componentSubtype = "integer";
      } else if (attr.type.includes("number.decimal")) {
        componentType = "number";
        componentSubtype = "float";
      } else if (attr.type.includes("date")) {
        componentType = "date";
        componentSubtype = "date";
      } else if (attr.type.includes("enumeration")) {
        componentType = "enumeration";
        componentSubtype = "enumeration";
      } else if (attr.type.includes("boolean")) {
        componentType = "boolean";
        componentSubtype = "toggle";
      } else if (attr.type.includes("relation")) {
        componentType = "related_field";
        componentSubtype = "related_field";
      }

      // Find metadata
      let metadata: any = {};
      if (componentType === "date") {
        metadata = typeMetaData.date;
      } else if (componentType === "related_field") {
        metadata = typeMetaData.related_field[0];
      } else {
        const typeCategory = typeMetaData[componentType];
        if (Array.isArray(typeCategory)) {
          const foundMetadata = typeCategory.find(
            (item) => item.value === componentSubtype
          );
          if (foundMetadata) {
            metadata = foundMetadata;
          }
        }
      }

      // Build attribute meta
      let attributeMeta: any = {
        is_color: true,
        options: [],
        is_dynamic: false,
      };

      // Handle enum values
      if (attr.values && componentType === "enumeration") {
        attributeMeta.options = attr.values.map((value: string) => ({
          label: value,
          value: value,
        }));
      }

      return {
        tj_type: metadata.tj_type || "",
        background_color: "",
        border_radius: "",
        component: metadata.component || "",
        data_type: metadata.data_type || "",
        component_type: componentType,
        component_subtype: componentSubtype,
        default_value: attr.default || "",
        display_name:
          attr.display_name ||
          attr.key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase()),
        disposition: "",
        hide: metadata.hide || false,
        instruction_text: "",
        is_editable: true,
        key: attr.key,
        meta_data: componentType === "date" ? metadata : {},
        metadata_strapi: {},
        rank: null,
        required_strapi: attr.required || false,
        resized: true,
        strapi_unique: metadata.strapi_unique || attr.unique || false,
        text_color: "",
        tj_disabled: false,
        tj_isrequired: attr.required || false,
        tj_metadata: {},
        tj_visibility: true,
        type_strapi: metadata.type_strapi || "",
        ui_header_align: "left",
        validation_data: "",
        validation_type: metadata.validation_type || "",
        width: "200",
        master_slug: "",
        is_encrypted: false,
        is_primary: false,
        attribute_of: "",
        is_auditable: attr.auditable || false,
        attribute_meta: attributeMeta,
        is_global: false,
        is_default: false,
        is_internal: false,
        related_objects_configuration: [],
      };
    }
  );

  // Create attributes in batch
  await createAttributeBatch(baseUrl, token, attributePayloads);
}

// Convert user attribute to MCP format
function convertAttribute(attr: any): any {
//   let componentType = "text";

//   // Map user types to MCP types
//   if (attr.type.includes("text")) {
//     componentType = "text";
//   } else if (attr.type.includes("number")) {
//     componentType = "number";
//   } else if (attr.type.includes("date")) {
//     componentType = "date";
//   } else if (attr.type.includes("enumeration")) {
//     componentType = "enumeration";
//   } else if (attr.type.includes("boolean")) {
//     componentType = "boolean";
//   } else if (attr.type.includes("user")) {
//     componentType = "user";
//   } else if (attr.type.includes("relation")) {
//     componentType = "related_field";
//   } else if (attr.type.includes("media")) {
//     componentType = "media";
//   }

  return {
    ...attr,
    display_name: attr.key

    // component_type: componentType,
    // ...(attr.required && { required: true }),
    // ...(attr.unique && { unique: true }),
    // ...(attr.values && { enum_values: attr.values }),
  };
}

// Convert user object to MCP format
function convertObject(obj: any): any {
  let mcpType = obj.type;
  if (obj.type === "case") {
    mcpType = "workitem";
  }

  // Convert attributes
  const attributes = obj.attributes?.map(convertAttribute) || [];

  // Convert status values - handle both string array and object array formats
  const status =
    obj.status_values?.map((statusValue: any, index: number) => {
      if (typeof statusValue === "string") {
        // Old format: array of strings
        return {
          name: statusValue,
          color: getStatusColor(index),
          amo_name: mapToAmoStatus(statusValue),
        };
      } else if (
        typeof statusValue === "object" &&
        statusValue.amo_name &&
        statusValue.name
      ) {
        // New format: array of objects with amo_name, name, and color
        return {
          name: statusValue.name, // This is the display_name
          color: statusValue.color, // Use the user-provided color
          amo_name: statusValue.amo_name, // Use the provided amo_name
        };
      } else {
        // Fallback for malformed data
        return {
          name: String(statusValue),
          color: getStatusColor(index),
          amo_name: mapToAmoStatus(String(statusValue)),
        };
      }
    }) || [];

  // Convert relationships
  const relationship =
    obj.relationships?.map((rel: any) => ({
      name: rel.related_object,
      relationship_type: rel.type === "oneToMany" ? "oneToMany" : "manyToOne",
    })) || [];

  return {
    name: obj.name,
    type: mcpType,
    slug: obj.uid.replace(/[^a-zA-Z0-9]/g, "").toLowerCase(),
    ...(attributes.length > 0 && { attributes }),
    ...(status.length > 0 && { status }),
    ...(relationship.length > 0 && { relationship }),
  };
}

// Get status color based on index
function getStatusColor(index: number): string {
  const colors = [
    "#94A3B8",
    "#3B82F6",
    "#F59E0B",
    "#10B981",
    "#EF4444",
    "#8B5CF6",
    "#F97316",
  ];
  return colors[index % colors.length];
}

// Map status names to AMO status names
function mapToAmoStatus(statusName: string): string {
  const lowerStatus = statusName.toLowerCase();

  if (
    lowerStatus.includes("to do") ||
    lowerStatus.includes("submitted") ||
    lowerStatus.includes("pending")
  ) {
    return "todo";
  } else if (
    lowerStatus.includes("progress") ||
    lowerStatus.includes("active")
  ) {
    return "inProgress";
  } else if (
    lowerStatus.includes("completed") ||
    lowerStatus.includes("done") ||
    lowerStatus.includes("finished")
  ) {
    return "completed";
  } else if (
    lowerStatus.includes("cancelled") ||
    lowerStatus.includes("rejected")
  ) {
    return "inCompleted";
  } else if (lowerStatus.includes("hold") || lowerStatus.includes("waiting")) {
    return "onHold";
  } else {
    return "todo";
  }
}

// Convert user SOT to MCP format
function convertSOT(obj: any, objectSlugMapping: Map<string, string>): any[] {
  if (!obj.sot || !obj.sot.statuses) {
    return [];
  }

  const actualObjectSlug = objectSlugMapping.get(obj.uid);
  if (!actualObjectSlug) {
    console.warn(
      `No slug found for object UID: ${obj.uid}. Available mappings:`,
      Array.from(objectSlugMapping.entries())
    );
    return [];
  }

  return obj.sot.statuses.map((sot: any, index: number) => ({
    id: `sot_${obj.uid.replace(/[^a-zA-Z0-9]/g, "")}_${index}`,
    name: `${sot.status} Transition`,
    description: `Transition to ${sot.status} status for ${obj.name}`,
    instruction: sot.pseudo || "", // Keep exact pseudo code from user
    object_slug: actualObjectSlug,
    origination_type: sot.origination_type,
    origination: {
      value: sot.origination_name,
      slug: sot.origination_name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase(),
      display_name: sot.origination_name,
      ...(sot.origination_type === "page" && { type: "record" }),
    },
    status: {
      display_name: sot.status,
      color: getStatusColor(index),
      slug: sot.status.replace(/[^a-zA-Z0-9]/g, "").toLowerCase(),
    },
  }));
}

export async function createSOTV1(params: CreateSOTV1Params) {
  try {
    const results = [];

    // Step 1: Collect all attributes from all objects
    const allObjects = [
      ...(params.objectsData.masters || []),
      ...params.objectsData.objects,
    ];

    // Extract all unique attributes
    const allAttributes: any[] = [];
    allObjects.forEach((obj) => {
      if (obj.attributes) {
        obj.attributes.forEach((attr: any) => {
          // Skip reserved attributes
          if (!RESERVED_ATTRIBUTES.has(attr.key.toLowerCase())) {
            const exists = allAttributes.some(
              (existing) =>
                existing.key.toLowerCase() === attr.key.toLowerCase()
            );
            if (!exists) {
              allAttributes.push({
                key: attr.key,
                type: attr.type,
                display_name: attr.key
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l: string) => l.toUpperCase()),
                required: attr.required,
                unique: attr.unique,
                auditable: attr.auditable,
                default: attr.default,
                values: attr.values,
              });
            }
          }
        });
      }
    });

    // // Step 2: Validate and create missing attributes
    // if (allAttributes.length > 0) {
    //   await createMissingAttributes(
    //     params.baseUrl,
    //     params.tenantName,
    //     allAttributes,
    //     params.appId
    //   );
    //   results.push({
    //     step: "validate_create_attributes",
    //     status: "success",
    //     message: `Validated and created ${allAttributes.length} attributes at tenant level`,
    //     count: allAttributes.length,
    //   });
    // }

    // Step 3: Prepare all objects (masters + objects)
    const mcpObjects = allObjects.map(convertObject);

    // Create initial object slug mapping (will be updated with actual slugs)
    const objectSlugMapping = new Map<string, string>();
    mcpObjects.forEach((mcpObj, index) => {
      const originalObj = allObjects[index];
      objectSlugMapping.set(originalObj.uid, mcpObj.slug);
    });

    // Step 4: Create objects
    const createObjectResult = await createObject({
      tenantName: params.tenantName,
      baseUrl: params.baseUrl,
      appId: params.appId,
      appSlug: params.appSlug,
      email: params.email,
      appName: params.appName,
      objects: mcpObjects,
    });

    // Step 4.1: Update object slug mapping with actual slugs from response
    if (
      createObjectResult &&
      createObjectResult.objects &&
      createObjectResult.objects.length > 0
    ) {
      // Clear the initial mapping and rebuild with actual slugs
      objectSlugMapping.clear();

      createObjectResult.objects.forEach((actualObj: any) => {
        // Find the original object by matching name
        const originalObj = allObjects.find(
          (obj) => obj.name.toLowerCase() === actualObj.name.toLowerCase()
        );
        if (originalObj) {
          objectSlugMapping.set(originalObj.uid, actualObj.slug);
        }
      });
    }

    results.push({
      step: "create_objects",
      status: "success",
      message: `Created ${mcpObjects.length} objects`,
      count: mcpObjects.length,
      actualSlugs: Array.from(objectSlugMapping.entries()).map(
        ([uid, slug]) => ({ uid, slug })
      ),
    });

    // Step 5: Create SOT for all objects that have SOT defined (only regular objects, not masters)
    const allSotData = params.objectsData.objects
      .filter(
        (obj: any) => obj.sot && obj.sot.statuses && obj.sot.statuses.length > 0
      )
      .flatMap((obj: any) => convertSOT(obj, objectSlugMapping));

    // console.log(
    //   `Generated ${allSotData.length} SOT configurations:`,
    //   allSotData
    // );

    if (allSotData.length > 0) {
      await createSot({
        tenantName: params.tenantName,
        baseUrl: params.baseUrl,
        appId: params.appId,
        sotData: allSotData,
      });

      results.push({
        step: "create_sot",
        status: "success",
        message: `Created ${allSotData.length} SOT configurations`,
        count: allSotData.length,
        sotData: allSotData.map((sot) => ({
          object_slug: sot.object_slug,
          status: sot.status.display_name,
          origination_type: sot.origination_type,
        })),
      });
    } else {
      results.push({
        step: "create_sot",
        status: "skipped",
        message: "No SOT configurations found",
      });
    }

    return {
      success: true,
      message: `Objects and SOT created successfully`,
      results,
      attributesValidated: allAttributes.length,
      objectsCreated: mcpObjects.length,
      sotCreated: allSotData.length,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create objects and SOT: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
