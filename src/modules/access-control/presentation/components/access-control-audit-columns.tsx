"use client"

import {type ColumnDef} from "@tanstack/react-table"
import {Badge} from "@sentients/sdk/presentation/ui/badge"
import {AccessAuditRow} from "@/modules/access-control/presentation/components/access-control-audit-data-grid"

export const accessAuditColumns: ColumnDef<AccessAuditRow>[] = [
    {
        id: "user",
        header: "Utilisateur",
        cell: ({row}) => (
            <span className="font-medium">{row.original.userName}</span>
        ),
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({row}) => (
            <span className="text-muted-foreground">{row.original.action}</span>
        ),
    },
    {
        accessorKey: "module",
        header: "Module",
        cell: ({row}) => (
            <Badge variant="outline" className="px-1.5 text-muted-foreground">
                {row.original.module}
            </Badge>
        ),
    },
    {
        id: "description",
        header: "Détail",
        cell: ({row}) => {
            const text = row.original.description || row.original.describe || row.original.details?.label
            return (
                <div className="max-w-[320px] truncate text-muted-foreground">
                    {typeof text === 'string' ? text : ''}
                </div>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Horodatage",
        cell: ({row}) => (
            <span className="text-muted-foreground text-sm">
                {formatTimestamp(row.original.createdAt)}
            </span>
        ),
    },
]

function formatTimestamp(value?: string): string {
    if (!value) return '—'
    const date = new Date(value)
    if (isNaN(date.getTime())) return value
    return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}
