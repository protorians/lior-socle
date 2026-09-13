"use client"

import * as React from "react"
import {useQuery} from "@tanstack/react-query"
import {CloudIcon} from "lucide-react"
import {ModuleWidget} from "@sentients/sdk/presentation/module-widget"
import {CloudApiService} from "@/modules/media-library/application/service/cloud-api-service";

export function CloudWidget() {
    const {data} = useQuery({
        queryKey: ['cloud', 'widget'],
        queryFn: async () => {
            const response = await CloudApiService.getAll({limit: 1, page: 1});
            const body = response.data?.data;
            return body ?? {data: [], meta: {}};
        },
        refetchInterval: 60_000,
        refetchOnWindowFocus: false,
    });

    const totalFiles = data?.meta?.total ?? 0;

    const storageConfig = {
        stockage: {label: 'Stockage (Go)', color: 'var(--chart-1)'},
    };

    const storageDemo = [
        {mois: 'Jan', stockage: 12},
        {mois: 'Fév', stockage: 16},
        {mois: 'Mar', stockage: 21},
        {mois: 'Avr', stockage: 27},
        {mois: 'Mai', stockage: 34},
        {mois: 'Juin', stockage: 39},
    ];

    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <CloudIcon className="size-5 text-primary"/>
                    <span>Cloud</span>
                </div>
            }
            description="Gestion des fichiers"
            stats={[
                {label: 'Fichiers', amount: totalFiles},
            ]}
            chartVariant="chart:area"
            chart={{
                data: storageDemo,
                config: storageConfig,
                xAxisDataKey: 'mois',
                areas: [{dataKey: 'stockage', stackId: 'a'}],
                title: 'Stockage utilisé',
                description: 'Évolution de l’utilisation (Go)',
                footerDescription: 'Données d’aperçu — à affiner avec l’analytics',
            }}
            className="h-full"
        />
    )
}
