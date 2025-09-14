import { AttributePayload } from "../types/attribute.types.js";
import {
  getAttributes,
  createOrUpdateAttributeBatch,
} from "../services/attribute.service.js";
import { getCrmToken } from "../utils/api.js";
import {
  CreateAttributeV2Input,
  validateComponentSubtype,
  getValidationPreset,
  COMPONENT_SUBTYPE_MAP,
} from "../schemas/attribute-v2-schema.js";

// Type metadata mapping for V2
const typeMetaDataV2 = {
  text: {
    string: {
      tj_type: "TextInput",
      type_strapi: "string",
      data_type: "string",
    },
    text: { tj_type: "TextArea", type_strapi: "text", data_type: "string" },
    uuid: {
      tj_type: "TextInput",
      type_strapi: "text",
      strapi_unique: true,
      data_type: "string",
    },
    password: {
      tj_type: "TextInput",
      type_strapi: "password",
      data_type: "string",
    },
    email: {
      tj_type: "TextInput",
      type_strapi: "text",
      validation_type: "email",
      data_type: "string",
    },
    comment: {
      tj_type: "TextArea",
      type_strapi: "text",
      component: "Comment",
      data_type: "string",
    },
    instruction: {
      tj_type: "Instructions",
      type_strapi: "",
      hide: true,
      data_type: "string",
    },
    title: {
      tj_type: "Title",
      type_strapi: "",
      hide: true,
      data_type: "string",
    },
    Container: {
      tj_type: "Container",
      type_strapi: "text",
      hide: true,
      data_type: "string",
    },
    richText: {
      tj_type: "Richtext",
      type_strapi: "json",
      component: "richtext",
      data_type: "richtext",
    },
  },
  enumeration: {
    enumeration: {
      tj_type: "Dropdown",
      type_strapi: "string",
      data_type: "string",
    },
    status: {
      tj_type: "Dropdown",
      type_strapi: "enumeration",
      component: "status",
      data_type: "string",
    },
    priority: {
      tj_type: "Dropdown",
      type_strapi: "enumeration",
      component: "priority",
      data_type: "string",
    },
    multiselect: {
      tj_type: "Multiselect",
      type_strapi: "text",
      data_type: "string",
    },
  },
  user: {
    assignee: {
      tj_type: "Dropdown",
      type_strapi: "string",
      component: "user",
      data_type: "string",
    },
  },
  number: {
    integer: {
      tj_type: "TextInput",
      type_strapi: "integer",
      validation_type: "number",
      data_type: "integer",
    },
    biginteger: {
      tj_type: "TextInput",
      type_strapi: "biginteger",
      validation_type: "number",
      data_type: "biginteger",
    },
    float: {
      tj_type: "TextInput",
      type_strapi: "float",
      validation_type: "decimal",
      data_type: "float",
    },
  },
  boolean: {
    toggle: { tj_type: "Toggle", type_strapi: "boolean", data_type: "boolean" },
    checkbox: {
      tj_type: "Checkbox",
      type_strapi: "boolean",
      data_type: "boolean",
    },
  },
  date: {
    default: {
      tj_type: "Datepicker",
      type_strapi: "datetime",
      component: "Calendar",
      data_type: "datetime",
    },
  },
  media: {
    default: {
      tj_type: "Media",
      type_strapi: "media",
      component: "media",
      data_type: "media",
    },
  },
  map: {
    default: {
      tj_type: "Map",
      type_strapi: "json",
      component: "map",
      data_type: "json",
    },
  },
  segment: {
    default: {
      tj_type: "Dropdown",
      type_strapi: "string",
      component: "segment",
      data_type: "string",
    },
  },
  related_field: {
    default: {
      tj_type: "Dropdown",
      type_strapi: "string",
      component: "Dropdown",
      data_type: "string",
    },
  },
};

// Reserved system attributes
const RESERVED_ATTRIBUTES = new Set([
  "status",
  "priority",
  "due date",
  "Due Date",
  "name",
  "assignee",
  "due_date",
  "dueDate",
]);

