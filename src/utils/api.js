import {
  appPayload,
  defaultPermission,
  formatLocoName,
  get_default_attributes,
  getDefaultPriorities,
  getDefaultStatuses,
} from "./helper.js";
import { v4 as uuidv4 } from "uuid";
import { widgets } from "./config/widgts.js";
const isValidHexColor = (color) =>
  /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
const defaultStatusColor = "#94A3B8";
const rolesPermissions = (objects, roleName, slug) => {
  let loco_permission = Object.assign(
    {},
    ...objects.map((item) => {
      return { [item.slug]: defaultPermission };
    })
  );
  let permission_level = Object.assign(
    {},
    ...objects.map((item) => {
      return { [item.slug]: 40 };
    })
  );
  return {
    [slug]: {
      loco_role: slug,
      display_name: roleName,
      loco_permission: loco_permission,
      permission_level: permission_level,
      mapped_job_titles: [],
    },
  };
};
const createPageV1 = async (baseUrl, token, data) => {
  try {
    const response = await fetch(`${baseUrl}/api/v1/core/page`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    // if (!response.ok) throw result;
    return result;
  } catch (error) {
    throw error;
  }
};

const updateMappedWidget = async (baseUrl, token, pageId, data) => {
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
    const result = await response.json();
    console.log("resultresult", result);
    if (!response.ok) throw result;
    return result;
  } catch (error) {
    throw error;
  }
};
const handleUsePageTemplate = async (baseUrl, token, pageData) => {
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
  }
};

