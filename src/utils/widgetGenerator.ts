import { Widget, GridProps } from "../types/widget.types.js";
import { ObjectType, PageType } from "../types/sot.types.js";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_GRID_PROPS: GridProps = {
  maxH: 72,
  maxW: 12,
  minH: 3,
  minW: 3,
  isResizable: true,
  static: false,
  moved: false,
};

interface WidgetLayout {
  w: number;
  h: number;
  x: number;
  y: number;
}

function createBaseWidget(
  type: string,
  layout: Partial<WidgetLayout> = {},
  customProps: Record<string, any> = {}
): Widget {
  const baseProps = {
    title:
      type === "taskIframe"
        ? "Task Iframe"
        : type === "conversation"
        ? "Conversation"
        : type === "activity"
        ? "Activity"
        : type === "comment"
        ? "Comments"
        : type === "header"
        ? "Header"
        : type === "table"
        ? "table"
        : type === "stats"
        ? "Statistics"
        : type === "iframe"
        ? "Details"
        : type === "tab"
        ? "Tabs"
        : type,
    hidden: false,
    disable: false,
    show_widget_title: false,
    widget_border_disabled: false,
    allow_navigation: true,
    ...customProps,
  };

  // Add type-specific props
  if (type === "comment") {
    Object.assign(baseProps, {
      sort_by: "newest",
      show_sort: true,
      date_format: "relative",
      show_filter: true,
      show_search: true,
    });
  } else if (type === "activity") {
    Object.assign(baseProps, {
      data_source: [],
      field_update: true,
    });
  } else if (type === "header") {
    Object.assign(baseProps, {
      icon: { name: "", type: "", color: "" },
      actions: [],
      refresh: false,
      alignment: "1",
      icon_type: "dynamic",
      show_icon: true,
      attributes: [], // Will be populated dynamically
      show_title: true,
      title_size: "large",
      title_type: "dynamic",
      data_source: [],
      action_count: "4",
      show_actions: true,
      action_spacing: "auto",
      override_style: false,
      label_attribute: "name",
      show_breadcrumb: true,
      show_action_icon: false,
      attribute_spacing: "auto",
      row_attribute_count: "5",
      widget_border_radius: "",
      widget_border_disabled: false,
      widget_background_color: "",
      select_as_native_on_mobile: false,
    });
  } else if (type === "taskIframe") {
    Object.assign(baseProps, {
      url: "",
      type: "dynamic",
    });
  } else if (type === "table") {
    Object.assign(baseProps, {
      page: {},
      sort: [],
      filter: { value: [], operator: "and", parse_segment: 1 },
      actions: [],
      columns: [],
      density: true,
      tree_view: true,
      view_type: "table",
      pagination: true,
      sort_allow: true,
      adhoc_tasks: [],
      create_type: { key: "tooljet", name: "Tooljet", value: "" },
      data_source: {},
      enable_view: false,
      line_clamps: 1,
      create_allow: true,
      export_allow: false,
      filter_allow: true,
      import_allow: false,
      search_allow: true,
      stick_bottom: false,
      custom_filter: [],
      quick_filters: [],
      record_render: "side",
      reorder_allow: true,
      rows_per_page: 10,
      download_limit: 10000,
      import_rule_id: [],
      pagination_limit: 15,
      bulk_action_allow: true,
      open_details_page: false,
      enable_bulk_delete: true,
      enable_show_closed: true,
      table_header_color: "#EDF1F9",
      column_header_color: "#2A4277",
      show_card_on_mobile: true,
      show_vertical_border: true,
      show_checkbox_on_hover: true,
      show_horizontal_border: true,
      show_vertical_scrollbar: true,
      column_header_background: "#EDF1F9",
      horizontal_scrollbar_size: "4px",
      show_horizontal_scrollbar: false,
      select_as_native_on_mobile: false,
    });
  } else if (type === "iframe") {
    Object.assign(baseProps, {
      url: "https://www.amoga.io/",
      type: "static",
      isSuperset: false,
    });
  } else if (type === "conversation") {
    Object.assign(baseProps, {
      data_source: [],
      background_color: "#fff",
      outgoing_actions: [],
    });
  } else if (type === "note") {
    Object.assign(baseProps, {
      sort_by: "newest",
      updated: true,
      added_by: true,
      show_sort: true,
      show_search: true,
    });
  }

  return {
    configs: {
      display_name:
        type === "taskIframe"
          ? "Task Iframe1"
          : type === "conversation"
          ? "Conversation"
          : type === "activity"
          ? "activity1"
          : type === "comment"
          ? "comments1"
          : type === "header"
          ? "header1"
          : type === "table"
          ? "table"
          : type === "stats"
          ? "stats1"
          : type === "iframe"
          ? "Details"
          : type === "tab"
          ? "tabs1"
          : type === "note"
          ? "notes1"
          : `${type}1`,
      icon: {
        type: "material-icons-outlined",
        name: "10k",
        color: "#5f6368",
        svg: "memo",
        style: "solid",
        version: 1,
      },
      color: "#FFA500",
      type,
      description: `${type} description`,
      is_refresh: false,
      dynamically_binded: [],
      grid_props: {
        ...DEFAULT_GRID_PROPS,
        ...layout,
        i: uuidv4(),
      },
      props: baseProps,
    },
    is_default: true,
    is_active: true,
    widget_version: 1,
  };
}

