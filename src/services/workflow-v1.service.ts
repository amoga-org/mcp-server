import { getCrmToken, getAppContract } from "./app.service.js";

export interface WorkflowV1Params {
  baseUrl: string;
  appId: string;
  tenantName: string;
  caseName: string;
  businessLogic: BusinessLogic;
  xml?: string; // Optional pre-generated XML
}

export interface BusinessLogic {
  tasks: TaskDefinition[];
  patterns: BusinessPattern[];
}

export interface TaskDefinition {
  slug: string;
  displayName: string;
  outcomes: string[];
  assignee?: string;
  candidateGroups?: string;
  dueDate?: string;
  formKey?: string;
  repetitionLimit?: number;
}

export interface BusinessPattern {
  type: "sequential" | "approval-chain" | "parallel" | "conditional" | "retry";
  tasks: string[]; // task slugs
  conditions?: ConditionDefinition[];
}

export interface ConditionDefinition {
  sourceTask: string;
  outcome: string;
  targetTask: string;
  operator?: "equals" | "notEquals";
}

export interface ApplicationDetail {
  identifier: string;
  slug: string;
}

/**
 * Generate CMMN XML based on business logic and app contract
 */
export const generateWorkflowV1 = async (
  params: WorkflowV1Params
): Promise<{
  success: boolean;
  cmmnXml?: string;
  deploymentResult?: any;
  configurationResult?: any;
  error?: string;
}> => {
  try {
    // Step 1: Get CRM token
    const { token } = await getCrmToken(params.baseUrl, params.tenantName);

    // Step 2: Fetch app contract
    const contractResult = await getAppContract({
      baseUrl: params.baseUrl,
      appId: params.appId,
      tenantName: params.tenantName,
    });

    if (!contractResult.contract_json) {
      throw new Error("Failed to fetch app contract");
    }

    // Step 3: Extract application details from contract
    const applicationDetail: ApplicationDetail = {
      identifier: contractResult.contract_json.application_id || params.appId,
      slug: contractResult.contract_json.slug || "app",
    };

    // Step 4: Validate caseName exists in workitem objects
    const workitemObjects =
      contractResult.contract_json.objects?.filter(
        (obj: any) => obj.type === "workitem"
      ) || [];

    const workitemExists = workitemObjects.some(
      (workitem: any) => workitem.slug === params.caseName
    );

    if (!workitemExists) {
      throw new Error(
        `Case '${
          params.caseName
        }' not found in workitem objects. Available cases: ${workitemObjects
          .map((w: any) => w.slug)
          .join(", ")}`
      );
    }

    // Step 5: Generate or use provided XML
    let cmmnXml: string;
    if (params.xml) {
      // Use provided XML
      cmmnXml = params.xml;
    } else {
      // Generate XML from business logic
      cmmnXml = generateCMMNXML(
        applicationDetail,
        params.caseName,
        params.businessLogic
      );
    }

    // Step 6: Deploy CMMN workflow
    const deploymentResult = await deployCmmnWorkflowV1(
      params.baseUrl,
      token,
      params.appId,
      applicationDetail.slug,
      params.caseName,
      cmmnXml
    );

    // Step 7: Save workflow configuration
    const configurationResult = await saveWorkflowConfigV1(
      params.baseUrl,
      token,
      params.appId,
      applicationDetail.slug,
      params.caseName,
      params.caseName,
      deploymentResult,
      params.businessLogic.tasks
    );

    return {
      success: true,
      cmmnXml,
      deploymentResult,
      configurationResult,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Generate CMMN XML following the pattern with dynamic IDs
 */
export const generateCMMNXML = (
  applicationDetail: ApplicationDetail,
  caseName: string,
  businessLogic: BusinessLogic
): string => {
  const { tasks, patterns } = businessLogic;

  // Calculate container dimensions
  const taskWidth = 100;
  const taskHeight = 80;
  const taskSpacing = 180;
  const rowSpacing = 150;

  const tasksPerRow = Math.ceil(Math.sqrt(tasks.length));
  const containerWidth = tasksPerRow * taskSpacing + 100;
  const containerHeight =
    Math.ceil(tasks.length / tasksPerRow) * rowSpacing + 100;

  // Position tasks
  const positionedTasks = tasks.map((task, index) => ({
    ...task,
    x: 120 + (index % tasksPerRow) * taskSpacing,
    y: 150 + Math.floor(index / tasksPerRow) * rowSpacing,
  }));

  // Generate XML sections
  const definitions = generateDefinitions();
  const caseSection = generateCase(applicationDetail, caseName);
  const casePlanModel = generateCasePlanModel(applicationDetail, caseName);
  const mainStage = generateMainStage(applicationDetail, caseName);
  const planItems = generatePlanItems(
    applicationDetail,
    caseName,
    positionedTasks,
    patterns
  );
  const sentries = generateSentries(
    applicationDetail,
    caseName,
    positionedTasks,
    patterns
  );
  const humanTasks = generateHumanTasks(
    applicationDetail,
    caseName,
    positionedTasks
  );
  const endStage = "</stage></casePlanModel></case>";
  const cmmndi = generateCMMNDI(
    applicationDetail,
    caseName,
    positionedTasks,
    containerWidth,
    containerHeight
  );
  const endDefinitions = "</definitions>";

  return [
    definitions,
    caseSection,
    casePlanModel,
    mainStage,
    planItems,
    sentries,
    humanTasks,
    endStage,
    cmmndi,
    endDefinitions,
  ].join("\n");
};

/**
 * Generate XML definitions header
 */
const generateDefinitions = (): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/CMMN/20151109/MODEL"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xmlns:flowable="http://flowable.org/cmmn"
             xmlns:cmmndi="http://www.omg.org/spec/CMMN/20151109/CMMNDI"
             xmlns:dc="http://www.omg.org/spec/CMMN/20151109/DC"
             xmlns:di="http://www.omg.org/spec/CMMN/20151109/DI"
             xmlns:modeler="http://flowable.org/modeler"
             targetNamespace="http://www.flowable.org/casedef"
             exporter="Flowable Open Source Modeler">`;
};

/**
 * Generate case section with dynamic IDs
 */
const generateCase = (
  applicationDetail: ApplicationDetail,
  caseName: string
): string => {
  return `<case id="${caseName}_${applicationDetail.identifier}"
        name="${caseName}_${applicationDetail.identifier}"
        flowable:initiatorVariableName="initiator">`;
};

/**
 * Generate case plan model
 */
const generateCasePlanModel = (
  applicationDetail: ApplicationDetail,
  caseName: string
): string => {
  return `<casePlanModel id="${caseName}123"
                 flowable:formKey="${caseName}Form"
                 flowable:formFieldValidation="true">
    <planItem id="planItem${applicationDetail.slug}${caseName}"
              name="${applicationDetail.slug}${caseName}"
              definitionRef="${caseName}_${applicationDetail.identifier}stage">
    </planItem>`;
};

/**
 * Generate main stage
 */
const generateMainStage = (
  applicationDetail: ApplicationDetail,
  caseName: string
): string => {
  return `<stage id="${caseName}_${applicationDetail.identifier}stage"
           name="${caseName}_${applicationDetail.identifier}">
    <extensionElements>
      <flowable:planItemLifecycleListener
        sourceState="available"
        targetState="active"
        class="org.flowable.ui.application.lifecycle.listener.TemporalListener">
      </flowable:planItemLifecycleListener>
    </extensionElements>`;
};

/**
 * Generate plan items for tasks
 */
const generatePlanItems = (
  applicationDetail: ApplicationDetail,
  caseName: string,
  tasks: any[],
  patterns: BusinessPattern[]
): string => {
  const stageSlug = caseName;

  return tasks
    .map((task, index) => {
      const hasEntryCriterion =
        index > 0 || hasConditionForTask(task.slug, patterns);
      const repetitionRule =
        task.repetitionLimit && task.repetitionLimit > 1
          ? generateRepetitionRule(task.repetitionLimit)
          : "";

      const entryCriterion = hasEntryCriterion
        ? `<entryCriterion id="sid-${task.slug}1" sentryRef="sentry${task.slug}1"></entryCriterion>`
        : "";

      return `<planItem id="planItem${stageSlug}${task.slug}"
              name="${task.displayName}"
              definitionRef="${stageSlug}${task.slug}">
      ${repetitionRule}
      ${entryCriterion}
    </planItem>`;
    })
    .join("\n");
};

/**
 * Generate sentries for task activation conditions
 */
const generateSentries = (
  applicationDetail: ApplicationDetail,
  caseName: string,
  tasks: any[],
  patterns: BusinessPattern[]
): string => {
  const stageSlug = caseName;
  let sentries = "";

  // Generate sentry for first task (triggered by stage start)
  if (tasks.length > 0) {
    const firstTask = tasks[0];
    sentries += `<sentry id="sentry${firstTask.slug}1" flowable:triggerMode="onEvent">
      <planItemOnPart id="sentryOnPart${applicationDetail.slug}${caseName}1"
                      sourceRef="planItem${applicationDetail.slug}${caseName}">
        <standardEvent>start</standardEvent>
      </planItemOnPart>
    </sentry>\n`;
  }

  // Generate sentries for task sequences based on patterns
  patterns.forEach((pattern) => {
    if (pattern.type === "sequential" || pattern.type === "approval-chain") {
      for (let i = 1; i < pattern.tasks.length; i++) {
        const previousTask = pattern.tasks[i - 1];
        const currentTask = pattern.tasks[i];
        const condition = pattern.conditions?.find(
          (c) => c.sourceTask === previousTask && c.targetTask === currentTask
        );

        const conditionClause = condition
          ? `<ifPart><condition><![CDATA[\${vars:equals(_outcome,'${condition.outcome}')}]]></condition></ifPart>`
          : "";

        sentries += `<sentry id="sentry${currentTask}1" flowable:triggerMode="onEvent">
          <planItemOnPart id="sentryOnPart${stageSlug}${previousTask}1"
                          sourceRef="planItem${stageSlug}${previousTask}">
            <standardEvent>complete</standardEvent>
          </planItemOnPart>
          ${conditionClause}
        </sentry>\n`;
      }
    }
  });

  return sentries;
};

/**
 * Generate human task definitions
 */
const generateHumanTasks = (
  applicationDetail: ApplicationDetail,
  caseName: string,
  tasks: any[]
): string => {
  const stageSlug = caseName;

  return tasks
    .map((task) => {
      const assignee = task.assignee || "${initiator}";
      const candidateGroups = task.candidateGroups
        ? `flowable:candidateGroups="${task.candidateGroups}"`
        : "";
      const dueDate = task.dueDate ? `flowable:dueDate="${task.dueDate}"` : "";
      const formKey = task.formKey || `${task.slug}Form`;

      // Generate outcome-to-status mappings
      const outcomeMapping = task.outcomes.map((outcome: string) => ({
        conditions: [{ key: "_outcome", value: outcome, op: "eq" }],
        output: [{ key: "_status", value: getNextStatus(outcome, task.slug) }],
      }));

      return `<humanTask id="${stageSlug}${task.slug}"
             name="${task.displayName}"
             flowable:assignee="${assignee}"
             ${candidateGroups}
             ${dueDate}
             flowable:formKey="${formKey}"
             flowable:formFieldValidation="true">
      <extensionElements>
        <modeler:flowable-idm-initiator xmlns:modeler="http://flowable.org/modeler">
          <![CDATA[true]]>
        </modeler:flowable-idm-initiator>
        <flowable:taskListener event="create"
                              class="org.flowable.ui.application.TriggerTemporalFlow"/>
        <flowable:taskListener event="complete"
                              class="org.flowable.ui.application.task.listener.SetVarriable">
          <flowable:field name="variables">
            <flowable:string><![CDATA[${JSON.stringify(
              outcomeMapping
            )}]]></flowable:string>
          </flowable:field>
        </flowable:taskListener>
        <flowable:taskListener event="complete"
                              class="org.flowable.ui.application.TriggerTemporalFlow"/>
      </extensionElements>
    </humanTask>`;
    })
    .join("\n");
};

/**
 * Generate CMMNDI visual layout section
 */
const generateCMMNDI = (
  applicationDetail: ApplicationDetail,
  caseName: string,
  tasks: any[],
  containerWidth: number,
  containerHeight: number
): string => {
  const stageSlug = caseName;

  // Generate shapes for container, stage, and tasks
  let shapes = `<cmmndi:CMMNDI>
    <cmmndi:CMMNDiagram id="CMMNDiagram_${caseName}_${
    applicationDetail.identifier
  }">
      <cmmndi:CMMNShape id="CMMNShape_${caseName}"
                        cmmnElementRef="${caseName}123">
        <dc:Bounds height="${containerHeight + 50}"
                   width="${containerWidth + 50}"
                   x="20" y="30"/>
        <cmmndi:CMMNLabel/>
      </cmmndi:CMMNShape>

      <cmmndi:CMMNShape id="CMMNShape_${applicationDetail.slug}${caseName}"
                        cmmnElementRef="planItem${
                          applicationDetail.slug
                        }${caseName}">
        <dc:Bounds height="${containerHeight}"
                   width="${containerWidth}"
                   x="40" y="50"/>
        <cmmndi:CMMNLabel/>
      </cmmndi:CMMNShape>`;

  // Add task shapes
  tasks.forEach((task) => {
    shapes += `
      <cmmndi:CMMNShape id="CMMNShape_${stageSlug}${task.slug}"
                        cmmnElementRef="planItem${stageSlug}${task.slug}">
        <dc:Bounds height="80.0" width="100.0" x="${task.x}" y="${task.y}"/>
        <cmmndi:CMMNLabel/>
      </cmmndi:CMMNShape>`;

    // Add entry criterion shape
    shapes += `
      <cmmndi:CMMNShape id="CMMNShape_sid-${task.slug}1"
                        cmmnElementRef="sid-${task.slug}1">
        <dc:Bounds height="22.0" width="14.0" x="${task.x - 7}" y="${
      task.y + 29
    }"/>
        <cmmndi:CMMNLabel/>
      </cmmndi:CMMNShape>`;
  });

  // Add edges connecting tasks
  for (let i = 1; i < tasks.length; i++) {
    const sourceTask = tasks[i - 1];
    const targetTask = tasks[i];

    shapes += `
      <cmmndi:CMMNEdge id="CMMNEdge_sid-${sourceTask.slug}_to_${
      targetTask.slug
    }"
                       cmmnElementRef="planItem${stageSlug}${sourceTask.slug}"
                       targetCMMNElementRef="sid-${targetTask.slug}1">
        <di:extension>
          <flowable:docker type="source" x="50.0" y="40.0"/>
          <flowable:docker type="target" x="7.0" y="11.0"/>
        </di:extension>
        <di:waypoint x="${sourceTask.x + 50}" y="${sourceTask.y + 40}"/>
        <di:waypoint x="${targetTask.x - 7}" y="${targetTask.y + 40}"/>
        <cmmndi:CMMNLabel/>
      </cmmndi:CMMNEdge>`;
  }

  shapes += `
    </cmmndi:CMMNDiagram>
  </cmmndi:CMMNDI>`;

  return shapes;
};

/**
 * Helper functions
 */
const hasConditionForTask = (
  taskSlug: string,
  patterns: BusinessPattern[]
): boolean => {
  return patterns.some((pattern) =>
    pattern.conditions?.some((condition) => condition.targetTask === taskSlug)
  );
};

const generateRepetitionRule = (limit: number): string => {
  return `<itemControl>
    <repetitionRule flowable:counterVariable="repetitionCounter">
      <extensionElements></extensionElements>
      <condition><![CDATA[\${repetitionCounter < ${limit}}]]></condition>
    </repetitionRule>
  </itemControl>`;
};

const getNextStatus = (outcome: string, taskSlug: string): string => {
  // Map outcomes to next status - can be customized
  const statusMap: { [key: string]: string } = {
    completed: "nextTask",
    approved: "nextApproval",
    rejected: "rejected",
    pending: "pending",
    review: "underReview",
  };

  return statusMap[outcome] || "pending";
};

/**
 * Deploy CMMN workflow to Flowable engine
 */
export const deployCmmnWorkflowV1 = async (
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
 * Save workflow configuration
 */
export const saveWorkflowConfigV1 = async (
  baseUrl: string,
  token: string,
  appId: string,
  appName: string,
  caseSlug: string,
  caseName: string,
  deploymentData: any,
  tasks: TaskDefinition[]
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
          relationship: [],
          stages: [],
          tasks: tasks.map((task) => ({
            slug: task.slug,
            display_name: task.displayName,
            outcomes: task.outcomes,
            assignee: task.assignee,
            candidateGroups: task.candidateGroups,
            dueDate: task.dueDate,
            formKey: task.formKey,
            repetitionLimit: task.repetitionLimit,
          })),
          new: true,
        },
      },
      application: appId,
      object_slug: caseSlug,
      meta_data: {
        flow_app_id: deploymentData.data.appDefinition.id,
        flow_app_name: appName,
        flow_app_key: deploymentData.data.appDefinition.key,
        generated_by: "workflow-v1",
        generated_at: new Date().toISOString(),
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
 * Generate a UUID v4
 */
const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
