"use client"

import {useEffect, useState} from "react";
import {userActivitiesAnalyticsRoutine} from "@/modules/user-activity/infrastructure/routines/user-activities-analytics.routine";
import {AnalyticsSection} from "@liorian/sdk/presentation/analytics-section";
import {WaitingSection} from "@liorian/sdk/presentation/components/waiting-section";
import {cn} from "@liorian/sdk/infrastructure/utilities/utils";

export function UserActivitiesAnalyticsData() {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const {dataset: analytics} = userActivitiesAnalyticsRoutine.dataset()

    useEffect(() => {
        if (analytics) setIsLoading(false)
    }, [analytics])

    return (
        <div className="flex flex-col gap-4">
            {isLoading && (
                <WaitingSection label={'Récupération des statistiques'} className={cn("min-h-25")}/>
            )}
            <AnalyticsSection
                items={[
                    {
                        label: 'Total',
                        value: analytics?.summary?.totalActivities || 0,
                        title: <>Activités totales</>,
                        description: <>Le nombre total d'activités enregistrées</>,
                    },
                    {
                        label: 'Dernières 24h',
                        value: analytics?.summary?.activitiesLast24h || 0,
                        title: <>Activités (24h)</>,
                        description: <>Les activités des dernières 24 heures</>,
                    },
                    {
                        label: 'Actifs',
                        value: analytics?.summary?.uniqueUsersActive || 0,
                        title: <>Utilisateurs actifs</>,
                        description: <>Le nombre d'utilisateurs actifs (24h)</>,
                    },
                    {
                        label: 'Module',
                        value: analytics?.summary?.mostActiveModule || 'N/A',
                        title: <>Module le plus actif</>,
                        description: <>Le module le plus sollicité</>,
                    },
                ]}
            />
        </div>
    )
}