function createTabWidget(layout: Partial<WidgetLayout> = {}): Widget {
  const tabWidget = createBaseWidget("tab", layout, {
    type: { name: "Tabs", value: "tabs" },
    view: "standard",
    color: false,
    query: "",
    enable: true,
    linear: false,
    styles: "",
    refresh: false,
    hide_nav: false,
    peek_mode: { name: "Full", value: "full" },
    current_tab: 0,
    transformer:
      "(result, global) => {\n    // transform result and return\n    return result;\n}",
    dynamic_list: false,
    stick_bottom: false,
    default_children: ["iframe"],
    show_back_button: true,
    show_next_button: true,
    show_scroll_button: true,
    children: [
      {
        slug: uuidv4().substring(0, 10),
        configs: {
          icon: {
            name: "10k",
            type: "material-icons-outlined",
            color: "#5f6368",
          },
          type: "table",
          color: "#FFA500",
          props: {
            ...createBaseWidget("table").configs.props,
            title: "Child Objects",
          },
          tab_id: uuidv4(),
          grid_props: { maxH: 72, maxW: 12, minH: 25, minW: 6 },
          is_refresh: false,
          description: "table description",
          display_name: "Child Objects",
          dynamically_binded: [],
        },
        is_active: true,
        is_default: true,
        latest_version: 2,
        widget_version: 2,
      },
      {
        slug: uuidv4().substring(0, 10),
        configs: {
          icon: {
            name: "10k",
            type: "material-icons-outlined",
            color: "#5f6368",
          },
          type: "table",
          color: "#FFA500",
          props: {
            ...createBaseWidget("table").configs.props,
            title: "Related Data",
          },
          tab_id: uuidv4(),
          grid_props: { maxH: 72, maxW: 12, minH: 25, minW: 6 },
          is_refresh: false,
          description: "table description",
          display_name: "Related Data",
          dynamically_binded: [],
        },
        is_active: true,
        is_default: true,
        latest_version: 2,
        widget_version: 2,
      },
    ],
  });

  // Update the tab widget type and properties
  tabWidget.configs.type = "tab";
  tabWidget.configs.props.name = "tabs";

  return tabWidget;
}

// Generate widgets for Case Index Page (Case list view)
function generateCaseIndexWidgets(): Widget[] {
  return [createBaseWidget("table", { w: 12, h: 43, x: 0, y: 0 })];
}

// Generate widgets for Case Record Page / Composite Case-Task Page
function generateCaseRecordWidgets(
  hasMultipleStatuses: boolean = false
): Widget[] {
  const widgets: Widget[] = [];

  if (hasMultipleStatuses) {
    // If number of statuses > 5, show top full-width path widget
    widgets.push(createBaseWidget("path", { w: 12, h: 3, x: 0, y: 0 }));
    widgets.push(createBaseWidget("header", { w: 8, h: 9, x: 0, y: 3 }));
    widgets.push(createBaseWidget("comment", { w: 4, h: 23, x: 8, y: 3 }));
    widgets.push(createBaseWidget("taskIframe", { w: 8, h: 16, x: 0, y: 12 }));
    widgets.push(createBaseWidget("activity", { w: 4, h: 22, x: 8, y: 26 }));
    widgets.push(createTabWidget({ w: 8, h: 20, x: 0, y: 28 }));
  } else {
    // Standard layout with path below header
    widgets.push(createBaseWidget("header", { w: 8, h: 9, x: 0, y: 0 }));
    widgets.push(createBaseWidget("comment", { w: 4, h: 23, x: 8, y: 0 }));
    widgets.push(createBaseWidget("taskIframe", { w: 8, h: 16, x: 0, y: 9 }));
    widgets.push(createBaseWidget("activity", { w: 4, h: 22, x: 8, y: 23 }));
    widgets.push(createTabWidget({ w: 8, h: 20, x: 0, y: 25 }));
    widgets.push(createBaseWidget("path", { w: 8, h: 2, x: 0, y: 7 })); // Path below header
  }

  return widgets;
}

// Generate widgets for Object or Master Record Page
function generateObjectRecordWidgets(): Widget[] {
  return [
    // Header - Top-Left {w: 8, h: 15, x: 0, y: 0}
    createBaseWidget(
      "header",
      { w: 8, h: 15, x: 0, y: 0 },
      {
        minH: 6,
        minW: 6,
      }
    ),
    // Notes - Top-Right {w: 4, h: 15, x: 8, y: 0}
    createBaseWidget(
      "note",
      { w: 4, h: 15, x: 8, y: 0 },
      {
        minH: 10,
        minW: 3,
      }
    ),
    // Tabs - Bottom-Left {w: 8, h: 42, x: 0, y: 15}
    createTabWidget({ w: 8, h: 42, x: 0, y: 15 }),
    // Activity - Bottom-Right {w: 4, h: 42, x: 8, y: 15}
    createBaseWidget(
      "activity",
      { w: 4, h: 42, x: 8, y: 15 },
      {
        minH: 10,
        minW: 3,
      }
    ),
  ];
}

