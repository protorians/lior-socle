"use client"

import {DataGrid, RowAction} from "@liorian/sdk/presentation/data-grid/data-grid"
import {useQuery, useQueryClient} from "@tanstack/react-query"
import {OrganizationsApiService} from "@liorian/sdk/application/service/organizations-api-service"
import {OrganizationMemberInterface} from "@liorian/sdk/domain/entities/organization.interface"
import {AppConfig} from "@liorian/sdk/domain/config/app.config"
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@liorian/sdk/presentation/ui/empty"
import {TrashIcon, UsersIcon} from "lucide-react"
import {Button} from "@liorian/sdk/presentation/ui/button"
import {useRouter} from "next/navigation"
import {Fragment, useEffect, useMemo, useState} from "react"
import {DataGridSearchEngine} from "@liorian/sdk/presentation/data-grid/data-grid-search-engine"
import {Table} from "@tanstack/react-table"
import {Activity} from "@liorian/sdk/presentation/components/activity"
import {Waiting} from "@liorian/sdk/presentation/components/waiting"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@liorian/sdk/presentation/ui/alert-dialog"
import {toast} from "sonner"
import {useMutation} from "@tanstack/react-query"
import {UsersApiService} from "@/modules/identity/application/service/users-api-service"
import {UserInterface} from "@liorian/sdk/domain/entities/user.interface"
import {getFullName} from "@/modules/identity/infrastructure/utilities/users-name.util"
import {getOrganizationMemberColumns} from "@/modules/organization/presentation/components/organization-members-columns"
import {AddMemberStepper} from "@/modules/organization/presentation/components/add-member-stepper"

export interface OrganizationMemberRow {
    member: OrganizationMemberInterface
    user?: UserInterface
}

function displayName(user?: UserInterface): string {
    if (!user) return 'Utilisateur inconnu';
    const full = getFullName(user);
    return full !== 'N/A' ? full : user.username || user.email || 'Utilisateur';
}

export function OrganizationMembersDataGrid({organizationId}: { organizationId: string }) {
    const [mounted, setMounted] = useState<boolean>(false)
    const [search, setSearch] = useState<string>('')
    const [removing, setRemoving] = useState<OrganizationMemberRow | null>(null)

    const queryClient = useQueryClient()
    const router = useRouter()

    const {data: members, isLoading} = useQuery<OrganizationMemberInterface[]>({
        queryKey: ['organizations', organizationId, 'members'],
        enabled: !!organizationId,
        queryFn: async () => {
            const response = await OrganizationsApiService.getMembers(organizationId)
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : (raw?.data ?? [])
        },
        refetchInterval: AppConfig.APP_REFRESH_UI,
    })

    const {data: users} = useQuery<UserInterface[]>({
        queryKey: ['users', 'all', 'light'],
        queryFn: async () => {
            const response = await UsersApiService.getAll({limit: 200})
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : []
        },
        staleTime: 60_000,
    })

    const userMap = useMemo(() => {
        const map = new Map<string, UserInterface>()
        for (const user of users ?? []) {
            if (user.id) map.set(user.id, user)
        }
        return map
    }, [users])

    const rows: OrganizationMemberRow[] = useMemo(() => {
        return (members ?? []).map(member => ({
            member,
            user: member.userId ? userMap.get(member.userId) : undefined,
        }))
    }, [members, userMap])

    const removeMutation = useMutation({
        mutationFn: (row: OrganizationMemberRow) => OrganizationsApiService.removeMember(organizationId, row.member.userId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['organizations', organizationId, 'members']})
            toast.success('Membre retiré')
            setRemoving(null)
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Erreur lors du retrait du membre')
        },
    })

    const handleRemove = async () => {
        if (!removing) return
        await removeMutation.mutateAsync(removing)
    }

    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return rows
        return rows.filter(r =>
            displayName(r.user).toLowerCase().includes(query) ||
            (r.user?.email || '').toLowerCase().includes(query)
        )
    }, [rows, search])

    const toolbar = (table: Table<OrganizationMemberRow>) => (
        <Fragment>
            <DataGridSearchEngine table={table} value={search} onChange={setSearch}/>
            {isLoading && (
                <div className="flex-auto flex items-center justify-center">
                    <Activity.Loader size={16}/>
                </div>
            )}
        </Fragment>
    )

    const rowActions = (row: OrganizationMemberRow): RowAction<OrganizationMemberRow>[] => [
        {
            id: 'remove',
            label: 'Retirer',
            icon: <TrashIcon className="size-4"/>,
            variant: 'destructive',
            onExecute: (r) => setRemoving(r),
        },
    ]

    useEffect(() => {
        if (!mounted) setMounted(true)
    }, [])

    return (
        <div className="flex-auto flex flex-col gap-4">
            <div className="flex items-center justify-end">
                <AddMemberStepper organizationId={organizationId} users={users ?? []}/>
            </div>
            {(rows.length > 0 || mounted) ? (
                <Fragment>
                    <DataGrid
                        data={filteredRows}
                        columns={getOrganizationMemberColumns()}
                        getRowId={row => row.member.id}
                        enableSelection
                        actions={rowActions}
                        toolbar={(table) => toolbar(table)}
                    />

                    <AlertDialog open={!!removing} onOpenChange={(open) => !open && setRemoving(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Retirer le membre</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Voulez-vous vraiment retirer « {removing ? displayName(removing.user) : ''} » de l’organisation ?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    onClick={handleRemove}
                                    disabled={removeMutation.isPending}
                                >
                                    {removeMutation.isPending ? 'Retrait...' : 'Retirer'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </Fragment>
            ) : (
                <div className="flex-auto flex flex-col items-center justify-center min-h-[40dvh]">
                    <Empty>
                        <EmptyMedia>
                            <UsersIcon size={80} strokeWidth={1}/>
                        </EmptyMedia>
                        <EmptyTitle>Membres</EmptyTitle>
                        <EmptyDescription>Les membres de l’organisation s’afficheront ici</EmptyDescription>
                        {isLoading && (
                            <EmptyDescription>
                                <Waiting label={'Chargement...'}/>
                            </EmptyDescription>
                        )}
                        <EmptyContent>
                            <Button onClick={router.refresh} variant="outline">
                                Actualiser
                            </Button>
                        </EmptyContent>
                    </Empty>
                </div>
            )}
        </div>
    )
}
