import { getAppContract, getCrmToken } from "../services/app.service.js";
import axios from "axios";
import { z } from "zod";
import { DummyDataSchema } from "../schemas/dummy-data-schema.js";

type DummyDataParams = z.infer<typeof DummyDataSchema>;

interface DummyRecord {
  name: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  attributes: { [key: string]: string | number | boolean | Date | null };
}

interface ContractAttribute {
  key: string;
  display_name: string;
  component_type: string;
  component_subtype?: string;
  attribute_meta?: {
    options?: Array<{
      slug: string;
      display_name: string;
      color?: string;
      rank?: number;
    }>;
  };
}

interface ContractStatus {
  name: string;
  amo_name?: string;
  color: string;
}

interface ContractObject {
  name: string;
  slug: string;
  attributes: ContractAttribute[];
  status?: ContractStatus[];
}

// Helper function to generate dummy values based on component type and subtype
function generateDummyValue(
  componentType: string,
  componentSubtype?: string,
  attribute?: ContractAttribute,
  contractJson?: {
    contract_json?: {
      objects: ContractObject[];
    };
  },
  targetObject?: ContractObject
): string | number | boolean | null {
  switch (componentType) {
    case "text":
      switch (componentSubtype) {
        case "email":
          const domains = ["example.com", "test.com", "dummy.org"];
          const randomDomain =
            domains[Math.floor(Math.random() * domains.length)];
          return `user${Math.floor(Math.random() * 1000)}@${randomDomain}`;
        case "uuid":
          return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
              const r = (Math.random() * 16) | 0;
              return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
            }
          );
        case "password":
          return "DummyPass" + Math.floor(Math.random() * 1000);
        case "richText":
          return `Sample ${
            attribute?.display_name || "content"
          } for testing purposes. This is an AI-generated text that provides meaningful context based on the attribute name and type.`;
        case "instruction":
          return `Instructions for ${
            attribute?.display_name || "this field"
          }. Please follow these guidelines when working with this item.`;
        default:
          // Use attribute display name for more contextual text generation
          const contextWords = attribute?.display_name?.split(" ") || [];
          const baseWords = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"];
          const words = contextWords.length > 0 ? contextWords : baseWords;
          return `${
            words[Math.floor(Math.random() * words.length)]
          } ${Math.floor(Math.random() * 1000)}`;
      }

    case "number":
      switch (componentSubtype) {
        case "integer":
          return Math.floor(Math.random() * 100);
        case "biginteger":
          return Math.floor(Math.random() * 1000000);
        case "float":
          return (Math.random() * 100).toFixed(2);
        default:
          return Math.floor(Math.random() * 100);
      }

    case "boolean":
      return Math.random() > 0.5;

    case "date":
      // Generate a random date within the last 30 days
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      const randomTimestamp =
        thirtyDaysAgo.getTime() +
        Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
      return new Date(randomTimestamp).toISOString();

    case "enumeration":
      // Use the actual enum values from the attribute if available
      if (
        attribute &&
        attribute.attribute_meta &&
        Array.isArray(attribute.attribute_meta.options) &&
        attribute.attribute_meta.options.length > 0
      ) {
        const options = attribute.attribute_meta.options;
        const option = options[Math.floor(Math.random() * options.length)];
        if (option) {
          return option.slug || option.display_name;
        }
      }
      // For status, use the status values from the contract
      if (
        attribute?.key === "status" &&
        targetObject &&
        targetObject.status &&
        targetObject.status.length > 0
      ) {
        const statusOption =
          targetObject.status[
            Math.floor(Math.random() * targetObject.status.length)
          ];
        return statusOption.amo_name || statusOption.name;
      }
      // For priority, use standard priority values
      if (attribute?.key === "priority") {
        const priorities = ["urgent", "high", "normal", "low"];
        return priorities[Math.floor(Math.random() * priorities.length)];
      }
      // Fallback to default enum values
      const defaultEnumValues = ["Option 1", "Option 2", "Option 3"];
      return defaultEnumValues[
        Math.floor(Math.random() * defaultEnumValues.length)
      ];
    default:
      return `Default value for ${attribute?.display_name || "this field"}`;
  }
}

function generateContextualName(
  objectType: string,
  index: number,
  contractObject: ContractObject
): string {
  const currentYear = new Date().getFullYear();
  const prefix = contractObject.name.charAt(0).toUpperCase();

  switch (objectType.toLowerCase()) {
    case "task":
    case "ticket":
    case "issue":
      return `${prefix}-${currentYear}${index.toString().padStart(4, "0")}`;

    case "project":
      return `${prefix}RJ-${currentYear}-${index.toString().padStart(3, "0")}`;

    default:
      const displayName = contractObject.name.replace(
        /([a-z])([A-Z])/g,
        "$1 $2"
      );
      return `${displayName} ${currentYear}-${index
        .toString()
        .padStart(3, "0")}`;
  }
}