// Generate widgets for Task Record Page
function generateTaskRecordWidgets(
  taskType: "approve_reject" | "simple" | "complex" = "simple"
): Widget[] {
  if (taskType === "approve_reject") {
    // Case A: Task with Approve / Reject / Send-Back
    return [
      createBaseWidget("header", { w: 12, h: 4, x: 0, y: 0 }),
      createBaseWidget(
        "button",
        { w: 4, h: 3, x: 0, y: 4 },
        { label: "Reject", color: "red" }
      ),
      createBaseWidget(
        "button",
        { w: 4, h: 3, x: 4, y: 4 },
        { label: "Send Back", color: "yellow" }
      ),
      createBaseWidget(
        "button",
        { w: 4, h: 3, x: 8, y: 4 },
        { label: "Approve", color: "green" }
      ),
    ];
  } else if (taskType === "simple") {
    // Case B: Task with ≤ 6 Info Elements (2 rows, max 3 columns per row)
    return [
      createBaseWidget("jsonform", { w: 4, h: 4, x: 0, y: 0 }),
      createBaseWidget("jsonform", { w: 4, h: 4, x: 4, y: 0 }),
      createBaseWidget("jsonform", { w: 4, h: 4, x: 8, y: 0 }),
      createBaseWidget("jsonform", { w: 4, h: 4, x: 0, y: 4 }),
      createBaseWidget("jsonform", { w: 4, h: 4, x: 4, y: 4 }),
      createBaseWidget("jsonform", { w: 4, h: 4, x: 8, y: 4 }),
      createBaseWidget(
        "button",
        { w: 6, h: 2, x: 0, y: 8 },
        { label: "Cancel" }
      ),
      createBaseWidget(
        "button",
        { w: 6, h: 2, x: 6, y: 8 },
        { label: "Submit" }
      ),
    ];
  } else {
    // Case C: Task with > 6 Info Elements (Multiple rows, 2 columns per row)
    return [
      createBaseWidget("jsonform", { w: 6, h: 4, x: 0, y: 0 }),
      createBaseWidget("jsonform", { w: 6, h: 4, x: 6, y: 0 }),
      createBaseWidget("jsonform", { w: 6, h: 4, x: 0, y: 4 }),
      createBaseWidget("jsonform", { w: 6, h: 4, x: 6, y: 4 }),
      createBaseWidget("jsonform", { w: 6, h: 4, x: 0, y: 8 }),
      createBaseWidget("jsonform", { w: 6, h: 4, x: 6, y: 8 }),
      createBaseWidget("jsonform", { w: 6, h: 4, x: 0, y: 12 }),
      createBaseWidget("jsonform", { w: 6, h: 4, x: 6, y: 12 }),
      createBaseWidget(
        "button",
        { w: 6, h: 2, x: 0, y: 16 },
        { label: "Cancel" }
      ),
      createBaseWidget(
        "button",
        { w: 6, h: 2, x: 6, y: 16 },
        { label: "Submit" }
      ),
    ];
  }
}

function generateWorkItemRecordWidgets(): Widget[] {
  // Use Case Record Page layout for workitems
  return generateCaseRecordWidgets();
}

function generateWorkItemGeneralWidgets(): Widget[] {
  // Use Case Index layout for workitem dashboard
  return generateCaseIndexWidgets();
}

function generateObjectGeneralWidgets(): Widget[] {
  return [
    createBaseWidget("stats", { w: 6, h: 3, x: 0, y: 0 }),
    createBaseWidget("stats", { w: 6, h: 3, x: 6, y: 0 }),
    createBaseWidget("table", { w: 12, h: 10, x: 0, y: 3 }),
    createBaseWidget("jsonform", { w: 12, h: 8, x: 0, y: 13 }),
  ];
}

export function generateWidgets(
  objectType: ObjectType,
  pageType: PageType
): Widget[] {
  if (pageType === "record") {
    switch (objectType) {
      case "workitem":
        return generateWorkItemRecordWidgets();
      case "task":
        return generateTaskRecordWidgets();
      case "object":
      case "master":
      case "segment":
        return generateObjectRecordWidgets();
      default:
        return generateObjectRecordWidgets();
    }
  } else if (pageType === "dashboard") {
    switch (objectType) {
      case "workitem":
        return generateWorkItemGeneralWidgets();
      case "task":
        return generateCaseIndexWidgets();
      case "object":
      case "master":
      case "segment":
        return generateObjectGeneralWidgets();
      default:
        return generateObjectGeneralWidgets();
    }
  }

  // For unknown combinations, return a basic layout
  return [
    createBaseWidget("stats", { w: 12, h: 3, x: 0, y: 0 }),
    createBaseWidget("table", { w: 12, h: 10, x: 0, y: 3 }),
  ];
}
