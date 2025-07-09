import { getCrmToken } from "./app.service.js";
import { GenerateWorkflowParams } from "../types/app.types.js";
import { getAppContract, publishApp } from "./app.service.js";

interface TaskRelationItem {
  slug: string;
  name: string;
}

interface TaskSchemaItem {
  tl_x: number | null;
  tl_y: number | null;
  tr_x: number | null;
  tr_y: number | null;
  bl_x: number | null;
  bl_y: number | null;
  br_x: number | null;
  br_y: number | null;
  xp: number | null;
  yp: number | null;
  x: number | null;
  y: number | null;
  w: number | null;
  h: number | null;
  actions: any[];
  isBlockedOn: any[];
  rules: any[];
  unmapped: boolean;
  slug: string;
  display_name: string;
  taskname: string;
  parent: string;
  is_update: boolean;
  sentry: any[];
  tasks: any[];
  untouched: boolean;
  isDefault: boolean;
  isDefaultCondition: string;
  repetetion: boolean;
  manualActivation: boolean;
  type: string;
}

const getTaskSchema = (
  taskRelation: TaskRelationItem[],
  parent: string
): TaskSchemaItem[] => {
  const updatedTaskSchema: TaskSchemaItem[] = [];
  taskRelation.forEach((el: TaskRelationItem) => {
    updatedTaskSchema.push({
      tl_x: null,
      tl_y: null,
      tr_x: null,
      tr_y: null,
      bl_x: null,
      bl_y: null,
      br_x: null,
      br_y: null,
      xp: null,
      yp: null,
      x: null,
      y: null,
      w: null,
      h: null,
      actions: [],
      isBlockedOn: [],
      rules: [],
      unmapped: true,
      slug: el.slug,
      display_name: el.name,
      taskname: el.slug,
      parent: parent,
      is_update: true,
      sentry: [],
      tasks: [],
      untouched: true,
      isDefault: false,
      isDefaultCondition: "",
      repetetion: true,
      manualActivation: false,
      type: "task",
    });
  });
  return updatedTaskSchema;
};

/**
 * Generate CMMN XML for a case object
 * @param appId - Application ID
 * @param caseName - Name of the case
 * @param caseSlug - Slug of the case
 * @returns CMMN XML string
 */
