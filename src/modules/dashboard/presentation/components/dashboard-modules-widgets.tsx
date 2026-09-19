"use client"

import {useModuleStore} from "@liorian/sdk/infrastructure/stores/module.store";
import {Fragment} from "react";
import {Waiting} from "@liorian/sdk/presentation/components/waiting";
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@liorian/sdk/presentation/ui/empty";
import {BoxesIcon, LayersIcon} from "lucide-react";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {AnalyticsSection} from "@liorian/sdk/presentation/analytics-section";

export function DashboardModulesWidgets() {
    const {modules} = useModuleStore();

    return (
        <div className="flex-auto flex flex-col gap-4">
            {!modules.length
                ? (
                    <div className="flex-auto flex flex-col items-center justify-center min-h-[70dvh]">
                        <Empty>
                            <EmptyMedia>
                                <LayersIcon size={80} strokeWidth={1}/>
                            </EmptyMedia>
                            <EmptyTitle>Widgets</EmptyTitle>
                            <EmptyDescription>Tous les widgets des modules s'afficheront ici</EmptyDescription>
                            <EmptyDescription>
                                <Waiting label={"En attente de widgets"}/>
                            </EmptyDescription>
                            <EmptyContent>
                                <Button variant="outline">Actualiser</Button>
                            </EmptyContent>
                        </Empty>
                    </div>
                )
                : (
                    <Fragment>
                        <div className="w-full">
                            <AnalyticsSection
                                items={[
                                    {
                                        label: 'Total',
                                        value: modules.length,
                                        title: <>Module total installé</>,
                                        description: <>Le nombre de module total installé</>,
                                    },
                                    {
                                        label: 'Module Actifs',
                                        value: modules.filter((m) => m.isEnabled).length,
                                        title: <>Module actifs</>,
                                        description: <>Le nombre de module actifs</>,
                                    },
                                    {
                                        label: 'Module Inactifs',
                                        value: modules.filter((m) => !m.isEnabled).length,
                                        title: <>Module inactifs</>,
                                        description: <>Le nombre de module inactifs</>,
                                    },
                                    {
                                        label: 'Module Internes',
                                        value: modules.filter((m) => m.isDefault).length,
                                        title: <>Module internes</>,
                                        description: <>Le nombre de module internes</>,
                                    },
                                ]}
                            />
                        </div>
                        <div
                            className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                            {modules.map((module) => {
                                if (typeof module.widgets != 'object')
                                    return null;
                                const widgets = Object.entries(module.widgets)
                                return (
                                    <Fragment key={module.identifier}>
                                        {widgets.map(([key, Widget], index) => {
                                            return (
                                                <Widget key={`dashboard-widget-${key}-${index}`}/>
                                            )
                                        })}
                                    </Fragment>
                                )
                            })}
                        </div>
                    </Fragment>
                )
            }
        </div>
    )
}