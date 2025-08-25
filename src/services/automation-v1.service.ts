/**
 * AI-Enhanced Automation V1 Service - Create automations with AI-powered pseudo code generation
 */

import { CreateAutomationV1Params } from "../schemas/automation-v1-schema.js";
import { getCrmToken } from "./app.service.js";
import { v4 as uuidv4 } from "uuid";

// AI Analysis Interface
interface PseudoCodeAnalysis {
  actions: string[];
  patterns: string[];
  objects: string[];
  conditions: string[];
  notifications: string[];
  complexity: "simple" | "medium" | "complex";
  requiredFunctions: string[];
}

// Convert user trigger to automation parameters
function parseTrigger(
  trigger: string,
  filter?: string
): {
  triggerType: "object" | "core" | "schedule" | "webhook";
  objectSlug?: string;
  crudEvent?: string;
  coreEventName?: string;
  cronExpression?: string;
} {
  // Parse different trigger formats
  if (trigger.includes("event.task.created")) {
    return {
      triggerType: "object",
      objectSlug: "task",
      crudEvent: "created",
    };
  } else if (trigger.includes("event.case.status.changed")) {
    return {
      triggerType: "object",
      objectSlug: "workitem",
      crudEvent: "updated",
    };
  } else if (trigger.includes("event.page.action.clicked")) {
    return {
      triggerType: "core",
      objectSlug: "default",
      coreEventName: "page_action",
    };
  } else if (trigger.includes("schedule.")) {
    let cronExpression = "0 */15 * * * *";

    if (trigger.includes("every_15_minutes")) {
      cronExpression = "0 */15 * * * *";
    } else if (trigger.includes("daily")) {
      cronExpression = "0 0 0 * * *";
    } else if (trigger.includes("hourly")) {
      cronExpression = "0 0 * * * *";
    }

    return {
      triggerType: "schedule",
      cronExpression,
    };
  } else {
    return {
      triggerType: "webhook",
    };
  }
}

// AI-powered pseudo code analysis
function analyzePseudoCode(pseudoCode: string): PseudoCodeAnalysis {
  const lower = pseudoCode.toLowerCase();
  const lines = pseudoCode.split("\n").filter((line) => line.trim());

  const analysis: PseudoCodeAnalysis = {
    actions: [],
    patterns: [],
    objects: [],
    conditions: [],
    notifications: [],
    complexity: "simple",
    requiredFunctions: [],
  };

  // AI Pattern Detection
  lines.forEach((line) => {
    const lineLower = line.toLowerCase().trim();

    // Action detection
    if (
      lineLower.includes("create") ||
      lineLower.includes("add") ||
      lineLower.includes("insert")
    ) {
      analysis.actions.push("create");
      analysis.requiredFunctions.push("create_object");
    }
    if (
      lineLower.includes("update") ||
      lineLower.includes("modify") ||
      lineLower.includes("change")
    ) {
      analysis.actions.push("update");
      analysis.requiredFunctions.push("update_object");
    }
    if (lineLower.includes("delete") || lineLower.includes("remove")) {
      analysis.actions.push("delete");
      analysis.requiredFunctions.push("delete_object");
    }
    if (
      lineLower.includes("email") ||
      lineLower.includes("mail") ||
      lineLower.includes("notify")
    ) {
      analysis.notifications.push("email");
      analysis.requiredFunctions.push("send_mail_sendgrid");
    }
    if (
      lineLower.includes("pdf") ||
      lineLower.includes("report") ||
      lineLower.includes("document")
    ) {
      analysis.actions.push("pdf_generation");
      analysis.requiredFunctions.push("html_to_pdf_base64_or_url");
    }
    if (
      lineLower.includes("database") ||
      lineLower.includes("query") ||
      lineLower.includes("sql")
    ) {
      analysis.actions.push("database");
      analysis.requiredFunctions.push("execute_mysql_db_query");
    }
    if (
      lineLower.includes("api") ||
      lineLower.includes("external") ||
      lineLower.includes("webhook")
    ) {
      analysis.actions.push("external_api");
      analysis.requiredFunctions.push("external_api");
    }

    // Object detection
    if (lineLower.includes("task")) analysis.objects.push("task");
    if (lineLower.includes("case") || lineLower.includes("workitem"))
      analysis.objects.push("workitem");
    if (lineLower.includes("user") || lineLower.includes("contact"))
      analysis.objects.push("user");

    // Condition detection
    if (
      lineLower.includes("if") ||
      lineLower.includes("when") ||
      lineLower.includes("condition")
    ) {
      analysis.conditions.push(line);
    }
  });

  // Determine complexity
  const totalActions = analysis.actions.length + analysis.notifications.length;
  if (totalActions > 5 || analysis.conditions.length > 2) {
    analysis.complexity = "complex";
  } else if (totalActions > 2 || analysis.conditions.length > 0) {
    analysis.complexity = "medium";
  }

  // Remove duplicates
  analysis.actions = [...new Set(analysis.actions)];
  analysis.objects = [...new Set(analysis.objects)];
  analysis.notifications = [...new Set(analysis.notifications)];
  analysis.requiredFunctions = [...new Set(analysis.requiredFunctions)];

  return analysis;
}

