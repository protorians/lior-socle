"use client"

import * as React from "react"
import {LayersIcon, ShieldIcon} from "lucide-react"
import {ModuleWidget} from "@sentients/sdk/presentation/module-widget"
import {RolesSummaryType} from "../../domain/entities/roles.interface";
import accessControlModule from "@/modules/access-control";
import {useQuery} from "@tanstack/react-query";
import {AccessControlApiService} from "@/modules/access-control/application/service/access-control-api.service";
import {getRoleLabel} from "@sentients/sdk/infrastructure/utilities/access-label.util";
import {Fragment, ReactNode, useEffect, useState} from "react";
import {StatisticalProps} from "@sentients/sdk/domain/typing/statisticals";
import {WaitingBar} from "@sentients/sdk/presentation/components/waiting-bar";
import {Waiting} from "@sentients/sdk/presentation/components/waiting";
import {ChartConfig} from "@sentients/sdk/presentation/ui/chart";

export interface AccessControlWidgetProps {
    data?: RolesSummaryType
    loading?: boolean
}

export function AccessControlWidget() {
    const [data, setData] = useState<RolesSummaryType | null>(null)
    const [total, setTotal] = useState<number>(0)
    const [blocked, setBlocked] = useState<number>(0)
    const [roles, setRoles] = useState<StatisticalProps[]>([])
    const [chartConfig, setChartConfig] = useState<ChartConfig>({})

    const {isLoading} = useQuery({
        queryKey: ["access-control", "widget"],
        queryFn: async () => {
            const response = await AccessControlApiService.getSummary()

            if (!response) return;
            if (!response.data) return;

            setData(response?.data.data)
            setTotal(Object.keys(response?.data.data).length)
            setBlocked(
                Object.values(response?.data.data)
                    .reduce((acc, curr) => acc + curr.stats.blocked, 0)
            )

            const roles: StatisticalProps[] = []
            const chartConfig: ChartConfig = {}

            for (const [_, role] of Object.entries(response.data.data)) {
                const name = role.metadata.name
                const label = getRoleLabel(name)
                roles.push({
                    label,
                    amount: role.stats.fullAccess,
                    color: role.metadata.color,
                    fill: role.metadata.color,
                    description: role.metadata.description,
                })

                chartConfig[name] = {
                    label,
                    color: role.metadata.color,
                }
            }

            setRoles(roles)
            setChartConfig(chartConfig)

            return response.data;
        },
    })

    return (
        <Fragment>
            {isLoading
                ? (
                    <div className="flex flex-col items-center justify-center gap-6 animate-pulse duration-2000">
                        <ShieldIcon size={64} className="text-muted-foreground"/>
                        <Waiting label={"Récupération..."}/>
                    </div>
                )
                : (
                    <ModuleWidget
                        title={
                            <div className="flex items-center gap-2">
                                <ShieldIcon className="size-5 text-primary"/>
                                <span>Sécurité</span>
                            </div>
                        }
                        description="Rôles et permissions"
                        stats={[
                            {label: 'Rôles', amount: total},
                            {label: 'Domaines Bloqués', amount: blocked},
                        ]}
                        className="h-full"
                        chartVariant={"chart:pie"}
                        chart={{
                            data: roles,
                            config: chartConfig,
                            dataKey: "amount",
                            nameKey: "label",
                            innerLabel: "Accès"
                        } as any}
                    />
                )
            }

        </Fragment>
    )
}
