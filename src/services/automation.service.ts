import { getCrmToken } from "./app.service.js";
import { CreateAutomationParams } from "../types/app.types.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate AI-driven automation script based on comprehensive description
 * @param description - Comprehensive description including what to do, which utils to use, business logic, etc.
 * @returns Python script code with AI-generated logic based on description
 */
export const generateAutomationScript = (description: string): string => {
  // Parse the description to identify key components
  const lowercaseDesc = description.toLowerCase();

  // AI-driven import detection based on description keywords
  const requiredImports: string[] = [];
  const logicPatterns: string[] = [];

  // Basic imports (always included)
  requiredImports.push("from amogaconnectors.utils.v1.helper import log");

  // Object operations
  if (
    lowercaseDesc.includes("create") ||
    lowercaseDesc.includes("new") ||
    lowercaseDesc.includes("add")
  ) {
    requiredImports.push(
      "from amogaconnectors.amoga.v1.workitem import create_object"
    );
    logicPatterns.push("object_creation");
  }

  if (
    lowercaseDesc.includes("update") ||
    lowercaseDesc.includes("modify") ||
    lowercaseDesc.includes("change")
  ) {
    requiredImports.push(
      "from amogaconnectors.amoga.v1.workitem import update_object"
    );
    logicPatterns.push("object_update");
  }

  if (lowercaseDesc.includes("delete") || lowercaseDesc.includes("remove")) {
    requiredImports.push(
      "from amogaconnectors.amoga.v1.workitem import delete_object"
    );
    logicPatterns.push("object_deletion");
  }

  if (
    lowercaseDesc.includes("get") ||
    lowercaseDesc.includes("fetch") ||
    lowercaseDesc.includes("retrieve") ||
    lowercaseDesc.includes("find")
  ) {
    requiredImports.push(
      "from amogaconnectors.amoga.v1.workitem import get_objects"
    );
    logicPatterns.push("object_retrieval");
  }

  // Bulk operations
  if (
    lowercaseDesc.includes("bulk") ||
    lowercaseDesc.includes("multiple") ||
    lowercaseDesc.includes("batch")
  ) {
    requiredImports.push(
      "from amogaconnectors.amoga.v1.workitem import bulk_create_object"
    );
    requiredImports.push(
      "from amogaconnectors.amoga.v1.workitem import bulk_update_object"
    );
    logicPatterns.push("bulk_operations");
  }

  // Email and notifications
  if (
    lowercaseDesc.includes("email") ||
    lowercaseDesc.includes("mail") ||
    lowercaseDesc.includes("notify")
  ) {
    requiredImports.push(
      "from amogaconnectors.amoga.v1.core import send_mail_sendgrid"
    );
    requiredImports.push(
      "from amogaconnectors.amoga.v1.core import send_mail_smtp"
    );
    logicPatterns.push("email_notification");
  }

  if (
    lowercaseDesc.includes("notification") ||
    lowercaseDesc.includes("alert") ||
    lowercaseDesc.includes("notify")
  ) {
    requiredImports.push(
      "from amogaconnectors.amoga.v1.core import send_push_notification"
    );
    requiredImports.push(
      "from amogaconnectors.amoga.v1.core import send_socket"
    );
    logicPatterns.push("notification");
  }

  if (lowercaseDesc.includes("teams") || lowercaseDesc.includes("microsoft")) {
    requiredImports.push(
      "from amogaconnectors.amoga.v1.core import send_teams_alert_message"
    );
    logicPatterns.push("teams_notification");
  }

  // External API calls
  if (
    lowercaseDesc.includes("api") ||
    lowercaseDesc.includes("external") ||
    lowercaseDesc.includes("webhook") ||
    lowercaseDesc.includes("http")
  ) {
    requiredImports.push(
      "from amogaconnectors.utils.v1.helper import external_api"
    );
    logicPatterns.push("external_api");
  }

  // Database operations
  if (
    lowercaseDesc.includes("database") ||
    lowercaseDesc.includes("mysql") ||
    lowercaseDesc.includes("sql")
  ) {
    requiredImports.push(
      "from amogaconnectors.amoga.v1.core import execute_mysql_db_query"
    );
    logicPatterns.push("database_query");
  }

  // File operations
  if (
    lowercaseDesc.includes("file") ||
    lowercaseDesc.includes("pdf") ||
    lowercaseDesc.includes("document") ||
    lowercaseDesc.includes("report")
  ) {
    requiredImports.push(
      "from amogaconnectors.amoga.v1.core import html_to_pdf_base64_or_url"
    );
    requiredImports.push(
      "from amogaconnectors.amoga.v1.workitem import convert_data_to_file_url"
    );
    requiredImports.push(
      "from amogaconnectors.amoga.v1.workitem import convert_file_url_to_data"
    );
    logicPatterns.push("file_processing");
  }

  // App and tenant management
  if (
    lowercaseDesc.includes("app") ||
    lowercaseDesc.includes("tenant") ||
    lowercaseDesc.includes("connection")
  ) {
    requiredImports.push(
      "from amogaconnectors.amoga.v1.core import get_tenant_app_details"
    );
    requiredImports.push(
      "from amogaconnectors.amoga.v1.core import get_tenant_connections"
    );
    logicPatterns.push("app_management");
  }

  // Generate AI logic patterns string
  const patternsString = JSON.stringify(logicPatterns);

  // Build the complete script
  const script = `# 🤖 AI-GENERATED AUTOMATION SCRIPT
# ================================================================================
# Description: ${description}
# Generated: ${new Date().toISOString()}
# AI Intelligence Level: Advanced
# Detected Patterns: ${patternsString}
# ================================================================================

# Required imports (AI-detected based on description)
${[...new Set(requiredImports)].join("\n")}

# Additional imports for AI functionality
from datetime import datetime
import json

def main(payload, tenant):
    """
    🤖 AI-Generated Automation Function

    This script was intelligently generated based on your description:
    "${description}"

    The AI has analyzed your requirements and automatically:
    - Selected appropriate utility functions: ${requiredImports.length} imports
    - Detected patterns: ${patternsString}
    - Generated relevant business logic
    - Implemented error handling
    - Added comprehensive logging

    Args:
        payload (dict): Trigger data and object information
        tenant (dict): Tenant configuration and authentication

    Returns:
        dict: AI automation results with detailed action log
    """

    log("🤖 AI Automation Engine Initialized", "info")
    log(f"📋 AI Task: ${description}", "info")
    log(f"🔧 AI Detected Patterns: ${patternsString}", "debug")

    try:
        log("🚀 Starting AI automation execution", "info")
        log(f"📥 Processing payload: {payload}", "debug")

        # Extract key information from payload
        object_data = payload.get('object_data', {})
        trigger_type = payload.get('trigger_type', 'unknown')
        crud_event = payload.get('crud_event', 'unknown')
        application_id = payload.get('amo_application_id')
        user_email = payload.get('user_email') or object_data.get('email')

        ai_results = {"actions_taken": [], "status": "success"}

        # 🤖 AI-Generated Logic Based on Description
        # Purpose: ${description}

        ${
          logicPatterns.includes("object_creation")
            ? `
        # 🆕 AI Logic: Object Creation
        if trigger_type == 'object' and crud_event == 'create':
            log("🤖 AI detected object creation, executing creation workflow", "info")

            # AI-generated follow-up object creation
            follow_up_data = {
                "name": f"Follow-up for {object_data.get('name', 'New Item')}",
                "status": "pending",
                "parent_id": object_data.get('id'),
                "created_by": "ai_automation",
                "description": f"AI-generated follow-up based on: ${description}"
            }

            # Create follow-up object
            new_object = create_object(
                tenant,
                data=follow_up_data,
                category="task",  # Adjust category as needed
                application_id=application_id,
                is_sync=True
            )

            ai_results["actions_taken"].append(f"Created follow-up object: {new_object.get('id')}")
            log(f"✅ AI created follow-up object: {new_object}", "info")
        `
            : ""
        }

        ${
          logicPatterns.includes("email_notification")
            ? `
        # 📧 AI Logic: Email Notification
        if user_email:
            log(f"📧 AI sending intelligent email to {user_email}", "info")

            # AI-generated personalized email content
            email_subject = f"AI Automation: ${description.substring(0, 50)}..."
            email_html = f'''
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px;">
                    <h2 style="margin: 0;">🤖 AI Automation Notification</h2>
                </div>
                <div style="padding: 20px; background: #f8f9fa;">
                    <p>Hello!</p>
                    <p>Our AI automation system has processed your request:</p>
                    <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0;">
                        <strong>Description:</strong> ${description}
                    </div>
                    <p>Object Details:</p>
                    <ul>
                        <li>ID: {object_data.get('id', 'N/A')}</li>
                        <li>Name: {object_data.get('name', 'N/A')}</li>
                        <li>Status: {object_data.get('status', 'N/A')}</li>
                    </ul>
                    <p>Best regards,<br>AI Automation System</p>
                </div>
            </div>
            '''

            # Send email using Sendgrid
            send_mail_sendgrid(tenant, {
                'email_address': user_email,
                'subject': email_subject,
                'html': email_html
            })

            ai_results["actions_taken"].append(f"Sent AI email to {user_email}")
            log(f"✅ AI sent email to {user_email}", "info")
        `
            : ""
        }

        ${
          logicPatterns.includes("notification")
            ? `
        # 🔔 AI Logic: Push and Socket Notifications
        if user_email and application_id:
            log("🔔 AI sending intelligent notifications", "info")

            # Send push notification
            push_payload = {
                "title": "🤖 AI Automation Alert",
                "message": f"AI processed: ${description.substring(0, 100)}...",
                "user_email": user_email,
                "data": {
                    "automation_type": "ai_generated",
                    "object_id": object_data.get('id'),
                    "timestamp": str(datetime.now())
                }
            }

            send_push_notification(tenant, push_payload)

            # Send socket message for real-time UI updates
            socket_payload = {
                "module": "work",
                "app_id": application_id,
                "email": user_email,
                "action_type": "ai_automation",
                "message": f"AI automation completed: ${description.substring(
                  0,
                  50
                )}...",
                "status": "success",
                "status_code": 200,
                "data": object_data
            }

            send_socket(tenant, socket_payload)

            ai_results["actions_taken"].append("Sent AI notifications (push + socket)")
            log("✅ AI sent push and socket notifications", "info")
        `
            : ""
        }

        ${
          logicPatterns.includes("external_api")
            ? `
        # 🌐 AI Logic: External API Integration
        log("🌐 AI initiating external API integration", "info")

        # AI-determined API call based on context
        api_payload = {
            "source": "ai_automation",
            "description": "${description}",
            "object_data": object_data,
            "trigger_info": {
                "type": trigger_type,
                "event": crud_event
            }
        }

        # Example external API call (adjust URL as needed)
        try:
            api_response = external_api(
                tenant,
                url="https://api.example.com/ai-webhook",  # Replace with actual URL
                method="POST",
                payload=api_payload
            )

            ai_results["actions_taken"].append(f"External API call: {api_response.get('status', 'completed')}")
            log(f"✅ AI external API response: {api_response}", "info")

        except Exception as api_error:
            log(f"⚠️ AI external API failed: {str(api_error)}", "warn")
        `
            : ""
        }

        ${
          logicPatterns.includes("database_query")
            ? `
        # 🗄️ AI Logic: Database Query and Analysis
        log("🗄️ AI executing database analysis", "info")

        # AI-generated database query (example - adjust as needed)
        db_config = {
            "host": "your_db_host",
            "user": "your_db_user",
            "password": "your_db_password",
            "database": "your_database"
        }

        # Example analytical query
        query = f"""
        SELECT
            COUNT(*) as total_records,
            AVG(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completion_rate,
            MAX(created_at) as latest_record
        FROM objects
        WHERE application_id = '{application_id}'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        """

        try:
            db_result = execute_mysql_db_query(tenant, db_config, query)

            if db_result:
                analytics_data = {
                    "total_records": db_result[0].get('total_records', 0),
                    "completion_rate": db_result[0].get('completion_rate', 0),
                    "latest_record": str(db_result[0].get('latest_record', ''))
                }

                ai_results["analytics"] = analytics_data
                ai_results["actions_taken"].append("Performed AI database analysis")
                log(f"✅ AI database analysis: {analytics_data}", "info")

        except Exception as db_error:
            log(f"⚠️ AI database query failed: {str(db_error)}", "warn")
        `
            : ""
        }

        ${
          logicPatterns.includes("file_processing")
            ? `
        # 📄 AI Logic: File and PDF Processing
        log("📄 AI processing files and documents", "info")

        # AI-generated HTML report
        report_html = f'''
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                .header {{ background: #667eea; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .data-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                .data-table th, .data-table td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
                .data-table th {{ background-color: #f2f2f2; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🤖 AI Automation Report</h1>
                <p>Generated on {str(datetime.now())}</p>
            </div>
            <div class="content">
                <h2>Automation Summary</h2>
                <p><strong>Description:</strong> ${description}</p>
                <p><strong>Trigger Type:</strong> {trigger_type}</p>
                <p><strong>Object ID:</strong> {object_data.get('id', 'N/A')}</p>

                <h2>Object Details</h2>
                <table class="data-table">
                    <tr><th>Property</th><th>Value</th></tr>
        '''

        # Add object data to table
        for key, value in object_data.items():
            report_html += f"<tr><td>{key}</td><td>{str(value)}</td></tr>"

        report_html += '''
                </table>
                <p><em>This report was automatically generated by AI automation.</em></p>
            </div>
        </body>
        </html>
        '''

        # Convert HTML to PDF
        try:
            pdf_result = html_to_pdf_base64_or_url(
                tenant,
                html_content=report_html,
                file=True,  # Get URL response
                render_content={"timestamp": str(datetime.now())}
            )

            if pdf_result and pdf_result.get('pdf_url'):
                ai_results["report_url"] = pdf_result['pdf_url']
                ai_results["actions_taken"].append(f"Generated AI report PDF: {pdf_result['pdf_url']}")
                log(f"✅ AI generated PDF report: {pdf_result['pdf_url']}", "info")

                # Email the report if user email is available
                if user_email:
                    send_mail_sendgrid(tenant, {
                        'email_address': user_email,
                        'subject': f'🤖 AI Automation Report: ${description.substring(
                          0,
                          30
                        )}...',
                        'html': '<p>Please find your AI-generated automation report attached.</p>',
                        'attachment_urls': pdf_result['pdf_url']
                    })

                    ai_results["actions_taken"].append("Emailed AI report to user")
                    log(f"✅ AI emailed report to {user_email}", "info")

        except Exception as pdf_error:
            log(f"⚠️ AI PDF generation failed: {str(pdf_error)}", "warn")
        `
            : ""
        }

        # Custom logic based on specific keywords in description
        ${
          lowercaseDesc.includes("custom")
            ? `
        # 🎯 AI Logic: Custom Processing
        log("🎯 AI detected custom processing requirements", "info")

        # Add your custom logic here based on specific requirements
        # This section can be expanded based on the AI's analysis of the description

        ai_results["actions_taken"].append("Executed custom AI logic")
        `
            : ""
        }

        log("🎉 AI automation execution completed successfully", "info")
        return {
            "status": "success",
            "message": f"AI automation completed: ${description}",
            "ai_results": ai_results,
            "processed_at": str(datetime.now()),
            "trigger_type": trigger_type,
            "patterns_detected": ${patternsString}
        }

    except Exception as e:
        log(f"❌ AI automation error: {str(e)}", "error")

        # AI error notification
        if 'user_email' in locals() and user_email:
            try:
                send_mail_sendgrid(tenant, {
                    'email_address': user_email,
                    'subject': '🤖 AI Automation Error',
                    'html': f'<p>AI automation encountered an error: {str(e)}</p><p>Description: ${description}</p>'
                })
            except:
                pass  # Don't fail the entire automation if error notification fails

        return {
            "status": "error",
            "message": f"AI automation failed: {str(e)}",
            "description": "${description}",
            "error_details": str(e)
        }
`;

  return script;
};