export const getCrmToken = async (baseUrl, tenantName) => {
  let apikey = process.env.MCP_API_KEY;
  if (!apikey) {
    throw new Error("API Key is required in configuration");
  }
  try {
    const response = await fetch(
      `${baseUrl}/api/v1/core/studio/get/tenant/coreapp?name=${tenantName}`,
      {
        headers: {
          "API-KEY": apikey,
          "content-type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.data?.token) {
      throw new Error("Token not found in response");
    }
    return { coreApp: data.data.core_app, token: data.data.token };
  } catch (error) {
    console.error("Error getting CRM token:", error);
    throw error;
  }
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

  let pageDetails = [];
  for (const sot of sotData) {
    if (sot.origination_type == "page") {
      let updatedWidgets = [];
      if (sot.widgets && Array.isArray(sot.widgets)) {
        sot.widgets.map((el) => {
          let { configs, ...rest } = widgets[el.type || "button"];
          let { grid_props } = configs;
          updatedWidgets.push({
            configs: {
              ...configs,
              grid_props: {
                ...el.grid_props,
                ...grid_props,
                i: uuidv4(),
              },
            },
            ...rest,
            id: uuidv4(),
          });
        });
        pageDetails.push({
          application_id: appId,
          display_name: sot.origination.display_name,
          mode: "create",
          name: sot.origination.display_name,
          object_slug: sot.object_slug,
          show_header: true,
          type: sot?.origination?.type || "record",
          widgets: updatedWidgets,
        });
      }
    }
  }
  pageDetails.map(async (el) => {
    await handleUsePageTemplate(baseUrl, token, el);
  });

  // Get existing modeling_data or initialize empty
  const existingModelingData = contractJson.modeling_data || {};
  const existingSots = existingModelingData.data || [];

  // Add new SOTs with UUIDs while preserving existing ones
  const newSots = sotData.map((sot) => {
    const newSot = { ...sot, id: uuidv4() };
    if (newSot.widgets) {
      delete newSot.widgets;
    }
    return newSot;
  });

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

  // Get existing contract to check for existing objects
  const existingContract = await getAppContract(baseUrl, tenantName, appId);
  const existingObjects = existingContract?.contract_json?.objects || [];
  const existingObjectsBySlug = new Map(
    existingObjects.map((obj) => [obj.slug, obj])
  );

  // Add validation function for relationships
  const validateRelationships = (objects) => {
    // Track task-workitem relationships to enforce one-to-one constraint
    const taskRelationships = new Map();

    objects.forEach((obj) => {
      if (!obj.relationship || obj.relationship.length === 0) return;

      switch (obj.type) {
        case "workitem":
          obj.relationship = obj.relationship.filter((rel) => {
            const targetObj = objects.find((o) => o.name === rel.name);
            return (
              targetObj?.type === "task" &&
              rel.relationship_type === "oneToMany"
            );
          });
          break;

        case "task":
          // Only allow one relationship with workitem
          const workitemRels = obj.relationship.filter((rel) => {
            const targetObj = objects.find((o) => o.name === rel.name);
            return (
              targetObj?.type === "workitem" &&
              rel.relationship_type === "manyToOne"
            );
          });

          // Take only the first workitem relationship if multiple exist
          obj.relationship = workitemRels.slice(0, 1);

          // Track this relationship
          if (obj.relationship.length > 0) {
            taskRelationships.set(obj.name, obj.relationship[0].name);
          }
          break;

        case "master":
          const masterObjects = objects.filter((o) => o.type === "master");
          const hasTwoMasterObjects = masterObjects.length >= 2;

          if (hasTwoMasterObjects) {
            obj.relationship = obj.relationship.filter((rel) => {
              const targetObj = objects.find((o) => o.name === rel.name);
              return (
                targetObj?.type === "master" &&
                (rel.relationship_type === "oneToMany" ||
                  rel.relationship_type === "manyToOne")
              );
            });
          } else {
            obj.relationship = [];
          }
          break;

        default:
          obj.relationship = [];
      }
    });

    return { objects, taskRelationships };
  };

  // Validate relationships before processing
  const { objects: validatedObjects, taskRelationships } =
    validateRelationships(objects);
  objects = validatedObjects;

  // 2. Generate slugs for the objects that don't exist
  const newObjects = objects.filter(
    (obj) =>
      !existingObjects.some(
        (existing) => existing.name.toLowerCase() === obj.name.toLowerCase()
      )
  );

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
        value: newObjects.map((obj) => obj.name),
      }),
    }
  );

  const slugData = await slugResponse.json();
  const slugList = slugData.data;

  // 3. Create the objects with their attributes and relationships
  const updatedObjects = [...existingObjects];
  // Get existing forms from the contract
  const existingForms = existingContract?.forms || [];
  const forms_data = [...existingForms]; // Preserve existing forms
  const relationshipMap = new Map();

  const createBidirectionalRelationship = (
    sourceObj,
    destinationObj,
    relationship,
    appId
  ) => {
    const relationshipId = uuidv4();
    const reverseRelationshipId = uuidv4();

    // Forward relationship (source to destination)
    const forwardRelationship = {
      id: relationshipId,
      source_object_slug: sourceObj.slug,
      destination_object_slug: destinationObj.slug,
      destination_display_name: destinationObj.name,
      relation_type: relationship.relationship_type,
      is_external: false,
      source_app_id: appId,
    };

    // Reverse relationship (destination to source)
    const reverseRelationship = {
      id: reverseRelationshipId,
      source_object_slug: destinationObj.slug,
      destination_object_slug: sourceObj.slug,
      destination_display_name: sourceObj.name,
      source_app_id: appId,
      relation_type:
        relationship.relationship_type === "manyToOne"
          ? "oneToMany"
          : "manyToOne",
      is_external: false,
    };
    return { forwardRelationship, reverseRelationship };
  };

  for (const objectDef of objects) {
    // Check if object already exists
    const existingObject = existingObjects.find(
      (existing) => existing.name.toLowerCase() === objectDef.name.toLowerCase()
    );

    const slugInfo = existingObject
      ? { generated_slug: existingObject.slug, slug: objectDef.name }
      : slugList.find((s) => s.slug === objectDef.name);

    if (!slugInfo) continue;

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
    const indexed_attributes = {
      ...allAvailableAttributes,
      ...Object.fromEntries(
        (
          (objectDef.attributes &&
            objectDef.attributes.length > 0 &&
            objectDef.attributes) ||
          []
        ).map((obj) => {
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

    // Create or update the object
    const updatedObject = existingObject
      ? { ...existingObject }
      : {
          name: objectDef.name,
          slug: slugInfo.generated_slug,
          type: objectDef.type,
          application_id: appId,
          attributes: attributes || [],
          created_by: email ? email : "bishal@tangohr.com",
          last_updated_by: email ? email : "bishal@tangohr.com",
          description: "",
          subtype: "",
          parent: null,
          icon: {
            svg: "memo",
            color: "#5f6368",
            style: "solid",
            version: 1,
          },
          is_global: false,
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

    // Add parent key for task objects that have a workitem relationship
    if (objectDef.type === "task" && taskRelationships.has(objectDef.name)) {
      const workitemName = taskRelationships.get(objectDef.name);
      const workitemObj = objects.find((obj) => obj.name === workitemName);
      if (workitemObj) {
        const workitemSlugInfo =
          existingObjects.find(
            (obj) => obj.name.toLowerCase() === workitemName.toLowerCase()
          )?.slug ||
          slugList.find((s) => s.slug === workitemName)?.generated_slug;

        if (workitemSlugInfo) {
          updatedObject.parent = workitemSlugInfo;
        }
      }
    }

    // Update statuses
    if (objectDef.status && objectDef.status.length > 0) {
      updatedObject.maps.status = objectDef.status.map((status, index) => {
        let statusColor = status.color || defaultStatusColor;
        if (statusColor && !isValidHexColor(statusColor)) {
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
    } else if (!existingObject || !updatedObject.maps.status.length) {
      updatedObject.maps.status = getDefaultStatuses().map((s) => ({
        ...s,
        slug: `${slugInfo.generated_slug}__${s.loco_name}`,
      }));
    }

    // Handle relationships
    if (objectDef.relationship && objectDef.relationship.length > 0) {
      const relationships = [];

      objectDef.relationship.forEach((rel) => {
        const destinationObjDef = objects.find((obj) => obj.name === rel.name);
        if (!destinationObjDef) return;

        // Additional validation during relationship creation
        if (
          objectDef.type === "workitem" &&
          (destinationObjDef.type !== "task" ||
            rel.relationship_type !== "oneToMany")
        ) {
          return;
        }

        if (objectDef.type === "task") {
          // Only allow one relationship with workitem
          if (
            destinationObjDef.type !== "workitem" ||
            rel.relationship_type !== "manyToOne" ||
            relationships.length > 0
          ) {
            return;
          }
        }

        if (objectDef.type === "master") {
          const masterCount = objects.filter((o) => o.type === "master").length;
          if (masterCount !== 2 || destinationObjDef.type !== "master") {
            return;
          }
        }

        const destinationSlug =
          existingObjects.find(
            (obj) => obj.name.toLowerCase() === rel.name.toLowerCase()
          )?.slug ||
          slugList.find((s) => s.slug === rel.name)?.generated_slug ||
          formatLocoName(rel.name);

        const sourceObj = {
          name: objectDef.name,
          slug: slugInfo.generated_slug,
        };

        const destinationObj = {
          name: destinationObjDef.name,
          slug: destinationSlug,
        };

        if (
          rel.relationship_type === "manyToOne" ||
          rel.relationship_type === "oneToMany"
        ) {
          const { forwardRelationship, reverseRelationship } =
            createBidirectionalRelationship(
              sourceObj,
              destinationObj,
              rel,
              appId
            );

          relationships.push(forwardRelationship);

          const key = `${destinationObj.slug}:${sourceObj.slug}`;
          relationshipMap.set(key, {
            relationship: reverseRelationship,
            targetSlug: destinationObj.slug,
          });
        } else {
          relationships.push({
            id: uuidv4(),
            source_object_slug: sourceObj.slug,
            destination_object_slug: destinationObj.slug,
            destination_display_name: destinationObj.name,
            relation_type: rel.relationship_type,
            is_external: false,
          });
        }
      });

      updatedObject.relationship = relationships;
    }

    // Add or update form data
    const existingFormIndex = forms_data.findIndex(
      (f) => f.slug === slugInfo.generated_slug
    );
    const formData = {
      form: form || [],
      name: objectDef.name,
      slug: slugInfo.generated_slug,
    };

    if (existingFormIndex !== -1) {
      // Merge existing form with new form data, preserving existing fields
      const existingForm = forms_data[existingFormIndex];
      const existingFormFields = new Set(existingForm.form.map((f) => f.key));
      const newFormFields = form.filter((f) => !existingFormFields.has(f.key));
      formData.form = [...existingForm.form, ...newFormFields];
      forms_data[existingFormIndex] = formData;
    } else {
      forms_data.push(formData);
    }

    if (existingObject) {
      // Update existing object
      const index = updatedObjects.findIndex(
        (obj) => obj.slug === existingObject.slug
      );
      if (index !== -1) {
        updatedObjects[index] = updatedObject;
      }
    } else {
      // Add new object
      updatedObjects.push(updatedObject);
    }
  }

  // Update relationships for all objects
  updatedObjects.forEach((obj) => {
    relationshipMap.forEach((relInfo, key) => {
      if (obj.slug === relInfo.targetSlug) {
        const existingRelationship = obj.relationship.find(
          (r) => r.id === relInfo.relationship.id
        );

        if (!existingRelationship) {
          obj.relationship.push(relInfo.relationship);
        }
      }
    });
  });

  // 4. Save the contract with updated objects and preserved forms
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
          description: existingContract?.contract_json?.description || "",
          cover_image: existingContract?.contract_json?.cover_image || "",
          icon: existingContract?.contract_json?.icon || {
            svg: "memo",
            color: "#5f6368",
            style: "solid",
            version: 1,
          },
          tags: existingContract?.contract_json?.tags || [],
          slug: appSlug,
          objects: updatedObjects,
        },
        forms: forms_data,
        actions: existingContract?.actions || [],
        permission: rolesPermissions(updatedObjects, "admin", "admin"),
      }),
    }
  );
  const data = await contractResponse.json();
  return data.data;
};

export const deleteObject = async (baseUrl, tenantName, appId, objectName) => {
  const { token } = await getCrmToken(baseUrl, tenantName);

  // Get existing contract
  const existingContract = await getAppContract(baseUrl, tenantName, appId);
  if (!existingContract?.contract_json?.objects) {
    throw new Error("Could not fetch app contract or no objects found");
  }

  // Find the object to delete
  const objectToDelete = existingContract.contract_json.objects.find(
    (obj) => obj.name.toLowerCase() === objectName.toLowerCase()
  );

  if (!objectToDelete) {
    throw new Error(
      `Object with name "${objectName}" not found in the contract`
    );
  }

  // Remove the object and its relationships from other objects
  const updatedObjects = existingContract.contract_json.objects
    .filter((obj) => obj.name.toLowerCase() !== objectName.toLowerCase())
    .map((obj) => {
      // Remove relationships that reference the deleted object
      if (obj.relationship) {
        obj.relationship = obj.relationship.filter(
          (rel) => rel.destination_object_slug !== objectToDelete.slug
        );
      }
      return obj;
    });

  // Remove forms related to the deleted object
  const updatedForms = (existingContract.forms || []).filter(
    (form) => form.slug !== objectToDelete.slug
  );

  // Update the contract
  const response = await fetch(
    `${baseUrl}/api/v1/core/studio/contract/app_meta/${appId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        contract_json: {
          ...existingContract.contract_json,
          objects: updatedObjects,
        },
        forms: updatedForms,
        actions: existingContract.actions || [],
        permission: rolesPermissions(updatedObjects, "admin", "admin"),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete object: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
};