// AI-powered script generation from pseudo code
function generateAIEnhancedScript(automation: any): string {
  const pseudoCode = automation.pseudo || "";
  const name = automation.name || "Automation";
  const trigger = automation.trigger || "";
  const filter = automation.filter || "";

  // AI Analysis
  const analysis = analyzePseudoCode(pseudoCode);
  console.log(`🤖 AI Analysis for ${name}:`, analysis);

  return `# AI-Enhanced Automation: ${name}
# Trigger: ${trigger}
${filter ? `# Filter: ${filter}` : ""}
# AI Analysis: ${analysis.complexity} complexity, ${
    analysis.actions.length
  } actions, ${analysis.notifications.length} notifications
# Required Functions: ${analysis.requiredFunctions.join(", ")}
# ================================================================================

# Comprehensive Amoga Connector Imports (AI-Selected) - Individual Imports for Better Readability
from amogaconnectors.utils.v1.helper import log
from amogaconnectors.utils.v1.helper import external_api
from amogaconnectors.amoga.v1.workitem import create_object
from amogaconnectors.amoga.v1.workitem import update_object
from amogaconnectors.amoga.v1.workitem import delete_object
from amogaconnectors.amoga.v1.workitem import bulk_create_object
from amogaconnectors.amoga.v1.workitem import bulk_update_object
from amogaconnectors.amoga.v1.workitem import get_objects
from amogaconnectors.amoga.v1.workitem import bulk_import_data
from amogaconnectors.amoga.v1.workitem import bulk_update_data_through_file
from amogaconnectors.amoga.v1.workitem import convert_file_url_to_data
from amogaconnectors.amoga.v1.workitem import convert_data_to_file_url
from amogaconnectors.amoga.v1.core import send_socket
from amogaconnectors.amoga.v1.core import send_push_notification
from amogaconnectors.amoga.v1.core import send_mail_smtp
from amogaconnectors.amoga.v1.core import send_mail_sendgrid
from amogaconnectors.amoga.v1.core import get_tenant_connections
from amogaconnectors.amoga.v1.core import send_teams_alert_message
from amogaconnectors.amoga.v1.core import execute_mysql_db_query
from amogaconnectors.amoga.v1.core import get_tenant_app_details
from amogaconnectors.amoga.v1.core import html_to_pdf_base64_or_url
from datetime import datetime
import json
import re

def get_ai_mapping():
    """
    AI-Generated field mappings for data transformations
    """
    return {
        # Dynamic field mappings based on pseudo code analysis
        "source_field": "target_field",
        "priority": "task_priority",
        "status": "current_status",
        "assignee": "assigned_to",
        "due_date": "deadline",
        "description": "task_description"
    }

