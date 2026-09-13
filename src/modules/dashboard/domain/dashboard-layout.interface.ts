export interface DashboardWidgetEntry {
    identifier: string
    moduleId: string
    widgetKey: string
    order: number
    enabled: boolean
}

export interface DashboardLayoutConfig {
    version: 1
    widgets: DashboardWidgetEntry[]
}

export const DASHBOARD_LAYOUT_LABEL = 'dashboard_layout'

export function createWidgetId(moduleId: string, widgetKey: string): string {
    return `${moduleId}:${widgetKey}`
}
