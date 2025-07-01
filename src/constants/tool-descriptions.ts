/**
 * Tool descriptions for the MCP server
 * This file contains all the descriptions for ADD_DUMMY_DATA,CREATE_SOT,CREATE_UPDATE_ROLES and ADD_DUMMY_DATA:
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
    "5. CREATE_UPDATE_ROLES - Set up user roles and permissions for the objects\n" +
    "6. PUBLISH_APP - Publish the application to make it available\n" +
    "7. CREATE_SOT - Define status transitions and workflows\n" +
    // "8. ADD_DUMMY_DATA - Add test data (only for 'master' and 'object' type objects)\n\n" +
    "⚠️ IMPORTANT: Each step depends on the previous one. GET_APP_CONTRACT must be run before roles, SOT, and dummy data operations.",

  GET_APPS: "Get all applications for a tenant",

  DELETE_APP: "Delete an application from the backend system",

  GET_APP_CONTRACT:
    "Step 4 in app creation workflow: Fetch all objects in an app contract and their details. " +
    "⚠️ Run after CREATE_OBJECT and before CREATE_UPDATE_ROLES.\n\n" +
    "This tool MUST be run before using CREATE_UPDATE_ROLES, CREATE_SOT, and ADD_DUMMY_DATA to ensure proper understanding of the application structure and object configurations. " +
    "It provides essential contract data that subsequent tools depend on for validation and proper operation.",

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
    "When `origination_type` is set to `page`, the AI must auto-generate a **UI page layout** for the target object. The layout should include a relevant set of widgets under the `widgets` property. " +
    "- `record`: All widgets applicable to the object type are allowed (e.g., header, iframe, comment, activity, jsonform, attachments, etc.), including `stats` and `table` if appropriate.\n" +
    "- `dashboard`: Only `stats` and `table` widgets must be included. No other widgets are allowed.\n" +
    "⚙️ Widget Auto-Generation Rules:\n" +
    "- If object type is `workitem` or `task`, include:\n" +
    "  • header, iframe, comment, activity\n" +
    "- If object type is for display (e.g., `object`, `master`), include:\n" +
    "  • header, table, filter, stats, jsonform\n" +
    "- If collaboration is needed, include:\n" +
    "  • comment, note, attachment, conversation\n" +
    "- If automation or tracking is involved, include:\n" +
    "  • automationLogs, eventLog, progressbar, taskIframe\n" +
    "- For advanced or custom UI, optionally include:\n" +
    "  • customComponent, container, richTextEditor, carousel, qrscanner, calendar, map, chart, json\n" +
    "🧩 Grid Layout Auto-Generation:\n" +
    "Each widget must include a `grid_props` object for layout control. The AI must auto-generate these dynamically based on widget type and available space.\n" +
    "- Default layout values:\n" +
    "  • w: width (max 12)\n" +
    "  • h: height (calculated based on widget type — 1 grid unit = 14px, so total height in px ÷ 14 = h)\n" +
    "  • x, y: position on grid (auto-calculated to prevent overlap)\n" +
    "  • isResizable: true\n" +
    "  • static: false\n" +
    "🖼️ Page Layout Previews (for origination_type = page):\n" +
    "- WorkItem dashboard Page:\n" +
    "  ┌───────────────────────────────┐\n" +
    "  │   [ Stat Widget 1 ]           │\n" +
    "  │   [ Stat Widget 2 ]           │\n" +
    "  │   [ Stat Widget 3 ]           │\n" +
    "  │                               │\n" +
    "  │   [ Table - Assigned Items ]  │\n" +
    "  └───────────────────────────────┘\n" +
    "- WorkItem / Task / Object Record Page:\n" +
    "  ┌───────────────────────────────┐\n" +
    "  │       [ Header Widget ]       │\n" +
    "  │     [ iframe Widget ]        │\n" +
    "  │ [ Comment ]    [ Activity ]   │\n" +
    "  └───────────────────────────────┘\n" +
    "- Task / Object dashboard Page:\n" +
    "  ┌───────────────────────────────┐\n" +
    "  │       [ Table Widget ]        │\n" +
    "  └───────────────────────────────┘\n" +
    "- Object with Full Display Needs:\n" +
    "  ┌───────────────────────────────┐\n" +
    "  │  [ Stats ]   [ Filters ]       │\n" +
    "  │        [ Table Widget ]        │\n" +
    "  │        [ JSON Form ]           │\n" +
    "  └───────────────────────────────┘\n",

  DELETE_OBJECT: "Delete an object from the application contract",

  CREATE_UPDATE_ROLES:
    "Step 5 in app creation workflow: Create and update RBAC (Role-Based Access Control) roles for an application. " +
    "⚠️ Run after GET_APP_CONTRACT and before PUBLISH_APP.\n\n" +
    "⚠️ PREREQUISITE: GET_APP_CONTRACT must be run first to fetch the complete app contract and understand object structure, status maps, and attribute configurations. " +
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
    "Supported component types: enumeration (enumeration, multiselect), text (string, text, uuid, password, email, comment, instruction, title, Container, richText), number (integer, biginteger, float), boolean (toggle, checkbox), date. " +
    "The component_subtype must match one of the valid values for the selected component_type category.",

  ADD_DUMMY_DATA:
    "Step 8 in app creation workflow: Add AI-generated dummy data to tables based on object schema and attribute types. " +
    "⚠️ Run after CREATE_SOT as the final step in app setup.\n\n" +
    "⚠️ AUTO-FETCH CONTRACT: GET_APP_CONTRACT will be automatically run first to fetch the complete app contract and understand object structure, status maps, and attribute configurations. " +
    "⚠️ OBJECT TYPE RESTRICTION: This tool ONLY works with 'master' and 'object' type objects. It will skip workitems, tasks, and other object types.\n\n" +
    "Then generates realistic test data using the contract's object maps for status and priority values (loco_name). " +
    "Generates realistic test data for each attribute while respecting system attributes. " +
    "⚠️ Note: System attributes (status, priority, Due Date, name, assignee) will be populated using appropriate values from the contract's object maps, falling back to default values if not defined.",

  PUBLISH_APP:
    "Step 6 in app creation workflow: Publish an application using the app ID and base URL. " +
    "⚠️ Run after CREATE_UPDATE_ROLES and before CREATE_SOT.\n\n" +
    "This will make the application available for use and is required before creating SOT (Status Origination Tree). " +
    "Publishing ensures the application is properly deployed and ready for status transition configurations.",
} as const;
