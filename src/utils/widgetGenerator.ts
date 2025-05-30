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
  layout: Partial<WidgetLayout> = {}
): Widget {
  return {
    configs: {
      display_name: type,
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
      props: {
        title: type,
        hidden: false,
        disable: false,
        show_widget_title: false,
        widget_border_disabled: false,
      },
    },
    is_default: true,
    is_active: true,
    widget_version: 1.0,
  };
}

function generateWorkItemRecordWidgets(): Widget[] {
  return [
    createBaseWidget("header", { w: 12, h: 4, x: 0, y: 0 }),
    createBaseWidget("jsonform", { w: 12, h: 8, x: 0, y: 4 }),
    createBaseWidget("comment", { w: 6, h: 6, x: 0, y: 12 }),
    createBaseWidget("activity", { w: 6, h: 6, x: 6, y: 12 }),
  ];
}

function generateWorkItemGeneralWidgets(): Widget[] {
  return [
    createBaseWidget("stats", { w: 4, h: 3, x: 0, y: 0 }),
    createBaseWidget("stats", { w: 4, h: 3, x: 4, y: 0 }),
    createBaseWidget("stats", { w: 4, h: 3, x: 8, y: 0 }),
    createBaseWidget("table", { w: 12, h: 10, x: 0, y: 3 }),
  ];
}

function generateObjectRecordWidgets(): Widget[] {
  return [
    createBaseWidget("header", { w: 12, h: 4, x: 0, y: 0 }),
    createBaseWidget("jsonform", { w: 12, h: 8, x: 0, y: 4 }),
  ];
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
      case "task":
        return generateWorkItemRecordWidgets();
      default:
        return generateObjectRecordWidgets();
    }
  } else if (pageType === "dashboard") {
    switch (objectType) {
      case "workitem":
      case "task":
        return generateWorkItemGeneralWidgets();
      default:
        return generateObjectGeneralWidgets();
    }
  }

  // For dashboard pages or unknown combinations, return a basic layout
  return [
    createBaseWidget("stats", { w: 12, h: 3, x: 0, y: 0 }),
    createBaseWidget("table", { w: 12, h: 10, x: 0, y: 3 }),
  ];
}
