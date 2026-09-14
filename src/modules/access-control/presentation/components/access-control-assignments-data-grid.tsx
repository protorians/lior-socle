"use client"

import {DataGrid} from "@sentients/sdk/presentation/data-grid/data-grid"
import {DataGridSearchEngine} from "@sentients/sdk/presentation/data-grid/data-grid-search-engine"
import {useQuery} from "@tanstack/react-query"
import {useMemo, useState} from "react"
import {OrganizationsApiService} from "@sentients/sdk/application/service/organizations-api-service"
import {OrganizationMemberInterface} from "@sentients/sdk/domain/entities/organization.interface"
import {MediaStorageInterface} from "@sentients/sdk/domain/entities/media"
import {UserInterface} from "@sentients/sdk/domain/entities/user.interface"
import {UsersApiService} from "@/modules/identity/application/service/users-api-service"
import {accessAssignmentsColumns} from "@/modules/access-control/presentation/components/access-control-assignments-columns"

export interface AccessAssignmentUser {
    id?: string
    username?: string
    email?: string
    avatar?: MediaStorageInterface | null
    userData?: {
        firstname?: string
        lastname?: string
    }
}

export interface AccessAssignmentRow {
    id: string
    userId: string
    isFounder: boolean
    status?: boolean
    user?: AccessAssignmentUser
}

interface AccessAssignmentsDataGridProps {
    organizationId?: string
}

function displayName(row: AccessAssignmentRow): string {
    const user = row.user
    if (!user) return 'Utilisateur inconnu'
    const firstname = user.userData?.firstname ?? ''
    const lastname = user.userData?.lastname ?? ''
    return `${firstname} ${lastname}`.trim() || user.username || user.email || 'Utilisateur inconnu'
}

export function AccessAssignmentsDataGrid({organizationId}: AccessAssignmentsDataGridProps) {
    const [search, setSearch] = useState("")

    const {data: members = []} = useQuery<OrganizationMemberInterface[]>({
        queryKey: ['access-control', organizationId, 'assignments'],
        enabled: !!organizationId,
        queryFn: async () => {
            const response = await OrganizationsApiService.getMembers(organizationId as string)
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : (raw?.data ?? [])
        },
    })

    const {data: users = []} = useQuery<UserInterface[]>({
        queryKey: ['users', 'all', 'light'],
        queryFn: async () => {
            const response = await UsersApiService.getAll({limit: 200})
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : []
        },
        staleTime: 60_000,
    })

    const userMap = useMemo(() => {
        const map = new Map<string, AccessAssignmentUser>()
        for (const user of users) {
            if (user.id) map.set(user.id, user)
        }
        return map
    }, [users])

    const allRows: AccessAssignmentRow[] = useMemo(() => {
        return (members ?? []).map(member => ({
            id: member.id,
            userId: member.userId,
            isFounder: member.isFounder,
            status: member.status,
            user: member.user || (member.userId ? userMap.get(member.userId) : undefined),
        }))
    }, [members, userMap])

    const rows = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return allRows
        return allRows.filter(row => {
            const name = displayName(row).toLowerCase()
            const email = (row.user?.email ?? '').toLowerCase()
            const role = row.isFounder ? 'fondateur' : 'membre'
            return name.includes(query) || email.includes(query) || role.includes(query)
        })
    }, [allRows, search])

    return (
        <DataGrid
            data={rows}
            columns={accessAssignmentsColumns}
            getRowId={(row) => row.id}
            enableSelection
            enableColumnVisibility
            toolbar={(table) => (
                <DataGridSearchEngine table={table} value={search} onChange={setSearch}/>
            )}
        />
    )
}
