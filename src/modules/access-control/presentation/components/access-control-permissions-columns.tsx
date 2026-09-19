"use client"

import {type ColumnDef} from "@tanstack/react-table"
import {Badge} from "@liorian/sdk/presentation/ui/badge"
import {PermissionCapabilityInterface} from "@/modules/access-control/domain/entities/roles.interface"
import {getDomainLabel, getRoleLabel} from "@liorian/sdk/infrastructure/utilities/access-label.util"

export interface AccessPermissionRow {
    id: string
    roleName: string
    domain: string
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
}

function capabilityOf(row: AccessPermissionRow): PermissionCapabilityInterface {
    return {create: row.create, read: row.read, update: row.update, delete: row.delete}
}

export const accessPermissionsColumns: ColumnDef<AccessPermissionRow>[] = [
    {
        accessorKey: "roleName",
        header: "Rôle",
        cell: ({row}) => (
            <span className="font-medium">{getRoleLabel(row.original.roleName)}</span>
        ),
    },
    {
        accessorKey: "domain",
        header: "Domaine",
        cell: ({row}) => (
            <Badge variant="outline" className="px-1.5 text-muted-foreground">
                {getDomainLabel(row.original.domain)}
            </Badge>
        ),
    },
    {
        id: "create",
        header: "Créer",
        cell: ({row}) => badgeCapability(row.original.create),
    },
    {
        id: "read",
        header: "Lire",
        cell: ({row}) => badgeCapability(row.original.read),
    },
    {
        id: "update",
        header: "Modifier",
        cell: ({row}) => badgeCapability(row.original.update),
    },
    {
        id: "delete",
        header: "Supprimer",
        cell: ({row}) => badgeCapability(row.original.delete),
    },
    {
        id: "access",
        header: "Accès",
        cell: ({row}) => {
            const cap = capabilityOf(row.original)
            const full = cap.create && cap.read && cap.update && cap.delete
            const none = !cap.create && !cap.read && !cap.update && !cap.delete
            return (
                <Badge
                    variant="outline"
                    className={
                        full
                            ? "px-1.5 text-emerald-500"
                            : none
                                ? "px-1.5 text-muted-foreground"
                                : "px-1.5 text-amber-500"
                    }
                >
                    {full ? 'Complet' : none ? 'Aucun' : 'Partiel'}
                </Badge>
            )
        },
    },
]

function badgeCapability(value: boolean) {
    return (
        <Badge variant="outline" className={value ? "px-1.5 text-emerald-500" : "px-1.5 text-rose-500"}>
            {value ? 'Oui' : 'Non'}
        </Badge>
    )
}
