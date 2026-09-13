"use client"

import * as React from "react"
import {type ColumnDef} from "@tanstack/react-table"
import {Badge} from "@sentients/sdk/presentation/ui/badge"
import {OrganizationApiAccessKeyInterface} from "@sentients/sdk/domain/entities/organization.interface"
import {KeyRoundIcon, ShieldCheckIcon, ShieldAlertIcon, ClockIcon} from "lucide-react"
import {format} from "date-fns"
import {fr} from "date-fns/locale"
import {CopyButton} from "@/modules/organization/presentation/components/copy-button"

const formatDate = (date?: Date | string | null) => {
    if (!date) return 'Jamais'
    try {
        return format(new Date(date), "d MMM yyyy", {locale: fr})
    } catch {
        return '—'
    }
}

export const getOrganizationApiKeyColumns = (): ColumnDef<OrganizationApiAccessKeyInterface>[] => [
    {
        accessorKey: "public",
        header: "Clé publique",
        cell: ({row}) => (
            <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <KeyRoundIcon className="size-4 text-muted-foreground shrink-0"/>
                <span className="truncate max-w-40">{row.original.public}</span>
                <CopyButton value={row.original.public} label="Copier la clé publique"/>
            </span>
        ),
    },
    {
        id: "secret",
        header: "Secret",
        cell: ({row}) => (
            <span className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs truncate max-w-32">
                    {'•'.repeat(12)}
                </Badge>
                <CopyButton value={row.original.secret} label="Copier le secret"/>
            </span>
        ),
    },
    {
        accessorKey: "expiredAt",
        header: "Expiration",
        cell: ({row}) => (
            <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <ClockIcon className="size-3.5"/>
                {formatDate(row.original.expiredAt)}
            </span>
        ),
    },
    {
        accessorKey: "status",
        header: "Statut",
        cell: ({row}) => {
            const active = row.original.status !== false
            return (
                <Badge variant="outline" className="px-1.5">
                    {active ? (
                        <ShieldCheckIcon className="size-4 text-emerald-500 mr-1"/>
                    ) : (
                        <ShieldAlertIcon className="size-4 text-muted-foreground mr-1"/>
                    )}
                    {active ? 'Active' : 'Désactivée'}
                </Badge>
            )
        },
    },
]
