import { Widget } from "../types/widget.types.js";
import { widgets as widgetConfig } from "../config/widgets.js";

// Local mutable store (if you want to allow runtime updates)
let widgets: Record<string, Widget> = { ...widgetConfig };

// Get a single widget
export function getWidget(type: string): Widget | undefined {
  return widgets[type];
}

// Get all widget types
export function getAllWidgetTypes(): string[] {
  return Object.keys(widgets);
}

// Validate if widget type exists
export function validateWidgetType(type: string): boolean {
  return type in widgets;
}

// Clone widget (deep copy)
export function cloneWidget(type: string): Widget | undefined {
  const widget = getWidget(type);
  return widget ? JSON.parse(JSON.stringify(widget)) : undefined;
}

// Register new widget
export function registerWidget(type: string, widget: Widget): void {
  widgets[type] = widget;
}

// Update an existing widget
export function updateWidget(
  type: string,
  partialWidget: Partial<Widget>
): void {
  const existing = widgets[type];
  if (existing) {
    widgets[type] = {
      ...existing,
      ...partialWidget,
      configs: {
        ...existing.configs,
        ...partialWidget.configs,
      },
    };
  }
}

// (Optional) Reset widgets to default config (useful in testing)
export function resetWidgets(): void {
  widgets = { ...widgetConfig };
}