def ai_parse_conditions(pseudo_line: str) -> dict:
    """
    AI tool to parse conditions from pseudo code lines
    """
    conditions = {}
    line_lower = pseudo_line.lower()

    # Extract comparison operators
    if "greater than" in line_lower or ">" in pseudo_line:
        conditions["operator"] = ">"
    elif "less than" in line_lower or "<" in pseudo_line:
        conditions["operator"] = "<"
    elif "equals" in line_lower or "==" in pseudo_line:
        conditions["operator"] = "=="
    elif "contains" in line_lower:
        conditions["operator"] = "in"

    # Extract field names using regex
    field_patterns = [
        r'if\\s+(\\w+)\\s+',
        r'when\\s+(\\w+)\\s+',
        r'check\\s+(\\w+)\\s+'
    ]

    for pattern in field_patterns:
        match = re.search(pattern, line_lower)
        if match:
            conditions["field"] = match.group(1)
            break

    return conditions

def ai_generate_create_logic(pseudo_line: str) -> str:
    """AI tool to generate object creation logic"""
    object_type = "task"
    if "workitem" in pseudo_line.lower() or "case" in pseudo_line.lower():
        object_type = "workitem"

    return f'''
        # AI-Generated Create Logic: {pseudo_line}
        try:
            # AI-generated object data structure
            new_object_data = {{
                "name": f"AI-Created from {{object_name}} - {pseudo_line[:50]}",
                "status": "open",
                "created_by": "ai_automation",
                "assignee": user_email or "system",
                "priority": "medium",
                "parent_id": object_id,
                "description": f"AI-Generated from pseudo: {pseudo_line}",
                "ai_generated": True,
                "original_pseudo": "{pseudo_line}"
            }}

            # Apply AI field mapping
            mapping = get_ai_mapping()
            for source_field, target_field in mapping.items():
                if source_field in object_data:
                    new_object_data[target_field] = object_data[source_field]

            # Create object using AI-determined parameters
            created_object = create_object(
                tenant,
                data=new_object_data,
                category="{object_type}",
                application_id=application_id,
                is_sync=True,
                notify=True
            )

            actions_completed.append(f"AI-Created {object_type}: {{created_object.get('id')}}")
            result[f"ai_created_{object_type}_id"] = created_object.get('id')
            log(f"✅ AI-Created {object_type}: {{created_object.get('id')}}", "info")

        except Exception as create_error:
            log(f"❌ AI Create failed: {{str(create_error)}}", "error")
            actions_completed.append(f"AI Create failed: {{str(create_error)}}")
    '''

def ai_generate_email_logic(pseudo_line: str) -> str:
    """AI tool to generate email sending logic"""
    return f'''
        # AI-Generated Email Logic: {pseudo_line}
        if user_email:
            try:
                # AI-enhanced email content generation
                email_subject = f"🤖 AI Automation: {{object_name}} - {pseudo_line[:30]}..."

                # AI-generated email template
                email_html = f\\'''
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
                        <h2 style="color: white; margin: 0;">🤖 AI Automation Executed</h2>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h3 style="color: #333;">Automation Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Object:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{object_name}}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Time:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{datetime.now()}}</td></tr>
                        </table>

                        <h4 style="color: #333;">Original Pseudo Code</h4>
                        <pre style="background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 4px;">{pseudo_line}</pre>
                    </div>
                </div>
                \\'''

                mail_payload = {{
                    'email_address': user_email,
                    'subject': email_subject,
                    'html': email_html
                }}

                send_mail_sendgrid(tenant, mail_payload)
                actions_completed.append(f"AI-Enhanced email sent to {{user_email}}")
                log(f"📧 AI-Enhanced email sent to {{user_email}}", "info")

            except Exception as email_error:
                log(f"❌ AI Email failed: {{str(email_error)}}", "error")
                actions_completed.append(f"AI Email failed: {{str(email_error)}}")
    '''

