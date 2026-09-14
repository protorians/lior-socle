"use client"

import {useMemo} from "react";
import {PieWidgetChart} from "@sentients/sdk/presentation/charts/pie-widget.chart";
import {PieWidgetChartSkeleton} from "@sentients/sdk/presentation/charts/pie-widget.chart-skeleton";
import {ChartConfig} from "@sentients/sdk/presentation/ui/chart";
import {
    userActivitiesAnalyticsRoutine
} from "@/modules/user-activity/infrastructure/routines/user-activities-analytics.routine";
import {retrieveModule} from "@sentients/sdk/infrastructure/utilities/modules";
import {capitalizeFirstLetter} from "@sentients/sdk/infrastructure/utilities/strings.util";

const CHART_COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

function moduleLabel(module?: string): string {
    if (!module) return 'Autre';
    return retrieveModule(module)?.name || capitalizeFirstLetter(module);
}

export function UserActivitiesByModuleChart() {
    const {dataset: analytics} = userActivitiesAnalyticsRoutine.dataset()

    const data = useMemo(
        () => (analytics?.activitiesByModule || []).map((item, index) => ({
            module: item.module,
            count: item.count,
            fill: CHART_COLORS[index % CHART_COLORS.length],
        })),
        [analytics?.activitiesByModule]
    )

    const config = useMemo<ChartConfig>(() => {
        const result: ChartConfig = {};
        (analytics?.activitiesByModule || []).forEach((item, index) => {
            result[item.module] = {
                label: moduleLabel(item.module),
                color: CHART_COLORS[index] || CHART_COLORS[index % CHART_COLORS.length],
            };
        });
        return result;
    }, [analytics?.activitiesByModule])

    if (!analytics?.summary) {
        return (
            <div className="h-full">
                <PieWidgetChartSkeleton
                    title="Activités par module"
                    description="Répartition des activités par module"
                />
            </div>
        )
    }

    return (
        <PieWidgetChart
            title="Activités par module"
            description="Répartition des activités par module"
            data={data}
            config={config}
            dataKey="count"
            nameKey="module"
            innerLabel="Activités"
            className="h-full"
        />
    )
}
