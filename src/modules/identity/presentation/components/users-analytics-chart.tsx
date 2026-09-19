"use client"

import {Fragment, useCallback, useEffect, useState} from "react";
import {AreaWidgetChart} from "@liorian/sdk/presentation/charts/area-widget.chart";
import {AreaWidgetChartSkeleton} from "@liorian/sdk/presentation/charts/area-widget.chart-skeleton";
import {ChartConfig} from "@liorian/sdk/presentation/ui/chart";
import {usersAnalyticsRoutine} from "@/modules/identity/infrastructure/routines/users-analytics.routine";
import {GranularitySelector, GranularityValue} from "@liorian/sdk/presentation/ui/granularity-selector";

const chartConfig = {
    count: {
        label: "Utilisateurs",
        color: "var(--color-chart-1)",
    },
} satisfies ChartConfig

export function UsersAnalyticsChart() {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [granularity, setGranularity] = useState<GranularityValue>("day")
    const {dataset: analytics} = usersAnalyticsRoutine.dataset()

    const handleGranularityChange = useCallback((value: GranularityValue) => {
        setGranularity(value)
        usersAnalyticsRoutine.setGranularity(value).refetch()
    }, [])

    useEffect(() => {
        if (analytics && analytics.summary) setIsLoading(false)
    }, [analytics])

    return (
        <div className="flex flex-col gap-4 py-6">
            <div className="flex items-center justify-end">
                <GranularitySelector
                    value={granularity}
                    onValueChange={handleGranularityChange}
                />
            </div>
            {isLoading && (
                <div className="w-full h-[40dvh]">
                    <AreaWidgetChartSkeleton
                        title="Utilisateurs au fil du temps"
                        description="Affichage du nombre d'utilisateurs inscrits par période"
                        className="h-full"
                    />
                </div>
            )}
            {
                !isLoading && analytics && analytics.summary && (
                    <Fragment>
                        <div className="w-full h-[40dvh]">
                            <AreaWidgetChart
                                hideCard={false}
                                title="Utilisateurs au fil du temps"
                                description="Affichage du nombre d'utilisateurs inscrits par période"
                                data={analytics.usersOverTime || []}
                                config={chartConfig}
                                areas={[
                                    {
                                        dataKey: "count",
                                        stroke: "var(--chart-1)",
                                    }
                                ]}
                                xAxisDataKey="date"
                                className="h-full"
                            />
                        </div>
                    </Fragment>
                )
            }
        </div>
    )
}