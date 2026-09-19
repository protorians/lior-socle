"use client"

import * as React from "react"
import {ModuleDeclarationInterface} from "@liorian/sdk/domain/entities/module.interface";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger} from "@liorian/sdk/presentation/ui/sheet";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {Badge} from "@liorian/sdk/presentation/ui/badge";
import {Input} from "@liorian/sdk/presentation/ui/input";
import {LucideIcon} from "@liorian/sdk/presentation/icons/lucide";
import {PlusIcon, SearchIcon, CheckIcon, LayoutDashboardIcon, EyeIcon} from "lucide-react";
import {useDashboardLayoutStore} from "@/modules/dashboard/infrastructure/dashboard-layout.store";

interface DashboardAddWidgetPanelProps {
    modules: ModuleDeclarationInterface[]
    userId: string
}

interface AvailableWidget {
    moduleId: string
    moduleName: string
    moduleIcon: string
    widgetKey: string
    WidgetComponent: React.ComponentType<any>
}

function collectAvailableWidgets(modules: ModuleDeclarationInterface[]): AvailableWidget[] {
    const items: AvailableWidget[] = [];
    for (const mod of modules) {
        if (!mod.isEnabled || typeof mod.widgets !== 'object' || !mod.widgets) continue;
        for (const [key, WidgetComponent] of Object.entries(mod.widgets)) {
            items.push({
                moduleId: mod.identifier,
                moduleName: mod.name,
                moduleIcon: mod.icon,
                widgetKey: key,
                WidgetComponent,
            });
        }
    }
    return items;
}

function WidgetPreview({WidgetComponent}: { WidgetComponent: React.ComponentType<any> }) {
    return (
        <div className="relative h-32 overflow-hidden rounded-lg border bg-background/50">
            <div
                className="pointer-events-none origin-top-left"
                style={{
                    width: '285%',
                    height: '60vh',
                    transform: 'scale(0.35)',
                }}
            >
                <div className="w-[360px] min-h-[40dvh] p-2">
                    <WidgetComponent/>
                </div>
            </div>
        </div>
    )
}

export function DashboardAddWidgetPanel({modules, userId}: DashboardAddWidgetPanelProps) {
    const [search, setSearch] = React.useState('');
    const {widgets, isHiddenWidget, addWidget, hasWidget, isAddPanelOpen, closeAddPanel, toggleWidget} = useDashboardLayoutStore();

    const available = React.useMemo(() => collectAvailableWidgets(modules), [modules]);

    const filtered = React.useMemo(() => {
        if (!search.trim()) return available;
        const q = search.toLowerCase();
        return available.filter(w =>
            w.moduleName.toLowerCase().includes(q) ||
            w.widgetKey.toLowerCase().includes(q) ||
            w.moduleId.toLowerCase().includes(q)
        );
    }, [available, search]);

    const grouped = React.useMemo(() => {
        const map = new Map<string, AvailableWidget[]>();
        for (const w of filtered) {
            const existing = map.get(w.moduleId);
            if (existing) {
                existing.push(w);
            } else {
                map.set(w.moduleId, [w]);
            }
        }
        return map;
    }, [filtered]);

    function handleAdd(moduleId: string, widgetKey: string) {
        addWidget(moduleId, widgetKey, userId);
    }

    function handleShow(moduleId: string, widgetKey: string) {
        const entry = widgets.find(w => w.moduleId === moduleId && w.widgetKey === widgetKey);
        if (entry) toggleWidget(entry.identifier, userId);
    }

    return (
        <Sheet open={isAddPanelOpen} onOpenChange={(open) => { if (!open) closeAddPanel(); }}>
            <SheetTrigger asChild>
                <Button variant="default" size="sm" onClick={(e) => { e.preventDefault(); useDashboardLayoutStore.getState().openAddPanel(); }}>
                    <PlusIcon className="size-4"/>
                    Ajouter un widget
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <LayoutDashboardIcon className="size-4"/>
                        Widgets disponibles
                    </SheetTitle>
                    <SheetDescription>
                        Choisissez les widgets à afficher sur votre tableau de bord
                    </SheetDescription>
                    <div className="relative mt-2">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                        <Input
                            placeholder="Rechercher un widget..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {Array.from(grouped.entries()).map(([moduleId, moduleWidgets]) => {
                        const first = moduleWidgets[0];
                        return (
                            <div key={moduleId} className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <LucideIcon
                                        name={first.moduleIcon}
                                        size={4}
                                        className="text-muted-foreground"
                                    />
                                    <span className="text-sm font-medium text-foreground">
                                        {first.moduleName}
                                    </span>
                                    <Badge variant="secondary" className="ml-auto text-[10px]">
                                        {moduleWidgets.length}
                                    </Badge>
                                </div>

                                <div className="space-y-3">
                                    {moduleWidgets.map(w => {
                                        const alreadyAdded = hasWidget(w.moduleId, w.widgetKey);
                                        const hidden = isHiddenWidget(w.moduleId, w.widgetKey);
                                        return (
                                            <div
                                                key={`${w.moduleId}:${w.widgetKey}`}
                                                className="space-y-2"
                                            >
                                                <WidgetPreview WidgetComponent={w.WidgetComponent}/>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground capitalize">
                                                        {w.widgetKey}
                                                    </span>
                                                    {hidden ? (
                                                        <Button
                                                            variant="outline"
                                                            size="xs"
                                                            onClick={() => handleShow(w.moduleId, w.widgetKey)}
                                                        >
                                                            <EyeIcon className="size-3"/>
                                                            Afficher
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant={alreadyAdded ? "secondary" : "default"}
                                                            size="xs"
                                                            disabled={alreadyAdded}
                                                            onClick={() => handleAdd(w.moduleId, w.widgetKey)}
                                                        >
                                                            {alreadyAdded ? (
                                                                <>
                                                                    <CheckIcon className="size-3"/>
                                                                    Ajouté
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <PlusIcon className="size-3"/>
                                                                    Ajouter
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {grouped.size === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <SearchIcon className="size-8 mb-2 opacity-50"/>
                            <span className="text-sm">Aucun widget trouvé</span>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