const validateAttributesV2 = (
  attributes: Array<{ key: string; display_name: string }>
) => {
  const reservedAttrs = attributes.filter(
    (attr) =>
      RESERVED_ATTRIBUTES.has(attr.key.toLowerCase()) ||
      RESERVED_ATTRIBUTES.has(attr.display_name.toLowerCase())
  );

  if (reservedAttrs.length > 0) {
    throw new Error(
      `Cannot create reserved system attributes: ${reservedAttrs
        .map((attr) => attr.display_name)
        .join(", ")}. These attributes are managed by the system.`
    );
  }
};

export const createAttributeV2Handler = {
  name: "create-attributeV2",
  description:
    "Advanced attribute creation with enhanced metadata support for date calculations, validation presets, and type-specific configurations. " +
    "Supports complex date metadata (absolute, relative, calculative), number formatting, validation presets, and formula fields.",

  async handler(params: CreateAttributeV2Input) {
    try {
      // Validate no reserved attributes
      validateAttributesV2(params.attributes);

      // Validate component subtypes match data types (skip for date type)
      for (const attr of params.attributes) {
        if (attr.data_type !== "date" && attr.component_subtype) {
          if (
            !validateComponentSubtype(attr.data_type, attr.component_subtype)
          ) {
            throw new Error(
              `Invalid component_subtype '${attr.component_subtype}' for data_type '${attr.data_type}'. ` +
                `Valid options are: ${COMPONENT_SUBTYPE_MAP[
                  attr.data_type as keyof typeof COMPONENT_SUBTYPE_MAP
                ]?.join(", ")}`
            );
          }
        }
      }

      // Get token for authentication
      const { token } = await getCrmToken(params.baseUrl, params.tenantName);

      // Get all existing attributes at app/tenant level
      const allAvailableAttributes = await getAttributes(
        params.baseUrl,
        token,
        params.appId || ""
      );

      // Convert V2 attributes to full attribute payloads
      const attributePayloads: AttributePayload[] = params.attributes.map(
        (attr) => {
          // Get metadata based on data_type and component_subtype
          let metadata: any = {};
          const typeCategory =
            typeMetaDataV2[attr.data_type as keyof typeof typeMetaDataV2];

          if (typeCategory) {
            if (
              attr.data_type === "date" ||
              attr.data_type === "media" ||
              attr.data_type === "map" ||
              attr.data_type === "segment" ||
              attr.data_type === "related_field"
            ) {
              metadata = (typeCategory as any).default;
            } else {
              metadata =
                (typeCategory as any)[attr.component_subtype || ""] || {};
            }
          }

          // Build enhanced attribute_meta
          let attributeMeta: any = {
            is_color: false,
            options: [],
            is_dynamic: false,
          };

          // Handle enumeration specific meta
          if (attr.data_type === "enumeration") {
            attributeMeta.is_color = attr.attribute_meta?.is_color ?? true;
            attributeMeta.options = attr.attribute_meta?.options ?? [];
            attributeMeta.is_dynamic = attr.attribute_meta?.is_dynamic ?? false;
          }

          // Handle number specific meta
          if (attr.data_type === "number") {
            if (attr.attribute_meta?.abbreviation !== undefined) {
              attributeMeta.abbreviation = attr.attribute_meta.abbreviation;
            }
            if (attr.attribute_meta?.thousands_separator !== undefined) {
              attributeMeta.thousands_separator =
                attr.attribute_meta.thousands_separator;
            }
            if (attr.attribute_meta?.currency !== undefined) {
              attributeMeta.currency = attr.attribute_meta.currency;
              if (attr.attribute_meta.currency_symbol) {
                attributeMeta.currency_symbol =
                  attr.attribute_meta.currency_symbol;
              }
            }
            if (attr.attribute_meta?.decimal_places !== undefined) {
              attributeMeta.decimal_places = attr.attribute_meta.decimal_places;
            }
          }

          // Handle formula
          if (attr.attribute_meta?.is_formula) {
            attributeMeta.is_formula = true;
            attributeMeta.formula = attr.attribute_meta.formula || "";
          }

          // Handle autocorrection
          if (attr.attribute_meta?.is_autocorrection) {
            attributeMeta.is_autocorrection = true;
            attributeMeta.autocorrection_attribute =
              attr.attribute_meta.autocorrection_attribute || "";
            attributeMeta.autocorrection_object =
              attr.attribute_meta.autocorrection_object || "";
          }

          // Handle validation
          if (attr.attribute_meta?.is_validation) {
            attributeMeta.is_validation = true;

            // Check if using validation suggestion preset
            if (attr.attribute_meta.validation_suggestion) {
              const preset = getValidationPreset(
                attr.attribute_meta.validation_suggestion
              );
              if (preset) {
                attributeMeta.regex = preset.regex;
                attributeMeta.message = preset.message;
                attributeMeta.validation_suggestion = preset.key;
              }
            } else {
              // Use custom regex and message
              attributeMeta.regex = attr.attribute_meta.regex || "";
              attributeMeta.message = attr.attribute_meta.message || "";
            }
          }

          // Handle related field configuration
          if (
            attr.data_type === "related_field" &&
            attr.attribute_meta?.related_objects_configuration
          ) {
            attributeMeta.related_objects_configuration =
              attr.attribute_meta.related_objects_configuration;
          }

          // Determine validation type based on component subtype
          let validationType = metadata.validation_type || "";
          if (attr.component_subtype === "email") {
            validationType = "email";
          } else if (attr.data_type === "number" && attr.component_subtype) {
            validationType =
              attr.component_subtype === "float" ? "decimal" : "number";
          }

          return {
            tj_type: metadata.tj_type || "",
            background_color: "",
            border_radius: "",
            component: metadata.component || "",
            data_type: metadata.data_type || attr.data_type,
            component_type: attr.component_type,
            component_subtype:
              attr.data_type === "date" ? "" : attr.component_subtype || "", // Empty for date type
            default_value: attr.default_value || "",
            display_name: attr.display_name,
            disposition: "",
            hide: attr.hide || metadata.hide || false,
            instruction_text: "",
            is_editable: attr.is_editable ?? true,
            key: attr.key,
            meta_data: attr.data_type === "date" ? attr.meta_data || {} : {},
            metadata_strapi: {},
            rank: null,
            required_strapi: attr.is_required || false,
            resized: true,
            strapi_unique: attr.is_unique || metadata.strapi_unique || false,
            text_color: "",
            tj_disabled: attr.is_disabled || false,
            tj_isrequired: attr.is_required || false,
            tj_metadata: {},
            tj_visibility: !attr.hide,
            type_strapi: metadata.type_strapi || "",
            ui_header_align: "left",
            validation_data: "",
            validation_type: validationType,
            width: "200",
            master_slug: "",
            is_encrypted: attr.is_encrypted || false,
            is_primary: false,
            attribute_of: "",
            is_auditable: attr.is_auditable || false,
            attribute_meta: attributeMeta,
            is_global: false,
            is_default: false, // Additional property
            is_internal: false, // Additional property
            application: params.appId || null,
            related_objects_configuration:
              attr.data_type === "related_field"
                ? attr.attribute_meta?.related_objects_configuration || []
                : [],
          };
        }
      );

      // Use the new createOrUpdate function
      const result = await createOrUpdateAttributeBatch(
        params.baseUrl,
        token,
        attributePayloads,
        allAvailableAttributes,
        params.appId
      );

      return {
        success: true,
        message: `Successfully processed attributes. Created: ${result.created.length}, Updated: ${result.updated.length}`,
        created: result.created.map((attr: any) => ({
          display_name: attr.display_name,
          key: attr.key,
          data_type: attr.data_type,
        })),
        updated: result.updated.map((attr: any) => ({
          display_name: attr.display_name,
          key: attr.key,
          data_type: attr.data_type,
        })),
        data: {
          created: result.created,
          updated: result.updated,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      const errorStatus = (error as any)?.status;
      return {
        success: false,
        error: errorMessage,
        status: errorStatus,
      };
    }
  },
};
