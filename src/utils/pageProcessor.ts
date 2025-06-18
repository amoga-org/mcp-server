import type { Widget } from "../types/widget.types.js";
import type { SOTData } from "../types/sot.types.js";
// import { generateWidgets } from "./widgetGenerator.js";
import { cloneWidget } from "../services/widget.service.js";

export interface PageData {
  application_id: string;
  display_name: string;
  mode: string;
  name: string;
  object_slug: string;
  show_header: boolean;
  type: "record" | "dashboard";
  widgets: Widget[];
}

export const BASE_URL = "https://studio.amoga.live";

/**
 * Process a widget configuration with base widget settings
 */
function processWidget(widget: Partial<Widget>): Widget {
  const baseWidget = cloneWidget(widget.configs?.type || "button");
  if (!baseWidget) {
    throw new Error(`Invalid widget type: ${widget.configs?.type}`);
  }

  return {
    ...baseWidget,
    configs: {
      ...baseWidget.configs,
      ...widget.configs,
      grid_props: {
        ...baseWidget.configs.grid_props,
        ...widget.configs?.grid_props,
      },
      props: {
        ...baseWidget.configs.props,
        ...widget.configs?.props,
      },
    },
  };
}

/**
 * Process the SOT data and create page details
 */
export const processPageDetails = (sotData: SOTData[]): PageData[] => {
  const pageDetails: PageData[] = [];

  for (const sot of sotData) {
    if (sot.origination_type === "page") {
      let widgets: Widget[] = [];

      // If widgets are provided, use them; otherwise generate based on object type
      if (sot.widgets && Array.isArray(sot.widgets)) {
        widgets = sot.widgets.map((widget) => processWidget(widget));
      } else {
        // widgets = generateWidgets(
        //   sot.object_slug,
        //   sot.origination.type || "record"
        // );
      }

      pageDetails.push({
        application_id: "c7b757ba-3631-4d81-b596-ec8a23305019",
        display_name: sot.origination.display_name,
        mode: "create",
        name: sot.origination.display_name,
        object_slug: sot.object_slug,
        show_header: true,
        type: sot.origination.type || "record",
        widgets,
      });
    }
  }

  return pageDetails;
};
