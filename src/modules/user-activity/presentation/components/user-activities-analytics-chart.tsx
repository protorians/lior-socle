"use client"

import {Fragment, useCallback, useEffect, useState} from "react";
import {AreaWidgetChart} from "@sentients/sdk/presentation/charts/area-widget.chart";
import {AreaWidgetChartSkeleton} from "@sentients/sdk/presentation/charts/area-widget.chart-skeleton";
import {ChartConfig} from "@sentients/sdk/presentation/ui/chart";
import {GranularitySelector, GranularityValue} from "@sentients/sdk/presentation/ui/granularity-selector";
import {userActivitiesAnalyticsRoutine} from "@/modules/user-activity/infrastructure/routines/user-activities-analytics.routine";

const chartConfig = {
    count: {
        label: "Activités",
        color: "var(--color-chart-1)",
    },
} satisfies ChartConfig

export function UserActivitiesAnalyticsChart() {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [granularity, setGranularity] = useState<GranularityValue>("day")
    const {dataset: analytics} = userActivitiesAnalyticsRoutine.dataset()

    const handleGranularityChange = useCallback((value: GranularityValue) => {
        setGranularity(value)
        userActivitiesAnalyticsRoutine.setGranularity(value).refetch()
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
                        title="Activités au fil du temps"
                        description="Affichage du nombre d'activités par période"
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
                                title="Activités au fil du temps"
                                description="Affichage du nombre d'activités par période"
                                data={analytics.activityOverTime || []}
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
