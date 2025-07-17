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

export const getAttributes = async (
  baseUrl: string,
  token: string
): Promise<Record<string, any>> => {
  try {
    const client = createClient(baseUrl, token);
    const response = await client.get("/api/v1/core/studio/loco/attributes");

    const attributesArray = response.data.data || [];

    return Object.fromEntries(
      attributesArray.map((obj: any) => [obj.key, obj])
    );
  } catch (error) {
    throw handleError(error);
  }
};
