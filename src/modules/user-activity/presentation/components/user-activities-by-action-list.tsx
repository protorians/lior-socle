"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@sentients/sdk/presentation/ui/card";
import {Badge} from "@sentients/sdk/presentation/ui/badge";
import {PermissionActionBadge} from "@sentients/sdk/presentation/permission-action-badge";
import {userActivitiesAnalyticsRoutine} from "@/modules/user-activity/infrastructure/routines/user-activities-analytics.routine";
import {Empty, EmptyDescription, EmptyMedia, EmptyTitle} from "@sentients/sdk/presentation/ui/empty";
import {ActivityIcon} from "lucide-react";

export function UserActivitiesByActionList() {
    const {dataset: analytics} = userActivitiesAnalyticsRoutine.dataset()
    const actions = analytics?.activitiesByAction || []
    const total = actions.reduce((sum, item) => sum + (item.count || 0), 0)

    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardDescription>Actions</CardDescription>
                <CardTitle>Répartition par action</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 flex-1">
                {actions.length === 0 && (
                    <Empty>
                        <EmptyMedia>
                            <ActivityIcon size={48} strokeWidth={1}/>
                        </EmptyMedia>
                        <EmptyTitle>Aucune action</EmptyTitle>
                        <EmptyDescription>Aucune donnée d'activité disponible</EmptyDescription>
                    </Empty>
                )}
                {actions.map((item) => {
                    const percent = total > 0 ? Math.round(((item.count || 0) / total) * 100) : 0
                    return (
                        <div key={item.action} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <PermissionActionBadge action={item.action}/>
                                </div>
                                <Badge variant="outline" className="text-xs tabular-nums">
                                    {item.count}
                                </Badge>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-primary/70"
                                    style={{width: `${percent}%`}}
                                />
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
