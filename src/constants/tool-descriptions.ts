/**
 * Tool descriptions for the MCP server
 * This file contains all the descriptions for the various tools to keep the main index.ts clean
 */

export const TOOL_DESCRIPTIONS = {
  CREATE_APP: "Create a new application and update the backend system",

  GET_APPS: "Get all applications for a tenant",

  DELETE_APP: "Delete an application from the backend system",

  GET_APP_CONTRACT: "Fetch all objects in an app contract and their details",

  CREATE_OBJECT:
    "Create structured objects like workitems, tasks, and masters with attributes, statuses, and defined relationships. " +
    "This tool lets you model business entities (e.g., workflows, data objects, master lists) by specifying fields, lifecycle states, and how objects relate to each other. " +
    "⚠️ Relationship Rules: " +
    "Only two relationship types are supported: oneToMany and manyToOne. " +
    "A task can be related to a workitem using only one task → workitem relationship. " +
    "Only two relationships are allowed between object types.",

  CREATE_SOT:
    "Create SOT (Status Origination Tree). " +
    "The SOT defines how and from where an object's status can change. Each transition is linked to an origination source such as a workflow, automation rule, or page. " +
    "If `origination_type` is set to `page`, the AI must auto-generate a **UI page layout** for the target object. The layout should include a relevant set of widgets under the `widgets` property. If not explicitly provided, the AI should decide when `origination_type` should be `page` based on the nature of the object and transition context. " +
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
    "Create and update RBAC (Role-Based Access Control) roles for an application. " +
    "This tool allows you to define roles with specific permissions for each object in the app. " +
    "Each role must have a unique `loco_role` identifier at the app level, a `display_name` for UI display, " +
    "and `loco_permission` which maps object slugs to permission sets. " +
    "Default permissions include: pick, read, assign, create, delete, update, and release. " +
    "If objects are not present in the app, default roles will be created automatically.",

  CREATE_ATTRIBUTE:
    "Create custom attributes for objects in the application. " +
    "This tool allows you to define fields with specific display names, component types, component subtypes, and unique keys. " +
    "Each attribute will be created with auto-generated unique slugs to prevent conflicts. " +
    "Supported component types: enumeration (enumeration, status, priority, multiselect), text (string, text, uuid, password, email, comment, instruction, title, Container, richText), number (integer, biginteger, float), boolean (toggle, checkbox), date. " +
    "The component_subtype must match one of the valid values for the selected component_type category.",
} as const;
