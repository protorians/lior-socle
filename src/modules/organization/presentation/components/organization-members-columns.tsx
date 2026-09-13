"use client"

import {type ColumnDef} from "@tanstack/react-table"
import {Badge} from "@sentients/sdk/presentation/ui/badge"
import {Avatar, AvatarFallback, AvatarImage} from "@sentients/sdk/presentation/ui/avatar"
import {OrganizationMemberRow} from "@/modules/organization/presentation/components/organization-members-data-grid"
import {getFullName} from "@/modules/identity/infrastructure/utilities/users-name.util"
import {CrownIcon, UserIcon} from "lucide-react"

function initials(name: string): string {
    return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase()
}

export const getOrganizationMemberColumns = (): ColumnDef<OrganizationMemberRow>[] => [
    {
        id: "member",
        header: "Membre",
        cell: ({row}) => {
            const user = row.original.user
            const full = user ? getFullName(user) : ''
            const name = user
                ? (full !== 'N/A' ? full : user.username || user.email || 'Utilisateur inconnu')
                : 'Utilisateur inconnu'
            return (
                <span className="flex items-center gap-2">
                    <Avatar className="size-8">
                        <AvatarImage src={user?.avatar?.label ?? undefined} alt={name}/>
                        <AvatarFallback className="text-xs">
                            {user ? initials(name) : <UserIcon className="size-3.5"/>}
                        </AvatarFallback>
                    </Avatar>
                    <span className="flex flex-col">
                        <span className="font-semibold leading-tight">{name}</span>
                        {user?.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
                    </span>
                </span>
            )
        },
    },
    {
        id: "role",
        header: "Rôle",
        cell: ({row}) => {
            const isFounder = row.original.member.isFounder
            return (
                <Badge variant="outline" className="gap-1.5 px-2">
                    {isFounder ? (
                        <CrownIcon className="size-3.5 text-amber-500"/>
                    ) : (
                        <UserIcon className="size-3.5 text-muted-foreground"/>
                    )}
                    {isFounder ? 'Fondateur' : 'Membre'}
                </Badge>
            )
        },
    },
]
