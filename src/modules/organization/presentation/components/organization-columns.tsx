"use client"

import * as React from "react"
import {type ColumnDef} from "@tanstack/react-table"
import {Badge} from "@sentients/sdk/presentation/ui/badge"
import {OrganizationInterface} from "@sentients/sdk/domain/entities/organization.interface"
import {MODULE_LABELS, ModuleEnum} from "@sentients/sdk/domain/enums/module.enum"
import {getDataGridAction} from "@sentients/sdk/presentation/data-grid/data-grid"
import {Clickable} from "@sentients/sdk/presentation/ui/clickable"
import {Building2Icon, ShieldCheckIcon, ShieldAlertIcon, LayersIcon} from "lucide-react"

export const getOrganizationColumns = (): ColumnDef<OrganizationInterface>[] => [
    {
        accessorKey: "name",
        header: "Organisation",
        cell: ({row, table}) => {
            const view = getDataGridAction(table, row.original, "view")
            return (
                <Clickable onClick={() => view?.onExecute(row.original)}>
                    <span className="flex justify-start items-center gap-2 font-semibold">
                        <span className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Building2Icon className="size-4"/>
                        </span>
                        <span className="flex flex-col">
                            <span className="leading-tight">{row.original.name}</span>
                            {row.original.description && (
                                <span className="text-xs font-normal text-muted-foreground truncate max-w-52">
                                    {row.original.description}
                                </span>
                            )}
                        </span>
                    </span>
                </Clickable>
            )
        },
    },
    {
        accessorKey: "enabledModules",
        header: "Modules",
        cell: ({row}) => {
            const modules = (row.original.enabledModules ?? []) as ModuleEnum[]
            return (
                <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                    <LayersIcon className="size-3.5"/>
                    {modules.length}
                </Badge>
            )
        },
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
                    {active ? 'Active' : 'Inactive'}
                </Badge>
            )
        },
    },
    {
        id: "modules-list",
        header: "Modules activés",
        cell: ({row}) => {
            const modules = (row.original.enabledModules ?? []) as ModuleEnum[]
            if (modules.length === 0) return <span className="text-muted-foreground">—</span>
            const labels = modules.slice(0, 3).map(m => MODULE_LABELS[m] ?? m)
            const extra = modules.length - labels.length
            return (
                <span className="text-muted-foreground text-sm">
                    {labels.join(', ')}
                    {extra > 0 ? ` +${extra}` : ''}
                </span>
            )
        },
    },
]
