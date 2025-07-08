import { AttributePayload } from "../types/attribute.types.js";
import {
  createAttributeBatch,
  getAttributes,
} from "../services/attribute.service.js";
import { getCrmToken } from "../utils/api.js";

const typeMetaData = {
  enumeration: [
    {
      label: "Enumeration",
      value: "enumeration",
      title: "Single Select",
      tj_type: "Dropdown",
      component: "Input",
      type_strapi: "string",
      strapi_unique: false,
      data_type: "string",
      validation_type: "",
    },
    {
      label: "Status",
      value: "status",
      title: "Status",
      tj_type: "Dropdown",
      component: "status",
      type_strapi: "enumeration",
      strapi_unique: false,
      data_type: "string",
      validation_type: "",
    },
    {
      label: "Priority",
      value: "priority",
      title: "Priority",
      tj_type: "Dropdown",
      component: "priority",
      type_strapi: "enumeration",
      strapi_unique: false,
      data_type: "string",
      validation_type: "",
    },
    {
      label: "Multi Select",
      value: "multiselect",
      title: "Multi Select",
      tj_type: "Multiselect",
      component: "Input",
      type_strapi: "text",
      strapi_unique: false,
      data_type: "string",
      validation_type: "",
    },
  ],
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
      desc: "",
      type_strapi: "text",
      strapi_unique: false,
      validation_type: "",
      tj_type: "TextArea",
    },
    {
      label: "UUID",
      value: "uuid",
      title: "UUID",
      desc: "",
      type_strapi: "text",
      strapi_unique: true,
      validation_type: "",
      tj_type: "TextInput",
    },
    {
      label: "Password",
      value: "password",
      title: "Password",
      desc: "",
      type_strapi: "password",
      strapi_unique: false,
      validation_type: "",
      tj_type: "TextInput",
    },
    {
      label: "Email",
      value: "email",
      title: "Email",
      desc: "",
      type_strapi: "text",
      strapi_unique: false,
      validation_type: "email",
      tj_type: "TextInput",
    },
    {
      label: "Comment",
      value: "comment",
      title: "Comment",
      type_strapi: "text",
      strapi_unique: false,
      tj_type: "TextArea",
      component: "Comment",
      data_type: "string",
      validation_type: "",
    },
    {
      label: "Instruction",
      value: "instruction",
      title: "Instruction",
      type_strapi: "",
      strapi_unique: false,
      tj_type: "Instructions",
      component: "",
      hide: true,
      validation_type: "",
    },
    {
      label: "Title",
      value: "title",
      title: "Title",
      type_strapi: "",
      strapi_unique: false,
      tj_type: "Title",
      component: "",
      hide: true,
      validation_type: "",
    },
    {
      label: "Container",
      value: "Container",
      title: "Container",
      type_strapi: "text",
      strapi_unique: false,
      tj_type: "Container",
      component: "Input",
      data_type: "string",
      validation_type: "",
      hide: true,
    },
    {
      label: "Rich Text",
      value: "richText",
      title: "Rich Text",
      type_strapi: "json",
      strapi_unique: false,
      tj_type: "Richtext",
      component: "richtext",
      data_type: "richtext",
      validation_type: "",
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
      label: "Big integer",
      value: "biginteger",
      title: "Big integer",
      type_strapi: "biginteger",
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
    {
      label: "Checkbox",
      value: "checkbox",
      title: "Checkbox",
      type_strapi: "boolean",
      strapi_unique: false,
      validation_type: "",
      tj_type: "Checkbox",
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
};

// Reserved system attributes that cannot be created
const RESERVED_ATTRIBUTES = new Set([
  "status",
  "priority",
  "Due Date",
  "name",
  "assignee",
  "due_date", // Alternative format
  "dueDate", // Alternative format
  "task_type",
]);

const validateAttributes = (
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

type HandlerParams = {
  baseUrl: string;
  tenantName: string;
  attributes: Array<{
    display_name: string;
    component_type: "enumeration" | "text" | "number" | "boolean" | "date";
    component_subtype: string;
    key: string;
  }>;
};

export const createAttributeHandler = {
  name: "mcp_create-attribute",
  description: "Create a new attribute with automatic slug generation",
  parameters: {
    type: "object",
    properties: {
      baseUrl: {
        type: "string",
        format: "uri",
        description: "The base URL of the backend system",
      },
      tenantName: {
        type: "string",
        description: "The tenant name",
      },
      attributes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            display_name: { type: "string" },
            component_type: {
              type: "string",
              enum: ["enumeration", "text", "number", "boolean", "date"],
            },
            component_subtype: { type: "string" },
            key: { type: "string" },
          },
          required: [
            "display_name",
            "component_type",
            "component_subtype",
            "key",
          ],
        },
      },
    },
    required: ["baseUrl", "tenantName", "attributes"],
  },
  async handler(params: HandlerParams) {
    try {
      // Validate no reserved attributes are being created
      validateAttributes(params.attributes);

      // Get token for authentication
      const { token } = await getCrmToken(params.baseUrl, params.tenantName);

      // Get all existing attributes at tenant level
      const allAvailableAttributes = await getAttributes(params.baseUrl, token);

      // Filter out attributes that already exist
      const attributesToCreate = params.attributes.filter((attr) => {
        const existsInTenant = Object.keys(allAvailableAttributes).some(
          (existingKey) =>
            existingKey.toLowerCase() === attr.key.toLowerCase() ||
            allAvailableAttributes[existingKey]?.display_name?.toLowerCase() ===
              attr.display_name.toLowerCase()
        );

        if (existsInTenant) {
          return false;
        }

        return true;
      });

      // If no attributes to create, return early
      if (attributesToCreate.length === 0) {
        return {
          success: true,
          message:
            "All attributes already exist at tenant level. No new attributes created.",
          skipped: params.attributes.map((attr) => ({
            display_name: attr.display_name,
            key: attr.key,
            reason: "Already exists at tenant level",
          })),
          data: [],
        };
      }

      // Convert input attributes to full attribute payloads using metadata
      const attributePayloads: AttributePayload[] = attributesToCreate.map(
        (attr) => {
          // Find the metadata based on component_type and component_subtype
          let metadata: any = {};

          if (attr.component_type === "date") {
            metadata = typeMetaData.date;
          } else {
            const typeCategory = typeMetaData[attr.component_type];
            if (Array.isArray(typeCategory)) {
              const foundMetadata = typeCategory.find(
                (item) => item.value === attr.component_subtype
              );
              if (foundMetadata) {
                metadata = foundMetadata;
              }
            }
          }

          return {
            tj_type: metadata.tj_type || "",
            background_color: "",
            border_radius: "",
            component: metadata.component || "",
            data_type: metadata.data_type || "",
            component_type: attr.component_type,
            component_subtype: metadata.value || attr.component_subtype,
            default_value: "",
            display_name: attr.display_name,
            disposition: "",
            hide: metadata.hide || false,
            instruction_text: "",
            is_editable: true,
            key: attr.key,
            meta_data: attr.component_type === "date" ? metadata : {},
            metadata_strapi: {},
            rank: null,
            required_strapi: false,
            resized: true,
            strapi_unique: metadata.strapi_unique || false,
            text_color: "",
            tj_disabled: false,
            tj_isrequired: false,
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
            is_auditable: false,
            attribute_meta: {
              is_color: true,
              options: [],
              is_dynamic: false,
            },
            is_global: false,
          };
        }
      );

      const result = await createAttributeBatch(
        params.baseUrl,
        token,
        attributePayloads
      );

      // Calculate skipped attributes for reporting
      const skippedAttributes = params.attributes.filter((attr) => {
        return !attributesToCreate.some(
          (toCreate) => toCreate.key === attr.key
        );
      });

      return {
        success: true,
        message: `Successfully created ${attributesToCreate.length} attribute(s). ${skippedAttributes.length} attribute(s) already existed and were skipped.`,
        created: attributesToCreate.map((attr) => ({
          display_name: attr.display_name,
          key: attr.key,
          component_type: attr.component_type,
          component_subtype: attr.component_subtype,
        })),
        skipped: skippedAttributes.map((attr) => ({
          display_name: attr.display_name,
          key: attr.key,
          reason: "Already exists at tenant level",
        })),
        data: result,
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
