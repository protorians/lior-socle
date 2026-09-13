import * as React from "react"
import {BellIcon} from "lucide-react"
import {ModuleWidget} from "@sentients/sdk/presentation/module-widget"

export interface NotificationsWidgetProps {
    data?: {
        sentToday?: number
        failedToday?: number
        failureTrend?: number
    }
    loading?: boolean
}

const NOTIF_CONFIG = {
    envoyées: {label: 'Envoyées', color: 'var(--chart-1)'},
    échecs: {label: 'Échecs', color: 'var(--chart-2)'},
}

const NOTIF_DEMO = [
    {jour: 'Lun', envoyées: 248, échecs: 9},
    {jour: 'Mar', envoyées: 302, échecs: 12},
    {jour: 'Mer', envoyées: 276, échecs: 7},
    {jour: 'Jeu', envoyées: 389, échecs: 15},
    {jour: 'Ven', envoyées: 421, échecs: 18},
]

export function NotificationsWidget({ data, loading }: NotificationsWidgetProps) {
    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <BellIcon className="size-5 text-primary" />
                    <span>Notifications</span>
                </div>
            }
            description="Alertes et communications"
            stats={[
                { label: 'Envoyées', amount: data?.sentToday ?? 0 },
                { label: 'Echecs', amount: data?.failedToday ?? 0, trend: data?.failureTrend ?? 0 }
            ]}
            chartVariant="chart:bar"
            chart={{
                data: NOTIF_DEMO,
                config: NOTIF_CONFIG,
                xAxisDataKey: 'jour',
                bars: [
                    {dataKey: 'envoyées', fill: 'var(--chart-1)', stackId: 'a'},
                    {dataKey: 'échecs', fill: 'var(--chart-2)', stackId: 'b'},
                ],
                title: 'Délivrance',
                description: 'Notifications envoyées vs échecs',
                footerDescription: 'Données d’aperçu — à affiner avec l’analytics',
            } as any}
            loading={loading}
            className="h-full"
        />
    )
}