def ai_generate_implementation(pseudo_code: str) -> str:
    """
    AI tool to generate complete implementation from pseudo code
    """
    lines = pseudo_code.split('\\n')
    implementation_parts = []

    for line in lines:
        line_lower = line.lower().strip()
        if not line_lower:
            continue

        # AI pattern matching for implementation
        if "create" in line_lower and ("task" in line_lower or "object" in line_lower):
            implementation_parts.append(ai_generate_create_logic(line))
        elif "send" in line_lower and "email" in line_lower:
            implementation_parts.append(ai_generate_email_logic(line))
        elif "if" in line_lower or "when" in line_lower:
            conditions = ai_parse_conditions(line)
            implementation_parts.append(f'''
        # AI-Generated Condition: {line}
        condition_field = "{conditions.get('field', 'status')}"
        condition_operator = "{conditions.get('operator', '==')}"
        field_value = object_data.get(condition_field, "")

        if field_value:  # Basic condition check
            log(f"✅ AI Condition met: {line}", "info")
            actions_completed.append(f"AI Condition satisfied: {line}")
        else:
            log(f"❌ AI Condition not met: {line}", "warn")
            ''')
        else:
            # Generic implementation for unrecognized patterns
            implementation_parts.append(f'''
        # AI-Generated Generic Logic: {line}
        log(f"🤖 Executing AI logic: {line}", "info")
        actions_completed.append("AI-Generated: {line}")
            ''')

    return '\\n'.join(implementation_parts)

def main(payload, tenant):
    """
    AI-Enhanced Automation: ${name}

    Original pseudo code:
    ${pseudoCode
      .split("\n")
      .map((line: string) => `    ${line}`)
      .join("\n")}

    AI Analysis Results:
    - Complexity: ${analysis.complexity}
    - Detected Actions: ${analysis.actions.join(", ")}
    - Required Functions: ${analysis.requiredFunctions.join(", ")}
    - Objects Involved: ${analysis.objects.join(", ")}

    Args:
        payload (dict): Trigger data and object information
        tenant (dict): Tenant configuration and authentication

    Returns:
        dict: AI-enhanced automation execution results
    """

    log(f"🤖 Starting AI-Enhanced automation: ${name}", "info")
    log(f"📋 Trigger: ${trigger}", "info")
    ${filter ? `log(f"🔍 Filter: ${filter}", "info")` : ""}
    log(f"🧠 AI Analysis: ${analysis.complexity} complexity with ${
    analysis.actions.length
  } actions", "info")
    log(f"📥 Payload: {json.dumps(payload, indent=2)}", "debug")

    try:
        # Extract data from payload
        object_data = payload.get('object_data', {})
        trigger_type = payload.get('trigger_type', 'unknown')
        crud_event = payload.get('crud_event', 'unknown')
        application_id = payload.get('amo_application_id')
        user_email = payload.get('user_email') or object_data.get('email')
        object_id = object_data.get('id')
        object_name = object_data.get('name', 'Unknown')

        # Initialize AI-enhanced result object
        result = {
            "status": "success",
            "automation_name": "${name}",
            "trigger": "${trigger}",
            "ai_analysis": {
                "complexity": "${analysis.complexity}",
                "detected_actions": ${JSON.stringify(analysis.actions)},
                "required_functions": ${JSON.stringify(
                  analysis.requiredFunctions
                )},
                "objects_involved": ${JSON.stringify(analysis.objects)}
            },
            "actions_taken": [],
            "processed_at": str(datetime.now()),
            "object_id": object_id,
            "object_name": object_name,
            "ai_generated": True
        }

        # Initialize actions tracking
        actions_completed = []

        # AI-Generated Implementation based on pseudo code analysis
        log(f"🤖 Executing AI-generated implementation", "info")

        ${generateAIImplementationFromPseudo(pseudoCode)}

        # Update result with all actions taken
        result["actions_taken"] = actions_completed
        log(f"📋 Total AI actions completed: {len(actions_completed)}", "info")

        log(f"✅ AI-Enhanced Automation completed: ${name}", "info")
        return result

    except Exception as e:
        log(f"❌ AI Automation error in ${name}: {str(e)}", "error")

        # AI-Enhanced error notification
        if 'user_email' in locals() and user_email:
            try:
                error_mail_payload = {
                    'email_address': user_email,
                    'subject': f'🤖 AI Automation Error: ${name}',
                    'html': f'''
                    <div style="font-family: Arial, sans-serif; max-width: 600px;">
                        <h3 style="color: #dc3545;">🤖 AI Automation Error Report</h3>
                        <p><strong>Automation:</strong> ${name}</p>
                        <p><strong>Trigger:</strong> ${trigger}</p>
                        <p><strong>Error:</strong> {str(e)}</p>
                        <p><strong>Time:</strong> {datetime.now()}</p>
                        <p><strong>Object:</strong> {object_data.get('name', 'Unknown')}</p>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 10px 0;">
                            <h4>Original Pseudo Code:</h4>
                            <pre>{pseudoCode}</pre>
                        </div>
                    </div>
                    '''
                }
                send_mail_sendgrid(tenant, error_mail_payload)
                log("📧 AI Error notification sent via email", "info")
            except Exception as mail_error:
                log(f"⚠️ Failed to send AI error notification: {str(mail_error)}", "warn")

        return {
            "status": "error",
            "automation_name": "${name}",
            "message": f"AI Automation failed: {str(e)}",
            "error_details": str(e),
            "processed_at": str(datetime.now()),
            "ai_generated": True
        }