function getValidStatus(contractObject: ContractObject): string {
  if (!contractObject.status?.length) return "todo";

  // Prefer status with amo_name
  const statusWithAmo = contractObject.status.find((s) => s.amo_name);
  if (statusWithAmo) return statusWithAmo.amo_name!;

  // Fall back to first status name
  return contractObject.status[0].name;
}

function getPriorityBasedOnContext(objectType: string, record: any): string {
  const priorities = ["urgent", "high", "normal", "low"];

  // Set priority based on context
  if (record.status?.toLowerCase().includes("complete")) {
    return "normal";
  }

  if (objectType.toLowerCase().includes("bug")) {
    return Math.random() > 0.3 ? "urgent" : "high";
  }

  return priorities[Math.floor(Math.random() * priorities.length)];
}

function generateAttributeValue(
  attribute: ContractAttribute
): string | number | boolean | Date | null {
  const { component_type, component_subtype, attribute_meta } = attribute;

  switch (component_type) {
    case "text":
      if (component_subtype === "email") {
        return `test${Math.floor(Math.random() * 1000)}@example.com`;
      }
      return `Sample ${attribute.display_name}`;

    case "number":
      return Math.floor(Math.random() * 100);

    case "boolean":
      return Math.random() > 0.5;

    case "date":
      return new Date().toISOString();

    case "enumeration":
      if (attribute_meta?.options?.length) {
        const option =
          attribute_meta.options[
            Math.floor(Math.random() * attribute_meta.options.length)
          ];
        return option.slug;
      }
      return "default";

    default:
      return `Default value for ${attribute.display_name}`;
  }
}

export const createDummyDataHandler = {
  name: "add-dummy-data",
  description: "Add AI-generated dummy data to tables based on object schema",
  parameters: DummyDataSchema,
  async handler(params: DummyDataParams) {
    try {
      // Get authorization token
      const { token } = await getCrmToken(params.baseUrl, params.tenantName);
      const authToken = `Bearer ${token}`;

      // Get app contract and validate object
      const contractJson = await getAppContract({
        baseUrl: params.baseUrl,
        tenantName: params.tenantName,
        appId: params.appId,
      });

      const contractObjects = contractJson?.contract_json?.objects || [];
      const targetObject = contractObjects.find(
        (obj: ContractObject) =>
          obj.slug === params.objectSlug || obj.name === params.objectSlug
      );

      if (!targetObject) {
        throw new Error(`Object with slug '${params.objectSlug}' not found`);
      }

      const count = params.count || 10;
      const results = [];

      // Use provided record list or generate new records
      const recordsToCreate =
        params.recordList ||
        Array.from({ length: count }, (_, i) => {
          const baseRecord: DummyRecord = {
            name: generateContextualName(
              targetObject.name,
              i + 1,
              targetObject
            ),
            status: getValidStatus(targetObject),
            priority: getPriorityBasedOnContext(targetObject.name, {}),
            dueDate: new Date(
              Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            attributes: {},
          };

          // Generate values for custom attributes
          targetObject.attributes.forEach((attr: ContractAttribute) => {
            if (
              !["status", "priority", "Due Date", "name", "assignee"].includes(
                attr.key
              )
            ) {
              baseRecord.attributes[attr.key] = generateAttributeValue(attr);
            }
          });

          return baseRecord;
        });

      // Create records
      for (const record of recordsToCreate) {
        const recordData: Record<
          string,
          string | number | boolean | Date | null
        > = {};

        // Add system fields
        recordData[`${params.objectSlug}__name`] = record.name || "Untitled";
        recordData[`${params.objectSlug}__status`] = record.status || "toDo";
        recordData[`${params.objectSlug}__priority`] = record.priority || "low";
        recordData[`${params.objectSlug}__dueDate`] =
          record.dueDate || new Date().toISOString();

        // Add custom attributes
        if (record.attributes) {
          Object.entries(record.attributes).forEach(([key, value]) => {
            recordData[`${params.objectSlug}__${key}`] = value;
          });
        }

        const payload = {
          parentCategory: null,
          category: params.objectSlug,
          data: recordData,
          parent_instance_id: "",
          workflow_instance_id: null,
          notify: true,
        };

        try {
          const response = await axios.post(
            `https://${params.tenantName}.amoga.app/api/v2/create/object/flow/${params.appId}?sync=true`,
            payload,
            {
              headers: {
                Authorization: authToken,
                "Content-Type": "application/json",
              },
            }
          );

          results.push({
            success: true,
            recordId: record.name,
            data: response.data,
          });
        } catch (err) {
          results.push({
            success: false,
            recordId: record.name,
            error:
              err instanceof Error ? err.message : "Failed to insert record",
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      return {
        success: successCount > 0,
        message: `Successfully inserted ${successCount} out of ${recordsToCreate.length} records for ${params.objectSlug}`,
        results,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || error.message,
          status: error.response?.status,
        };
      }
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate dummy data",
        status: 500,
      };
    }
  },
};
