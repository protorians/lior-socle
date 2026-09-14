"use client"

import * as React from "react"
import {BuildingIcon} from "lucide-react"
import {ModuleWidget} from "@sentients/sdk/presentation/module-widget"
import {useQuery} from "@tanstack/react-query"
import {OrganizationsApiService} from "@sentients/sdk/application/service/organizations-api-service"
import {OrganizationInterface} from "@sentients/sdk/domain/entities/organization.interface"
import {useAuth} from "@sentients/sdk/infrastructure/hooks/use-auth"

export interface OrganizationsWidgetProps {
    data?: {
        totalOrganizations?: number
        activeOrganizations?: number
    }
    loading?: boolean
}

export function OrganizationsWidget({data, loading}: OrganizationsWidgetProps) {
    const {currentOrganization} = useAuth()

    const {data: organizations, isLoading} = useQuery<OrganizationInterface[]>({
        queryKey: ['organizations', 'widget'],
        enabled: !!currentOrganization?.id,
        queryFn: async () => {
            const response = await OrganizationsApiService.getAll()
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : (raw?.data ?? [])
        },
    })

    const items = organizations ?? []
    const total = items.length
    const activeCount = items.filter(o => o.status !== false).length
    const inactiveCount = Math.max(total - activeCount, 0)
    const loadingState = loading ?? isLoading

    const splitData = React.useMemo(() => [
        {statut: 'Actives', value: data?.activeOrganizations ?? activeCount},
        {statut: 'Inactives', value: Math.max((data?.totalOrganizations ?? total) - (data?.activeOrganizations ?? activeCount), 0) || inactiveCount},
    ], [data, activeCount, inactiveCount, total])

    const splitConfig = React.useMemo(() => ({
        'Actives': {label: 'Actives', color: 'var(--chart-1)'},
        'Inactives': {label: 'Inactives', color: 'var(--chart-2)'},
    }), [])

    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <BuildingIcon className="size-5 text-primary"/>
                    <span>Organisations</span>
                </div>
            }
            description="Gestion des organisations et du multi-tenant"
            stats={[
                {label: 'Total', amount: data?.totalOrganizations ?? total},
                {label: 'Actives', amount: data?.activeOrganizations ?? activeCount},
            ]}
            chartVariant="chart:bar"
            chart={{
                data: splitData,
                config: splitConfig,
                xAxisDataKey: 'statut',
                bars: [
                    {dataKey: 'value', fill: 'var(--chart-1)', stackId: 'a', radius: [4, 4, 4, 4] as [number, number, number, number]},
                ],
                title: 'Répartition',
                description: 'Organisations actives vs inactives',
            } as any}
            loading={loadingState}
            className="h-full"
        />
    )
}
