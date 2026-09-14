"use client"

import * as React from "react"
import {StoreIcon} from "lucide-react"
import {useShallow} from "zustand/react/shallow"
import {ModuleWidget} from "@sentients/sdk/presentation/module-widget"
import {useModuleStore} from "@sentients/sdk/infrastructure/stores/module.store"
import {ModuleStoreApiService} from "@sentients/sdk/application/service/module-store-api.service"
import {ModuleUsageAnalyticsInterface} from "@sentients/sdk/domain/entities/module-activation.interface"
import {useAuth} from "@sentients/sdk/infrastructure/hooks/use-auth"
import {useQuery} from "@tanstack/react-query"
import {MODULE_CATEGORY_LABELS} from "@sentients/sdk/domain/enums/module-category.enum"
import {ModuleCategory} from "@sentients/sdk/domain/enums/module-category.enum"

export interface StoreAnalyticsWidgetProps {
    loading?: boolean
}

const STATE_COLORS: Record<string, string> = {
    available: 'var(--chart-2)',
    enabled: 'var(--chart-1)',
    installed: 'var(--chart-3)',
    disabled: 'var(--chart-4)',
    failed: 'var(--chart-5)',
}

const STATE_LABELS: Record<string, string> = {
    available: 'Disponibles',
    enabled: 'Activées',
    installed: 'Installées',
    disabled: 'Désactivées',
    failed: 'Échec',
}

const USAGE_COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
]

function formatMinutes(totalMs: number): string {
    const totalMin = Math.round(totalMs / 60000)
    if (totalMin < 60) return `${totalMin} min`
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    return m > 0 ? `${h} h ${m} min` : `${h} h`
}

export function StoreAnalyticsWidget({loading}: StoreAnalyticsWidgetProps) {
    const stats = useModuleStore(useShallow((state) => state.getModuleStoreStats()))
    const modules = useModuleStore((state) => state.modules)
    const {currentOrganization} = useAuth()

    const {data: usageData, isLoading: usageLoading} = useQuery<ModuleUsageAnalyticsInterface | null>({
        queryKey: ['store', 'usage-analytics', currentOrganization?.id],
        enabled: !!currentOrganization?.id,
        queryFn: async () => {
            if (!currentOrganization?.id) return null
            const response = await ModuleStoreApiService.getModuleUsageAnalytics(currentOrganization.id, 'organization')
            return response?.data?.data ?? null
        },
    })

    const consent = usageData?.consent ?? false
    const usageModules = usageData?.modules ?? []
    const showUsage = consent && usageModules.length > 0

    const stateDistribution = React.useMemo(() => {
        return [
            {state: 'available', label: STATE_LABELS.available, value: stats.available},
            {state: 'enabled', label: STATE_LABELS.enabled, value: stats.enabled},
            {state: 'installed', label: STATE_LABELS.installed, value: stats.installed - stats.enabled},
            {state: 'disabled', label: STATE_LABELS.disabled, value: stats.disabled},
            {state: 'failed', label: STATE_LABELS.failed, value: stats.failed},
        ].filter(d => d.value > 0)
    }, [stats])

    const installedRatio = stats.total > 0 ? Math.round((stats.installed / stats.total) * 100) : 0

    const stateChartConfig = Object.fromEntries(
        stateDistribution.map(d => [d.state, {label: d.label, color: STATE_COLORS[d.state]}])
    )

    const categoryData = React.useMemo(() => {
        const counts = new Map<string, number>()
        modules.forEach(m => {
            const cat = m.category ?? ModuleCategory.SYSTEM
            counts.set(cat, (counts.get(cat) ?? 0) + 1)
        })
        return [...counts.entries()].map(([key, value]) => ({
            category: key,
            label: MODULE_CATEGORY_LABELS[key as ModuleCategory] ?? key,
            value,
        }))
    }, [modules])

    const usageChartData = React.useMemo(() => {
        return usageModules.map((m, index) => ({
            id: m.moduleId,
            label: m.moduleName || m.moduleId,
            value: m.usageTimeMs,
            color: USAGE_COLORS[index % USAGE_COLORS.length],
        }))
    }, [usageModules])

    const totalUsageMs = usageModules.reduce((sum, m) => sum + m.usageTimeMs, 0)
    const totalUses = usageModules.reduce((sum, m) => sum + m.useCount, 0)
    const topModule = usageModules.length > 0 ? usageModules[0] : null

    const usageChartConfig = Object.fromEntries(
        usageChartData.map(d => [d.id, {label: d.label, color: d.color}])
    )

    const loadingState = loading ?? usageLoading

    if (!showUsage) {
        return (
            <ModuleWidget
                title={
                    <div className="flex items-center gap-2">
                        <StoreIcon className="size-5 text-primary"/>
                        <span>Store</span>
                    </div>
                }
                description="Catalogue et état des applications"
                stats={[
                    {label: 'Total', amount: stats.total},
                    {label: 'Installées', amount: stats.installed},
                    {label: 'Activées', amount: stats.enabled},
                    {label: 'Disponibles', amount: stats.available, devise: '%', trend: stats.total > 0 ? stats.available : 0},
                ]}
                chartVariant="chart:pie"
                chart={{
                    data: stateDistribution.length > 0
                        ? stateDistribution
                        : [{state: 'available', label: 'Vide', value: 1}],
                    config: stateChartConfig,
                    dataKey: 'value',
                    nameKey: 'label',
                    innerLabel: `${installedRatio}%`,
                    title: 'Répartition par état',
                    description: "État d'installation des modules du catalogue",
                    footerTitle: 'Modules installés',
                    footerDescription: `${stats.installed} sur ${stats.total} applications installées`,
                }}
                loading={loadingState}
                className="h-full"
            />
        )
    }

    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <StoreIcon className="size-5 text-primary"/>
                    <span>Store</span>
                </div>
            }
            description="Usage des modules (données partagées)" 
            stats={[
                {label: 'Modules suivis', amount: usageModules.length},
                {label: 'Ouv. totales', amount: totalUses},
                {label: 'Temps total', amount: Math.round(totalUsageMs / 60000), devise: 'min'},
                {label: 'Plus utilisé', amount: topModule ? Math.round((topModule.usageTimeMs / Math.max(totalUsageMs, 1)) * 100) : 0, devise: '%'},
            ]}
            chartVariant="chart:pie"
            chart={{
                data: usageChartData.length > 0
                    ? usageChartData
                    : [{id: 'empty', label: 'Vide', value: 1}],
                config: usageChartConfig,
                dataKey: 'value',
                nameKey: 'label',
                innerLabel: totalUsageMs > 0 ? formatMinutes(totalUsageMs) : '0',
                title: 'Temps d\'utilisation par module',
                description: 'Répartition du temps d\'utilisation anonyme',
                footerTitle: 'Ouv. par module',
                footerDescription: `${totalUses} ouvertures sur ${usageModules.length} modules`,
            }}
            loading={loadingState}
            className="h-full"
        />
    )
}