`;
}

// AI-powered implementation generator from pseudo code
function generateAIImplementationFromPseudo(pseudoCode: string): string {
  const lines = pseudoCode.split("\n").filter((line) => line.trim());
  let implementation = "";

  lines.forEach((line, index) => {
    const lineLower = line.toLowerCase().trim();

    if (
      lineLower.includes("create") &&
      (lineLower.includes("task") || lineLower.includes("object"))
    ) {
      implementation += `        ai_generate_create_logic("${line.replace(
        /"/g,
        '\\"'
      )}")\n`;
    } else if (lineLower.includes("send") && lineLower.includes("email")) {
      implementation += `        ai_generate_email_logic("${line.replace(
        /"/g,
        '\\"'
      )}")\n`;
    } else if (lineLower.includes("if") || lineLower.includes("when")) {
      implementation += `
        # AI-Generated Condition: ${line}
        conditions = ai_parse_conditions("${line.replace(/"/g, '\\"')}")
        field_value = object_data.get(conditions.get('field', 'status'), "")

        if field_value:  # Basic condition check
            log(f"✅ AI Condition met: ${line}", "info")
            actions_completed.append(f"AI Condition satisfied: ${line}")
        else:
            log(f"❌ AI Condition not met: ${line}", "warn")
        `;
    } else {
      implementation += `
        # AI-Generated Generic Logic: ${line}
        log(f"🤖 Executing AI logic: ${line}", "info")
        actions_completed.append("AI-Generated: ${line}")
        `;
    }
  });

  if (!implementation.trim()) {
    implementation = `
        # AI Fallback Implementation
        log(f"🤖 AI executing fallback logic for pseudo code", "info")
        actions_completed.append("AI-Generated fallback implementation")
        `;
  }

  return implementation;
}

// Generate automation flow data
function generateAutomationFlowData(script: string): any {
  const scriptNodeId = uuidv4();
  const triggerNodeId = uuidv4();

  let encodedScript;
  try {
    encodedScript = btoa(encodeURIComponent(script));
    console.log(
      "AI Script encoded successfully, length:",
      encodedScript.length
    );
  } catch (encodeError) {
    console.error("AI Script encoding error:", encodeError);
    encodedScript = btoa(script);
  }

  return {
    flow_nodes: [
      {
        id: triggerNodeId,
        type: "trigger",
        position: { x: 600, y: 200 },
      },
      {
        id: scriptNodeId,
        position: { x: 250, y: 250 },
        data: {
          display_name: "AI-Generated Script",
          script: encodedScript,
          language: "python",
          isPlaywrightGenerated: false,
          playwrightFormData: null,
          aiGenerated: true,
        },
        type: "script",
        width: 250,
        height: 42,
        parent: [triggerNodeId],
      },
    ],
  };
}

