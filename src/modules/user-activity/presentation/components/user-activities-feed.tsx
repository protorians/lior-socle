"use client"

import {Fragment, useMemo, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {ActivityIcon, RefreshCwIcon} from "lucide-react";
import {authUserConnectedStore} from "@liorian/sdk/infrastructure/stores/auth-user-connected.store";
import {hasPermissions} from "@liorian/sdk/infrastructure/utilities/permission.util";
import {DomainsEnum} from "@liorian/sdk/domain/enums/domains.enum";
import {ActivitiesType} from "@liorian/sdk/domain/entities/activities.interface";
import {UserActivitiesApiService} from "@/modules/user-activity/application/service/user-activities-api-service";
import {
    Timeline,
    TimelineContent,
    TimelineDate,
    TimelineHeader,
    TimelineIndicator,
    TimelineItem,
    TimelineSeparator,
    TimelineTitle,
} from "@liorian/sdk/presentation/reui/timeline";
import {ActivityDescriptor, explainActivityAction} from "@liorian/sdk/infrastructure/utilities/activities.util";
import {Badge} from "@liorian/sdk/presentation/ui/badge";
import {PermissionActionBadge} from "@liorian/sdk/presentation/permission-action-badge";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@liorian/sdk/presentation/ui/empty";
import {Skeleton} from "@liorian/sdk/presentation/ui/skeleton";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@liorian/sdk/presentation/ui/select";
import {Tabs, TabsList, TabsTrigger} from "@liorian/sdk/presentation/ui/tabs";
import {cn} from "@liorian/sdk/infrastructure/utilities/utils";

const HTTP_ACTIONS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
type Scope = 'all' | 'mine';

function formatDate(iso: string): string {
    return Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    }).format(new Date(iso));
}

export function UserActivitiesFeed() {
    const {getCurrentUser} = authUserConnectedStore()
    const [hoverIndex, setHoverIndex] = useState<number>(0)
    const [moduleFilter, setModuleFilter] = useState<string>('all')
    const [actionFilter, setActionFilter] = useState<string>('all')

    const canViewAll = useMemo(() => {
        return hasPermissions(
            getCurrentUser?.permissions || {},
            [DomainsEnum.Activity, DomainsEnum.UserActivity],
            false,
        )
    }, [getCurrentUser?.permissions])

    const [scope, setScope] = useState<Scope>(canViewAll ? 'all' : 'mine')

    const {isLoading, isFetching, data: activities, refetch} = useQuery<ActivitiesType>({
        queryKey: ['user-activities', 'feed', scope],
        queryFn: async () => {
            const response = scope === 'all'
                ? await UserActivitiesApiService.getAll({limit: 100})
                : await UserActivitiesApiService.getMyActivities();
            return (Array.isArray(response.data.data) ? response.data.data : []) as ActivitiesType;
        },
        refetchInterval: 30_000,
        refetchOnWindowFocus: false,
    });

    const moduleOptions = useMemo(() => {
        const unique = new Set<string>();
        (activities || []).forEach(a => {
            if (a.module) unique.add(a.module);
        });
        return [...unique].sort();
    }, [activities]);

    const filtered = useMemo(() => {
        return (activities || []).filter(a => {
            if (moduleFilter !== 'all' && a.module !== moduleFilter) return false;
            if (actionFilter !== 'all' && a.action?.toUpperCase() !== actionFilter) return false;
            return true;
        });
    }, [activities, moduleFilter, actionFilter]);

    const filterBar = (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
                <TabsList>
                    {canViewAll && <TabsTrigger value="all">Toutes</TabsTrigger>}
                    <TabsTrigger value="mine">Mes activités</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 flex-auto justify-end">
                <Select value={moduleFilter} onValueChange={setModuleFilter}>
                    <SelectTrigger className="w-[150px]" aria-label="Filtrer par module">
                        <SelectValue placeholder="Module"/>
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                        <SelectItem value="all" className="rounded-lg">Tous les modules</SelectItem>
                        {moduleOptions.map(module => (
                            <SelectItem key={module} value={module} className="rounded-lg">{module}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-[150px]" aria-label="Filtrer par action">
                        <SelectValue placeholder="Action"/>
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                        <SelectItem value="all" className="rounded-lg">Toutes les actions</SelectItem>
                        {HTTP_ACTIONS.map(action => (
                            <SelectItem key={action} value={action} className="rounded-lg">
                                {explainActivityAction(action)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="outline" size="icon" onClick={() => refetch()}>
                    <RefreshCwIcon className={cn(isFetching && "animate-spin")}/>
                </Button>
            </div>
        </div>
    )

    if (isLoading) {
        return (
            <div className="flex flex-col gap-3">
                {filterBar}
                <Skeleton className="h-16 w-full"/>
                <Skeleton className="h-16 w-full"/>
                <Skeleton className="h-16 w-full"/>
                <Skeleton className="h-16 w-full"/>
            </div>
        )
    }

    if (!activities || activities.length === 0) {
        return (
            <div className="flex flex-col gap-4">
                {filterBar}
                <Empty>
                    <EmptyMedia>
                        <ActivityIcon size={80} strokeWidth={1}/>
                    </EmptyMedia>
                    <EmptyTitle>Aucune activité</EmptyTitle>
                    <EmptyDescription>Les activités s'afficheront ici dès qu'elles seront enregistrées</EmptyDescription>
                    <EmptyContent>
                        <Button variant="outline" onClick={() => refetch()}>
                            <RefreshCwIcon/>
                            Actualiser
                        </Button>
                    </EmptyContent>
                </Empty>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {filterBar}

            {isFetching && (
                <p className="text-center text-xs text-muted-foreground">Mise à jour...</p>
            )}

            {filtered.length === 0 && (
                <Empty>
                    <EmptyMedia>
                        <ActivityIcon size={64} strokeWidth={1}/>
                    </EmptyMedia>
                    <EmptyTitle>Aucun résultat</EmptyTitle>
                    <EmptyDescription>Aucune activité ne correspond aux filtres sélectionnés</EmptyDescription>
                </Empty>
            )}

            {filtered.length > 0 && (
                <Timeline defaultValue={1} value={hoverIndex} className="w-full">
                    {filtered.map((activity, index) => (
                        <Fragment key={activity.id}>
                            <TimelineItem step={index + 1} onMouseEnter={() => setHoverIndex(index + 1)}>
                                <TimelineHeader>
                                    <TimelineDate>{formatDate(activity.createdAt)}</TimelineDate>
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
                                {activity.description && (
                                    <TimelineContent className={'text-xs!'}>
                                        {activity.description}
                                    </TimelineContent>
                                )}
                            </TimelineItem>
                        </Fragment>
                    ))}
                </Timeline>
            )}
        </div>
    )
}
