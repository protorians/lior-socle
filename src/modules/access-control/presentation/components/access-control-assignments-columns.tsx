"use client"

import {type ColumnDef} from "@tanstack/react-table"
import {Badge} from "@liorian/sdk/presentation/ui/badge"
import {Avatar, AvatarFallback, AvatarImage} from "@liorian/sdk/presentation/ui/avatar"
import {CrownIcon, UserIcon} from "lucide-react"
import {AccessAssignmentRow} from "@/modules/access-control/presentation/components/access-control-assignments-data-grid"

function initials(name: string): string {
    return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase()
}

export const accessAssignmentsColumns: ColumnDef<AccessAssignmentRow>[] = [
    {
        id: "user",
        header: "Utilisateur",
        cell: ({row}) => {
            const {name, email, avatar} = displayName(row.original)
            return (
                <span className="flex items-center gap-2">
                    <Avatar className="size-8">
                        <AvatarImage src={avatar ?? undefined} alt={name}/>
                        <AvatarFallback className="text-xs">
                            {name ? initials(name) : <UserIcon className="size-3.5"/>}
                        </AvatarFallback>
                    </Avatar>
                    <span className="flex flex-col">
                        <span className="font-medium leading-tight">{name}</span>
                        {email && <span className="text-xs text-muted-foreground">{email}</span>}
                    </span>
                </span>
            )
        },
    },
    {
        id: "role",
        header: "Rôle",
        cell: ({row}) => (
            <Badge variant="outline" className="gap-1.5 px-2">
                {row.original.isFounder ? (
                    <CrownIcon className="size-3.5 text-amber-500"/>
                ) : (
                    <UserIcon className="size-3.5 text-muted-foreground"/>
                )}
                {row.original.isFounder ? 'Fondateur' : 'Membre'}
            </Badge>
        ),
    },
    {
        accessorKey: "status",
        header: "Statut",
        cell: ({row}) => (
            <Badge variant="outline" className="px-1.5 text-muted-foreground">
                {row.original.status === false ? 'Inactif' : 'Actif'}
            </Badge>
        ),
    },
]

interface DisplayInfos {
    name: string
    email?: string
    avatar?: string | null
}

function displayName(row: AccessAssignmentRow): DisplayInfos {
    const user = row.user
    if (!user) return {name: 'Utilisateur inconnu'}
    const firstname = user.userData?.firstname ?? ''
    const lastname = user.userData?.lastname ?? ''
    const name = `${firstname} ${lastname}`.trim() || user.username || user.email || 'Utilisateur inconnu'
    return {
        name,
        email: user.email,
        avatar: user.avatar?.label ?? null,
    }
}
