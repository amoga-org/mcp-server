/**
 * Tool descriptions for the MCP server
 * This file contains all t  CREATE_SOT:
    "Step 9 in app creation workflow: Create SOT (Status Origination Tree) for all origination types. " +
    "⚠️ Run after GET_APP_CONTRACT (step 8) has re-fetched the published app contract.\n\n" +
    "⚠️ PREREQUISITES: \n" +
    "1. PUBLISH_APP must be completed (step 6)\n" +
    "2. CHECK_PUBLISH_STATUS must confirm all components are deployed (step 7)\n" +
    "3. GET_APP_CONTRACT must be re-run to fetch updated contract (step 8)\n\n" +
    "The SOT defines how and from where an object's status can change. Each transition is linked to an origination source.",riptions for ADD_DUMMY_DATA,CREATE_SOT,CREATE_UPDATE_ROLES and ADD_DUMMY_DATA:
    "⚠️ IMPORTANT: Must run GET_APP_CONTRACT first to fetch application structure!\n\n" +
    "Process for adding dummy data:\n" +
    "1. GET_APP_CONTRACT must be called first to:\n" +
    "   • Get object definitions and relationships\n" +
    "   • Retrieve status and priority configurations from maps\n" +
    "   • Understand attribute types and constraints\n\n" +
    "2. Only then ADD_DUMMY_DATA,CREATE_SOT and CREATE_UPDATE_ROLES will:\n" +
    "   • Use the fetched contract to generate appropriate data\n" +
    "   • Create records with correct status values (using loco_name from maps)\n" +
    "   • Set proper priority levels based on object configuration\n" +
    "   • Generate contextual data for all attributes\n\n" +
    "3. Data insertion:\n" +
    "   • Validates against contract rules\n" +
    "   • Posts to correct endpoints\n" +
    "   • Returns creation status\n\n" +
    "⚠️ Attempting to run this tool without first running GET_APP_CONTRACT will result in an error.", "Tool to generate and insert dummy data into application tables. Process:\n" +
    "1. First runs GET_APP_CONTRACT to fetch and analyze the complete application contract:\n" +
    "   • Understands object structure and relationships\n" +
    "   • Maps available status options (using loco_name from maps)\n" +
    "   • Identifies priority configurations\n" +
    "   • Analyzes attribute definitions and constraints\n" +
    "2. Then generates contextual dummy data:\n" +
    "   • Uses object maps for correct status and priority values\n" +
    "   • Creates realistic data for each attribute type\n" +
    "   • Respects system fields (status, priority, Due Date, name, assignee)\n" +
    "3. Finally inserts the generated records:\n" +
    "   • Validates data against contract rules\n" +
    "   • Posts to appropriate API endpoints\n" +
    "   • Returns success/failure status for each record\n" +
    "⚠️ Note: System attributes are populated using values from object maps (loco_name), falling back to defaults if not defined.",ious tools to keep the main index.ts clean
 */

