"use client"

import {type ColumnDef} from "@tanstack/react-table";
import {Badge} from "@sentients/sdk/presentation/ui/badge";
import {SmileIcon, UserIcon} from "lucide-react";
import {HelloWorldInterface} from "../../domain/hello-world.interface";
import {HelloWorldStatus} from "../../domain/enums/hello-world-status.enum";

const STATUS_LABELS: Record<HelloWorldStatus, string> = {
    [HelloWorldStatus.DRAFT]: 'Brouillon',
    [HelloWorldStatus.PUBLISHED]: 'Publié',
    [HelloWorldStatus.ARCHIVED]: 'Archivé',
};

export const getHelloWorldColumns = (): ColumnDef<HelloWorldInterface>[] => [
    {
        accessorKey: "title",
        header: "Salutation",
        cell: ({row}) => {
            const item = row.original;
            return (
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                        <SmileIcon className="size-4"/>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate">{item.title}</span>
                        {item.author && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <UserIcon className="size-3"/>
                                {item.author}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "message",
        header: "Message",
        cell: ({row}) => (
            <span className="text-sm text-muted-foreground line-clamp-1 max-w-[32rem]">
                {row.original.message || "—"}
            </span>
        ),
    },
    {
        accessorKey: "status",
        header: "Statut",
        cell: ({row}) => {
            const status = row.original.status;
            return (
                <Badge
                    variant={status === HelloWorldStatus.PUBLISHED ? "default" : "outline"}
                    className={status === HelloWorldStatus.PUBLISHED
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : status === HelloWorldStatus.ARCHIVED
                            ? "text-muted-foreground"
                            : "text-amber-600 border-amber-500/20"}
                >
                    {STATUS_LABELS[status] ?? status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Création",
        cell: ({row}) => {
            const date = row.original.createdAt;
            return (
                <span className="text-sm text-muted-foreground">
                    {date ? new Date(date).toLocaleDateString('fr-FR') : "—"}
                </span>
            )
        },
    },
];