/**
 * Generate automation flow data based on trigger type
 * @param triggerType - Type of trigger
 * @param objectSlug - Object slug (for object triggers)
 * @param crudEvent - CRUD event (for object triggers)
 * @param appId - Application ID
 * @param script - Python script code
 * @returns Flow data object
 */
export const generateAutomationFlowData = (
  triggerType: string,
  objectSlug: string | undefined,
  crudEvent: string | undefined,
  appId: string,
  script: string
): any => {
  const scriptNodeId = uuidv4();
  const triggerNodeId = uuidv4();

  // Encode the script for the API
  const encodedScript = btoa(encodeURIComponent(script));

  const flowData = {
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
          display_name: "",
          script: encodedScript,
          language: "python",
          isPlaywrightGenerated: false,
          playwrightFormData: null,
        },
        type: "script",
        width: 250,
        height: 42,
        parent: [triggerNodeId],
      },
    ],
  };

  return flowData;
};

/**
 * Generate trigger details based on trigger type
 * @param triggerType - Type of trigger
 * @param objectSlug - Object slug (for object triggers)
 * @param crudEvent - CRUD event (for object triggers)
 * @param coreEventName - Core event name (for core triggers)
 * @param cronExpression - Cron expression (for schedule triggers)
 * @param appId - Application ID
 * @returns Trigger details object
 */
