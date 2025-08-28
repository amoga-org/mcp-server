/**
 * Workflow V1 Parser and Validator
 * Handles XML validation and business logic parsing for CMMN workflows
 */

import { BusinessLogic, TaskDefinition, BusinessPattern, ConditionDefinition } from "../services/workflow-v1.service.js";

export interface ParsedXMLWorkflow {
  isValid: boolean;
  caseName?: string;
  applicationId?: string;
  tasks?: ParsedTask[];
  errors?: string[];
}

export interface ParsedTask {
  id: string;
  name: string;
  assignee?: string;
  candidateGroups?: string;
  dueDate?: string;
  formKey?: string;
  outcomes?: string[];
}

/**
 * Validate CMMN XML structure and extract information
 */
export const validateCMMNXML = (xmlContent: string): ParsedXMLWorkflow => {
  try {
    const errors: string[] = [];
    
    // Basic XML structure validation
    if (!xmlContent.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
      errors.push("Missing XML declaration");
    }
    
    if (!xmlContent.includes('<definitions') || !xmlContent.includes('</definitions>')) {
      errors.push("Missing definitions element");
    }
    
    if (!xmlContent.includes('xmlns:flowable="http://flowable.org/cmmn"')) {
      errors.push("Missing Flowable namespace");
    }
    
    // CMMN specific validation
    if (!xmlContent.includes('<case id=') || !xmlContent.includes('</case>')) {
      errors.push("Missing case element");
    }
    
    if (!xmlContent.includes('<casePlanModel') || !xmlContent.includes('</casePlanModel>')) {
      errors.push("Missing casePlanModel element");
    }
    
    // Required Flowable classes
    const requiredClasses = [
      'org.flowable.ui.application.lifecycle.listener.TemporalListener',
      'org.flowable.ui.application.TriggerTemporalFlow',
      'org.flowable.ui.application.task.listener.SetVarriable'
    ];
    
    requiredClasses.forEach(className => {
      if (!xmlContent.includes(className)) {
        errors.push(`Missing required Flowable class: ${className}`);
      }
    });
    
    // Visual diagram validation
    if (!xmlContent.includes('<cmmndi:CMMNDI>') || !xmlContent.includes('</cmmndi:CMMNDI>')) {
      errors.push("Missing CMMN diagram information");
    }
    
    // Extract basic information
    const caseNameMatch = xmlContent.match(/<case id="([^"]+)"/);
    const caseName = caseNameMatch ? caseNameMatch[1].split('_')[0] : undefined;
    
    const applicationIdMatch = xmlContent.match(/<case id="[^_]+_([^"]+)"/);
    const applicationId = applicationIdMatch ? applicationIdMatch[1] : undefined;
    
    // Extract tasks
    const tasks = extractTasksFromXML(xmlContent);
    
    return {
      isValid: errors.length === 0,
      caseName,
      applicationId,
      tasks,
      errors: errors.length > 0 ? errors : undefined
    };
    
  } catch (error) {
    return {
      isValid: false,
      errors: [`XML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
};

/**
 * Extract task information from XML
 */
const extractTasksFromXML = (xmlContent: string): ParsedTask[] => {
  const tasks: ParsedTask[] = [];
  
  try {
    // Find all humanTask elements
    const humanTaskRegex = /<humanTask[^>]*id="([^"]+)"[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/humanTask>/g;
    let match;
    
    while ((match = humanTaskRegex.exec(xmlContent)) !== null) {
      const [, id, name, content] = match;
      
      // Extract attributes
      const assigneeMatch = content.match(/flowable:assignee="([^"]+)"/);
      const candidateGroupsMatch = content.match(/flowable:candidateGroups="([^"]+)"/);
      const dueDateMatch = content.match(/flowable:dueDate="([^"]+)"/);
      const formKeyMatch = content.match(/flowable:formKey="([^"]+)"/);
      
      // Extract outcomes from SetVarriable listener
      const outcomesMatch = content.match(/SetVarriable[\s\S]*?<!\[CDATA\[(.*?)\]\]>/);
      let outcomes: string[] = [];
      
      if (outcomesMatch) {
        try {
          const variableData = JSON.parse(outcomesMatch[1]);
          outcomes = variableData.map((item: any) => 
            item.conditions?.find((c: any) => c.key === '_outcome')?.value
          ).filter(Boolean);
        } catch {
          // Ignore JSON parse errors
        }
      }
      
      tasks.push({
        id,
        name,
        assignee: assigneeMatch?.[1],
        candidateGroups: candidateGroupsMatch?.[1],
        dueDate: dueDateMatch?.[1],
        formKey: formKeyMatch?.[1],
        outcomes
      });
    }
  } catch (error) {
    console.error('Error extracting tasks from XML:', error);
  }
  
  return tasks;
};

/**
 * Parse business logic from structured input
 */
export const parseBusinessLogic = (input: any): BusinessLogic => {
  if (typeof input === 'string') {
    try {
      input = JSON.parse(input);
    } catch {
      throw new Error('Invalid JSON format for business logic');
    }
  }
  
  if (!input || typeof input !== 'object') {
    throw new Error('Business logic must be an object');
  }
  
  const { tasks, patterns } = input;
  
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error('Business logic must include at least one task');
  }
  
  // Validate and parse tasks
  const parsedTasks: TaskDefinition[] = tasks.map((task: any, index: number) => {
    if (!task.slug || typeof task.slug !== 'string') {
      throw new Error(`Task ${index + 1}: slug is required and must be a string`);
    }
    
    if (!task.displayName || typeof task.displayName !== 'string') {
      throw new Error(`Task ${index + 1}: displayName is required and must be a string`);
    }
    
    if (!Array.isArray(task.outcomes) || task.outcomes.length === 0) {
      throw new Error(`Task ${index + 1}: outcomes must be a non-empty array`);
    }
    
    return {
      slug: task.slug,
      displayName: task.displayName,
      outcomes: task.outcomes,
      assignee: task.assignee,
      candidateGroups: task.candidateGroups,
      dueDate: task.dueDate,
      formKey: task.formKey,
      repetitionLimit: task.repetitionLimit
    };
  });
  
  // Validate and parse patterns
  const parsedPatterns: BusinessPattern[] = Array.isArray(patterns) ? patterns.map((pattern: any, index: number) => {
    const validTypes = ['sequential', 'approval-chain', 'parallel', 'conditional', 'retry'];
    
    if (!validTypes.includes(pattern.type)) {
      throw new Error(`Pattern ${index + 1}: type must be one of: ${validTypes.join(', ')}`);
    }
    
    if (!Array.isArray(pattern.tasks) || pattern.tasks.length === 0) {
      throw new Error(`Pattern ${index + 1}: tasks must be a non-empty array`);
    }
    
    // Validate that all referenced tasks exist
    const taskSlugs = parsedTasks.map(t => t.slug);
    pattern.tasks.forEach((taskSlug: string) => {
      if (!taskSlugs.includes(taskSlug)) {
        throw new Error(`Pattern ${index + 1}: referenced task '${taskSlug}' does not exist`);
      }
    });
    
    // Parse conditions if provided
    let parsedConditions: ConditionDefinition[] | undefined;
    if (Array.isArray(pattern.conditions)) {
      parsedConditions = pattern.conditions.map((condition: any, condIndex: number) => {
        if (!condition.sourceTask || !condition.targetTask || !condition.outcome) {
          throw new Error(`Pattern ${index + 1}, condition ${condIndex + 1}: sourceTask, targetTask, and outcome are required`);
        }
        
        return {
          sourceTask: condition.sourceTask,
          targetTask: condition.targetTask,
          outcome: condition.outcome,
          operator: condition.operator || 'equals'
        };
      });
    }
    
    return {
      type: pattern.type,
      tasks: pattern.tasks,
      conditions: parsedConditions
    };
  }) : [];
  
  return {
    tasks: parsedTasks,
    patterns: parsedPatterns
  };
};

/**
 * Generate business logic templates for common patterns
 */
export const generateBusinessLogicTemplates = () => {
  return {
    sequentialApproval: {
      name: "Sequential Approval Chain",
      description: "Tasks execute in sequence, each requiring approval to proceed",
      template: {
        tasks: [
          {
            slug: "submit",
            displayName: "Submit Request",
            outcomes: ["submitted", "draft"],
            assignee: "${initiator}"
          },
          {
            slug: "l1Approval",
            displayName: "L1 Approval",
            outcomes: ["approved", "rejected"],
            candidateGroups: "level1Approvers"
          },
          {
            slug: "l2Approval",
            displayName: "L2 Approval",
            outcomes: ["approved", "rejected"],
            candidateGroups: "level2Approvers"
          },
          {
            slug: "complete",
            displayName: "Process Complete",
            outcomes: ["completed"],
            assignee: "${initiator}"
          }
        ],
        patterns: [
          {
            type: "approval-chain",
            tasks: ["submit", "l1Approval", "l2Approval", "complete"],
            conditions: [
              {
                sourceTask: "submit",
                targetTask: "l1Approval",
                outcome: "submitted"
              },
              {
                sourceTask: "l1Approval",
                targetTask: "l2Approval",
                outcome: "approved"
              },
              {
                sourceTask: "l2Approval",
                targetTask: "complete",
                outcome: "approved"
              }
            ]
          }
        ]
      }
    },
    
    parallelReview: {
      name: "Parallel Review Process",
      description: "Multiple reviewers work simultaneously on different aspects",
      template: {
        tasks: [
          {
            slug: "initiate",
            displayName: "Initiate Review",
            outcomes: ["started"],
            assignee: "${initiator}"
          },
          {
            slug: "technicalReview",
            displayName: "Technical Review",
            outcomes: ["approved", "rejected"],
            candidateGroups: "technicalTeam"
          },
          {
            slug: "legalReview",
            displayName: "Legal Review",
            outcomes: ["approved", "rejected"],
            candidateGroups: "legalTeam"
          },
          {
            slug: "finalApproval",
            displayName: "Final Approval",
            outcomes: ["approved", "rejected"],
            candidateGroups: "managers"
          }
        ],
        patterns: [
          {
            type: "parallel",
            tasks: ["technicalReview", "legalReview"],
            conditions: [
              {
                sourceTask: "initiate",
                targetTask: "technicalReview",
                outcome: "started"
              },
              {
                sourceTask: "initiate",
                targetTask: "legalReview",
                outcome: "started"
              }
            ]
          },
          {
            type: "sequential",
            tasks: ["finalApproval"],
            conditions: [
              {
                sourceTask: "technicalReview",
                targetTask: "finalApproval",
                outcome: "approved"
              },
              {
                sourceTask: "legalReview",
                targetTask: "finalApproval",
                outcome: "approved"
              }
            ]
          }
        ]
      }
    },
    
    retryPattern: {
      name: "Review and Retry Process",
      description: "Tasks can be redone based on review feedback",
      template: {
        tasks: [
          {
            slug: "createDocument",
            displayName: "Create Document",
            outcomes: ["completed"],
            assignee: "${initiator}",
            repetitionLimit: 5
          },
          {
            slug: "review",
            displayName: "Review Document",
            outcomes: ["approved", "needsChanges"],
            candidateGroups: "reviewers"
          },
          {
            slug: "finalize",
            displayName: "Finalize",
            outcomes: ["finalized"],
            assignee: "${initiator}"
          }
        ],
        patterns: [
          {
            type: "retry",
            tasks: ["createDocument", "review"],
            conditions: [
              {
                sourceTask: "createDocument",
                targetTask: "review",
                outcome: "completed"
              },
              {
                sourceTask: "review",
                targetTask: "createDocument",
                outcome: "needsChanges"
              },
              {
                sourceTask: "review",
                targetTask: "finalize",
                outcome: "approved"
              }
            ]
          }
        ]
      }
    }
  };
};

/**
 * Validate XML against common CMMN issues
 */
export const validateXMLQuality = (xmlContent: string): { isValid: boolean; warnings: string[]; suggestions: string[] } => {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  // Check for common issues
  if (xmlContent.includes('SetVarriable')) {
    // This is actually correct (double 'r')
  } else if (xmlContent.includes('SetVariable')) {
    warnings.push("Found 'SetVariable' - should be 'SetVarriable' (with double 'r') for Flowable compatibility");
  }
  
  // Check JSON formatting in SetVarriable
  const setVarMatches = xmlContent.match(/SetVarriable[\s\S]*?<!\[CDATA\[(.*?)\]\]>/g);
  if (setVarMatches) {
    setVarMatches.forEach((match, index) => {
      try {
        const jsonMatch = match.match(/<!\[CDATA\[(.*?)\]\]>/);
        if (jsonMatch) {
          JSON.parse(jsonMatch[1]);
        }
      } catch {
        warnings.push(`Invalid JSON in SetVarriable listener ${index + 1}`);
      }
    });
  }
  
  // Check for required elements
  const requiredElements = [
    'flowable:initiatorVariableName="initiator"',
    'class="org.flowable.ui.application.lifecycle.listener.TemporalListener"',
    'class="org.flowable.ui.application.TriggerTemporalFlow"',
    'class="org.flowable.ui.application.task.listener.SetVarriable"'
  ];
  
  requiredElements.forEach(element => {
    if (!xmlContent.includes(element)) {
      warnings.push(`Missing recommended element: ${element}`);
    }
  });
  
  // Performance suggestions
  if (!xmlContent.includes('flowable:formFieldValidation="true"')) {
    suggestions.push("Consider adding form field validation for better user experience");
  }
  
  if (!xmlContent.includes('flowable:dueDate=')) {
    suggestions.push("Consider adding due dates to tasks for better tracking");
  }
  
  if (!xmlContent.includes('flowable:candidateGroups=')) {
    suggestions.push("Consider using candidate groups for better task assignment");
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  };
};

/**
 * Extract business logic from existing CMMN XML
 */
export const extractBusinessLogicFromXML = (xmlContent: string): BusinessLogic | null => {
  try {
    const parsed = validateCMMNXML(xmlContent);
    
    if (!parsed.isValid || !parsed.tasks) {
      return null;
    }
    
    const tasks: TaskDefinition[] = parsed.tasks.map(task => ({
      slug: task.id.replace(/^.*?([^_]+)$/, '$1'), // Extract slug from ID
      displayName: task.name,
      outcomes: task.outcomes || ['completed'],
      assignee: task.assignee,
      candidateGroups: task.candidateGroups,
      dueDate: task.dueDate,
      formKey: task.formKey
    }));
    
    // Infer patterns from sentries (simplified)
    const patterns: BusinessPattern[] = [];
    
    // Look for sequential pattern
    if (tasks.length > 1) {
      patterns.push({
        type: 'sequential',
        tasks: tasks.map(t => t.slug)
      });
    }
    
    return {
      tasks,
      patterns
    };
    
  } catch (error) {
    console.error('Error extracting business logic from XML:', error);
    return null;
  }
};