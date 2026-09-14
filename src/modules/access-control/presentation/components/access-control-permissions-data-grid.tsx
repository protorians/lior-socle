"use client"

import {DataGrid} from "@sentients/sdk/presentation/data-grid/data-grid"
import {DataGridSearchEngine} from "@sentients/sdk/presentation/data-grid/data-grid-search-engine"
import {useQuery} from "@tanstack/react-query"
import {useMemo, useState} from "react"
import {
    accessPermissionsColumns,
    type AccessPermissionRow,
} from "@/modules/access-control/presentation/components/access-control-permissions-columns"
import {AccessControlApiService} from "@/modules/access-control/application/service/access-control-api.service"
import {PermissionsCapabilitiesInterface} from "@/modules/access-control/domain/entities/roles.interface"

interface DefaultRoleInfo {
    name: string
    metadata?: { name?: string; color?: string; description?: string; level?: number }
    permissions?: PermissionsCapabilitiesInterface
}

export function AccessPermissionsDataGrid() {
    const [search, setSearch] = useState("")

    const {data: defaults = []} = useQuery<DefaultRoleInfo[]>({
        queryKey: ['access-control', 'defaults', 'permissions'],
        queryFn: async () => {
            const response = await AccessControlApiService.getDefaultsInfo()
            const data = Array.isArray(response.data) ? response.data : response.data?.data
            return Array.isArray(data) ? data : []
        },
    })

    const allRows: AccessPermissionRow[] = useMemo(() => {
        const list: AccessPermissionRow[] = []
        for (const role of defaults) {
            const roleName = role.name ?? role.metadata?.name ?? 'Rôle'
            const permissions = role.permissions ?? {}
            for (const [domain, cap] of Object.entries(permissions)) {
                if (!cap) continue
                list.push({
                    id: `${roleName}-${domain}`,
                    roleName,
                    domain,
                    create: !!cap.create,
                    read: !!cap.read,
                    update: !!cap.update,
                    delete: !!cap.delete,
                })
            }
        }
        return list
    }, [defaults])

    const rows = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return allRows
        return allRows.filter(row =>
            (row.roleName ?? '').toLowerCase().includes(query) ||
            (row.domain ?? '').toLowerCase().includes(query)
        )
    }, [allRows, search])

    return (
        <DataGrid
            data={rows}
            columns={accessPermissionsColumns}
            getRowId={(row) => row.id}
            enableSelection
            enableColumnVisibility
            initialPageSize={20}
            toolbar={(table) => (
                <DataGridSearchEngine table={table} value={search} onChange={setSearch}/>
            )}
        />
    )
}
