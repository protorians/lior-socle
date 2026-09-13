"use client"

import {type ColumnDef} from "@tanstack/react-table"
import {ShieldCheckIcon} from "lucide-react"

import {Badge} from "@sentients/sdk/presentation/ui/badge"
import {PermissionsCapabilitiesInterface} from "@/modules/access-control/domain/entities/roles.interface"
import {getRoleLabel} from "@sentients/sdk/infrastructure/utilities/access-label.util"

export interface AccessControlRow {
    id: string
    name: string
    color?: string
    description?: string
    level?: number
    permissions?: PermissionsCapabilitiesInterface
    permissionCount?: {
        create: number
        read: number
        update: number
        delete: number
    }
    disabled?: boolean
}

const formatLevel = (level?: number) =>
    (level ?? 0).toFixed(2)

export const accessControlColumns: ColumnDef<AccessControlRow>[] = [
    {
        accessorKey: "name",
        header: "Nom du Rôle",
        cell: ({row}) => (
            <div className="flex items-center gap-2 font-medium">
                <span
                    className="size-2.5 rounded-full"
                    style={{backgroundColor: row.original.color ?? 'transparent'}}
                />
                {getRoleLabel(row.original.name)}
            </div>
        ),
        enableHiding: false,
    },
    {
        accessorKey: "level",
        header: "Niveau",
        cell: ({row}) => (
            <Badge variant="outline" className="px-1.5 text-muted-foreground tabular-nums">
                {formatLevel(row.original.level)}
            </Badge>
        ),
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({row}) => (
            <div className="max-w-[260px] truncate text-muted-foreground">
                {row.original.description}
            </div>
        ),
    },
    {
        id: "permissions",
        header: "Permissions",
        cell: ({row}) => {
            const count = row.original.permissionCount
            if (!count) return <span className="text-muted-foreground">—</span>
            return (
                <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="px-1.5 tabular-nums">C {count.create}</Badge>
                    <Badge variant="outline" className="px-1.5 tabular-nums">L {count.read}</Badge>
                    <Badge variant="outline" className="px-1.5 tabular-nums">M {count.update}</Badge>
                    <Badge variant="outline" className="px-1.5 tabular-nums text-rose-500">S {count.delete}</Badge>
                </div>
            )
        },
    },
    {
        id: "type",
        header: "Type",
        cell: () => (
            <ShieldCheckIcon className="size-4 text-emerald-500"/>
        ),
    },
    {
        id: "statut",
        header: "Statut",
        cell: ({row}) => row.original.disabled
            ? <Badge variant="outline" className="px-1.5 text-muted-foreground">Inactif</Badge>
            : <Badge variant="outline" className="px-1.5 text-emerald-600">Actif</Badge>,
    },
]