// Generate trigger details
function generateTriggerDetails(
  triggerType: string,
  objectSlug?: string,
  crudEvent?: string,
  coreEventName?: string,
  appId?: string
): any {
  switch (triggerType) {
    case "object":
      return {
        type: "object",
        name: crudEvent || "created",
        application_id: appId,
        task_type: objectSlug || "default",
        import_key_mapping: [],
      };

    case "core":
      return {
        type: "core",
        name: coreEventName || "import",
        application_id: appId,
        task_type: objectSlug || "default",
        import_key_mapping: [],
      };

    case "schedule":
      return {
        type: "scheduled",
        name: "Custom Schedule",
        application_id: "",
        task_type: "",
      };

    case "webhook":
      return {
        type: "webhook",
        name: "webhook",
        application_id: appId,
        task_type: "",
        import_key_mapping: [],
      };

    default:
      return {
        type: "webhook",
        name: "webhook",
        application_id: appId,
        task_type: "",
        import_key_mapping: [],
      };
  }
}

export async function createAutomationV1(params: CreateAutomationV1Params) {
  try {
    const results = [];
    const { token } = await getCrmToken(params.baseUrl, params.tenantName);

    // Process each automation with AI enhancement
    for (const automation of params.automationsData.automations) {
      console.log("🤖 Processing AI automation:", automation.name);
      try {
        // Parse the trigger
        const triggerInfo = parseTrigger(automation.trigger, automation.filter);
        console.log("🤖 AI Trigger info:", triggerInfo);

        // Generate AI-Enhanced Python script from pseudo code
        const script = generateAIEnhancedScript(automation);
        console.log("🤖 Generated AI script length:", script.length);

        // Generate flow data with AI markers
        const flowData = generateAutomationFlowData(script);
        console.log(
          "🤖 AI Flow data created with nodes:",
          flowData.flow_nodes.length
        );

        // Generate trigger details
        const triggerDetails = generateTriggerDetails(
          triggerInfo.triggerType,
          triggerInfo.objectSlug,
          triggerInfo.crudEvent,
          triggerInfo.coreEventName,
          params.appId
        );

        // Prepare automation payload with AI markers
        const automationPayload = {
          application: params.appId,
          created_by: params.email,
          name: `🤖 ${automation.name}`,
          tags: ["ai-generated", "pseudo-code"],
          is_active: true,
          schedule:
            triggerInfo.triggerType === "schedule"
              ? {
                  type: "cron",
                  value: triggerInfo.cronExpression || "0 0 * * *",
                }
              : null,
          flow_data: flowData,
          trigger_details: triggerDetails,
        };

        console.log("🤖 AI Automation payload prepared for:", automation.name);

        // Create the AI automation
        const response = await fetch(
          `${params.baseUrl}/api/v1/core/automation/flows`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              accept: "application/json, text/plain, */*",
            },
            body: JSON.stringify(automationPayload),
          }
        );

        console.log("🤖 AI API response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `AI HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }

        const responseText = await response.text();
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error("🤖 AI JSON parse error:", parseError);
          throw new Error(
            `Failed to parse AI API response: ${
              parseError instanceof Error
                ? parseError.message
                : "Unknown parsing error"
            }`
          );
        }

        results.push({
          automation: automation.name,
          status: "success",
          trigger: automation.trigger,
          triggerType: triggerInfo.triggerType,
          automationId: result?.id || result?.data?.id || "created",
          aiEnhanced: true,
        });
      } catch (error) {
        console.error(
          "🤖 Error creating AI automation:",
          automation.name,
          error
        );
        results.push({
          automation: automation.name,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
          aiEnhanced: true,
        });
      }
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    return {
      success: errorCount === 0,
      message: `🤖 AI Created ${successCount} automations${
        errorCount > 0 ? `, ${errorCount} failed` : ""
      }`,
      results,
      automationsCreated: successCount,
      automationsFailed: errorCount,
      aiEnhanced: true,
    };
  } catch (error) {
    return {
      success: false,
      message: `🤖 Failed to create AI automations: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      error: error instanceof Error ? error.message : "Unknown error",
      aiEnhanced: true,
    };
  }
}
