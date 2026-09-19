"use client"

import * as React from "react"
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {GripVerticalIcon, XIcon, EyeOffIcon, EyeIcon} from "lucide-react";
import {cn} from "@liorian/sdk/infrastructure/utilities/utils";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {Tooltip, TooltipContent, TooltipTrigger} from "@liorian/sdk/presentation/ui/tooltip";
import {DashboardWidgetEntry} from "@/modules/dashboard/domain/dashboard-layout.interface";

interface SortableDashboardWidgetProps {
    entry: DashboardWidgetEntry
    children: React.ReactNode
    onRemove: (id: string) => void
    onToggle: (id: string) => void
}

export function SortableDashboardWidget(
    {entry, children, onRemove, onToggle}: SortableDashboardWidgetProps
) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({id: entry.identifier});

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.8 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group/widget relative min-h-[40dvh] rounded-xl transition-shadow",
                isDragging && "shadow-xl ring-2 ring-primary/20",
                !entry.enabled && "opacity-50 grayscale",
            )}
        >
            <div
                className={cn(
                    "absolute top-2 left-2 z-10 flex items-center gap-1 rounded-lg bg-background/80 p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover/widget:opacity-100",
                    isDragging && "opacity-100",
                )}
            >
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                            {...attributes}
                            {...listeners}
                        >
                            <GripVerticalIcon className="size-3.5"/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Déplacer</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className={cn(
                                "text-muted-foreground hover:text-foreground",
                                !entry.enabled && "text-muted-foreground/50",
                            )}
                            onClick={() => onToggle(entry.identifier)}
                        >
                            {entry.enabled
                                ? <EyeIcon className="size-3.5"/>
                                : <EyeOffIcon className="size-3.5"/>
                            }
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        {entry.enabled ? 'Masquer' : 'Afficher'}
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => onRemove(entry.identifier)}
                        >
                            <XIcon className="size-3.5"/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Supprimer</TooltipContent>
                </Tooltip>
            </div>

            {children}
        </div>
    )
}