export const TOOL_DESCRIPTIONS = {
  CREATE_APP:
    "Create a new application and update the backend system.\n\n" +
    "📋 REQUIRED WORKFLOW: When creating an app, follow this exact sequence:\n" +
    "1. CREATE_APP - Creates the basic application structure\n" +
    "2. CREATE_ATTRIBUTES - Define custom attributes for objects (optional but recommended)\n" +
    "3. CREATE_OBJECT - Create objects using the defined attributes\n" +
    "4. GET_APP_CONTRACT - Fetch application contract to understand structure\n" +
    "5. GENERATE_WORKFLOW - Generate workflows for the created objects\n" +
    "6. CREATE_UPDATE_ROLES - Set up user roles and permissions for the objects\n" +
    "7. PUBLISH_APP - Publish the application to make it available\n" +
    "8. GET_APP_CONTRACT - Re-fetch contract after publishing (for SOT and dummy data)\n" +
    "9. CREATE_SOT - Define status transitions and workflows\n" +
    "10. ADD_DUMMY_DATA - Add test data to objects (only for 'master' and 'object' type objects)\n\n" +
    "⚠️ IMPORTANT: Each step depends on the previous one. Steps 7-8 ensure the app is fully published before proceeding with SOT and dummy data operations.",

  GET_APPS: "Get all applications for a tenant",

  DELETE_APP: "Delete an application from the backend system",

  GET_APP_CONTRACT:
    "Step 4 & 8 in app creation workflow: Fetch all objects in an app contract and their details. " +
    "⚠️ Run after CREATE_OBJECT (step 4) and again after CHECK_PUBLISH_STATUS confirms publishing is complete (step 8).\n\n" +
    "First run (Step 4): Provides essential contract data for CREATE_UPDATE_ROLES to understand object structure and permissions.\n" +
    "Second run (Step 8): Re-fetches the updated contract after publishing to ensure CREATE_SOT and ADD_DUMMY_DATA have the latest object configurations, status maps, and attribute definitions. " +
    "This tool MUST be run before using CREATE_UPDATE_ROLES, CREATE_SOT, and ADD_DUMMY_DATA to ensure proper understanding of the application structure and object configurations.",

  CREATE_OBJECT:
    "Step 3 in app creation workflow: Create structured objects like workitems, tasks, and masters with attributes, statuses, and defined relationships. " +
    "⚠️ Run after CREATE_APP and CREATE_ATTRIBUTES, before CREATE_UPDATE_ROLES.\n\n" +
    "This tool lets you model business entities (e.g., workflows, data objects, master lists) by specifying fields, lifecycle states, and how objects relate to each other. " +
    "⚠️ Relationship Rules: " +
    "Only two relationship types are supported: oneToMany and manyToOne. " +
    "A task can be related to a workitem using only one task → workitem relationship. " +
    "Only two relationships are allowed between object types.",

  CREATE_SOT:
    "Step 7 in app creation workflow: Create SOT (Status Origination Tree) for all origination types. " +
    "⚠️ Run after PUBLISH_APP as the application must be published first.\n\n" +
    "⚠️ PREREQUISITES: \n" +
    "1. PUBLISH_APP must be run first to make the application available\n" +
    "2. GET_APP_CONTRACT will be automatically run first to understand object structure if not already done\n\n" +
    "The SOT defines how and from where an object's status can change. Each transition is linked to an origination source. " +
    "Supported origination types include:\n" +
    "• workflow - Status changes through workflow processes\n" +
    "• automation - Automated status transitions based on rules\n" +
    "• actions - Manual action-triggered status changes\n" +
    "• template_email_whatsApp - Status changes via email/WhatsApp templates\n" +
    "• template_pdf - PDF template-based status transitions\n" +
    "• create_form - Form creation triggers status changes\n" +
    "• page - UI page interactions (requires widget layout generation)\n" +
    "• navbar_and_roles - Navigation and role-based status changes\n" +
    "• dashboard - Dashboard-based status transitions\n\n" +
    "🖥️ PAGE ORIGINATION TYPE - SPECIAL HANDLING:\n" +
    "When `origination_type` is set to `page`, the AI must auto-generate a **UI page layout** for the target object. The layout should include a relevant set of widgets under the `widgets` property.\n\n" +
    "🧩 Page Generation Logic Summary:\n" +
    "Your system generates pages dynamically using a widget-based layout. Each widget has properties and is positioned based on page type and content.\n\n" +
    "📄 1. Page Types:\n" +
    "✅ Common Properties for All Pages:\n" +
    "- Widgets like: Header, Comments, Activities, Notes, etc.\n" +
    "- Layout is defined using {x, y, w, h} structure (e.g. {x: 0, y: 0, w: 8, h: 9})\n" +
    "- Header always contains: status, assigned, created-by, date-created, date-updated, masters/segments, and other key attributes\n\n" +
    "🗂️ 2. CaseIndex Page (Index View for Case):\n" +
    "- Shown Fields: title, assignee, status, due-date, masters/segments, date-created, last-update\n" +
    "- Layout: Full-width table widget with grid_props: {x: 0, y: 0, w: 12, h: 43}\n\n" +
    "📋 3. Case Record Page / Composite Case-Task Page:\n" +
    "⚙️ Dynamic Logic:\n" +
    "- If number of statuses > 5 → Show top full-width path widget (breadcrumb/status path)\n" +
    "- Else → Show path widget below header\n\n" +
    "🧱 Layout Widgets:\n" +
    "- Top-Left {x: 0, y: 0, w: 8, h: 9}: Header with important case properties\n" +
    "- Top-Right {x: 8, y: 0, w: 4, h: 23}: Comments widget\n" +
    "- Mid-Left {x: 0, y: 9, w: 8, h: 16}: Task iFrame (optional, dynamic)\n" +
    "- Bottom-Right {x: 8, y: 23, w: 4, h: 22}: Activities widget\n" +
    "- Bottom-Left {x: 0, y: 25, w: 8, h: 20}: Multi-tab widget with following tab order:\n" +
    "  • Conversation Widget (if omnichannel is important)\n" +
    "  • Tasks (table widget for related tasks)\n" +
    "  • Child Objects (not tasks - table widget)\n" +
    "  • Details Form (iframe widget)\n\n" +
    "🧾 4. Object or Master Record Page:\n" +
    "- Fields Similar to Case: title, business-segments/masters, date-created, last-update\n" +
    "- Real Layout Example (Object/Master Record):\n" +
    "  • Header {w: 8, h: 15, x: 0, y: 0} - Contains object attributes with proper minH: 6, minW: 6\n" +
    "  • Notes {w: 4, h: 15, x: 8, y: 0} - Note widget for collaboration\n" +
    "  • Tabs {w: 8, h: 42, x: 0, y: 15} - Child objects tables (Staff, Room Type, etc.)\n" +
    "  • Activity {w: 4, h: 42, x: 8, y: 15} - Activity tracking widget\n\n" +
    "🎯 AI Parameter Guidelines:\n" +
    "- When creating SOT with origination_type='page', the AI must detect object type from contract\n" +
    "- For `object` and `master` types: Generate Object Record layout (header, note, tabs, activity)\n" +
    "- For `workitem` and `task` types: Generate Case Record layout (header, comment, taskIframe, activity, tabs)\n" +
    "- Page type ('record' vs 'dashboard') determines widget combination and layout pattern\n" +
    "- Grid coordinates must prevent overlap and follow real-world tested layouts\n\n" +
    "✅ 5. Task Record Page Logic:\n" +
    "- Case A: Task with Approve/Reject/Send-Back\n" +
    "  • Top row: Minimal info\n" +
    "  • Bottom row buttons: Reject (Red), Send Back (Yellow), Approve (Green)\n" +
    "- Case B: Task with ≤ 6 Info Elements\n" +
    "  • 2 rows (max 3 columns per row)\n" +
    "  • 3rd row: Cancel + Submit\n" +
    "- Case C: Task with > 6 Info Elements\n" +
    "  • Multiple rows (2 columns per row)\n" +
    "  • Bottom: Cancel + Submit buttons\n\n" +
    "🧩 Grid Layout Auto-Generation:\n" +
    "Each widget must include a `grid_props` object for layout control. The AI must auto-generate these dynamically based on widget type and available space.\n" +
    "- Default layout values:\n" +
    "  • w: width (max 12)\n" +
    "  • h: height (calculated based on widget type — 1 grid unit = 14px, so total height in px ÷ 14 = h)\n" +
    "  • x, y: position on grid (auto-calculated to prevent overlap)\n" +
    "  • maxH: 72, maxW: 12, minH: varies by widget, minW: varies by widget\n" +
    "  • isResizable: true\n" +
    "  • static: false\n" +
    "  • moved: false\n\n" +
    "📊 Widget Types and Grid Configuration Examples:\n" +
    "- header: {w: 8, h: 15, minH: 6, minW: 6} (Object/Master), {w: 8, h: 9, minH: 2, minW: 3} (Workitem/Task)\n" +
    "- note: {w: 4, h: 15, minH: 10, minW: 3} (for Object/Master collaboration)\n" +
    "- comment: {w: 4, h: 23, minH: 15, minW: 3} (for Workitem/Task collaboration)\n" +
    "- activity: {w: 4, h: 42, minH: 10, minW: 3} (Object/Master), {w: 4, h: 22, minH: 10, minW: 3} (Workitem/Task)\n" +
    "- taskIframe: {w: 8, h: 16, minH: 4, minW: 2} (only for Workitem/Task types)\n" +
    "- tabs: {w: 8, h: 42, minH: 10, minW: 3} (Object/Master), {w: 8, h: 20, minH: 10, minW: 3} (Workitem/Task)\n" +
    "- table (index): {w: 12, h: 43, minH: 25, minW: 6}\n" +
    "- stats: {w: 4, h: 3, minH: 2, minW: 2}\n\n" +
    "⚙️ Widget Auto-Generation Rules by Object Type:\n" +
    "- `workitem` (record page): header {w:8,h:9}, comment {w:4,h:23}, taskIframe {w:8,h:16}, activity {w:4,h:22}, tabs {w:8,h:20}\n" +
    "- `task` (record page): Use task-specific layouts with approve/reject buttons or form elements\n" +
    "- `object`/`master` (record page): header {w:8,h:15}, note {w:4,h:15}, tabs {w:8,h:42}, activity {w:4,h:42}\n" +
    "- `workitem`/`task` (dashboard page): stats widgets (3 across), table widget {w:12,h:35+}\n" +
    "- `object`/`master`/`segment` (dashboard page): table widget {w:12,h:43} (full width)\n" +
    "- All record pages: Include collaboration widgets (comment/note, activity)\n" +
    "- All dashboard pages: Focus on data display (stats, tables)\n\n" +
    "🔍 Object Type Detection Logic:\n" +
    "- AI must read object_slug from SOT data and match against app contract objects\n" +
    "- Contract object.type determines which widget layout to generate\n" +
    "- Page type (record/dashboard) from origination.type determines overall structure\n" +
    "- Widget positioning coordinates must prevent overlap using tested real-world layouts\n\n" +
    "🖼️ Implementation Notes:\n" +
    "- All widgets include comprehensive configs with icon, color, props, and grid_props\n" +
    "- Widget slugs are auto-generated using UUID for uniqueness\n" +
    "- Tab widgets contain multiple child widgets with their own configurations\n" +
    "- Layout coordinates prevent overlap and ensure responsive design\n" +
    "- Page type determines the specific widget combination and layout pattern\n\n" +
    "🚀 AI Integration Instructions:\n" +
    "- When processing SOT creation with origination_type='page':\n" +
    "  1. Extract object_slug from SOT data\n" +
    "  2. Look up object in app contract to get object.type (workitem, task, object, master, segment)\n" +
    "  3. Use origination.type to determine page type (record/dashboard)\n" +
    "  4. Call generateWidgets(objectType, pageType) to create appropriate layout\n" +
    "  5. Widgets are automatically attached to SOT and included in API payload\n" +
    "- Widget generation happens automatically in sot.service.ts when SOT origination_type='page'\n" +
    "- No manual widget specification needed - system auto-generates based on object type\n\n",

  DELETE_OBJECT: "Delete an object from the application contract",

  CREATE_UPDATE_ROLES:
    "Step 5 in app creation workflow: Create and update RBAC (Role-Based Access Control) roles for an application. " +
    "⚠️ Run after GET_APP_CONTRACT (step 4) and before PUBLISH_APP (step 6).\n\n" +
    "⚠️ PREREQUISITE: GET_APP_CONTRACT must be run first (step 4) to fetch the complete app contract and understand object structure, status maps, and attribute configurations. " +
    "This tool allows you to define roles with specific permissions for each object in the app. " +
    "Each role must have a unique `loco_role` identifier at the app level, a `display_name` for UI display, " +
    "and `loco_permission` which maps object slugs to permission sets. " +
    "Default permissions include: pick, read, assign, create, delete, update, and release. " +
    "If objects are not present in the app, default roles will be created automatically.",

  CREATE_UPDATE_ATTRIBUTE:
    "Step 2 in app creation workflow: Create custom attributes for objects in the application. " +
    "⚠️ Run after CREATE_APP and before CREATE_OBJECT.\n\n" +
    "⚠️ IMPORTANT: The following system attributes are reserved and should NOT be created as they are automatically managed by the system: " +
    "'status', 'priority', 'Due Date', 'name', and 'assignee'. Attempting to create these will result in an error. " +
    "\n\nThis tool allows you to define custom fields with specific display names, component types, component subtypes, and unique keys. " +
    "Each attribute will be created with auto-generated unique slugs to prevent conflicts. " +
    "Supported component types: enumeration (enumeration, multiselect), text (string, text, uuid, password, email, comment, instruction, title, Container, richText), number (integer, biginteger, float), boolean (toggle, checkbox), date, related_field (for cascading dropdowns like Country→State→City). " +
    "The component_subtype must match one of the valid values for the selected component_type category. " +
    "\n\n🔗 RELATED_FIELD TYPE: For cascading dropdowns, use component_type='related_field' and provide related_objects_configuration array with parent-child object relationships. " +
    "Each configuration object should specify: parent (null for root), attributes (array of attribute names to fetch), object_slug (target object), and optional source_attribute (linking field).",

  ADD_DUMMY_DATA:
    "Step 10 in app creation workflow: Add AI-generated dummy data to tables based on object schema and attribute types. " +
    "⚠️ Run after CREATE_SOT as the final step in app setup.\n\n" +
    "⚠️ PREREQUISITES:\n" +
    "1. All previous steps (1-9) must be completed successfully\n" +
    // "2. CHECK_PUBLISH_STATUS must confirm publishing is complete\n" +/
    "2. GET_APP_CONTRACT must have been re-run after publishing to fetch updated contract\n\n" +
    "⚠️ AUTO-FETCH CONTRACT: If GET_APP_CONTRACT hasn't been run recently, it will be automatically executed first to fetch the complete app contract and understand object structure, status maps, and attribute configurations. " +
    "⚠️ OBJECT TYPE RESTRICTION: This tool ONLY works with 'task','workitem','master' and 'object' type objects.\n\n" +
    "Then generates realistic test data using the contract's object maps for status and priority values (loco_name). " +
    "Generates realistic test data for each attribute while respecting system attributes. " +
    "⚠️ Note: System attributes (status, priority, Due Date, name, assignee) will be populated using appropriate values from the contract's object maps, falling back to default values if not defined.",

  PUBLISH_APP:
    "Step 6 in app creation workflow: Publish an application using the app ID and base URL. " +
    "⚠️ Run after CREATE_UPDATE_ROLES and before CHECK_PUBLISH_STATUS.\n\n" +
    "This will initiate the application deployment process and make the application available for use. " +
    "After publishing, you must run CHECK_PUBLISH_STATUS to monitor and ensure all components are successfully deployed " +
    "before proceeding with SOT (Status Origination Tree) creation and dummy data generation." +
    "get version from app contract and pass it as a parameter to the API call.\n\n",

  CHECK_PUBLISH_STATUS:
    "Step 7 in app creation workflow: Check if application publishing process is completed by monitoring deployment status. " +
    "⚠️ Run after PUBLISH_APP and before re-running GET_APP_CONTRACT.\n\n" +
    "This tool checks the publication status of various app components (App_meta, Datastore, Forms, Workflow, Pages, Automation) " +
    "by polling the API endpoint up to 20 times every 30 seconds until all components show completion status.\n\n" +
    "Status Values:\n" +
    "• 'completed' - Component is successfully deployed\n" +
    "• 'not_started' - Component deployment hasn't begun\n" +
    "• '' (empty string) - Component is completed (shown as 'completed' to user)\n" +
    "• 'failure' - Component deployment failed\n" +
    "• 'in_progress' - Component is currently being deployed\n" +
    "• 'queued' - Component is waiting to be deployed\n\n" +
    "The tool returns the final status and indicates whether the entire application publishing process is complete. " +
    "Publishing is considered complete when all component statuses are one of: 'completed', 'success', 'not_started', '' (empty), or 'failure'. " +
    "⚠️ NEXT STEPS: Once publishing is complete, run GET_APP_CONTRACT again to fetch the updated contract, then proceed with CREATE_SOT and ADD_DUMMY_DATA.",

  GENERATE_WORKFLOW:
    "Generate and deploy workflows for workitem-type objects ONLY, then automatically publish the application. " +
    "This tool creates CMMN (Case Management Model and Notation) workflows specifically for objects with type 'workitem' and deploys them to the Flowable engine.\n\n" +
    "Process:\n" +
    "1. Fetches app contract to get app name and workitem objects (if not provided)\n" +
    "2. Validates that objects are workitem-type (type: 'workitem') only\n" +
    "3. Generates CMMN XML for each workitem object based on the object structure\n" +
    "4. Deploys the workflow to Flowable engine via multipart form upload\n" +
    "5. Saves workflow configuration data to the application level\n" +
    "6. 🚀 AUTOMATIC PUBLISHING: If all workflows are generated successfully, automatically publishes the application\n\n" +
    "⚠️ PREREQUISITES:\n" +
    "• Application must have workitem-type objects created (type: 'workitem' ONLY)\n" +
    "• Valid authentication token required\n\n" +
    "🔒 STRICT VALIDATION:\n" +
    "• Only objects with type 'workitem' are processed\n" +
    "• Objects, tasks, masters, etc. are excluded\n" +
    "• Manual workitem object validation against app contract\n\n" +
    "🚀 AUTOMATIC PUBLISHING:\n" +
    "• Publishes app automatically when ALL workflows succeed\n" +
    "• Skips publishing if ANY workflow fails\n" +
    "• Provides clear status of both workflow generation AND publishing\n\n" +
    "📋 OPTIONAL PARAMETERS:\n" +
    "• appName: Will be fetched from app contract if not provided\n" +
    "• caseObjects: Will be auto-discovered from app contract if not provided (filters for type: 'workitem' only)\n\n" +
    "📝 NEXT STEPS AFTER SUCCESS:\n" +
    "• Run PUBLISH_APP to monitor deployment progress\n" +
    "• Then proceed with CREATE_SOT and ADD_DUMMY_DATA",

  CREATE_AUTOMATION:
    "Create intelligent automation flows with AI-generated Python scripts based on comprehensive descriptions. " +
    "This tool uses artificial intelligence to analyze your requirements and automatically generate the appropriate code, imports, and business logic.\n\n" +
    "🤖 AI-POWERED SCRIPT GENERATION:\n" +
    "• **Smart Import Detection**: AI analyzes your description to import only required utility functions\n" +
    "• **Pattern Recognition**: Automatically detects patterns like email notifications, object creation, file processing, etc.\n" +
    "• **Logic Generation**: Creates complete business logic based on your description\n" +
    "• **Error Handling**: Includes comprehensive error handling and logging\n" +
    "• **Best Practices**: Implements coding best practices and proper documentation\n\n" +
    "📝 SCRIPT DESCRIPTION FORMAT:\n" +
    "Provide a comprehensive description including:\n" +
    "1. **What the script should do**: Clear explanation of business logic\n" +
    "2. **Which utilities to use**: Email, notifications, database, file processing, etc.\n" +
    "3. **Integration patterns**: External APIs, Teams alerts, PDF generation\n" +
    "4. **Error handling requirements**: How to handle failures\n" +
    "5. **Flow details**: Step-by-step automation workflow\n\n" +
    "🔧 TRIGGER TYPES:\n" +
    "1. **Object**: Automate CRUD events (created, updated, deleted) on specific objects\n" +
    "   • Requires: objectSlug, crudEvent\n" +
    "2. **Core**: Start workflows based on system events (import, export, sync)\n" +
    "   • Requires: objectSlug (as task_type)\n" +
    "   • Optional: coreEventName (default: 'import')\n" +
    "3. **Schedule**: Execute workflows on custom schedules (cron-based)\n" +
    "   • Optional: cronExpression (default: '0 0 * * *')\n" +
    "4. **Webhook**: Trigger workflows via external webhook calls\n" +
    "   • No additional parameters required\n\n" +
    "🛠️ AI-DETECTED UTILITY FUNCTIONS:\n" +
    "Based on your description, AI automatically imports and uses:\n" +
    "• **Object Operations**: create_object, update_object, delete_object, get_objects\n" +
    "• **Bulk Operations**: bulk_create_object, bulk_update_object, bulk_import_data\n" +
    "• **Email & Notifications**: send_mail_sendgrid, send_mail_smtp, send_push_notification, send_socket\n" +
    "• **File Processing**: html_to_pdf_base64_or_url, convert_data_to_file_url\n" +
    "• **External Integration**: external_api, execute_mysql_db_query\n" +
    "• **Teams Integration**: send_teams_alert_message\n" +
    "• **App Management**: get_tenant_app_details, get_tenant_connections\n\n" +
    "� AI SCRIPT FEATURES:\n" +
    "• Smart pattern detection from description keywords\n" +
    "• Automatic error handling with user notifications\n" +
    "• Comprehensive logging with different levels (info, error, warn, debug)\n" +
    "• Real-time UI updates via socket messages\n" +
    "• Professional email templates with styling\n" +
    "• PDF report generation with object data\n" +
    "• External API integration patterns\n\n" +
    "🎯 EXAMPLE DESCRIPTIONS:\n" +
    "• 'When a workitem is created, send a welcome email to the user and create a follow-up task'\n" +
    "• 'On object update, query external database, generate PDF report, and send Teams notification'\n" +
    "• 'Schedule daily: fetch data from external API, bulk update objects, and email summary report'\n" +
    "• 'Webhook trigger: validate incoming data, create objects, and notify users via push notifications'\n\n" +
    "⚠️ PREREQUISITES:\n" +
    "• Application must exist and be accessible\n" +
    "• For object/core triggers: Target object must exist in app contract\n" +
    "• Valid authentication token required\n" +
    "• Provide detailed scriptDescription for optimal AI generation",

  CREATE_NAVBAR:
    "Creates role-based, SOW-compliant navigation bars (navbars) for an Amoga application. This tool automatically creates separate navbars for each role (excluding administrator) based on the app contract permissions and page assignments.\n\n" +
    "**Key Features:**\n" +
    "- **Role-Based Creation:** Creates one navbar per role found in app contract (administrator role excluded)\n" +
    "- **Permission-Based Page Access:** Each role only sees pages they have read permissions for\n" +
    "- **Multiple Navbar Names:** Accepts array of navbar names for each role\n" +
    "- **Automatic Tool Execution:** Runs get-app-contract and get-app-pages internally\n" +
    "- **Strict Route Usage:** All routes use page_id for navigation\n\n" +
    "**SOW Navigation Structure (Strict Order):**\n" +
    "1. **📊 Dashboard** - Analytics and insights pages (Rank 1)\n" +
    "2. **✅ Tasks** - Task management and workflow items (Rank 2)\n" +
    "3. **💼 Case Objects** - workitem-type objects only, parent/top-level only (Rank 3+)\n" +
    "4. **📦 Object/Ad-Hoc Objects** - object/segment-type objects, parent/top-level only (Rank 4+)\n" +
    "5. **⚙️ Admin** - Master/Meta objects, only visible to admin roles (Final rank)\n\n" +
    "**Role-Based Page Filtering:**\n" +
    "- Pages are filtered based on object_slug permissions in loco_permission\n" +
    "- Only pages where role has read: true permission are included\n" +
    "- Dashboard and general pages are accessible to all roles\n" +
    "- Administrator role is completely excluded from navbar creation\n\n" +
    "**Generated Sub-Menu Items per Object:**\n" +
    "- **My [ObjectName]** - Items assigned to current user\n" +
    "- **All [ObjectName]** - All items of this type\n" +
    "- **Overdue [ObjectName]** - Past due items (for workitem/task types only)\n\n" +
    "**Input Parameters:**\n" +
    "- **navbarName:** Array of strings (one per role, excluding administrator)\n" +
    "- **baseUrl, appId, tenantName, email:** Required for API access\n" +
    "- Tool automatically fetches app contract and pages\n\n" +
    "**Example Usage:**\n" +
    "If app has roles: ['manager', 'user', 'administrator'], provide navbarName: ['Manager Dashboard', 'User Portal']\n" +
    "Tool creates 2 navbars (administrator excluded) with role-specific page access\n\n" +
    "**Requirements:**\n" +
    "- Valid app contract with role permissions (loco_permission structure)\n" +
    "- Pages must have object_slug for permission-based filtering\n" +
    "- Routes strictly use page_id format: /{page_id}\n\n" +
    "The tool ensures each role only sees navigation items they have permission to access, following strict SOW grouping and ordering requirements.",

  GET_APP_PAGES:
    "Retrieves all pages available for navigation in Amoga applications. This tool fetches comprehensive page data from the core page API and can optionally filter results by application ID.\n\n" +
    "**Key Features:**\n" +
    "- **Complete Page Discovery:** Fetches all pages from the core page API\n" +
    "- **Application Filtering:** Optional filtering by specific application ID\n" +
    "- **Status Information:** Returns page status, creation/update timestamps\n" +
    "- **Permission Context:** Includes page permissions and role assignments\n" +
    "- **Navigation Ready:** Provides page data formatted for navigation systems\n\n" +
    "**Returned Page Information:**\n" +
    "- **Basic Details:** ID, name, display name, slug, description\n" +
    "- **Status & Timestamps:** Current status, creation and update times\n" +
    "- **Application Context:** Associated application ID for filtering\n" +
    "- **Navigation Data:** Icon, route, permissions, and role assignments\n" +
    "- **Metadata:** Additional page configuration and settings\n\n" +
    "**Use Cases:**\n" +
    "- Building application navigation systems\n" +
    "- Auditing available pages across applications\n" +
    "- Creating custom page listings and menus\n" +
    "- Understanding page structure for role-based access\n" +
    "- Integration with navbar generation tools\n\n" +
    "**Parameters:**\n" +
    "- **appId (optional):** When provided, filters pages for specific application\n" +
    "- **baseUrl & tenantName:** Required for API authentication\n\n" +
    "**Response:**\n" +
    "- If appId provided: Returns filtered pages for that specific application\n" +
    "- If appId omitted: Returns all pages across all applications\n" +
    "- Includes total count and filtering status for clarity\n\n" +
    "This tool is particularly useful when building navigation systems or understanding the page structure of Amoga applications.",

  CREATE_JOB_TITLE:
    "Creates job titles for all roles in an application (excluding administrator) and automatically links them to their corresponding navbars and roles. This tool integrates with the navbar creation system to provide complete user management setup.\n\n" +
    "**Key Features:**\n" +
    "- **Role-Based Creation:** Creates one job title per role (excluding administrator)\n" +
    "- **Automatic Integration:** Links job titles to corresponding navbars and roles\n" +
    "- **User Management Data:** Fetches application roles, navbars, and relationships\n" +
    "- **Customizable Names:** Accepts array of job title names or generates them automatically\n" +
    "- **Department Assignment:** Assigns job titles to specified departments\n" +
    "- **Active Status:** All created job titles are automatically set to active\n\n" +
    "**Process Flow:**\n" +
    "1. **Data Retrieval:** Calls user management API to get roles, navbars, and app data\n" +
    "2. **Role Filtering:** Excludes administrator role from job title creation\n" +
    "3. **Name Assignment:** Uses provided names or generates contextual job title names\n" +
    "4. **Navbar Mapping:** Automatically links each job title to its corresponding navbar\n" +
    "5. **Job Title Creation:** Creates job titles via the object flow API\n\n" +
    "**Generated Job Title Structure:**\n" +
    "- **Name:** Role-based or custom job title name\n" +
    "- **Active Status:** Always true\n" +
    "- **Department:** Specified department (default: Engineering)\n" +
    "- **Assigned To:** Application or entity name\n" +
    "- **App Mapping:** Linked to specific application ID\n" +
    "- **Role Mapping:** Connected to corresponding role ID\n" +
    "- **Navbar Integration:** Mapped to role-specific navbar\n\n" +
    "**Use Cases:**\n" +
    "- Complete user management setup after navbar creation\n" +
    "- Organizational structure definition\n" +
    "- Role-based job title assignment\n" +
    "- Department-wise user categorization\n" +
    "- Integration with HR and user management systems\n\n" +
    "**Prerequisites:**\n" +
    "- Application must exist with defined roles\n" +
    "- Navbars should be created first (recommended workflow)\n" +
    "- Valid authentication token required\n" +
    "- User management API access permissions\n\n" +
    "**Integration Workflow:**\n" +
    "1. CREATE_NAVBAR - Creates role-based navigation bars\n" +
    "2. CREATE_JOB_TITLE - Creates job titles linked to navbars and roles\n" +
    "3. Complete user management system is ready\n\n" +
    "This tool completes the user management setup by creating organizational job titles that are properly integrated with the application's role and navigation system.",

  CREATE_USER:
    "Creates users for all roles in an application (excluding administrator) and automatically maps them to corresponding job titles, departments, and navbars. This is the final step in the complete user management workflow.\n\n" +
    "**Key Features:**\n" +
    "- **Role-Based User Creation:** Creates one user per role (excluding administrator)\n" +
    "- **Automatic Job Title Mapping:** Links users to previously created job titles\n" +
    "- **Department Assignment:** Assigns users to specified departments\n" +
    "- **Email Generation:** Creates emails as {app_slug}.{rolename}@amoga.dev\n" +
    "- **Master Data Integration:** Fetches and uses job titles, departments, and assignments\n" +
    "- **Status Management:** Sets all users to 'todo' status for further configuration\n\n" +
    "**Process Flow:**\n" +
    "1. **Authentication:** Obtains CRM token for API access\n" +
    "2. **Data Retrieval:** Fetches user management data (roles, navbars, applications)\n" +
    "3. **Master Data Access:** Gets job titles, departments, and assignment data\n" +
    "4. **Role Processing:** Filters out administrator role, processes remaining roles\n" +
    "5. **User Generation:** Creates user accounts with proper mappings\n" +
    "6. **API Integration:** Posts user data via object flow API\n\n" +
    "**Generated User Structure:**\n" +
    "- **Name:** Role-based or custom user name\n" +
    "- **Email:** Auto-generated as {app_slug}.{rolename}@amoga.dev\n" +
    "- **Status:** 'todo' (ready for assignment)\n" +
    "- **Job Title:** Mapped from created job titles in master data\n" +
    "- **Department:** Specified department (default: Engineering)\n" +
    "- **Password:** Set to email address (changeable)\n" +
    "- **App Assignment:** Linked to current application\n" +
    "- **Role Mapping:** Connected to corresponding role and navbar\n" +
    "- **Phone Number:** Optional, can be provided or left empty\n\n" +
    "**Input Parameters:**\n" +
    "- **userNames (optional):** Array of custom user names (uses role-based names if not provided)\n" +
    "- **passwords (optional):** Array of custom passwords (uses email as default)\n" +
    "- **phoneNumbers (optional):** Array of phone numbers for users\n" +
    "- **department (optional):** Department name (default: Engineering)\n\n" +
    "**Use Cases:**\n" +
    "- Complete user management system implementation\n" +
    "- Automated user provisioning for new applications\n" +
    "- Role-based user account creation\n" +
    "- Integration with HR and identity management systems\n" +
    "- Multi-tenant application user setup\n\n" +
    "**Prerequisites:**\n" +
    "- Application must exist with defined roles\n" +
    "- Job titles should be created first (via CREATE_JOB_TITLE)\n" +
    "- Navbars should be created (via CREATE_NAVBAR)\n" +
    "- Valid authentication and API access permissions\n" +
    "- Master data APIs must be accessible\n\n" +
    "**Complete Workflow Integration:**\n" +
    "1. CREATE_NAVBAR - Creates role-based navigation bars\n" +
    "2. CREATE_JOB_TITLE - Creates job titles linked to navbars and roles\n" +
    "3. CREATE_USER - Creates users mapped to job titles and departments\n" +
    "4. Complete user management ecosystem is established\n\n" +
    "**Output:**\n" +
    "- Success confirmation with created user details\n" +
    "- User mapping information (role, job title, department)\n" +
    "- Generated email addresses and access credentials\n" +
    "- Integration status with application roles and navbars\n\n" +
    "This tool completes the end-to-end user management setup by creating actual user accounts that are fully integrated with the application's organizational structure, roles, and navigation system.",
} as const;