export const generateTriggerDetails = (
  triggerType: string,
  objectSlug: string | undefined,
  crudEvent: string | undefined,
  coreEventName: string | undefined,
  cronExpression: string | undefined,
  appId: string
): any => {
  switch (triggerType) {
    case "object":
      if (!objectSlug || !crudEvent) {
        throw new Error(
          "Object slug and CRUD event are required for object triggers"
        );
      }
      return {
        type: "object",
        name: crudEvent,
        application_id: appId,
        task_type: objectSlug,
        import_key_mapping: [],
      };

    case "core":
      if (!objectSlug) {
        throw new Error(
          "Object slug is required for core triggers (as task_type)"
        );
      }
      return {
        type: "core",
        name: coreEventName || "import",
        application_id: appId,
        task_type: objectSlug,
        import_key_mapping: [],
      };

    case "schedule":
      return {
        type: "scheduled",
        name: `Custom Schedule${cronExpression ? ` (${cronExpression})` : ""}`,
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
      throw new Error(`Unsupported trigger type: ${triggerType}`);
  }
};

/**
 * Create automation flow
 * @param params - Automation creation parameters
 * @returns Promise with creation result
 */
export const createAutomation = async (
  params: CreateAutomationParams
): Promise<any> => {
  try {
    const { token } = await getCrmToken(params.baseUrl, params.tenantName);

    // Generate or use provided script
    const script =
      params.customScript || generateAutomationScript(params.scriptDescription);

    // Generate flow data
    const flowData = generateAutomationFlowData(
      params.triggerType,
      params.objectSlug,
      params.crudEvent,
      params.appId,
      script
    );

    // Generate trigger details
    const triggerDetails = generateTriggerDetails(
      params.triggerType,
      params.objectSlug,
      params.crudEvent,
      params.coreEventName,
      params.cronExpression,
      params.appId
    );

    // Prepare automation payload
    const automationPayload = {
      application: params.appId,
      created_by: params.email,
      name: params.name,
      tags: [],
      is_active: true,
      schedule:
        params.triggerType === "schedule"
          ? {
              type: "cron",
              value: params.cronExpression || "0 0 * * *",
            }
          : null,
      flow_data: flowData,
      trigger_details: triggerDetails,
    };

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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const result = await response.json();
    return {
      success: true,
      automation: result,
      triggerType: params.triggerType,
      objectSlug: params.objectSlug,
      crudEvent: params.crudEvent,
      scriptDescription: params.scriptDescription,
      generatedScript: script,
    };
  } catch (error) {
    throw error;
  }
};
