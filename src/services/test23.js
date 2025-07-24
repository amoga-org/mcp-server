import { genarateXML, makeWorkflow } from "../utils/workflowAlog.js";

let objects = [
  {
    created_by: "bishal@tangohr.com",
    last_updated_by: "bishal@tangohr.com",
    icon: {
      color: "#5f6368",
      svg: "memo",
      style: "solid",
      version: 1,
    },
    maps: {
      status: [
        {
          slug: "task_lkl__toDo",
          color: "#94A3B8",
          amo_name: "todo",
          loco_name: "toDo",
          is_default: true,
          display_name: "To Do",
          rank: 1,
        },
        {
          slug: "task_lkl__completed",
          loco_name: "completed",
          display_name: "Completed",
          amo_name: "completed",
          color: "#00D084",
          is_default: false,
          rank: 2,
        },
      ],
      priority: [
        {
          slug: "task_lkl__urgent",
          rank: 1,
          color: "#EB144C",
          amo_name: "urgent",
          is_default: false,
          loco_name: "urgent",
          display_name: "Urgent",
        },
        {
          slug: "task_lkl__high",
          rank: 2,
          color: "#FF6900",
          amo_name: "high",
          is_default: false,
          loco_name: "high",
          display_name: "High",
        },
        {
          slug: "task_lkl__medium",
          rank: 3,
          color: "#7BDCB5",
          amo_name: "medium",
          is_default: false,
          loco_name: "medium",
          display_name: "Medium",
        },
        {
          slug: "task_lkl__low",
          rank: 4,
          color: "#94A3B8",
          amo_name: "low",
          is_default: true,
          loco_name: "low",
          display_name: "Low",
        },
      ],
    },
    name: "task",
    slug: "task_lkl",
    type: "task",
    application_id: "a661989c-b4a9-4b96-90e1-369648d34c9f",
    parent: "case_dpa",
    relationship: [
      {
        id: "7ba04ff7-9665-4f2e-83f8-4e1daab2ff40",
        source_object_slug: "task_lkl",
        source_app_id: "a661989c-b4a9-4b96-90e1-369648d34c9f",
        destination_object_slug: "case_dpa",
        destination_display_name: "case",
        relation_type: "manyToOne",
        is_external: false,
      },
    ],
    source: "Tenant",
    subtype: "",
    description: "",
    application_name: "shubham new",
    attributes: [
      {
        key: "name",
        rank: 0,
        parent: "",
        hide: false,
      },
      {
        key: "status",
        rank: 1,
        parent: "",
        hide: false,
      },
      {
        key: "assignee",
        rank: 2,
        parent: "",
        hide: false,
      },
      {
        key: "priority",
        rank: 3,
        parent: "",
        hide: false,
      },
      {
        key: "dueDate",
        rank: 4,
        parent: "",
        hide: false,
      },
    ],
    save_as_draft: false,
  },
  {
    created_by: "bishal@tangohr.com",
    last_updated_by: "bishal@tangohr.com",
    icon: {
      color: "#5f6368",
      svg: "memo",
      style: "solid",
      version: 1,
    },
    maps: {
      status: [
        {
          slug: "case_dpa__toDo",
          color: "#94A3B8",
          amo_name: "todo",
          loco_name: "toDo",
          is_default: true,
          display_name: "To Do",
          rank: 1,
        },
        {
          slug: "case_dpa__completed",
          loco_name: "completed",
          display_name: "Completed",
          amo_name: "completed",
          color: "#00D084",
          is_default: false,
          rank: 2,
        },
      ],
      priority: [
        {
          slug: "case_dpa__urgent",
          rank: 1,
          color: "#EB144C",
          amo_name: "urgent",
          is_default: false,
          loco_name: "urgent",
          display_name: "Urgent",
        },
        {
          slug: "case_dpa__high",
          rank: 2,
          color: "#FF6900",
          amo_name: "high",
          is_default: false,
          loco_name: "high",
          display_name: "High",
        },
        {
          slug: "case_dpa__medium",
          rank: 3,
          color: "#7BDCB5",
          amo_name: "medium",
          is_default: false,
          loco_name: "medium",
          display_name: "Medium",
        },
        {
          slug: "case_dpa__low",
          rank: 4,
          color: "#94A3B8",
          amo_name: "low",
          is_default: true,
          loco_name: "low",
          display_name: "Low",
        },
      ],
    },
    name: "case",
    slug: "case_dpa",
    type: "workitem",
    application_id: "a661989c-b4a9-4b96-90e1-369648d34c9f",
    parent: null,
    relationship: [
      {
        id: "7ba04ff7-9665-4f2e-83f8-4e1daab2ff40",
        source_object_slug: "case_dpa",
        source_app_id: "a661989c-b4a9-4b96-90e1-369648d34c9f",
        destination_object_slug: "task_lkl",
        destination_display_name: "task",
        relation_type: "oneToMany",
        is_external: false,
      },
    ],
    source: "Tenant",
    subtype: "",
    description: "",
    application_name: "shubham new",
    attributes: [
      {
        key: "name",
        rank: 0,
        parent: "",
        hide: false,
      },
      {
        key: "status",
        rank: 1,
        parent: "",
        hide: false,
      },
      {
        key: "assignee",
        rank: 2,
        parent: "",
        hide: false,
      },
      {
        key: "priority",
        rank: 3,
        parent: "",
        hide: false,
      },
      {
        key: "dueDate",
        rank: 4,
        parent: "",
        hide: false,
      },
    ],
    save_as_draft: false,
  },
];
const workflowData = makeWorkflow({
  objects: objects,
  dispatch: "dispatch", // Default dispatch value
  application_id: "d62b9a04-9add-4916-bd8a-b98b8753cf60",
});
let applicationDetail = {
  icon: {
    svg: "memo",
    name: "apps",
    type: "material-icons-outlined",
    color: "#5f6368",
    style: "solid",
    version: 1,
  },
  slug: "atomyin_oio",
  tags: [],
  cover_image: "",
  description: "",
  application_id: "d62b9a04-9add-4916-bd8a-b98b8753cf60",
  application_name: "Atomy Inventory Management",
  identifier: "d62b9a04-9add-4916-bd8a-b98b8753cf60",
  objects: objects,
};
console.log("workflowData", JSON.stringify(workflowData));
for (const workflowCase of workflowData) {
  try {
    // Generate CMMN XML using genarateXML function from workflowAlog.js
    const xml = genarateXML(
      { ...applicationDetail, slug: "" },
      workflowCase.slug,
      [...workflowCase.stages, ...workflowCase.tasks]
    );
    // const cmmnXml = genarateXML(
    //   applicationDetail,
    //   workflowCase.name,
    //   workflowCase.stages || []
    // );
    console.log(`CMMN XML for ${workflowCase.name}:`, xml);
  } catch (error) {
    console.error("Error generating CMMN XML:", error);
  }
}
