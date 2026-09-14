"use client"

import {DataGrid} from "@sentients/sdk/presentation/data-grid/data-grid"
import {DataGridSearchEngine} from "@sentients/sdk/presentation/data-grid/data-grid-search-engine"
import {useQuery} from "@tanstack/react-query"
import {useMemo, useState} from "react"
import {ActivityInterface} from "@sentients/sdk/domain/entities/activities.interface"
import {UserActivitiesApiService} from "@/modules/user-activity/application/service/user-activities-api-service"
import {accessAuditColumns} from "@/modules/access-control/presentation/components/access-control-audit-columns"

export interface AccessAuditRow {
    id: string
    action: string
    module: string
    description?: string
    describe?: string
    details?: Record<string, any>
    userName: string
    organizationId?: string
    createdAt?: string
}

interface AccessAuditDataGridProps {
    organizationId?: string
}

export function AccessAuditDataGrid({organizationId}: AccessAuditDataGridProps) {
    const [search, setSearch] = useState("")

    const {data: activities = []} = useQuery<ActivityInterface[]>({
        queryKey: ['access-control', organizationId, 'audit'],
        queryFn: async () => {
            const response = await UserActivitiesApiService.getAll({limit: 100})
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : []
        },
    })

    const allRows: AccessAuditRow[] = useMemo(() => {
        return (activities ?? []).map((activity, index) => {
            const user = activity.user
            const full = user
                ? `${user.userData?.firstname ?? ''} ${user.userData?.lastname ?? ''}`.trim()
                : ''
            return {
                id: activity.id || `audit-${index}`,
                action: activity.action,
                module: activity.module,
                description: activity.description,
                describe: activity.describe,
                details: activity.details,
                userName: full || user?.username || user?.email || activity.userId || 'Inconnu',
                organizationId: activity.organizationId,
                createdAt: activity.createdAt,
            }
        })
    }, [activities])

    const rows = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return allRows
        return allRows.filter(row =>
            (row.userName ?? '').toLowerCase().includes(query) ||
            (row.action ?? '').toLowerCase().includes(query) ||
            (row.module ?? '').toLowerCase().includes(query) ||
            (row.description ?? row.describe ?? '').toLowerCase().includes(query)
        )
    }, [allRows, search])

    return (
        <DataGrid
            data={rows}
            columns={accessAuditColumns}
            getRowId={(row) => row.id}
            enableSelection
            enableColumnVisibility
            enablePagination
            toolbar={(table) => (
                <DataGridSearchEngine table={table} value={search} onChange={setSearch}/>
            )}
        />
    )
}
