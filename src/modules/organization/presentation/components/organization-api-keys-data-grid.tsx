"use client"

import {DataGrid, RowAction} from "@sentients/sdk/presentation/data-grid/data-grid"
import {useQuery, useQueryClient} from "@tanstack/react-query"
import {OrganizationsApiService} from "@sentients/sdk/application/service/organizations-api-service"
import {OrganizationApiAccessKeyInterface} from "@sentients/sdk/domain/entities/organization.interface"
import {AppConfig} from "@sentients/sdk/domain/config/app.config"
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@sentients/sdk/presentation/ui/empty"
import {KeyRoundIcon, TrashIcon} from "lucide-react"
import {Button} from "@sentients/sdk/presentation/ui/button"
import {useRouter} from "next/navigation"
import {Fragment, useEffect, useMemo, useState} from "react"
import {DataGridSearchEngine} from "@sentients/sdk/presentation/data-grid/data-grid-search-engine"
import {Table} from "@tanstack/react-table"
import {WaitingActivity} from "@sentients/sdk/presentation/components/waiting-activity"
import {Waiting} from "@sentients/sdk/presentation/components/waiting"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@sentients/sdk/presentation/ui/alert-dialog"
import {toast} from "sonner"
import {useMutation} from "@tanstack/react-query"
import {getOrganizationApiKeyColumns} from "@/modules/organization/presentation/components/organization-api-keys-columns"

export function OrganizationApiKeysDataGrid({organizationId}: { organizationId: string }) {
    const [mounted, setMounted] = useState<boolean>(false)
    const [search, setSearch] = useState<string>('')
    const [deleting, setDeleting] = useState<OrganizationApiAccessKeyInterface | null>(null)

    const queryClient = useQueryClient()
    const router = useRouter()

    const {data: apiKeys, isLoading} = useQuery<OrganizationApiAccessKeyInterface[]>({
        queryKey: ['organizations', organizationId, 'api-keys'],
        enabled: !!organizationId,
        queryFn: async () => {
            const response = await OrganizationsApiService.getApiKeys(organizationId)
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : (raw?.data ?? [])
        },
        refetchInterval: AppConfig.APP_REFRESH_UI,
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => OrganizationsApiService.deleteApiKey(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['organizations', organizationId, 'api-keys']})
            toast.success('Clé API supprimée')
            setDeleting(null)
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Erreur lors de la suppression de la clé')
        },
    })

    const handleDelete = async () => {
        if (!deleting) return
        await deleteMutation.mutateAsync(deleting.id)
    }

    const items = apiKeys ?? []

    const filteredItems = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return items
        return items.filter(k => (k.public || '').toLowerCase().includes(query))
    }, [items, search])

    const toolbar = (table: Table<OrganizationApiAccessKeyInterface>) => (
        <Fragment>
            <DataGridSearchEngine table={table} value={search} onChange={setSearch}/>
            {isLoading && (
                <div className="flex-auto flex items-center justify-center">
                    <WaitingActivity size={16}/>
                </div>
            )}
        </Fragment>
    )

    const rowActions = (key: OrganizationApiAccessKeyInterface): RowAction<OrganizationApiAccessKeyInterface>[] => [
        {
            id: 'delete',
            label: 'Révoquer',
            icon: <TrashIcon className="size-4"/>,
            variant: 'destructive',
            onExecute: (k) => setDeleting(k),
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
                        columns={getOrganizationApiKeyColumns()}
                        getRowId={row => row.id}
                        enableSelection
                        actions={rowActions}
                        toolbar={(table) => toolbar(table)}
                    />

                    <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Révoquer la clé API</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Voulez-vous vraiment révoquer cette clé ? Les systèmes qui l’utilisent perdront immédiatement l’accès.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? 'Révocation...' : 'Révoquer'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </Fragment>
            ) : (
                <div className="flex-auto flex flex-col items-center justify-center min-h-[40dvh]">
                    <Empty>
                        <EmptyMedia>
                            <KeyRoundIcon size={80} strokeWidth={1}/>
                        </EmptyMedia>
                        <EmptyTitle>Clés API</EmptyTitle>
                        <EmptyDescription>Les clés d’accès programmatique s’afficheront ici</EmptyDescription>
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
