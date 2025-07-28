# MCP Application Creation Template

This template provides a complete workflow to automatically create a new application using the MCP (Model Context Protocol) tools. Follow the exact sequence below for successful application creation.

## 🚀 Complete Application Creation Workflow

### Required Parameters (Set These First)
```json
{
  "tenantName": "your_tenant_name",
  "baseUrl": "https://your-base-url.com",
  "email": "user@example.com"
}
```

---

## 📋 Step-by-Step Workflow

### Step 1: Create Application
**Tool:** `mcp_appstudio2_create-app`

```json
{
  "tenantName": "your_tenant_name",
  "baseUrl": "https://your-base-url.com",
  "appName": "Your Application Name"
}
```

**Expected Output:** App ID and basic app structure
**Save:** `appId`, `appSlug` for next steps

---

### Step 2: Create Custom Attributes (Optional but Recommended)
**Tool:** `mcp_appstudio2_create-object`

Define custom fields for your objects. **Do NOT create these system attributes** (they're auto-managed):
- `status`, `priority`, `Due Date`, `name`, `assignee`

```json
{
  "tenantName": "your_tenant_name",
  "baseUrl": "https://your-base-url.com",
  "appId": "app_id_from_step1",
  "appSlug": "app_slug_from_step1",
  "email": "user@example.com",
  "appName": "Your Application Name",
  "objects": [
    {
      "name": "Project",
      "type": "workitem",
      "attributes": [
        {
          "display_name": "Project Description",
          "component_type": "text"
        },
        {
          "display_name": "Priority Level",
          "component_type": "enumeration"
        },
        {
          "display_name": "Start Date",
          "component_type": "date"
        },
        {
          "display_name": "Budget",
          "component_type": "number"
        },
        {
          "display_name": "Is Active",
          "component_type": "boolean"
        }
      ],
      "status": [
        {
          "name": "Draft",
          "color": "#gray",
          "amo_name": "todo"
        },
        {
          "name": "In Progress",
          "color": "#blue",
          "amo_name": "inProgress"
        },
        {
          "name": "Completed",
          "color": "#green",
          "amo_name": "completed"
        },
        {
          "name": "On Hold",
          "color": "#yellow",
          "amo_name": "onHold"
        }
      ],
      "relationship": [
        {
          "name": "tasks",
          "relationship_type": "oneToMany"
        }
      ]
    },
    {
      "name": "Task",
      "type": "task",
      "attributes": [
        {
          "display_name": "Task Notes",
          "component_type": "text"
        },
        {
          "display_name": "Estimated Hours",
          "component_type": "number"
        }
      ],
      "status": [
        {
          "name": "To Do",
          "color": "#gray",
          "amo_name": "todo"
        },
        {
          "name": "In Progress",
          "color": "#blue",
          "amo_name": "inProgress"
        },
        {
          "name": "Done",
          "color": "#green",
          "amo_name": "completed"
        }
      ],
      "relationship": [
        {
          "name": "project",
          "relationship_type": "manyToOne"
        }
      ]
    },
    {
      "name": "Department",
      "type": "master",
      "attributes": [
        {
          "display_name": "Department Code",
          "component_type": "text"
        },
        {
          "display_name": "Manager Email",
          "component_type": "text"
        }
      ]
    }
  ]
}
```

**Object Types Available:**
- `workitem` - Main workflow objects (projects, cases, tickets)
- `task` - Sub-tasks and activities
- `object` - General business objects
- `master` - Reference/lookup data
- `segment` - Data categorization

**Component Types:**
- `text` - String, email, password, comment, etc.
- `enumeration` - Dropdown, multiselect
- `number` - Integer, float, currency
- `boolean` - Toggle, checkbox
- `date` - Date picker
- `related_field` - Cascading dropdowns

**Relationship Rules:**
- Only `oneToMany` and `manyToOne` supported
- Max 2 relationships between object types
- Task → WorkItem relationships recommended

---

### Step 3: Get Application Contract
**Tool:** `mcp_appstudio2_get-app-contract`

```json
{
  "baseUrl": "https://your-base-url.com",
  "appId": "app_id_from_step1",
  "tenantName": "your_tenant_name"
}
```

**Purpose:** Fetch complete app structure for role creation
**Save:** Contract data for next step

---

### Step 4: Generate Workflows (For WorkItems Only)
**Tool:** `generate-workflow`

```json
{
  "baseUrl": "https://your-base-url.com",
  "appId": "app_id_from_step1",
  "tenantName": "your_tenant_name"
}
```

**Note:** Only processes objects with `type: "workitem"`
**Auto-publishes** app when all workflows succeed

---

### Step 5: Create User Roles & Permissions
**Tool:** `create-update-roles`

```json
{
  "baseUrl": "https://your-base-url.com",
  "appId": "app_id_from_step1",
  "tenantName": "your_tenant_name",
  "email": "user@example.com",
  "roles": [
    {
      "loco_role": "manager",
      "display_name": "Project Manager",
      "loco_permission": {
        "project": {
          "pick": true,
          "read": true,
          "assign": true,
          "create": true,
          "delete": true,
          "update": true,
          "release": true
        },
        "task": {
          "pick": true,
          "read": true,
          "assign": true,
          "create": true,
          "delete": false,
          "update": true,
          "release": true
        }
      }
    },
    {
      "loco_role": "user",
      "display_name": "Team Member",
      "loco_permission": {
        "project": {
          "pick": false,
          "read": true,
          "assign": false,
          "create": false,
          "delete": false,
          "update": false,
          "release": false
        },
        "task": {
          "pick": true,
          "read": true,
          "assign": false,
          "create": true,
          "delete": false,
          "update": true,
          "release": true
        }
      }
    }
  ]
}
```

**Permission Types:**
- `pick` - Can select/choose items
- `read` - Can view items
- `assign` - Can assign items to others
- `create` - Can create new items
- `delete` - Can delete items
- `update` - Can modify items
- `release` - Can release/complete items

---

### Step 6: Publish Application
**Tool:** `publish-app`

```json
{
  "baseUrl": "https://your-base-url.com",
  "appId": "app_id_from_step1",
  "tenantName": "your_tenant_name"
}
```

**Purpose:** Deploy app to production environment

---

### Step 7: Check Publishing Status
**Tool:** `check-publish-status`

```json
{
  "baseUrl": "https://your-base-url.com",
  "appId": "app_id_from_step1",
  "tenantName": "your_tenant_name"
}
```

**Wait for:** All components show `completed` status
**Components:** App_meta, Datastore, Forms, Workflow, Pages, Automation

---

### Step 8: Re-fetch Application Contract
**Tool:** `mcp_appstudio2_get-app-contract`

```json
{
  "baseUrl": "https://your-base-url.com",
  "appId": "app_id_from_step1",
  "tenantName": "your_tenant_name"
}
```

**Purpose:** Get updated contract after publishing for SOT and dummy data

---

### Step 9: Create Status Origination Tree (SOT)
**Tool:** `mcp_appstudio2_create-sot`

```json
{
  "baseUrl": "https://your-base-url.com",
  "appId": "app_id_from_step1",
  "tenantName": "your_tenant_name",
  "sotData": [
    {
      "id": "project_todo_to_progress",
      "description": "Move project from draft to in progress",
      "instruction": "Start working on the project",
      "name": "Start Project",
      "object_slug": "project",
      "origination_type": "page",
      "status": {
        "display_name": "In Progress",
        "color": "#blue",
        "slug": "in_progress"
      },
      "origination": {
        "value": "project_dashboard",
        "slug": "project_dashboard",
        "display_name": "Project Dashboard",
        "type": "dashboard"
      },
      "widgets": [
        {
          "type": "stats",
          "grid_props": {
            "h": 3,
            "i": "stats_1",
            "w": 4,
            "x": 0,
            "y": 0,
            "isResizable": true,
            "static": false
          }
        },
        {
          "type": "table",
          "grid_props": {
            "h": 35,
            "i": "table_1",
            "w": 12,
            "x": 0,
            "y": 3,
            "isResizable": true,
            "static": false
          }
        }
      ]
    },
    {
      "id": "project_progress_to_complete",
      "description": "Complete the project",
      "instruction": "Mark project as completed",
      "name": "Complete Project",
      "object_slug": "project",
      "origination_type": "workflow",
      "status": {
        "display_name": "Completed",
        "color": "#green",
        "slug": "completed"
      },
      "origination": {
        "value": "complete_workflow",
        "slug": "complete_workflow",
        "display_name": "Completion Workflow"
      }
    }
  ]
}
```

**Origination Types:**
- `workflow` - Status changes through workflows
- `automation` - Automated rule-based transitions
- `actions` - Manual action triggers
- `page` - UI page interactions (auto-generates layouts)
- `navbar_and_roles` - Navigation-based transitions
- `dashboard` - Dashboard interactions

**Widget Auto-Generation for Pages:**
- **WorkItem/Task Pages:** header, comment, taskIframe, activity, tabs
- **Object/Master Pages:** header, note, tabs, activity
- **Dashboard Pages:** stats, table widgets

---

### Step 10: Add Dummy Data
**Tool:** `add-dummy-data`

```json
{
  "baseUrl": "https://your-base-url.com",
  "appId": "app_id_from_step1",
  "tenantName": "your_tenant_name"
}
```

**Auto-generates:** Realistic test data for all objects
**Object Types Supported:** `workitem`, `task`, `master`, `object`
**Note:** Uses contract data for proper status/priority values

---

### Step 11: Create Navigation Bars
**Tool:** `create-navbar`

```json
{
  "baseUrl": "https://your-base-url.com",
  "appId": "app_id_from_step1",
  "tenantName": "your_tenant_name",
  "email": "user@example.com",
  "navbarName": ["Manager Dashboard", "User Portal"]
}
```

**Creates:** One navbar per role (excludes administrator)
**Structure:** Dashboard → Tasks → Case Objects → Objects → Admin

---

### Step 12: Create Job Titles
**Tool:** `create-job-title`

```json
{
  "baseUrl": "https://your-base-url.com",
  "appId": "app_id_from_step1",
  "tenantName": "your_tenant_name",
  "email": "user@example.com",
  "jobTitleNames": ["Project Manager", "Team Lead"],
  "department": "Engineering"
}
```

**Links:** Job titles to roles and navbars
**Status:** All job titles set to active

---

### Step 13: Create Users
**Tool:** `create-user`

```json
{
  "baseUrl": "https://your-base-url.com",
  "appId": "app_id_from_step1",
  "tenantName": "your_tenant_name",
  "email": "user@example.com",
  "userNames": ["John Manager", "Jane User"],
  "passwords": ["manager123", "user123"],
  "phoneNumbers": ["+1234567890", "+0987654321"],
  "department": "Engineering"
}
```

**Auto-generates:**
- Emails: `{app_slug}.{role}@amoga.dev`
- User accounts mapped to job titles and navbars
- Status set to 'todo' for further configuration

---

## 🔧 Advanced Features

### Create Automation Workflows
**Tool:** `create-automation`

```json
{
  "baseUrl": "https://your-base-url.com",
  "appId": "app_id_from_step1",
  "tenantName": "your_tenant_name",
  "email": "user@example.com",
  "automationFlowName": "Project Notification Flow",
  "triggerType": "object",
  "objectSlug": "project",
  "crudEvent": "created",
  "scriptDescription": "When a project is created, send a welcome email to the project manager and create a follow-up task. Include project details in the email and set the task due date to 3 days from now."
}
```

**Trigger Types:**
- `object` - CRUD events (created, updated, deleted)
- `core` - System events (import, export, sync)
- `schedule` - Cron-based execution
- `webhook` - External API triggers

**AI Script Generation:** Automatically creates Python scripts based on description

---

## ⚠️ Important Notes

### Critical Workflow Rules:
1. **Sequential Execution:** Each step depends on the previous one
2. **Publishing Requirement:** Steps 6-8 ensure app is published before SOT/dummy data
3. **Contract Fetching:** GET_APP_CONTRACT must be run before SOT and dummy data operations
4. **Object Type Restrictions:** Dummy data only works with workitem, task, master, object types

### System Attributes (Auto-Managed):
- `status` - Object lifecycle state
- `priority` - Importance level
- `Due Date` - Deadline information
- `name` - Object identifier
- `assignee` - Assigned user

### Relationship Constraints:
- Only `oneToMany` and `manyToOne` supported
- Maximum 2 relationships between object types
- Task → WorkItem relationships recommended

### Error Prevention:
- Always wait for publish status completion before SOT creation
- Re-fetch contract after publishing for updated configurations
- Use exact object slugs and status names from contract
- Provide detailed automation script descriptions for better AI generation

---

## 🎯 Quick Start Template

For a basic project management app, use this minimal configuration:

```json
{
  "appName": "Project Tracker",
  "objects": [
    {
      "name": "Project",
      "type": "workitem",
      "status": [
        {"name": "Draft", "color": "#gray", "amo_name": "todo"},
        {"name": "Active", "color": "#blue", "amo_name": "inProgress"},
        {"name": "Complete", "color": "#green", "amo_name": "completed"}
      ]
    },
    {
      "name": "Task",
      "type": "task",
      "relationship": [{"name": "project", "relationship_type": "manyToOne"}]
    }
  ],
  "roles": [
    {
      "loco_role": "manager",
      "display_name": "Project Manager"
    }
  ]
}
```

This template creates a complete, functional application with all necessary components, user management, and automation capabilities.