export const generateCmmnXml = (
  appId: string,
  caseName: string,
  caseSlug: string
): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/CMMN/20151109/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:flowable="http://flowable.org/cmmn" xmlns:cmmndi="http://www.omg.org/spec/CMMN/20151109/CMMNDI" xmlns:dc="http://www.omg.org/spec/CMMN/20151109/DC" xmlns:di="http://www.omg.org/spec/CMMN/20151109/DI" targetNamespace="http://www.flowable.org/casedef" exporter="Flowable Open Source Modeler">
<case id="${caseSlug}_${appId}" name="${caseSlug}_${appId}" flowable:initiatorVariableName="initiator"><casePlanModel id="${caseSlug}123" flowable:formKey="" flowable:formFieldValidation="true">
    <planItem id="planItem${caseSlug}" name="${caseSlug}" definitionRef="${caseSlug}_${appId}stage"></planItem>
    <stage id="${caseSlug}_${appId}stage" name="${caseSlug}_${appId}">
    <extensionElements>
    <flowable:planItemLifecycleListener sourceState="available" targetState="active" class="org.flowable.ui.application.lifecycle.listener.TemporalListener"></flowable:planItemLifecycleListener>
  </extensionElements>
    </stage></casePlanModel></case> <cmmndi:CMMNDI>
    <cmmndi:CMMNDiagram id="CMMNDiagram_${caseSlug}_${appId}">
    <cmmndi:CMMNShape id="CMMNShape_${caseSlug}" cmmnElementRef="${caseSlug}123">
    <dc:Bounds height="100" width="100" x="20" y="30"></dc:Bounds>
    <cmmndi:CMMNLabel></cmmndi:CMMNLabel>
    </cmmndi:CMMNShape>
    <cmmndi:CMMNShape id="CMMNShape_${caseSlug}" cmmnElementRef="planItem${caseSlug}">
    <dc:Bounds height="50" width="50" x="40" y="50"></dc:Bounds>
    <cmmndi:CMMNLabel></cmmndi:CMMNLabel>
  </cmmndi:CMMNShape>
    </cmmndi:CMMNDiagram>
    </cmmndi:CMMNDI></definitions>`;
};

/**
 * Generate a UUID v4
 * @returns UUID string
 */
export const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Deploy CMMN workflow to Flowable engine
 * @param baseUrl - Base URL for the API
 * @param token - Authentication token
 * @param appId - Application ID
 * @param appName - Application name
 * @param caseSlug - Case slug
 * @param cmmnXml - CMMN XML content
 * @returns Promise with deployment result
 */
export const deployCmmnWorkflow = async (
  baseUrl: string,
  token: string,
  appId: string,
  appName: string,
  caseSlug: string,
  cmmnXml: string
): Promise<any> => {
  try {
    const formData = new FormData();
    const xmlBlob = new Blob([cmmnXml], { type: "application/octet-stream" });
    formData.append("files", xmlBlob, `${caseSlug}flowableCase.cmmn.xml`);
    formData.append("app_name", appName);
    formData.append("amoga_app_id", appId);

    const response = await fetch(
      `${baseUrl}/api/v1/work/tenant/sdk/application/app/cmmn/deploy`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json, text/plain, */*",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Save workflow configuration to application level
 * @param baseUrl - Base URL for the API
 * @param token - Authentication token
 * @param appId - Application ID
 * @param appName - Application name
 * @param caseSlug - Case slug
 * @param caseName - Case name
 * @param deploymentData - Data from deployment response
 * @returns Promise with save result
 */
export const saveWorkflowConfig = async (
  baseUrl: string,
  token: string,
  appId: string,
  appName: string,
  caseSlug: string,
  caseName: string,
  deploymentData: any,
  relationship: any[] = []
): Promise<any> => {
  try {
    const workflowConfig = {
      flow_config: {
        [caseSlug]: {
          name: caseName,
          slug: caseSlug,
          uuid: generateUUID(),
          cmmnId: deploymentData.data.appDefinition.definition.cmmnModels[0].id,
          deploymentId: deploymentData.data.appDefinition.id || "",
          relationship: relationship.map((el) => el.slug) || [],
          stages: [],
          tasks: getTaskSchema(relationship, caseSlug) || [],
          new: true,
        },
      },
      application: appId,
      object_slug: caseSlug,
      meta_data: {
        flow_app_id: deploymentData.data.appDefinition.id,
        flow_app_name: appName,
        flow_app_key: deploymentData.data.appDefinition.key,
      },
    };

    const response = await fetch(`${baseUrl}/api/v2/work/flows/${appId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "application/json, text/plain, */*",
      },
      body: JSON.stringify([workflowConfig]),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Generate workflows for all case objects in an application
 * @param params - Workflow generation parameters
 * @returns Promise with generation results
 */
