"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@liorian/sdk/presentation/ui/card";
import {Avatar, AvatarFallback} from "@liorian/sdk/presentation/ui/avatar";
import {Badge} from "@liorian/sdk/presentation/ui/badge";
import {userActivitiesAnalyticsRoutine} from "@/modules/user-activity/infrastructure/routines/user-activities-analytics.routine";
import {Empty, EmptyDescription, EmptyMedia, EmptyTitle} from "@liorian/sdk/presentation/ui/empty";
import {UsersIcon} from "lucide-react";

function initials(username?: string): string {
    if (!username) return '?';
    const parts = username.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) || '';
    const second = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : '';
    return (first + second).toUpperCase();
}

export function UserActivitiesTopUsers() {
    const {dataset: analytics} = userActivitiesAnalyticsRoutine.dataset()
    const users = analytics?.topActiveUsers || []
    const max = Math.max(...users.map(u => u.activityCount || 0), 1)

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardDescription>Classement</CardDescription>
                <CardTitle>Utilisateurs les plus actifs</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 flex-1">
                {users.length === 0 && (
                    <Empty>
                        <EmptyMedia>
                            <UsersIcon size={48} strokeWidth={1}/>
                        </EmptyMedia>
                        <EmptyTitle>Aucun utilisateur</EmptyTitle>
                        <EmptyDescription>Aucune activité utilisateur enregistrée</EmptyDescription>
                    </Empty>
                )}
                {users.map((user, index) => (
                    <div key={user.userId} className="flex items-center gap-3">
                        <div className="text-xs font-medium text-muted-foreground w-5 text-right tabular-nums">
                            {index + 1}
                        </div>
                        <Avatar size="sm">
                            <AvatarFallback>{initials(user.username)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{user.username || 'Utilisateur inconnu'}</div>
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-1">
                                <div
                                    className="h-full rounded-full bg-primary/60"
                                    style={{width: `${Math.round(((user.activityCount || 0) / max) * 100)}%`}}
                                />
                            </div>
                        </div>
                        <Badge variant="outline" className="text-xs tabular-nums">
                            {user.activityCount}
                        </Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
