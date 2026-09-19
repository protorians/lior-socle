"use client"

import {useEffect, useState} from "react";
import {usersAnalyticsRoutine} from "@/modules/identity/infrastructure/routines/users-analytics.routine";
import {AnalyticsSection} from "@liorian/sdk/presentation/analytics-section";
import {WaitingSection} from "@liorian/sdk/presentation/components/waiting-section";
import {cn} from "@liorian/sdk/infrastructure/utilities/utils";

export function UsersAnalyticsData() {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const {dataset: analytics} = usersAnalyticsRoutine.dataset()

    useEffect(() => {
        if (analytics) setIsLoading(false)
    }, [analytics])


    return (
        <div className="flex flex-col gap-4">
            {isLoading && (
                <WaitingSection label={'Récupération des statistiques'} className={cn("min-h-25")}/>
            )}
            <AnalyticsSection
                direction={"vertical"}
                items={[
                    {
                        label: 'Total',
                        value: analytics?.summary?.totalUsers || 0,
                        title: <>Utilisateurs total</>,
                        description: <>Le nombre de tous les utilisateurs inscrits</>,
                    },
                    {
                        label: 'Actifs',
                        value: analytics?.summary?.activeUsers || 0,
                        title: <>Utilisateurs actifs</>,
                        description: <>Le nombre d'utilisateurs actifs</>
                    },
                    {
                        label: 'Ce mois',
                        value: analytics?.summary?.newUsersThisMonth || 0,
                        title: <>Utilisateurs inscrits ce mois-ci</>,
                        description: <>Le nombre d'utilisateurs inscrits ce mois-ci</>
                    },
                ]}
            />
        </div>
    )
}