export const generateWorkflows = async (
  params: GenerateWorkflowParams
): Promise<any> => {
  try {
    const { token } = await getCrmToken(params.baseUrl, params.tenantName);
    let appName = "";
    let caseObjects = [];
    const contractResult = await getAppContract({
      baseUrl: params.baseUrl,
      appId: params.appId,
      tenantName: params.tenantName,
    });
    try {
      if (contractResult.contract_json.slug) {
        appName = contractResult.contract_json.slug;
      }
      if (contractResult.contract_json.objects) {
        caseObjects = contractResult.contract_json.objects
          .filter((obj: any) => {
            return obj.type === "workitem";
          })
          .map((obj: any) => ({
            name: obj.name,
            slug: obj.slug || obj.name.toLowerCase().replace(/\s+/g, "_"),
            relationship:
              obj.relationship
                ?.filter((item: any) => !item.is_external)
                ?.map((el: any) => ({
                  name: el.destination_display_name,
                  slug: el.destination_object_slug,
                })) || [],
          }));
      }
    } catch (contractError) {
      throw new Error(
        `Failed to fetch app contract: ${
          contractError instanceof Error
            ? contractError.message
            : "Unknown error"
        }`
      );
    }
    if (!appName) {
      throw new Error(
        "Application name is required and could not be fetched from app contract"
      );
    }

    if (!caseObjects || caseObjects.length === 0) {
      throw new Error(
        "No workitem objects found. Please provide workitem objects or ensure the app has workitem-type objects (type: 'workitem') in its contract"
      );
    }
    // if (params.caseObjects && params.caseObjects.length > 0) {
    //   try {
    //     const validCaseObjects =
    //       contractResult.contract_json.objects?.filter(
    //         (obj: any) => obj.type === "workitem"
    //       ) || [];
    //     const validCaseSlugs = validCaseObjects.map(
    //       (obj: any) => obj.slug || obj.name.toLowerCase().replace(/\s+/g, "_")
    //     );

    //     // Validate each provided case object
    //     for (const providedCase of params.caseObjects) {
    //       if (!validCaseSlugs.includes(providedCase.slug)) {
    //         throw new Error(
    //           `Invalid case object '${providedCase.name}' (${providedCase.slug}). Only workitem objects (type: 'workitem') are allowed for workflow generation.`
    //         );
    //       }
    //     }
    //   } catch (contractError) {
    //     throw new Error(
    //       `Failed to validate case objects against app contract: ${
    //         contractError instanceof Error
    //           ? contractError.message
    //           : "Unknown error"
    //       }`
    //     );
    //   }
    // }

    const results = [];

    for (const caseObj of caseObjects) {
      try {
        // Generate CMMN XML
        const cmmnXml = generateCmmnXml(
          params.appId,
          caseObj.name,
          caseObj.slug
        );

        // Deploy to Flowable
        const deploymentResult = await deployCmmnWorkflow(
          params.baseUrl,
          token,
          params.appId,
          appName,
          caseObj.slug,
          cmmnXml
        );

        // Save workflow configuration
        const configResult = await saveWorkflowConfig(
          params.baseUrl,
          token,
          params.appId,
          appName,
          caseObj.slug,
          caseObj.name,
          deploymentResult,
          caseObj.relationship || []
        );

        results.push({
          caseObject: caseObj,
          deployment: deploymentResult,
          configuration: configResult,
          success: true,
        });
      } catch (error) {
        results.push({
          caseObject: caseObj,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        });
      }
    }

    const successfulWorkflows = results.filter((r) => r.success).length;
    const failedWorkflows = results.filter((r) => !r.success).length;

    let publishResult = null;
    let publishSuccess = false;

    // If all workflows were generated successfully, automatically publish the app
    if (successfulWorkflows > 0 && failedWorkflows === 0) {
      try {
        publishResult = await publishApp({
          baseUrl: params.baseUrl,
          appId: params.appId,
          tenantName: params.tenantName,
          version: contractResult.contract_json.version,
        });
        publishSuccess = true;
      } catch (publishError) {
        publishResult = {
          error:
            publishError instanceof Error
              ? publishError.message
              : "Unknown publish error",
        };
        publishSuccess = false;
      }
    }

    return {
      success: true,
      results,
      totalProcessed: caseObjects.length,
      successful: successfulWorkflows,
      failed: failedWorkflows,
      appName,
      caseObjectsProcessed: caseObjects,
      publishing: {
        attempted: successfulWorkflows > 0 && failedWorkflows === 0,
        success: publishSuccess,
        result: publishResult,
      },
    };
  } catch (error) {
    throw error;
  }
};
