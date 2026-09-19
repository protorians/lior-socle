"use client"

import * as React from "react"
import {
    closestCorners,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    rectSortingStrategy,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import {ModuleDeclarationInterface} from "@liorian/sdk/domain/entities/module.interface";
import {DashboardWidgetEntry} from "@/modules/dashboard/domain/dashboard-layout.interface";
import {SortableDashboardWidget} from "@/modules/dashboard/presentation/components/sortable-dashboard-widget";
import {useDashboardLayoutStore} from "@/modules/dashboard/infrastructure/dashboard-layout.store";
import {PlusIcon} from "lucide-react";

interface DashboardWidgetGridProps {
    widgets: DashboardWidgetEntry[]
    modules: ModuleDeclarationInterface[]
    onReorder: (movedId: string, overId: string) => void
    onRemove: (id: string) => void
    onToggle: (id: string) => void
}

function AddWidgetBlock() {
    const openAddPanel = useDashboardLayoutStore(s => s.openAddPanel);
    return (
        <button
            onClick={openAddPanel}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-transparent min-h-[14rem] hover:border-muted-foreground/50 hover:bg-muted/20 transition-colors cursor-pointer"
        >
            <div className="flex items-center justify-center size-10 rounded-full border-2 border-dashed border-muted-foreground/30">
                <PlusIcon className="size-5 text-muted-foreground"/>
            </div>
            <span className="text-xs text-muted-foreground">Ajouter un widget</span>
        </button>
    );
}

function resolveWidgetComponent(
    modules: ModuleDeclarationInterface[],
    moduleId: string,
    widgetKey: string,
): React.ComponentType | null {
    const mod = modules.find(m => m.identifier === moduleId);
    if (!mod || typeof mod.widgets !== 'object' || !mod.widgets) return null;
    return mod.widgets[widgetKey] ?? null;
}

export function DashboardWidgetGrid(
    {widgets, modules, onReorder, onRemove, onToggle}: DashboardWidgetGridProps
) {
    const sorted = React.useMemo(
        () => [...widgets].sort((a, b) => a.order - b.order),
        [widgets],
    );

    const enabledIds = React.useMemo(
        () => sorted.filter(w => w.enabled).map(w => w.identifier),
        [sorted],
    );

    const sensors = useSensors(
        useSensor(MouseSensor, {activationConstraint: {distance: 5}}),
        useSensor(TouchSensor, {activationConstraint: {delay: 150, tolerance: 5}}),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    );

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        if (!over || active.id === over.id) return;
        onReorder(active.id as string, over.id as string);
    }

    const enabledCount = sorted.filter(w => w.enabled).length;
    const showAddBlocks = sorted.length > 0;
    const showStartBlock = enabledCount > 7;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
            modifiers={[]}
        >
            <SortableContext items={enabledIds} strategy={rectSortingStrategy}>
                <div
                    className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
                >
                    {showAddBlocks && showStartBlock && (
                        <AddWidgetBlock/>
                    )}
                    {sorted.map(entry => {
                        const Widget = resolveWidgetComponent(modules, entry.moduleId, entry.widgetKey);
                        if (!Widget) return null;
                        if (!entry.enabled) return null;
                        return (
                            <SortableDashboardWidget
                                key={entry.identifier}
                                entry={entry}
                                onRemove={onRemove}
                                onToggle={onToggle}
                            >
                                <Widget/>
                            </SortableDashboardWidget>
                        );
                    })}
                    {showAddBlocks && (
                        <AddWidgetBlock/>
                    )}
                </div>
            </SortableContext>
        </DndContext>
    )
}
