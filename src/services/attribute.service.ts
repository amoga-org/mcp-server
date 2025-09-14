import { AttributePayload } from "../types/attribute.types.js";
import axios from "axios";

const handleError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const apiError = new Error(
      error.response?.data?.message || error.message
    ) as any;
    apiError.status = error.response?.status;
    throw apiError;
  }
  throw error instanceof Error ? error : new Error(String(error));
};

const createClient = (baseUrl: string, token: string) => {
  return axios.create({
    baseURL: baseUrl,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getUniqueSlug = async (
  baseUrl: string,
  token: string,
  keys: string[]
): Promise<Array<{ slug: string; generated_slug: string }>> => {
  try {
    const client = createClient(baseUrl, token);
    const response = await client.post("/api/v2/work/unique/slug", {
      model: "LocoAttributes",
      fields: "key",
      value: keys,
    });
    return response.data.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const createAttribute = async (
  baseUrl: string,
  token: string,
  attributeData: AttributePayload
): Promise<any> => {
  try {
    const client = createClient(baseUrl, token);
    const response = await client.post(
      "/api/v1/core/studio/loco/attributes",
      attributeData
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateAttribute = async (
  baseUrl: string,
  token: string,
  attributeId: number,
  attributeData: AttributePayload
): Promise<any> => {
  try {
    const client = createClient(baseUrl, token);
    const response = await client.put(
      "/api/v1/core/studio/loco/attributes",
      {
        ...attributeData,
        id: attributeId
      }
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const createAttributeBatch = async (
  baseUrl: string,
  token: string,
  attributes: AttributePayload[]
): Promise<any> => {
  try {
    // First get unique slugs for all attributes
    const keys = attributes.map((attr) => attr.key);
    const slugs = await getUniqueSlug(baseUrl, token, keys);

    // Map slugs to attributes
    const attributesWithSlugs = attributes.map((attr) => {
      const slugInfo = slugs.find((s) => s.slug === attr.key);
      return {
        ...attr,
        key: slugInfo ? slugInfo.generated_slug : attr.key,
      };
    });

    // Create all attributes in parallel
    const creationPromises = attributesWithSlugs.map((attr) =>
      createAttribute(baseUrl, token, attr)
    );

    return Promise.all(creationPromises);
  } catch (error) {
    throw handleError(error);
  }
};

export const createOrUpdateAttributeBatch = async (
  baseUrl: string,
  token: string,
  attributes: AttributePayload[],
  existingAttributes: Record<string, any>,
  appId?: string
): Promise<{ created: any[], updated: any[] }> => {
  try {
    const toCreate: AttributePayload[] = [];
    const toUpdate: { id: number, data: AttributePayload }[] = [];

    // Separate attributes into create and update lists
    for (const attr of attributes) {
      // Find existing attribute by (key OR display_name) AND data_type
      const existingAttr = Object.values(existingAttributes).find(
        (existing: any) => 
          existing.data_type === attr.data_type &&
          (existing.key?.toLowerCase() === attr.key.toLowerCase() ||
           existing.display_name?.toLowerCase() === attr.display_name.toLowerCase())
      );

      if (existingAttr) {
        // Update existing attribute
        toUpdate.push({
          id: existingAttr.id,
          data: {
            ...attr,
            key: existingAttr.key // Keep existing key
          }
        });
      } else {
        // Create new attribute
        toCreate.push(attr);
      }
    }

    // Handle creations
    let created: any[] = [];
    if (toCreate.length > 0) {
      // Get unique slugs for new attributes
      const keys = toCreate.map((attr) => attr.key);
      const slugs = await getUniqueSlug(baseUrl, token, keys);

      // Map slugs to attributes
      const attributesWithSlugs = toCreate.map((attr) => {
        const slugInfo = slugs.find((s) => s.slug === attr.key);
        return {
          ...attr,
          key: slugInfo ? slugInfo.generated_slug : attr.key,
        };
      });

      // Create all attributes in parallel
      const creationPromises = attributesWithSlugs.map((attr) =>
        createAttribute(baseUrl, token, attr)
      );
      created = await Promise.all(creationPromises);
    }

    // Handle updates
    let updated: any[] = [];
    if (toUpdate.length > 0) {
      const updatePromises = toUpdate.map(({ id, data }) =>
        updateAttribute(baseUrl, token, id, data)
      );
      updated = await Promise.all(updatePromises);
    }

    return { created, updated };
  } catch (error) {
    throw handleError(error);
  }
};

export const getAttributes = async (
  baseUrl: string,
  token: string,
  app_id: string
): Promise<Record<string, any>> => {
  try {
    const client = createClient(baseUrl, token);
    let url = app_id
      ? `/api/v1/core/studio/loco/attributes?application_id=${app_id}`
      : "/api/v1/core/studio/loco/attributes";
    const response = await client.get(url);

    const attributesArray = response.data.data || [];

    return Object.fromEntries(
      attributesArray.map((obj: any) => [obj.key, obj])
    );
  } catch (error) {
    throw handleError(error);
  }
};
