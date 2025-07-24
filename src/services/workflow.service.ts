import { getCrmToken } from "./app.service.js";
import { GenerateWorkflowParams } from "../types/app.types.js";
import { getAppContract, publishApp } from "./app.service.js";
import { makeWorkflow, genarateXML } from "../utils/workflowAlog.js";

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
  relationship: any[] = [],
  tasks: any[] = []
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
          relationship: relationship || [],
          stages: [],
          tasks: tasks || [],
          new: false,
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
    let applicationDetail = null;
    const contractResult = await getAppContract({
      baseUrl: params.baseUrl,
      appId: params.appId,
      tenantName: params.tenantName,
    });
    try {
      if (contractResult.contract_json.slug) {
        appName = contractResult.contract_json.slug;
        applicationDetail = {
          ...contractResult.contract_json,
          identifier: params.appId,
        };
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

    if (
      !contractResult.contract_json.objects ||
      contractResult.contract_json.objects.length === 0
    ) {
      throw new Error("No objects found in the app contract");
    }

    // Generate workflow data using makeWorkflow function from workflowAlog.js
    const workflowData = makeWorkflow({
      objects: contractResult.contract_json.objects,
      dispatch: "dispatch", // Default dispatch value
      application_id: params.appId,
    });

    if (!workflowData || workflowData.length === 0) {
      throw new Error(
        "No workflows could be generated. Ensure the app has workitem objects with task relationships"
      );
    }

    const results = [];

    for (const workflowCase of workflowData) {
      try {
        // Generate CMMN XML using genarateXML function from workflowAlog.js
        const cmmnXml = genarateXML(
          { ...applicationDetail, slug: "" },
          workflowCase.slug,
          [...workflowCase.stages, ...workflowCase.tasks]
        );

        if (!cmmnXml) {
          throw new Error(
            `Failed to generate CMMN XML for workflow case: ${workflowCase.name}`
          );
        }
        const deploymentResult = await deployCmmnWorkflow(
          params.baseUrl,
          token,
          params.appId,
          appName,
          workflowCase.slug,
          cmmnXml
        );

        // Save workflow configuration
        const configResult = await saveWorkflowConfig(
          params.baseUrl,
          token,
          params.appId,
          appName,
          workflowCase.slug,
          workflowCase.name,
          deploymentResult,
          workflowCase.relationship || [],
          workflowCase.tasks || []
        );

        results.push({
          caseObject: {
            name: workflowCase.name,
            slug: workflowCase.slug,
            relationship: workflowCase.relationship,
            stages: workflowCase.stages,
            tasks: workflowCase.tasks,
          },
          deployment: deploymentResult,
          configuration: configResult,
          success: true,
        });
      } catch (error) {
        results.push({
          caseObject: {
            name: workflowCase.name,
            slug: workflowCase.slug,
            relationship: workflowCase.relationship,
          },
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
      totalProcessed: workflowData.length,
      successful: successfulWorkflows,
      failed: failedWorkflows,
      appName,
      workflowDataGenerated: workflowData,
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
