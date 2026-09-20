"use client"
import * as React from "react"
import {WandSparklesIcon} from "lucide-react"
import {ModuleWidget} from "@liorian/sdk/presentation/module-widget"
import {useQuery} from "@tanstack/react-query"
import {HelloWorldApiService} from "../../application/service/hello-world-api-service"
import {useAuth} from "@liorian/sdk/infrastructure/hooks/use-auth"

export function HelloWorldWidget() {
    const {currentOrganization} = useAuth()

    const {data: analytics, isLoading} = useQuery<any>({
        queryKey: ['hello-world', 'widget'],
        enabled: !!currentOrganization?.id,
        queryFn: async () => {
            const response = await HelloWorldApiService.getAnalytics()
            return response.data?.data ?? response.data
        },
    })

    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <WandSparklesIcon className="size-5 text-primary"/>
                    <span>Hello World</span>
                </div>
            }
            description="Module d'exemple pour l'onboarding"
            stats={[
                {label: 'Total', amount: analytics?.total ?? 0},
                {label: 'Publiés', amount: analytics?.published ?? 0},
                {label: 'Brouillons', amount: analytics?.drafts ?? 0},
                {label: 'Archivés', amount: analytics?.archived ?? 0},
            ]}
            loading={isLoading}
            className="h-full"
        />
    )
}