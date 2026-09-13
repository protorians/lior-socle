"use client"

import * as React from "react"
import {useModuleStore} from "@sentients/sdk/infrastructure/stores/module.store";
import {authUserConnectedStore} from "@sentients/sdk/infrastructure/stores/auth-user-connected.store";
import {Waiting} from "@sentients/sdk/presentation/components/waiting";
import {useDashboardLayoutStore} from "@/modules/dashboard/infrastructure/dashboard-layout.store";
import {DashboardWidgetGrid} from "@/modules/dashboard/presentation/components/dashboard-widget-grid";
import {DashboardAddWidgetPanel} from "@/modules/dashboard/presentation/components/dashboard-add-widget-panel";
import {DashboardRemoveDialog} from "@/modules/dashboard/presentation/components/dashboard-remove-dialog";
import {createWidgetId} from "@/modules/dashboard/domain/dashboard-layout.interface";

export function DashboardWidgetsContainer() {
    const {modules} = useModuleStore();
    const currentUserId = authUserConnectedStore((s) => s.getCurrentUser)?.id;

    const {
        widgets,
        isLoaded,
        hydrate,
        removeWidget,
        toggleWidget,
        reorderWidgets,
    } = useDashboardLayoutStore();

    const [removeId, setRemoveId] = React.useState<string | null>(null);

    const removeEntry = React.useMemo(
        () => widgets.find(w => w.identifier === removeId) ?? null,
        [widgets, removeId],
    );

    const removeLabel = React.useMemo(() => {
        if (!removeEntry) return undefined;
        const mod = modules.find(m => m.identifier === removeEntry.moduleId);
        return `${mod?.name ?? removeEntry.moduleId} · ${removeEntry.widgetKey}`;
    }, [removeEntry, modules]);

    React.useEffect(() => {
        if (currentUserId && modules.length > 0) {
            hydrate(currentUserId, modules);
        }
    }, [currentUserId, modules, hydrate]);

    if (!currentUserId || !isLoaded) {
        return (
            <div className="flex-auto flex flex-col items-center justify-center min-h-[70dvh]">
                <Waiting label="Chargement de votre tableau de bord"/>
            </div>
        );
    }

    return (
        <div className="flex-auto flex flex-col gap-4">
            <div className="flex flex-row items-center">
                <div className="flex-auto"></div>
                <div className="flex flex-row items-center">
                    <DashboardAddWidgetPanel modules={modules} userId={currentUserId}/>
                </div>
            </div>
            <DashboardWidgetGrid
                widgets={widgets}
                modules={modules}
                onRemove={setRemoveId}
                onToggle={(id) => toggleWidget(id, currentUserId)}
                onReorder={(movedId, overId) => reorderWidgets(movedId, overId, currentUserId)}
            />
            <DashboardRemoveDialog
                open={removeId !== null}
                onOpenChange={(open) => {
                    if (!open) setRemoveId(null);
                }}
                onConfirm={() => {
                    if (removeId) removeWidget(removeId, currentUserId);
                    setRemoveId(null);
                }}
                widgetLabel={removeLabel}
            />
        </div>
    )
}
