// Helper function to format object names
export function formatLocoName(name) {
  if (!name) return "";
  return name
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase()
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Helper function for default statuses
export function getDefaultStatuses() {
  return [
    {
      color: "#94A3B8", // Grey
      amo_name: "todo",
      loco_name: "toDo",
      is_default: true,
      display_name: "To Do",
      rank: 1,
    },
    {
      loco_name: "completed",
      display_name: "Completed",
      amo_name: "completed",
      color: "#00D084", // Green
      is_default: false,
      rank: 2,
    },
  ];
}

// Helper function for default priorities
export function getDefaultPriorities() {
  return [
    {
      rank: 1,
      color: "#EB144C", // Red
      amo_name: "urgent",
      is_default: false,
      loco_name: "urgent",
      display_name: "Urgent",
    },
    {
      rank: 2,
      color: "#FF6900", // Orange
      amo_name: "high",
      is_default: false,
      loco_name: "high",
      display_name: "High",
    },
    {
      rank: 3,
      color: "#7BDCB5", // Light green
      amo_name: "medium",
      is_default: false,
      loco_name: "medium",
      display_name: "Medium",
    },
    {
      rank: 4,
      color: "#94A3B8", // Grey
      amo_name: "low",
      is_default: true,
      loco_name: "low",
      display_name: "Low",
    },
  ];
}

export function get_default_attributes() {
  return {
    task: ["name", "status", "assignee", "priority", "dueDate"],
    object: ["name", "status", "assignee", "priority", "dueDate"],
    amotask: ["name", "status", "assignee", "priority", "dueDate"],
    call_activity: ["name", "status", "assignee", "priority", "dueDate"],
    email_activity: ["name", "status", "assignee", "priority", "dueDate"],
    master: ["name", "status", "assignee", "priority", "dueDate"],
    segment: ["name", "status", "assignee", "priority", "dueDate"],
    workitem: ["name", "status", "assignee", "priority", "dueDate"],
  };
}

export const generateSlug = (value) => {
  return value.replace(/[^a-zA-Z]/g, "");
};

export const appPayload = (appName) => ({
  application_name: appName,
  application_props: {},
  application_version: "2.0.0",
  color: "green",
  contract_version: "1.0",
  created_by: "",
  description: "",
  endpoint_setting: {},
  icon: {
    color: "#5f6368",
    svg: "memo",
    style: "solid",
    version: 1,
  },
  slug: generateSlug(appName),
  state: "active",
  create_pages: true,
  cover_image: "",
});
