"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@sentients/sdk/presentation/ui/card";
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@sentients/sdk/presentation/ui/empty";
import {Button} from "@sentients/sdk/presentation/ui/button";
import {BoxesIcon} from "lucide-react";
import {QueryFunction, useQuery} from "@tanstack/react-query";
import {Fragment, useState} from "react";
import {authUserConnectedStore} from "@sentients/sdk/infrastructure/stores/auth-user-connected.store";
import {WaitingBar} from "@sentients/sdk/presentation/components/waiting-bar";
import {hasPermissions} from "@sentients/sdk/infrastructure/utilities/permission.util";
import {DomainsEnum} from "@sentients/sdk/domain/enums/domains.enum";
import {UsersApiService} from "@/modules/identity/application/service/users-api-service";
import {ActivitiesType} from "@sentients/sdk/domain/entities/activities.interface";
import {
    Timeline,
    TimelineContent,
    TimelineDate,
    TimelineHeader,
    TimelineIndicator,
    TimelineItem,
    TimelineSeparator,
    TimelineTitle
} from "@sentients/sdk/presentation/reui/timeline";
import {ActivityDescriptor, explainActivityAction} from "@sentients/sdk/infrastructure/utilities/activities.util";
import {Badge} from "@sentients/sdk/presentation/ui/badge";
import {PermissionActionBadge} from "@sentients/sdk/presentation/permission-action-badge";
import {cn} from "@sentients/sdk/infrastructure/utilities/utils";
import {Waiting} from "@sentients/sdk/presentation/components/waiting";


export interface UserActivitiesFeedProps {
    compacted?: boolean
}

export function UserActivitiesFeed({compacted = true}: UserActivitiesFeedProps) {
    const {getCurrentUser} = authUserConnectedStore()
    const getActivities: QueryFunction<any, any, any> = async ({}) => {
        const has = (getCurrentUser?.permissions) ? hasPermissions(
            getCurrentUser.permissions,
            [DomainsEnum.Activity, DomainsEnum.UserActivity]
        ) : undefined;

        if (has === undefined) return null;
        const response = await UsersApiService[has ? 'getAllActivities' : 'getMyActivities']()
        return (Array.isArray(response.data.data) ? response.data.data : []) as ActivitiesType;
    }
    const {isLoading, data: activities} = useQuery<ActivitiesType>({
        queryKey: ['users', 'activities', 'feed'],
        queryFn: getActivities,
        refetchInterval: 30_000,
    })
    const [hoverIndex, setHoverIndex] = useState<number>(0)

    const emptyRender = () => {
        return (
            <Empty>
                <EmptyMedia>
                    <BoxesIcon size={80} strokeWidth={1}/>
                </EmptyMedia>
                <EmptyTitle>Aucune activités</EmptyTitle>
                <EmptyDescription>Vous n'avez encore aucune activité ici</EmptyDescription>
                <EmptyContent>
                    <Button variant="outline">Actualiser</Button>
                </EmptyContent>
            </Empty>
        )
    }
    const timelineRender = () => {

        return (
            <Fragment>
                {isLoading && <Waiting label={'Récupération des activités...'}/>}
                {!isLoading && activities && (
                    <div
                        className={"flex flex-col gap-4 w-full items-end"}>
                        <Timeline
                            defaultValue={1}
                            value={hoverIndex}
                            className="w-full max-w-md"
                        >
                            {activities.map((activity, index) => {
                                const date = Intl.DateTimeFormat('fr-FR', {
                                    month: 'long',
                                    year: 'numeric',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    second: 'numeric',
                                })
                                    .format(new Date(activity.createdAt));
                                return (
                                    <Fragment key={activity.id}>
                                        <TimelineItem step={index + 1} onMouseEnter={() => setHoverIndex(index + 1)}>
                                            <TimelineHeader>
                                                <TimelineDate>{date}</TimelineDate>
                                                <TimelineTitle className={'flex flex-row gap-2 items-center'}>
                                                    <PermissionActionBadge action={activity.action}/>
                                                    <Badge variant="outline" className={'text-xs'}>
                                                        {activity.module?.toLowerCase()}
                                                    </Badge>
                                                </TimelineTitle>
                                            </TimelineHeader>
                                            <TimelineIndicator/>
                                            <TimelineSeparator/>
                                            <TimelineContent className={'text-foreground!'}>
                                                {ActivityDescriptor(activity)}
                                            </TimelineContent>
                                            <TimelineContent className={'text-xs!'}>
                                                {activity.description}
                                            </TimelineContent>
                                        </TimelineItem>
                                    </Fragment>
                                )
                            })}
                        </Timeline>

                    </div>
                )}
            </Fragment>
        )
    }

    return (
        <Fragment>
            {getCurrentUser && getCurrentUser.permissions && (
                <Card className={cn(
                    "flex flex-col h-full ",
                    compacted ? "max-h-[50dvh]" : "max-h-[80dvh]"
                )}>
                    <CardHeader>
                        <CardDescription>Activités</CardDescription>
                        <CardTitle></CardTitle>
                    </CardHeader>
                    <CardContent className={"flex flex-col flex-auto overflow-y-auto overflow-x-hidden"}>
                        {!getCurrentUser && emptyRender()}
                        {getCurrentUser && timelineRender()}
                    </CardContent>
                </Card>
            )}
        </Fragment>
    )
}