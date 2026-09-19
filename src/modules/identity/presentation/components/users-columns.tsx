"use client"

import * as React from "react"
import {type ColumnDef} from "@tanstack/react-table"
import {
    ShieldAlertIcon, ShieldCheckIcon, UsersIcon,
} from "lucide-react"

import {Badge} from "@liorian/sdk/presentation/ui/badge";
import {UserInterface} from "@liorian/sdk/domain/entities/user.interface";
import {getFullName} from "@/modules/identity/infrastructure/utilities/users-name.util";
import {UserStatusEnum} from "@liorian/sdk/domain/enums/user-status.enum";
import {Fragment} from "react";
import {getDataGridAction} from "@liorian/sdk/presentation/data-grid/data-grid";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {Clickable} from "@liorian/sdk/presentation/ui/clickable";

export const getUsersColumns = (): ColumnDef<UserInterface>[] => [
    {
        accessorKey: "Nom d'utilisateur",
        header: "Nom d'utilisateur",
        cell: ({row, table}) => {
            const details = getDataGridAction(table, row.original, "details")
            return (
                <Clickable onClick={() => details?.onExecute(row.original)}>
                    <span className="font-semibold">{row.original.username}</span>
                </Clickable>
            )
        },
    },
    {
        accessorKey: "Rôles",
        header: "Roles",
        cell: ({row}) => (
            <Badge variant="outline" className="px-1.5 text-muted-foreground">
                {row.original.roles?.map(role => role.name).join(", ")}
            </Badge>
        ),
    },
    {
        accessorKey: "Nom complet",
        header: "Nom complet",
        cell: ({row}) => (
            <div className="flex items-center gap-2">
                <UsersIcon className="size-4 text-muted-foreground"/>
                {getFullName(row.original)}
            </div>
        ),
    },
    {
        accessorKey: "Statut",
        header: "Statut",
        cell: ({row}) => (
            <Badge variant="outline" className="px-1.5 text-muted-foreground">
                {row.original.status === UserStatusEnum.ACTIVE ? (
                    <ShieldCheckIcon className="size-4 text-emerald-500 mr-1"/>
                ) : row.original.status === UserStatusEnum.INACTIVE ? (
                    <ShieldAlertIcon className="size-4 text-rose-500 mr-1"/>
                ) : row.original.status === UserStatusEnum.BANNED ? (
                    <ShieldAlertIcon className="size-4 text-rose-500 mr-1"/>
                ) : row.original.status === UserStatusEnum.SUSPENDED ? (
                    <ShieldAlertIcon className="size-4 text-rose-500 mr-1"/>
                ) : row.original.status}
                {row.original.status}
            </Badge>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({row}) => (
            <div className="max-w-75 truncate text-muted-foreground">
                {row.original.email}
            </div>
        ),
    },
];
