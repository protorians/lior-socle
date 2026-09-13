import * as React from "react"
import {UsersIcon} from "lucide-react"
import {ModuleWidget} from "@sentients/sdk/presentation/module-widget"

export interface UsersAnalyticsWidgetProps {
    data?: {
        totalUsers?: number
        activeUsers?: number
        growth?: number
    }
    loading?: boolean
}

const REGISTRATIONS = [
    { month: 'Jan', users: 42 },
    { month: 'Fév', users: 58 },
    { month: 'Mar', users: 51 },
    { month: 'Avr', users: 74 },
    { month: 'Mai', users: 89 },
    { month: 'Juin', users: 96 },
]

const CHART_CONFIG = {
    users: { label: 'Inscriptions', color: 'var(--chart-1)' },
}

export function UsersAnalyticsWidget({ data, loading }: UsersAnalyticsWidgetProps) {
    const totalUsers = data?.totalUsers ?? 0
    const activeUsers = data?.activeUsers ?? 0
    const growth = data?.growth ?? 0

    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <UsersIcon className="size-5 text-primary" />
                    <span>Utilisateurs</span>
                </div>
            }
            description="Inscriptions et comptes actifs"
            stats={[
                { label: 'Total', amount: totalUsers, trend: growth },
                { label: 'Actifs', amount: activeUsers }
            ]}
            chartVariant="chart:area"
            chart={{
                data: REGISTRATIONS,
                config: CHART_CONFIG,
                xAxisDataKey: 'month',
                areas: [{ dataKey: 'users', stackId: 'a' }],
                title: 'Croissance des inscriptions',
                description: 'Évolution sur les 6 derniers mois',
                footerTitle: 'Tendance à la hausse des inscriptions',
                footerDescription: 'Données d’aperçu — à affiner avec l’analytics',
            }}
            loading={loading}
            className="h-full"
        />
    )
}