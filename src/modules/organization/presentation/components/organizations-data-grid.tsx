"use client"

import {DataGrid, RowAction} from "@liorian/sdk/presentation/data-grid/data-grid"
import {getOrganizationColumns} from "@/modules/organization/presentation/components/organization-columns"
import {useQuery, useQueryClient} from "@tanstack/react-query"
import {OrganizationsApiService} from "@liorian/sdk/application/service/organizations-api-service"
import {OrganizationInterface} from "@liorian/sdk/domain/entities/organization.interface"
import {AppConfig} from "@liorian/sdk/domain/config/app.config"
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@liorian/sdk/presentation/ui/empty"
import {Building2Icon, EyeIcon, PencilIcon, TrashIcon} from "lucide-react"
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
import {useAuth} from "@liorian/sdk/infrastructure/hooks/use-auth"
import {toast} from "sonner"
import {useMutation} from "@tanstack/react-query"
import {EditOrganizationStepper} from "@/modules/organization/presentation/components/create-organization-stepper"

export function OrganizationsDataGrid() {
    const [mounted, setMounted] = useState<boolean>(false)
    const [search, setSearch] = useState<string>('')
    const [deleting, setDeleting] = useState<OrganizationInterface | null>(null)
    const [editing, setEditing] = useState<OrganizationInterface | null>(null)

    const {currentOrganization} = useAuth()
    const queryClient = useQueryClient()
    const router = useRouter()

    const {data: organizations, isLoading} = useQuery<OrganizationInterface[]>({
        queryKey: ['organizations', 'table'],
        enabled: !!currentOrganization?.id,
        queryFn: async () => {
            const response = await OrganizationsApiService.getAll()
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : (raw?.data ?? [])
        },
        refetchInterval: AppConfig.APP_REFRESH_UI,
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => OrganizationsApiService.deleteOrganization(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['organizations']})
            toast.success('Organisation supprimée')
            setDeleting(null)
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Erreur lors de la suppression')
        },
    })

    const handleDelete = async () => {
        if (!deleting) return
        await deleteMutation.mutateAsync(deleting.id)
    }

    const items = organizations ?? []

    const filteredItems = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return items
        return items.filter(o =>
            (o.name || '').toLowerCase().includes(query) ||
            (o.description || '').toLowerCase().includes(query)
        )
    }, [items, search])

    const toolbar = (table: Table<OrganizationInterface>) => (
        <Fragment>
            <DataGridSearchEngine
                table={table}
                value={search}
                onChange={setSearch}
            />
            {isLoading && (
                <div className="flex-auto flex items-center justify-center">
                    <Activity.Loader size={16}/>
                </div>
            )}
        </Fragment>
    )

    const rowActions = (organization: OrganizationInterface): RowAction<OrganizationInterface>[] => [
        {
            id: 'view',
            label: 'Voir détails',
            icon: <EyeIcon className="size-4"/>,
            onExecute: (o) => router.push(`/organization?id=${o.id}`),
        },
        {
            id: 'edit',
            label: 'Modifier',
            icon: <PencilIcon className="size-4"/>,
            onExecute: (o) => setEditing(o),
        },
        {
            id: 'delete',
            label: 'Supprimer',
            icon: <TrashIcon className="size-4"/>,
            variant: 'destructive',
            onExecute: (o) => setDeleting(o),
        },
    ]

    useEffect(() => {
        if (!mounted) setMounted(true)
    }, [])

    return (
        <div className="flex-auto">
            {(items.length > 0 || mounted) ? (
                <Fragment>
                    <DataGrid
                        data={filteredItems}
                        columns={getOrganizationColumns()}
                        getRowId={row => row.id}
                        enableSelection
                        actions={rowActions}
                        toolbar={(table) => toolbar(table)}
                    />

                    {editing && <EditOrganizationStepper organization={editing} autoOpen/>}

                    <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer l’organisation</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Voulez-vous vraiment supprimer « {deleting?.name} » ? Cette action est irréversible.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </Fragment>
            ) : (
                <div className="flex-auto flex flex-col items-center justify-center min-h-[50dvh]">
                    <Empty>
                        <EmptyMedia>
                            <Building2Icon size={80} strokeWidth={1}/>
                        </EmptyMedia>
                        <EmptyTitle>Organisations</EmptyTitle>
                        <EmptyDescription>Toutes les organisations du système s’afficheront ici</EmptyDescription>
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
