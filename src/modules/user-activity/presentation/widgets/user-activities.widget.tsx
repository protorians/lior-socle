"use client"

import * as React from "react"
import {ActivityIcon} from "lucide-react"
import {useQuery} from "@tanstack/react-query"
import {ModuleWidget} from "@liorian/sdk/presentation/module-widget"
import {UserActivitiesApiService} from "@/modules/user-activity/application/service/user-activities-api-service";
import {UserActivitiesAnalyticsAdapter} from "@/modules/user-activity/infrastructure/adapters/user-activities-analytics.adapter";
import {UserActivitiesAnalyticsInterface} from "@/modules/user-activity/domain/user-activities.interface";

const ACTIVITY_CONFIG = {
    activités: {label: 'Activités', color: 'var(--chart-1)'},
}

export function UserActivitiesWidget() {
    const {data, isLoading} = useQuery({
        queryKey: ['user-activities', 'widget', 'analytics'],
        queryFn: async () => {
            const response = await UserActivitiesApiService.getAnalytics();
            return response.data?.data as UserActivitiesAnalyticsInterface | undefined;
        },
        refetchInterval: 60_000,
        refetchOnWindowFocus: false,
    });

    const stats = UserActivitiesAnalyticsAdapter.toDashboard(data);

    const chartData = React.useMemo(() => {
        const series = data?.activityOverTime ?? []
        if (!series.length) {
            return [
                {jour: 'Lun', activités: 120},
                {jour: 'Mar', activités: 180},
                {jour: 'Mer', activités: 150},
                {jour: 'Jeu', activités: 240},
                {jour: 'Ven', activités: 310},
                {jour: 'Sam', activités: 190},
                {jour: 'Dim', activités: 130},
            ]
        }
        return series.map(point => ({jour: point.date, activités: point.count}))
    }, [data])

    const topUsers = React.useMemo(() => {
        const users = data?.topActiveUsers ?? []
        if (!users.length) return undefined
        return Object.fromEntries(
            users.slice(0, 4).map(u => [u.username || u.userId, `${u.activityCount} actions`])
        )
    }, [data])

    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <ActivityIcon className="size-5 text-primary"/>
                    <span>Activités</span>
                </div>
            }
            description="Journal d'activité et traçabilité"
            stats={[
                {label: 'Total', amount: stats.totalActivities},
                {label: '24h', amount: stats.activitiesLast24h},
                {label: 'Actifs', amount: stats.uniqueUsersActive},
            ]}
            chartVariant="chart:area"
            chart={{
                data: chartData,
                config: ACTIVITY_CONFIG,
                xAxisDataKey: 'jour',
                areas: [{dataKey: 'activités', stackId: 'a'}],
                title: 'Activité récente',
                description: 'Volume d’actions par jour',
            }}
            items={topUsers}
            itemsHeader="Utilisateurs les plus actifs"
            loading={isLoading}
            className="h-full"
        />
    )
}
