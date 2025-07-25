import { getCrmToken } from "./app.service.js";
import { GenerateWorkflowParams } from "../types/app.types.js";
import { getAppContract, publishApp } from "./app.service.js";
import { makeWorkflow, genarateXML } from "../utils/workflowAlog.js";

/**
 * Get workflow data for an application
 * @param baseUrl - Base URL for the API
 * @param appId - Application ID
 * @param defaultCases - Default workflow cases
 * @returns Promise with workflow data
 */
export const getWorkflowData = async (
  baseUrl: string,
  appId: string,
  defaultCases: any[],
  token: string
): Promise<{
  newCases: any[];
  flowsData: any[];
  isNewFlow: boolean;
  meta_data: any;
}> => {
  try {
    const res = await fetch(`${baseUrl}/api/v2/work/flows/${appId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
    });
    const response = await res.json();
    const newCases: any[] = [];
    const flowsData: any[] = [];
    let meta_data = {};
    let isNewFlow = true;
    const data = response.data;
    isNewFlow =
      Boolean(data.length === 0) ||
      data[0].meta_data.generate_flowable_app ||
      false;

    if (!isNewFlow) {
      meta_data = data[0].meta_data;
    }

    defaultCases.map((defaultCase) => {
      let currentCaseIndex = -1;
      if (data.length > 0) {
        currentCaseIndex = data.findIndex(
          (el: any) => el.object_slug === defaultCase.slug
        );
      }
      if (currentCaseIndex !== -1 && data.length > 0) {
        newCases.push({
          ...data[currentCaseIndex].flow_config[defaultCase.slug],
          relationship: defaultCase.relationship,
          tasks: defaultCase.tasks,
          new: false,
        });
      } else {
        newCases.push({ ...defaultCase, deploymentId: "", new: true });
      }
    });

    return { newCases, flowsData, isNewFlow, meta_data };
  } catch (error) {
    throw error;
  }
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
 * @param newFlow - Whether this is a new flow or update
 * @returns Promise with deployment result
 */
export const deployCmmnWorkflow = async (
  baseUrl: string,
  token: string,
  appId: string,
  appName: string,
  caseSlug: string,
  cmmnXml: string,
  newFlow: boolean
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
 * Update existing CMMN workflow using PUT request
 * @param baseUrl - Base URL for the API
 * @param token - Authentication token
 * @param appId - Application ID
 * @param appName - Application name
 * @param caseSlug - Case slug
 * @param cmmnXml - CMMN XML content
 * @param cmmnId - Existing CMMN ID to update
 * @param meta_data - Metadata for the application
 * @returns Promise with update result
 */
export const updateCmmnWorkflow = async (
  baseUrl: string,
  token: string,
  appId: string,
  appName: string,
  caseSlug: string,
  cmmnXml: string,
  cmmnId: string,
  meta_data: any
): Promise<any> => {
  try {
    const fileName = `${caseSlug}flowableCase.cmmn.xml`;
    const formData = new FormData();
    const xmlBlob = new Blob([cmmnXml], { type: "application/octet-stream" });
    formData.append("file", xmlBlob, fileName);
    formData.append(
      "data",
      JSON.stringify({
        app_id: meta_data.flow_app_id,
        app_name: appName,
        amoga_app_id: appId,
      })
    );

    const response = await fetch(
      `${baseUrl}/api/v1/work/tenant/sdk/application/app/cmmn/deploy/${cmmnId}`,
      {
        method: "PUT",
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
  tasks: any[] = [],
  newFlow: boolean = false
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

    let url = `${baseUrl}/api/v2/work/flows/${appId}`;
    let method = "POST";
    if (!newFlow) {
      url = `${baseUrl}/api/v2/work/flows/${appId}?object_slug=${caseSlug}`;
      method = "PUT";
    }
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "application/json, text/plain, */*",
      },
      body: newFlow
        ? JSON.stringify([workflowConfig])
        : JSON.stringify(workflowConfig),
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
    const { newCases, flowsData, isNewFlow, meta_data } = await getWorkflowData(
      params.baseUrl,
      params.appId,
      workflowData,
      token
    );

    if (!newCases || newCases.length === 0) {
      throw new Error(
        "No workflows could be generated. Ensure the app has workitem objects with task relationships"
      );
    }

    const results = [];

    for (const workflowCase of newCases) {
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

        let deploymentResult;

        // Check if this is a new workflow or update existing one
        if (workflowCase.new) {
          // Create new workflow
          deploymentResult = await deployCmmnWorkflow(
            params.baseUrl,
            token,
            params.appId,
            appName,
            workflowCase.slug,
            cmmnXml,
            workflowCase.new
          );
        } else {
          // Update existing workflow
          deploymentResult = await updateCmmnWorkflow(
            params.baseUrl,
            token,
            params.appId,
            appName,
            workflowCase.slug,
            cmmnXml,
            workflowCase.cmmnId,
            meta_data
          );
        }
        const relationships = workflowCase.relationship || [];
        const tasks = workflowCase.tasks || [];
        // Save workflow configuration
        const configResult = await saveWorkflowConfig(
          params.baseUrl,
          token,
          params.appId,
          appName,
          workflowCase.slug,
          workflowCase.name,
          deploymentResult,
          relationships,
          tasks,
          workflowCase.new
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
