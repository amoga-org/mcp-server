import {
  appPayload,
  formatLocoName,
  get_default_attributes,
  getDefaultPriorities,
  getDefaultStatuses,
} from "./helper.js";
import { v4 as uuidv4 } from "uuid";

const isValidHexColor = (color) =>
  /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
const defaultStatusColor = "#94A3B8";

const getCrmToken = async (baseUrl, tenantName) => {
  const apiKey = process.env.MCP_API_KEY;
  const response = await fetch(
    `${baseUrl}/api/v1/core/studio/get/tenant/coreapp?name=${tenantName}`,
    {
      headers: {
        "API-KEY": apiKey,
        "content-type": "application/json",
      },
    }
  );
  const data = await response.json();
  return { coreApp: data.data.core_app, token: data.data.token };
};

async function getAttributes(baseUrl, token) {
  const url = `${baseUrl}/api/v1/core/studio/loco/attributes`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch attributes: ${response.statusText}`);
  }

  const responseData = await response.json();
  const attributesArray = responseData.data || [];

  return Object.fromEntries(
    attributesArray.map(function (obj) {
      return [obj.key, obj];
    })
  );
}

export const createAppPayload = async (
  tenantName,
  baseUrl,
  appName,
  amo_application_id
) => {
  const { token } = await getCrmToken(baseUrl, tenantName);
  const createAppResponse = await fetch(
    `${baseUrl}/api/v1/core/studio/create/loco/application`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(appPayload(appName)),
    }
  );

  const appData = await createAppResponse.json();
  const appId = appData.data.uuid;
  const appSlug = appData.data.slug;
  return { appId, appSlug };
};

export const getAllApps = async (baseUrl, tenantName) => {
  const { token } = await getCrmToken(baseUrl, tenantName);
  const response = await fetch(`${baseUrl}/api/v1/core/studio/apps`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch apps: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || []; // return list of apps
};

export const deleteAppPayload = async (tenantName, baseUrl, appId) => {
  const { token } = await getCrmToken(baseUrl, tenantName);
  const response = await fetch(
    `${baseUrl}/api/v1/work/loco/application/delete?app_id=${appId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete app: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
};

export const getAppContract = async (baseUrl, tenantName, appId) => {
  const { token } = await getCrmToken(baseUrl, tenantName);
  const response = await fetch(
    `${baseUrl}/api/v1/core/studio/contract/view/${appId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch app contract: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
};

export const createSotData = async (
  baseUrl,
  tenantName,
  appId,
  sotData,
  contractJson
) => {
  const { token } = await getCrmToken(baseUrl, tenantName);
  // Validate that all object_slugs in sotData exist in the contract
  const contractObjects = contractJson.objects || [];
  const validObjectSlugs = new Set(contractObjects.map((obj) => obj.slug));

  for (const sot of sotData) {
    // if (!validObjectSlugs.has(sot.object_slug)) {
    //   throw new Error(
    //     `Invalid object_slug: ${sot.object_slug}. Must be one of: ${Array.from(
    //       validObjectSlugs
    //     ).join(", ")}`
    //   );
    // }

    // Validate that status exists for the given object
    const targetObject = contractObjects.find(
      (obj) => obj.slug === sot.object_slug
    );
    const validStatuses = new Set(
      (targetObject?.status || []).map((s) => s.slug)
    );

    // if (!validStatuses.has(sot.status.slug)) {
    //   throw new Error(
    //     `Invalid status slug '${sot.status.slug}' for object '${
    //       sot.object_slug
    //     }'. Valid statuses are: ${Array.from(validStatuses).join(", ")}`
    //   );
    // }
  }

  // Get existing modeling_data or initialize empty
  const existingModelingData = contractJson.modeling_data || {};
  const existingSots = existingModelingData.data || [];

  // Add new SOTs with UUIDs while preserving existing ones
  const newSots = sotData.map((sot) => ({
    ...sot,
    id: uuidv4(), // Use provided ID or generate new UUID
  }));

  // Combine existing and new SOTs
  const updatedSots = [...existingSots, ...newSots];

  // Prepare the updated contract with modeling_data
  const updatedContract = {
    modeling_data: {
      data: updatedSots,
    },
  };

  // Update the contract with new SOT data
  const response = await fetch(
    `${baseUrl}/api/v1/core/studio/contract/app_meta/${appId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ...updatedContract,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update SOT data: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
};

export const createAppContract = async (
  baseUrl,
  tenantName,
  objects,
  appSlug,
  appId,
  email,
  appName
) => {
  const { token } = await getCrmToken(baseUrl, tenantName);

  // First get all available attributes
  const allAvailableAttributes = await getAttributes(baseUrl, token);

  // 2. Generate slugs for the objects
  const slugResponse = await fetch(
    `${baseUrl}/api/v1/core/studio/generate/unique/slug`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "LocoWorkitems",
        fields: "slug",
        value: objects.map((obj) => obj.name),
      }),
    }
  );

  const slugData = await slugResponse.json();
  const slugList = slugData.data;

  // 3. Create the objects with their attributes and relationships
  const createdObjects = [];
  const forms_data = [];

  for (const slugInfo of slugList) {
    const objectDef = objects.find((obj) => obj.name === slugInfo.slug);
    if (!objectDef) continue;
    let form_blacklist = [
      "amo_created_at",
      "amo_updated_at",
      "updated_by",
      "created_by",
    ];
    // Get default attributes for this object type
    let def_attributes = get_default_attributes();

    // Combine default attributes with object-specific attributes
    const attriIds = Array.from(
      new Set([
        ...(def_attributes[objectDef.type] || []),
        ...(objectDef.attributes || []).map((attr) => {
          const matchingAttr = Object.values(allAvailableAttributes).find(
            (a) =>
              a.display_name.toLowerCase() === attr.display_name.toLowerCase()
          );
          return matchingAttr ? matchingAttr.key : attr.key;
        }),
      ])
    );
    // Create combined attributes object with both existing and new
    const indexed_attributes = {
      ...allAvailableAttributes,
      ...Object.fromEntries(
        (
          (objectDef.attributes &&
            objectDef.attributes.length > 0 &&
            objectDef.attributes) ||
          []
        ).map((obj) => {
          // Check if attribute already exists in available attributes
          const existingAttr = Object.values(allAvailableAttributes).find(
            (a) =>
              a.display_name.toLowerCase() === obj.display_name.toLowerCase()
          );
          return [
            existingAttr ? existingAttr.key : obj.key,
            existingAttr || obj,
          ];
        })
      ),
    };
    const form = [];
    attriIds.forEach((attr_key, idx) => {
      const data = indexed_attributes[attr_key];
      if (
        data &&
        attr_key &&
        !data.is_internal &&
        !form_blacklist.includes(attr_key)
      ) {
        form.push({
          key: attr_key,
          rank: idx + 1,
          object_slug: slugInfo.generated_slug,
          attribute_key: data.key,
          object_display_name: objectDef.name,
          attribute_display_name: data.display_name,
        });
      }
    });
    const attributes = attriIds
      .map((key, idx) => {
        if (!key) return null;
        return {
          key,
          rank: idx,
          parent: "",
          hide: false,
        };
      })
      .filter(Boolean);
    // Create the basic object structure
    const newObject = {
      name: objectDef.name,
      slug: slugInfo.generated_slug,
      type: objectDef.type,
      application_id: appId,
      attributes: attributes || [],
      icon: {
        svg: "memo",
        color: "#5f6368",
        style: "solid",
        version: 1,
      },
      relationship: [],
      maps: {
        status: [],
        priority: getDefaultPriorities().map((p) => ({
          ...p,
          slug: `${slugInfo.generated_slug}__${p.loco_name}`,
        })),
      },
      application_name: appName,
    };
    //form creation
    forms_data.push({
      form: form || [],
      name: objectDef.name,
      slug: slugInfo.generated_slug,
    });
    // Add statuses
    if (objectDef.status && objectDef.status.length > 0) {
      newObject.maps.status = objectDef.status.map((status, index) => {
        // Validate or convert color to hex
        let statusColor = status.color || defaultStatusColor;
        if (statusColor && !isValidHexColor(statusColor)) {
          // If it's not a valid hex color, use the default
          statusColor = defaultStatusColor;
        }

        return {
          color: statusColor,
          amo_name: status.amo_name,
          loco_name: formatLocoName(status.name),
          is_default: index === 0,
          display_name: status.name,
          rank: index + 1,
          slug: `${slugInfo.generated_slug}__${formatLocoName(status.name)}`,
        };
      });
    } else {
      newObject.maps.status = getDefaultStatuses().map((s) => ({
        ...s,
        slug: `${slugInfo.generated_slug}__${s.loco_name}`,
      }));
    }

    // Add relationships if any
    if (objectDef.relationship && objectDef.relationship.length > 0) {
      newObject.relationship = objectDef.relationship.map((rel) => ({
        id: uuidv4(),
        source_object_slug: newObject.slug,
        source_app_id: appId,
        destination_object_slug: formatLocoName(rel.name),
        destination_display_name: rel.name,
        relation_type: rel.relationship_type,
        is_external: false,
      }));
    }

    createdObjects.push(newObject);
  }

  // 4. Save the contract with the new objects
  const contractResponse = await fetch(
    `${baseUrl}/api/v1/core/studio/contract/app_meta/${appId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        contract_json: {
          application_id: appId,
          application_name: appName,
          description: "",
          cover_image: "",
          icon: {
            svg: "memo",
            color: "#5f6368",
            style: "solid",
            version: 1,
          },
          tags: [],
          slug: appSlug,
          objects: createdObjects,
          modeling_data: {
            data: [],
          },
        },
        forms: forms_data,
        actions: [],
      }),
    }
  );
  const data = await contractResponse.json();
  return data.data;
};
